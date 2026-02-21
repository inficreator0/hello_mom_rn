# Search Functionality Documentation

This document explains the technical implementation of the search functionality across the Nova Community App. The application leverages **PostgreSQL's native Full-Text Search** Engine to provide highly efficient, relevant, and robust search capabilities over **Articles** and **Posts** without the overhead of maintaining external search engines like Elasticsearch.

---

## 🏗️ Architecture Overview

The search architecture is composed of three primary layers:
1. **Database Layer (Native PostgreSQL)**: Utilizes `to_tsvector`, `to_tsquery`, and `ts_rank_cd` to execute fast textual searches natively on the database.
2. **Repository Layer (Spring Data JPA)**: Defines `@Query` annotations with native SQL to safely pass search terms and map results directly to Hibernate entities.
3. **Service & Controller Layers**: Handles term cleaning, pagination, and DTO object-mapping before exposing the payload via REST APIs.

---

## ⚡ Technical Core: PostgreSQL Full-Text Search

We use Postgres's built-in robust text matching mechanics. 

### 1. Vectorizing the Text (`to_tsvector`)
To make textual data searchable, PostgreSQL converts strings into a `ts_vector` (Text Search Vector). A `ts_vector` is an optimized list of normalized lexical tokens (lexemes). 
- **Normalization**: It automatically handles stemming (e.g., treating "running", "runs", and "run" as the same root word) and removes stop-words like "the", "a", or "an".
- **Concatenation**: We coalesce and append multiple entity fields (like `title`, `content`, and `category`) into a single massive vector.

### 2. Query Parsing (`plainto_tsquery`)
When a user submits a search term (e.g., `"newborn sleeping tips"`), Postgres needs to convert this string into a query object capable of matching against the `ts_vector`. 
- `plainto_tsquery` takes unformatted user text, normalizes it, and inserts boolean `&` (AND) operators between the words.

### 3. Relevance Ranking & Weighting (`ts_rank_cd` & `setweight`)
Not all matches are equal. A match in a highly visible field like a Post's **Title** is naturally more relevant to the user than a match buried deep in the **Content**.
- We use `setweight` to classify fields:
  - **A-Weight** (Highest): `title`
  - **B-Weight** (High): `content`
  - **C-Weight** (Medium): `category` / `summary`
- The `ts_rank_cd` function calculates a density-based ranking score comparing the generated `ts_vector` weights against the user's `ts_query`. We use this score to sort the results, falling back to recency (`created_at`) to break rank ties.

---

## 📝 API Endpoints

### 1. Article Search API
- **Endpoint**: `GET /api/articles/search`
- **Security**: Publicly accessible (`permitAll`)
- **Parameters**: 
  - `q` (String) - The search query term.
  - `cursor` (String, Optional) - Base64 encoded cursor token for pagination.
  - `limit` (Integer) - Number of results to return (default: 10).
  - `fuzzy` (Boolean) - Enable/disable pg_trgm fuzzy matching (default: true).
- **Implementation Highlights**:
  - Found in `ArticleSearchRepository.java`.
  - Returns `CursorSearchResponse<ArticleResponse>`
  - Searches across: `title`, `content`, `summary`, and `category`.
  - Enforces `is_published = true`.

### 2. Post Search API
- **Endpoint**: `GET /api/posts/search`
- **Security**: Publicly accessible (`permitAll`)
- **Parameters**: 
  - `q` (String) - The search query term.
  - `cursor` (String, Optional) - Base64 encoded cursor token for pagination.
  - `limit` (Integer) - Number of results to return (default: 10).
- **Implementation Highlights**:
  - Found in `PostSearchRepository.java`.
  - Returns `CursorSearchResponse<PostResponse>`
  - Searches across: `title`, `content`, `category`, and author details (`username`, `first_name`, `last_name`).
  - Enforces `deleted = false`.

### Sample Response (`CursorSearchResponse`)

```json
{
  "data": [
    {
      "id": 142,
      "title": "Sleep Training Newborns",
      "content": "Does anyone have tips on...",
      "authorId": 12,
      "authorUsername": "SarahJane",
      "category": "Parenting",
      "flair": "Advice",
      "upvotes": 4,
      "downvotes": 0,
      "commentCount": 2,
      "createdAt": "2024-03-12T10:15:30Z",
      "updatedAt": "2024-03-12T10:15:30Z"
    }
  ],
  "nextCursor": "MC42MDc5MjcxLDE3MTAyNDA5MzA="
}
```

---

## 🧭 Cursor-Based Pagination

Because both endpoints sort inherently by a dynamically calculated Relevance Rank (`ts_rank_cd`), standard offset pagination isn't enough to prevent duplicate entries if nodes are injected mid-scroll. 
Instead, we implemented **Cursor Pagination**.
- The `CursorSearchResponse` returns a `nextCursor` value.
- This cursor is a strictly **Base64 encoded payload** representing the final item's tuples: `(rank_score, created_at_epoch)`.
- When passed to the `?cursor=` parameter, the backend decodes it and fetches only matching items with strictly lower relevance (or equal relevance but older timestamp), ensuring an idempotent, stateless scroll stream.

---

## 🔍 Code Example (Post Search Native Query)

Here is a snippet showing precisely how the Postgres full-text search is structured inside the `@Query` annotation for Posts:

```sql
SELECT p.id, p.content, p.title, p.category, p.tag, p.author_id, p.upvotes, 
       p.comment_count, p.deleted, p.image_url, p.created_at, p.updated_at
FROM posts p
WHERE p.deleted = false
    -- The actual match comparison (@@) between vector and query
    AND to_tsvector('english', COALESCE(p.title, '') || ' ' || 
                   COALESCE(p.content, '') || ' ' || 
                   COALESCE(p.category, '')) @@ plainto_tsquery('english', :searchTerm)
ORDER BY 
    -- The ranking calculation applied to the matched rows
    ts_rank_cd(
        setweight(to_tsvector('english', COALESCE(p.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(p.content, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p.category, '')), 'C'),
        plainto_tsquery('english', :searchTerm)
    ) DESC, 
    p.created_at DESC -- Tie breaker
```

---

## 🚀 Future Expansions

Because we are using native PostgreSQL features, there is no infrastructure overhead. Future enhancements could include:
1. **Fuzzy Matching (`pg_trgm`)**: Implementing trigram matching to handle spelling mistakes or typos in the search terms.
2. **Search Suggestion/Autocomplete**: Utilizing `ts_stat` or pre-computed materialized views to offer rapid keyword suggestions on the frontend.