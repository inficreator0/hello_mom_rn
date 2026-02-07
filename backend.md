# Nova - Backend

A community application backend built with Spring Boot.

## Features

- ✅ User Registration and Authentication (JWT-based)
- ✅ User Login
- ✅ Password Reset (via email)
- ✅ Enhanced User Onboarding (age, gender, user type)
- ✅ Baby Profile Management (CRUD for expecting mothers)
- ✅ Post Creation, Update, Delete
- ✅ Get All Posts (with pagination)
- ✅ Get Posts by User
- ✅ Comment on Posts
- ✅ Reply to Comments (Nested Comments - Reddit-style)
- ✅ Update and Delete Comments
- ✅ Article Creation, Update, Delete
- ✅ Get Published Articles (with pagination)
- ✅ Get Articles by Category
- ✅ Get Articles by Author
- ✅ Article View Count Tracking
- ✅ Feed Feature (Most Recent / Most Upvotes)
- ✅ Full-Text Search with Fuzzy Matching (pg_trgm) for Articles
- ✅ Upvote/Downvote Posts and Comments
- ✅ Vote Management (change vote, remove vote)
- ✅ User Profile Management (view, update profile, change password)
- ✅ User Statistics (posts, comments, votes received, articles)
- ✅ Saved Posts (Bookmarks)
- ✅ Menstrual Cycle Tracker
- ✅ Pregnancy Progress Tracker (Weekly updates, Kick Counter, Contraction Timer)
- ✅ Health Tracker (Mood, Water, Sleep, Weight, Symptoms)
- ✅ Baby Feeding Tracker

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA**
- **H2 Database** (Development)
- **PostgreSQL** (Production ready)
- **Maven**

## Project Structure

```
src/main/java/com/motherhood/community/
├── CommunityApplication.java          # Main application class
├── config/
│   └── SecurityConfig.java            # Security configuration
├── controller/
│   ├── AuthController.java            # Authentication endpoints
│   ├── PostController.java            # Post endpoints
│   ├── CommentController.java         # Comment endpoints
│   ├── ArticleController.java        # Article endpoints
│   ├── ArticleSearchController.java  # Article search endpoints
│   ├── FeedController.java            # Feed endpoints
│   ├── UserController.java           # User profile endpoints
│   ├── CycleTrackerController.java    # Menstrual cycle endpoints
│   ├── PregnancyTrackerController.java # Pregnancy endpoints
│   ├── HealthTrackerController.java   # Health endpoints
│   └── BabyTrackerController.java     # Baby feeding endpoints
├── dto/
│   ├── AuthResponse.java              # Authentication response DTO
│   ├── LoginRequest.java              # Login request DTO
│   ├── RegisterRequest.java           # Registration request DTO
│   ├── PostRequest.java               # Post request DTO
│   ├── PostResponse.java              # Post response DTO
│   ├── CommentRequest.java            # Comment request DTO
│   ├── CommentResponse.java           # Comment response DTO
│   ├── ArticleRequest.java            # Article request DTO
│   ├── ArticleResponse.java           # Article response DTO
│   ├── UserProfileRequest.java        # User profile update request DTO
│   ├── UserProfileResponse.java       # User profile response DTO
│   ├── ChangePasswordRequest.java     # Change password request DTO
│   ├── UserStatsResponse.java         # User statistics response DTO
│   ├── MenstrualCycleRequest.java     # Cycle request DTO
│   ├── MenstrualCycleResponse.java    # Cycle response DTO
│   ├── PregnancyProgressRequest.java  # Pregnancy progress request DTO
│   ├── PregnancyProgressResponse.java # Pregnancy progress response DTO
│   ├── KickCounterRequest.java        # Kick counter request DTO
│   ├── KickCounterResponse.java       # Kick counter response DTO
│   ├── ContractionTimerRequest.java   # Contraction timer request DTO
│   ├── ContractionTimerResponse.java  # Contraction timer response DTO
│   ├── MoodLogRequest.java            # Mood log request DTO
│   ├── MoodLogResponse.java           # Mood log response DTO
│   ├── WaterIntakeRequest.java        # Water intake request DTO
│   ├── WaterIntakeResponse.java       # Water intake response DTO
│   ├── SleepLogRequest.java           # Sleep log request DTO
│   ├── SleepLogResponse.java          # Sleep log response DTO
│   ├── WeightLogRequest.java          # Weight log request DTO
│   ├── WeightLogResponse.java         # Weight log response DTO
│   ├── SymptomLogRequest.java         # Symptom log request DTO
│   ├── SymptomLogResponse.java        # Symptom log response DTO
│   ├── BabyFeedingRequest.java        # Baby feeding request DTO
│   └── BabyFeedingResponse.java       # Baby feeding response DTO
├── entity/
│   ├── User.java                      # User entity
│   ├── Post.java                      # Post entity
│   ├── Comment.java                   # Comment entity
│   ├── Article.java                   # Article entity
│   ├── Vote.java                      # Vote entity
│   ├── MenstrualCycle.java            # Menstrual cycle entity
│   ├── PregnancyProgress.java         # Pregnancy progress entity
│   ├── KickCounter.java               # Kick counter entity
│   ├── ContractionTimer.java          # Contraction timer entity
│   ├── MoodLog.java                   # Mood log entity
│   ├── WaterIntake.java               # Water intake entity
│   ├── SleepLog.java                  # Sleep log entity
│   ├── WeightLog.java                 # Weight log entity
│   ├── SymptomLog.java                # Symptom log entity
│   └── BabyFeeding.java               # Baby feeding entity
├── repository/
│   ├── UserRepository.java            # User repository
│   ├── PostRepository.java            # Post repository
│   ├── CommentRepository.java         # Comment repository
│   ├── ArticleRepository.java        # Article repository
│   ├── ArticleSearchRepository.java  # Article search repository
│   ├── VoteRepository.java          # Vote repository
│   ├── MenstrualCycleRepository.java  # Menstrual cycle repository
│   ├── PregnancyProgressRepository.java # Pregnancy progress repository
│   ├── KickCounterRepository.java     # Kick counter repository
│   ├── ContractionTimerRepository.java # Contraction timer repository
│   ├── MoodLogRepository.java         # Mood log repository
│   ├── WaterIntakeRepository.java     # Water intake repository
│   ├── SleepLogRepository.java        # Sleep log repository
│   ├── WeightLogRepository.java       # Weight log repository
│   ├── SymptomLogRepository.java      # Symptom log repository
│   └── BabyFeedingRepository.java     # Baby feeding repository
├── security/
│   └── JwtAuthenticationFilter.java   # JWT authentication filter
├── service/
│   ├── AuthService.java               # Authentication service
│   ├── PostService.java               # Post service
│   ├── CommentService.java            # Comment service
│   ├── ArticleService.java            # Article service
│   ├── ArticleSearchService.java      # Article search service
│   ├── UserService.java              # User profile service
│   ├── CustomUserDetailsService.java  # User details service
│   ├── CycleTrackerService.java       # Cycle tracker service
│   ├── PregnancyTrackerService.java   # Pregnancy tracker service
│   ├── HealthTrackerService.java      # Health tracker service
│   └── BabyTrackerService.java        # Baby tracker service
└── util/
    └── JwtUtil.java                   # JWT utility class
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher

### Running the Application

1. Clone the repository
2. Navigate to the project directory
3. Build the project:
   ```bash
   mvn clean install
   ```
4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The application will start on `http://localhost:8080`

### H2 Console

For development, you can access the H2 database console at:
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:motherhooddb`
- Username: `sa`
- Password: (leave empty)

## API Endpoints

### Authentication

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "johndoe",
  "email": "john@example.com"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "johndoe",
  "email": "john@example.com"
}
```

#### Forgot Password

Request a password reset token:
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a password reset link has been sent.",
  "resetToken": null
}
```

**Note:** 
- The password reset link is sent via email to the user
- Email sent from: `offclockengineers@gmail.com`
- The reset link expires in 1 hour
- The message is intentionally vague to prevent user enumeration

#### Reset Password

Reset password using the token:
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

**Token Details:**
- Tokens expire after 1 hour
- Tokens are single-use (cleared after successful reset)
- Invalid or expired tokens return 400 Bad Request

### Using the JWT Token

For protected endpoints, include the JWT token in the Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

### User Profile Management

#### Get current user's profile
```http
GET /api/users/me
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

#### Get user profile by username (public)
```http
GET /api/users/{username}
```

**Response:** Same as above

#### Get user profile by user ID (public)
```http
GET /api/users/id/{userId}
```

**Response:** Same as above

#### Update current user's profile
```http
PUT /api/users/me
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com"
}
```

**Note:** All fields are optional. Only provided fields will be updated. Email must be unique if changed.

**Response:** Updated user profile

#### Change password
```http
PUT /api/users/me/password
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

#### User Onboarding

##### Complete onboarding
```http
POST /api/users/me/onboarding
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "age": 28,
  "gender": "FEMALE",
  "onboardingType": "EXPECTING"
}
```

**Request Fields:**
- `age` (optional): Integer, 13-100. User's age.
- `gender` (optional): String. One of: `MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY`
- `onboardingType` (required): String. One of:
  - `EXPECTING` - For expecting mothers
  - `NEW_MOM` - For new mothers
  - `EXPERIENCED_MOM` - For experienced mothers
  - `GENERAL_HEALTH` - For general health and wellness tracking

**Response:**
```json
{
  "message": "Onboarding completed successfully",
  "isOnboarded": true,
  "onboardingType": "EXPECTING",
  "age": 28,
  "gender": "FEMALE"
}
```

##### Get onboarding status
```http
GET /api/users/me/onboarding
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "message": null,
  "isOnboarded": true,
  "onboardingType": "EXPECTING",
  "age": 28,
  "gender": "FEMALE"
}
```

**Note:** All fields may be `null` if the user hasn't completed onboarding yet.

### Baby Profile Management

Once a user completes onboarding with type `EXPECTING`, they can add baby profile(s) with expected due dates and other details.

#### Create a baby profile
```http
POST /api/users/me/babies
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Baby Doe",
  "expectedDueDate": "2026-08-15",
  "gender": "UNKNOWN"
}
```

**Fields:**
- `name` (optional): String, 1-100 characters
- `expectedDueDate` (optional): ISO date format (YYYY-MM-DD)
- `dateOfBirth` (optional): ISO date format (YYYY-MM-DD)
- `gender` (optional): `MALE`, `FEMALE`, `UNKNOWN`

**Response:**
```json
{
  "id": 1,
  "name": "Baby Doe",
  "expectedDueDate": "2026-08-15",
  "dateOfBirth": null,
  "gender": "UNKNOWN",
  "createdAt": "2026-02-06T23:00:00",
  "updatedAt": "2026-02-06T23:00:00"
}
```

#### Get all baby profiles
```http
GET /api/users/me/babies
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Baby Doe",
    "expectedDueDate": "2026-08-15",
    "dateOfBirth": null,
    "gender": "UNKNOWN",
    "createdAt": "2026-02-06T23:00:00",
    "updatedAt": "2026-02-06T23:00:00"
  }
]
```

#### Update a baby profile
```http
PUT /api/users/me/babies/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Emma",
  "dateOfBirth": "2026-08-10",
  "gender": "FEMALE"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response:** Updated baby profile

#### Delete a baby profile
```http
DELETE /api/users/me/babies/{id}
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "message": "Baby profile deleted successfully"
}
```


#### Get user statistics (public)
```http
GET /api/users/{username}/stats
```

**Response:**
```json
{
  "userId": 1,
  "username": "johndoe",
  "postsCount": 15,
  "commentsCount": 42,
  "totalUpvotesReceived": 128,
  "totalDownvotesReceived": 5,
  "articlesCount": 3
}
```

### Posts

#### Create a new post
```http
POST /api/posts
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "First time mom - need advice",
  "content": "I'm expecting my first child and would love some advice on...",
  "category": "Pregnancy",
  "flair": "Question"
}
```

**Note:** `category` and `flair` are optional fields (max 50 characters each).

**Response:**
```json
{
  "id": 1,
  "title": "First time mom - need advice",
  "content": "I'm expecting my first child and would love some advice on...",
  "authorId": 1,
  "authorUsername": "johndoe",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "upvotes": 0,
  "downvotes": 0,
  "commentCount": 0,
  "category": "Pregnancy",
  "flair": "Question"
}
```

#### Get all posts (paginated)
```http
GET /api/posts?page=0&size=10&sortBy=createdAt&sortDir=DESC
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "First time mom - need advice",
      "content": "...",
      "authorId": 1,
      "authorUsername": "johndoe",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00",
      "upvotes": 5,
      "downvotes": 0,
      "commentCount": 3,
      "category": "Pregnancy",
      "flair": "Question"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

#### Get post by ID
```http
GET /api/posts/{id}
Authorization: Bearer <your-jwt-token>
```

#### Get posts by username
```http
GET /api/posts/user/{username}
Authorization: Bearer <your-jwt-token>
```

**With pagination (optional):**
```http
GET /api/posts/user/{username}?page=0&size=10&sortBy=createdAt&sortDir=DESC
Authorization: Bearer <your-jwt-token>
```

#### Get posts by user ID
```http
GET /api/posts/user/id/{userId}
Authorization: Bearer <your-jwt-token>
```

**With pagination (optional):**
```http
GET /api/posts/user/id/{userId}?page=0&size=10&sortBy=createdAt&sortDir=DESC
Authorization: Bearer <your-jwt-token>
```

#### Get my posts
```http
GET /api/posts/my-posts
Authorization: Bearer <your-jwt-token>
```

**With pagination (optional):**
```http
GET /api/posts/my-posts?page=0&size=10&sortBy=createdAt&sortDir=DESC
Authorization: Bearer <your-jwt-token>
```

#### Get posts liked by current user
```http
GET /api/posts/liked
Authorization: Bearer <your-jwt-token>
```

Returns all posts that the current user has upvoted (liked), ordered by when the vote was cast (most recent first).

**With pagination (optional):**
```http
GET /api/posts/liked?page=0&size=10
Authorization: Bearer <your-jwt-token>
```

**Response:** Same structure as other post list endpoints (array of `PostResponse` or paginated `Page<PostResponse>`).

#### Update a post
```http
PUT /api/posts/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Updated title",
  "content": "Updated content",
  "category": "Parenting",
  "flair": "Advice"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

#### Delete a post
```http
DELETE /api/posts/{id}
Authorization: Bearer <your-jwt-token>
```

#### Upvote a post
```http
POST /api/posts/{id}/upvote
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "id": 1,
  "title": "First time mom - need advice",
  "content": "...",
  "upvotes": 1,
  "downvotes": 0,
  "category": "Pregnancy",
  "flair": "Question",
  ...
}
```

**Note:** If you already upvoted, calling this again will remove your upvote. If you downvoted, it will change to upvote.

#### Downvote a post
```http
POST /api/posts/{id}/downvote
Authorization: Bearer <your-jwt-token>
```

#### Remove vote from a post
```http
DELETE /api/posts/{id}/vote
Authorization: Bearer <your-jwt-token>
```

### Saved Posts (Bookmarks)

#### Save a post
```http
POST /api/posts/{postId}/save
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "message": "Post saved successfully"
}
```

**Error responses:**
- `409 Conflict` - Post already saved
- `404 Not Found` - Post not found
- `401 Unauthorized` - Not authenticated

#### Unsave a post
```http
DELETE /api/posts/{postId}/save
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "message": "Post unsaved successfully"
}
```

#### Check if a post is saved
```http
GET /api/posts/{postId}/saved
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "saved": true
}
```

#### Get all saved posts
```http
GET /api/users/me/saved-posts?page=0&size=10
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "First time mom - need advice",
      "content": "...",
      "authorId": 1,
      "authorUsername": "johndoe",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00",
      "upvotes": 5,
      "downvotes": 0,
      "commentCount": 3,
      "category": "Pregnancy",
      "flair": "Question"
    }
  ],
  "totalElements": 15,
  "totalPages": 2,
  "size": 10,
  "number": 0
}
```

**Note:** Saved posts are ordered by when they were saved (most recently saved first).

#### Get count of saved posts
```http
GET /api/users/me/saved-posts/count
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "count": 15
}
```

### Feed

The feed API returns all details needed to render the user's feed. Each item includes full post data plus **currentUserVote** and **saved** fields so the UI can show whether the user has upvoted/downvoted or bookmarked each post.

#### Get Feed (Most Recent - Default)
```http
GET /api/feed?sort=recent&page=0&size=10
Authorization: Bearer <your-jwt-token>
```

#### Get Feed with Category Filter
Filter posts by category (e.g., "Pregnancy", "Parenting", etc.):
```http
GET /api/feed?category=Pregnancy&page=0&size=10
Authorization: Bearer <your-jwt-token>
```

#### Get Feed with Category Filter and Sort by Upvotes
```http
GET /api/feed?category=Pregnancy&sort=upvotes&page=0&size=10
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "First time mom - need advice",
      "content": "...",
      "authorId": 1,
      "authorUsername": "johndoe",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00",
      "upvotes": 5,
      "downvotes": 0,
      "commentCount": 3,
      "category": "Pregnancy",
      "flair": "Question",
      "currentUserVote": "UPVOTE",
      "saved": true
    }
  ],
  "totalElements": 10,
  "totalPages": 1,
  "size": 10,
  "number": 0,
  "first": true,
  "last": true
}
```

**Feed item fields:**
- All post fields: `id`, `title`, `content`, `authorId`, `authorUsername`, `createdAt`, `updatedAt`, `upvotes`, `downvotes`, `commentCount`, `category`, `flair`
- **currentUserVote** – `"UPVOTE"`, `"DOWNVOTE"`, or `null` (not voted). Use this to highlight the correct vote button in the UI.
- **saved** – `true` if the user has saved/bookmarked this post, `false` otherwise. Use this to show a filled bookmark icon in the UI.

#### Get Feed (Most Upvotes)
```http
GET /api/feed?sort=upvotes&page=0&size=10
Authorization: Bearer <your-jwt-token>
```

**Alternative endpoints:**
```http
# Get recent feed
GET /api/feed/recent?page=0&size=10
Authorization: Bearer <your-jwt-token>

# Get most upvoted feed
GET /api/feed/upvotes?page=0&size=10
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `sort` - Sort option: `recent` (default) or `upvotes` / `most-upvotes`
- `category` - Optional category filter (e.g., "Pregnancy", "Parenting"). When omitted, returns posts from all categories
- `page` - Page number (default: 0)
- `size` - Number of posts per page (default: 10)

#### Get Feed with Cursor-Based Pagination (Recommended for Mobile/Real-time)

Cursor-based pagination is more efficient than offset-based pagination for feeds that update frequently. It prevents duplicates and missing items when new posts are added.

**First page:**
```http
GET /api/feed/cursor?sort=recent&limit=10
Authorization: Bearer <your-jwt-token>
```

**Next page (using cursor from previous response):**
```http
GET /api/feed/cursor?sort=recent&cursor=12345&limit=10
Authorization: Bearer <your-jwt-token>
```

**With category filter:**
```http
GET /api/feed/cursor?sort=recent&category=Pregnancy&cursor=12345&limit=10
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "content": [
    {
      "id": 12345,
      "title": "First time mom - need advice",
      "content": "...",
      "authorId": 1,
      "authorUsername": "johndoe",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00",
      "upvotes": 5,
      "downvotes": 0,
      "commentCount": 3,
      "category": "Pregnancy",
      "flair": "Question",
      "currentUserVote": "UPVOTE",
      "saved": true
    }
  ],
  "nextCursor": "12340",
  "previousCursor": null,
  "hasNext": true,
  "hasPrevious": false,
  "size": 10
}
```

**Cursor Format:**
- For `sort=recent`: cursor is the post ID (e.g., `"12345"`)
- For `sort=upvotes`: cursor is `upvotes:id` format (e.g., `"100:12345"`)

**Query Parameters:**
- `sort` - Sort option: `recent` (default) or `upvotes`
- `category` - Optional category filter
- `cursor` - Cursor token from previous page (omit for first page)
- `limit` - Number of items to fetch (default: 10, max: 50)

**Benefits of Cursor Pagination:**
- ✅ No duplicates or missing items when new posts are created
- ✅ Better performance for large datasets
- ✅ Consistent results across pages
- ✅ Ideal for infinite scroll implementations

### Comments

#### Create a comment on a post
```http
POST /api/posts/{postId}/comments
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "content": "This is a great post! Thanks for sharing."
}
```

**Response:**
```json
{
  "id": 1,
  "content": "This is a great post! Thanks for sharing.",
  "authorId": 1,
  "authorUsername": "johndoe",
  "postId": 1,
  "parentCommentId": null,
  "createdAt": "2024-01-15T11:00:00",
  "updatedAt": "2024-01-15T11:00:00",
  "upvotes": 0,
  "downvotes": 0,
  "replyCount": 0,
  "replies": []
}
```

#### Reply to a comment
```http
POST /api/posts/{postId}/comments
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "content": "I completely agree with you!",
  "parentCommentId": 1
}
```

**Response:**
```json
{
  "id": 2,
  "content": "I completely agree with you!",
  "authorId": 2,
  "authorUsername": "janedoe",
  "postId": 1,
  "parentCommentId": 1,
  "createdAt": "2024-01-15T11:05:00",
  "updatedAt": "2024-01-15T11:05:00",
  "upvotes": 0,
  "downvotes": 0,
  "replyCount": 0,
  "replies": []
}
```

#### Get all comments for a post (with nested replies)
```http
GET /api/posts/{postId}/comments
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
[
  {
    "id": 1,
    "content": "This is a great post!",
    "authorId": 1,
    "authorUsername": "johndoe",
    "postId": 1,
    "parentCommentId": null,
    "createdAt": "2024-01-15T11:00:00",
    "updatedAt": "2024-01-15T11:00:00",
    "upvotes": 5,
    "downvotes": 0,
    "replyCount": 2,
    "replies": [
      {
        "id": 2,
        "content": "I completely agree!",
        "authorId": 2,
        "authorUsername": "janedoe",
        "postId": 1,
        "parentCommentId": 1,
        "createdAt": "2024-01-15T11:05:00",
        "updatedAt": "2024-01-15T11:05:00",
        "upvotes": 3,
        "downvotes": 0,
        "replyCount": 0,
        "replies": []
      }
    ]
  }
]
```

#### Get a specific comment
```http
GET /api/posts/{postId}/comments/{commentId}
Authorization: Bearer <your-jwt-token>
```

#### Get replies to a comment
```http
GET /api/posts/{postId}/comments/{commentId}/replies
Authorization: Bearer <your-jwt-token>
```

#### Update a comment
```http
PUT /api/posts/{postId}/comments/{commentId}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "content": "Updated comment content"
}
```

#### Delete a comment
```http
DELETE /api/posts/{postId}/comments/{commentId}
Authorization: Bearer <your-jwt-token>
```

#### Upvote a comment
```http
POST /api/posts/{postId}/comments/{commentId}/upvote
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "id": 1,
  "content": "Great post!",
  "upvotes": 1,
  "downvotes": 0,
  ...
}
```

**Note:** If you already upvoted, calling this again will remove your upvote. If you downvoted, it will change to upvote.

#### Downvote a comment
```http
POST /api/posts/{postId}/comments/{commentId}/downvote
Authorization: Bearer <your-jwt-token>
```

#### Remove vote from a comment
```http
DELETE /api/posts/{postId}/comments/{commentId}/vote
Authorization: Bearer <your-jwt-token>
```

### Articles

#### Create an article
```http
POST /api/articles
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "10 Essential Tips for First-Time Mothers",
  "content": "Being a first-time mother can be overwhelming...",
  "summary": "A comprehensive guide for new mothers covering essential tips and advice.",
  "category": "Parenting Tips",
  "featuredImageUrl": "https://example.com/image.jpg",
  "isPublished": true
}
```

**Response:**
```json
{
  "id": 1,
  "title": "10 Essential Tips for First-Time Mothers",
  "content": "Being a first-time mother can be overwhelming...",
  "summary": "A comprehensive guide for new mothers covering essential tips and advice.",
  "authorId": 1,
  "authorUsername": "johndoe",
  "category": "Parenting Tips",
  "featuredImageUrl": "https://example.com/image.jpg",
  "viewCount": 0,
  "isPublished": true,
  "createdAt": "2024-01-15T12:00:00",
  "updatedAt": "2024-01-15T12:00:00",
  "publishedAt": "2024-01-15T12:00:00"
}
```

#### Get published articles (public endpoint - no auth required for reading)
```http
GET /api/articles/published?page=0&size=10&sortBy=publishedAt&sortDir=DESC
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "10 Essential Tips for First-Time Mothers",
      "content": "...",
      "summary": "...",
      "authorId": 1,
      "authorUsername": "johndoe",
      "category": "Parenting Tips",
      "featuredImageUrl": "https://example.com/image.jpg",
      "viewCount": 150,
      "isPublished": true,
      "publishedAt": "2024-01-15T12:00:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

#### Get published articles by category
```http
GET /api/articles/published/category/{category}?page=0&size=10
```

#### Get article by ID (increments view count)
```http
GET /api/articles/{id}?incrementView=true
```

#### Get all articles (including unpublished - requires auth)
```http
GET /api/articles?page=0&size=10&sortBy=createdAt&sortDir=DESC
Authorization: Bearer <your-jwt-token>
```

#### Get articles by author
```http
GET /api/articles/author/{username}?page=0&size=10
Authorization: Bearer <your-jwt-token>
```

#### Get my articles
```http
GET /api/articles/my-articles?page=0&size=10
Authorization: Bearer <your-jwt-token>
```

#### Update an article
```http
PUT /api/articles/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "summary": "Updated summary",
  "category": "New Category",
  "isPublished": true
}
```

#### Delete an article
```http
DELETE /api/articles/{id}
Authorization: Bearer <your-jwt-token>
```

#### Search Articles (Full-Text Search + Fuzzy Matching)
```http
GET /api/articles/search?q=motherhood%20tips&page=0&size=10&fuzzy=true
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "10 Essential Tips for First-Time Mothers",
      "content": "...",
      "summary": "A comprehensive guide...",
      "authorId": 1,
      "authorUsername": "johndoe",
      "category": "Parenting Tips",
      "viewCount": 150,
      "isPublished": true,
      "publishedAt": "2024-01-15T12:00:00"
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

**Query Parameters:**
- `q` (required) - Search query term
- `page` - Page number (default: 0)
- `size` - Number of results per page (default: 10)
- `fuzzy` - Enable fuzzy matching using pg_trgm (default: true)

**Quick Search (fuzzy enabled by default):**
```http
GET /api/articles/search/quick?q=motherhood%20tips&page=0&size=10
```

**Features:**
- **Full-Text Search**: Uses PostgreSQL's full-text search (tsvector/tsquery)
- **Fuzzy Matching**: Uses pg_trgm for typo-tolerant search
- **Relevance Ranking**: Results sorted by relevance score (title weighted highest)
- **Public Endpoint**: No authentication required (searches only published articles)

**Search Fields:**
- Title (highest weight)
- Content
- Summary
- Category

### Trackers

All tracker endpoints require authentication (JWT token in Authorization header).

#### Cycle Tracker

##### Log a menstrual cycle
```http
POST /api/trackers/cycle
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-05",
  "notes": "Normal cycle, no issues"
}
```

**Response:**
```json
{
  "id": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-01-05",
  "notes": "Normal cycle, no issues",
  "createdAt": "2024-01-01T10:00:00"
}
```

##### Get cycle history
```http
GET /api/trackers/cycle
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
[
  {
    "id": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-05",
    "notes": "Normal cycle, no issues",
    "createdAt": "2024-01-01T10:00:00"
  },
  {
    "id": 2,
    "startDate": "2024-01-28",
    "endDate": "2024-02-02",
    "notes": "Slightly longer cycle",
    "createdAt": "2024-01-28T10:00:00"
  }
]
```

##### Update cycle entry
```http
PUT /api/trackers/cycle/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-06",
  "notes": "Updated notes"
}
```

**Response:** Updated cycle entry

##### Delete cycle entry
```http
DELETE /api/trackers/cycle/{id}
Authorization: Bearer <your-jwt-token>
```

**Response:** `204 No Content`

#### Pregnancy Tracker

##### Log weekly progress
```http
POST /api/trackers/pregnancy/progress
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "weekNumber": 12,
  "weight": 65.5,
  "bellySize": 85.0,
  "date": "2024-01-15",
  "notes": "Feeling good this week, baby is growing well"
}
```

**Response:**
```json
{
  "id": 1,
  "weekNumber": 12,
  "weight": 65.5,
  "bellySize": 85.0,
  "date": "2024-01-15",
  "notes": "Feeling good this week, baby is growing well",
  "createdAt": "2024-01-15T10:00:00"
}
```

##### Get progress history
```http
GET /api/trackers/pregnancy/progress
Authorization: Bearer <your-jwt-token>
```

**Response:** Array of progress entries

##### Update progress
```http
PUT /api/trackers/pregnancy/progress/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "weekNumber": 13,
  "weight": 66.0,
  "bellySize": 87.0,
  "date": "2024-01-22",
  "notes": "Updated progress"
}
```

**Response:** Updated progress entry

##### Delete progress entry
```http
DELETE /api/trackers/pregnancy/progress/{id}
Authorization: Bearer <your-jwt-token>
```

**Response:** `204 No Content`

##### Log kick count
```http
POST /api/trackers/pregnancy/kicks
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "startTime": "2024-01-15T14:00:00",
  "endTime": "2024-01-15T14:30:00",
  "count": 10,
  "notes": "Baby is very active today"
}
```

**Response:**
```json
{
  "id": 1,
  "startTime": "2024-01-15T14:00:00",
  "endTime": "2024-01-15T14:30:00",
  "count": 10,
  "notes": "Baby is very active today",
  "createdAt": "2024-01-15T14:30:00"
}
```

##### Get kick count history
```http
GET /api/trackers/pregnancy/kicks
Authorization: Bearer <your-jwt-token>
```

**Response:** Array of kick count entries

##### Update kick count
```http
PUT /api/trackers/pregnancy/kicks/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "startTime": "2024-01-15T14:00:00",
  "endTime": "2024-01-15T14:35:00",
  "count": 12,
  "notes": "Updated kick count"
}
```

**Response:** Updated kick count entry

##### Delete kick count entry
```http
DELETE /api/trackers/pregnancy/kicks/{id}
Authorization: Bearer <your-jwt-token>
```

**Response:** `204 No Content`

##### Log contraction
```http
POST /api/trackers/pregnancy/contractions
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "startTime": "2024-01-20T10:00:00",
  "endTime": "2024-01-20T10:00:45",
  "durationSeconds": 45,
  "frequencyMinutes": 5.5,
  "intensity": "moderate"
}
```

**Response:**
```json
{
  "id": 1,
  "startTime": "2024-01-20T10:00:00",
  "endTime": "2024-01-20T10:00:45",
  "durationSeconds": 45,
  "frequencyMinutes": 5.5,
  "intensity": "moderate",
  "createdAt": "2024-01-20T10:00:45"
}
```

##### Get contraction history
```http
GET /api/trackers/pregnancy/contractions
Authorization: Bearer <your-jwt-token>
```

**Response:** Array of contraction entries

##### Update contraction
```http
PUT /api/trackers/pregnancy/contractions/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "startTime": "2024-01-20T10:00:00",
  "endTime": "2024-01-20T10:00:50",
  "durationSeconds": 50,
  "frequencyMinutes": 6.0,
  "intensity": "strong"
}
```

**Response:** Updated contraction entry

##### Delete contraction entry
```http
DELETE /api/trackers/pregnancy/contractions/{id}
Authorization: Bearer <your-jwt-token>
```

**Response:** `204 No Content`

#### Health Tracker

##### Log mood
```http
POST /api/trackers/health/mood
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "mood": "happy",
  "notes": "Feeling great today"
}
```

**Response:**
```json
{
  "id": 1,
  "date": "2024-01-15",
  "mood": "happy",
  "notes": "Feeling great today",
  "createdAt": "2024-01-15T10:00:00"
}
```

##### Get mood history
```http
GET /api/trackers/health/mood
Authorization: Bearer <your-jwt-token>
```

**Response:** Array of mood entries

##### Update mood
```http
PUT /api/trackers/health/mood/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "mood": "calm",
  "notes": "Updated mood"
}
```

**Response:** Updated mood entry

##### Delete mood entry
```http
DELETE /api/trackers/health/mood/{id}
Authorization: Bearer <your-jwt-token>
```

**Response:** `204 No Content`

##### Log water intake
```http
POST /api/trackers/health/water
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "amountMl": 2000
}
```

**Response:**
```json
{
  "id": 1,
  "date": "2024-01-15",
  "amountMl": 2000,
  "createdAt": "2024-01-15T10:00:00"
}
```

##### Get water intake history
```http
GET /api/trackers/health/water
Authorization: Bearer <your-jwt-token>
```

**Response:** Array of water intake entries

##### Update water intake
```http
PUT /api/trackers/health/water/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "amountMl": 2500
}
```

**Response:** Updated water intake entry

##### Delete water intake entry
```http
DELETE /api/trackers/health/water/{id}
Authorization: Bearer <your-jwt-token>
```

**Response:** `204 No Content`

##### Log sleep
```http
POST /api/trackers/health/sleep
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "startTime": "2024-01-15T22:00:00",
  "endTime": "2024-01-16T07:00:00",
  "quality": "good",
  "notes": "Slept well through the night"
}
```

**Response:**
```json
{
  "id": 1,
  "startTime": "2024-01-15T22:00:00",
  "endTime": "2024-01-16T07:00:00",
  "quality": "good",
  "notes": "Slept well through the night",
  "createdAt": "2024-01-16T07:00:00"
}
```

##### Get sleep history
```http
GET /api/trackers/health/sleep
Authorization: Bearer <your-jwt-token>
```

**Response:** Array of sleep entries

##### Update sleep
```http
PUT /api/trackers/health/sleep/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "startTime": "2024-01-15T22:30:00",
  "endTime": "2024-01-16T07:30:00",
  "quality": "excellent",
  "notes": "Updated sleep log"
}
```

**Response:** Updated sleep entry

##### Delete sleep entry
```http
DELETE /api/trackers/health/sleep/{id}
Authorization: Bearer <your-jwt-token>
```

**Response:** `204 No Content`

##### Log weight
```http
POST /api/trackers/health/weight
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "weightKg": 65.5,
  "notes": "Weekly weight check"
}
```

**Response:**
```json
{
  "id": 1,
  "date": "2024-01-15",
  "weightKg": 65.5,
  "notes": "Weekly weight check",
  "createdAt": "2024-01-15T10:00:00"
}
```

##### Get weight history
```http
GET /api/trackers/health/weight
Authorization: Bearer <your-jwt-token>
```

**Response:** Array of weight entries

##### Update weight
```http
PUT /api/trackers/health/weight/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "weightKg": 66.0,
  "notes": "Updated weight"
}
```

**Response:** Updated weight entry

##### Delete weight entry
```http
DELETE /api/trackers/health/weight/{id}
Authorization: Bearer <your-jwt-token>
```

**Response:** `204 No Content`

##### Log symptom
```http
POST /api/trackers/health/symptoms
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "symptom": "Morning sickness",
  "severity": "moderate",
  "notes": "Felt nauseous in the morning"
}
```

**Response:**
```json
{
  "id": 1,
  "date": "2024-01-15",
  "symptom": "Morning sickness",
  "severity": "moderate",
  "notes": "Felt nauseous in the morning",
  "createdAt": "2024-01-15T10:00:00"
}
```

##### Get symptom history
```http
GET /api/trackers/health/symptoms
Authorization: Bearer <your-jwt-token>
```

**Response:** Array of symptom entries

##### Update symptom
```http
PUT /api/trackers/health/symptoms/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "symptom": "Morning sickness",
  "severity": "mild",
  "notes": "Updated symptom log"
}
```

**Response:** Updated symptom entry

##### Delete symptom entry
```http
DELETE /api/trackers/health/symptoms/{id}
Authorization: Bearer <your-jwt-token>
```

**Response:** `204 No Content`

#### Baby Tracker

##### Log feeding
```http
POST /api/trackers/baby/feeding
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "startTime": "2024-01-15T10:30:00",
  "endTime": "2024-01-15T10:50:00",
  "type": "breastfeeding",
  "amountMl": 0,
  "side": "left",
  "notes": "Baby fed well"
}
```

**Response:**
```json
{
  "id": 1,
  "startTime": "2024-01-15T10:30:00",
  "endTime": "2024-01-15T10:50:00",
  "type": "breastfeeding",
  "amountMl": 0,
  "side": "left",
  "notes": "Baby fed well",
  "createdAt": "2024-01-15T10:50:00"
}
```

**Note:** For formula feeding, set `type` to `"formula"` and provide `amountMl`. For breastfeeding, `amountMl` can be 0.

##### Get feeding history
```http
GET /api/trackers/baby/feeding
Authorization: Bearer <your-jwt-token>
```

**Response:** Array of feeding entries

##### Update feeding
```http
PUT /api/trackers/baby/feeding/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "startTime": "2024-01-15T10:30:00",
  "endTime": "2024-01-15T10:55:00",
  "type": "formula",
  "amountMl": 120,
  "side": null,
  "notes": "Updated feeding log"
}
```

**Response:** Updated feeding entry

##### Delete feeding entry
```http
DELETE /api/trackers/baby/feeding/{id}
Authorization: Bearer <your-jwt-token>
```

**Response:** `204 No Content`

## Database Schema

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password` (Encrypted)
- `first_name`
- `last_name`
- `created_at`
- `updated_at`

### Posts Table
- `id` (Primary Key)
- `title`
- `content`
- `author_id` (Foreign Key to Users)
- `upvotes`
- `downvotes`
- `category` (optional, max 50 characters)
- `flair` (optional, max 50 characters)
- `created_at`
- `updated_at`

### Comments Table
- `id` (Primary Key)
- `content`
- `author_id` (Foreign Key to Users)
- `post_id` (Foreign Key to Posts)
- `parent_comment_id` (Foreign Key to Comments - for replies)
- `upvotes`
- `downvotes`
- `created_at`
- `updated_at`

### Votes Table
- `id` (Primary Key)
- `user_id` (Foreign Key to Users)
- `post_id` (Foreign Key to Posts, nullable)
- `comment_id` (Foreign Key to Comments, nullable)
- `vote_type` (UPVOTE or DOWNVOTE)
- `created_at`
- **Constraints:** One vote per user per post/comment (unique constraint)

### Articles Table
- `id` (Primary Key)
- `title`
- `content`
- `summary`
- `author_id` (Foreign Key to Users)
- `category`
- `featured_image_url`
- `view_count`
- `is_published`
- `created_at`
- `updated_at`
- `published_at`

### Tracker Tables
- **MenstrualCycle**: `id`, `user_id`, `start_date`, `end_date`, `notes`
- **PregnancyProgress**: `id`, `user_id`, `week_number`, `weight`, `belly_size`, `date`, `notes`
- **KickCounter**: `id`, `user_id`, `start_time`, `end_time`, `count`, `notes`
- **ContractionTimer**: `id`, `user_id`, `start_time`, `end_time`, `duration_seconds`, `frequency_minutes`, `intensity`
- **MoodLog**: `id`, `user_id`, `date`, `mood`, `notes`
- **WaterIntake**: `id`, `user_id`, `date`, `amount_ml`
- **SleepLog**: `id`, `user_id`, `start_time`, `end_time`, `quality`, `notes`
- **WeightLog**: `id`, `user_id`, `date`, `weight_kg`, `notes`
- **SymptomLog**: `id`, `user_id`, `date`, `symptom`, `severity`, `notes`
- **BabyFeeding**: `id`, `user_id`, `start_time`, `end_time`, `type`, `amount_ml`, `side`, `notes`

## Configuration

Edit `src/main/resources/application.properties` to configure:
- Server port
- Database connection
- JWT secret and expiration

For Docker deployment, see `application-docker.properties` and `DOCKER_SETUP.md`.

## Security

- Passwords are encrypted using BCrypt
- JWT tokens are used for authentication
- Protected endpoints require a valid JWT token in the Authorization header

## Additional Documentation

- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Docker build and deployment guide
- **[POSTMAN_SETUP.md](POSTMAN_SETUP.md)** - Postman collection setup guide
- **[SEARCH_SETUP.md](SEARCH_SETUP.md)** - Full-text search setup instructions
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Supabase database configuration

## Postman Collection

A complete Postman collection is available for testing all API endpoints:
- **Collection**: `Motherhood_Community_API.postman_collection.json`
- **Environment**: `Motherhood_Community_API.postman_environment.json`

Import both files into Postman to get started. The Login request automatically saves the JWT token to the environment variable for use in authenticated requests.

## License

This project is open source and available for use.

