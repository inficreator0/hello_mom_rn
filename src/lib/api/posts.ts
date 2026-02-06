import { apiRequest } from "../http";

export const postsAPI = {
  getAll: async (
    page: number = 0,
    size: number = 20,
    sortBy: string = "createdAt",
    sortDir: string = "DESC"
  ) => {
    const response = await apiRequest<{
      content: any[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`/posts?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    return response;
  },

  getById: async (id: string) => {
    const response = await apiRequest<any>(`/posts/${id}`);
    return response;
  },

  create: async (data: { title: string; content: string; category?: string; flair?: string }) => {
    const response = await apiRequest<any>("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  update: async (id: string, data: { title: string; content: string; category?: string; flair?: string }) => {
    const response = await apiRequest<any>(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response;
  },

  delete: async (id: string) => {
    await apiRequest(`/posts/${id}`, {
      method: "DELETE",
    });
  },

  upvote: async (id: string) => {
    await apiRequest(`/posts/${id}/upvote`, {
      method: "POST",
    });
  },

  downvote: async (id: string) => {
    await apiRequest(`/posts/${id}/downvote`, {
      method: "POST",
    });
  },

  save: async (id: string) => {
    await apiRequest(`/posts/${id}/save`, {
      method: "POST",
    });
  },

  unsave: async (id: string) => {
    await apiRequest(`/posts/${id}/save`, {
      method: "DELETE",
    });
  },

  report: async (id: string, reason: string) => {
    // Assuming backend endpoint for reporting
    try {
      await apiRequest(`/posts/${id}/report`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
    } catch (e) {
      // Fallback or ignore if endpoint doesn't exist yet, but logically this is where it goes
      console.warn("Report API might not be implemented on backend yet", e);
      throw e;
    }
  },

  getMyPosts: async (page: number = 0, size: number = 20) => {
    const response = await apiRequest<{
      content: any[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`/posts/my-posts?page=${page}&size=${size}`);
    return response;
  },

  getSavedPosts: async (page: number = 0, size: number = 20) => {
    const response = await apiRequest<{
      content: any[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`/users/me/saved-posts?page=${page}&size=${size}`);
    return response;
  },

  getUserStats: async (username: string) => {
    const response = await apiRequest<{
      userId: number;
      username: string;
      postsCount: number;
      commentsCount: number;
      totalUpvotesReceived: number;
      totalDownvotesReceived: number;
      articlesCount: number;
    }>(`/users/${username}/stats`);
    return response;
  },
};

export const feedAPI = {
  getFeed: async (
    sort: "recent" | "upvotes" = "recent",
    page: number = 0,
    size: number = 20
  ) => {
    const response = await apiRequest<{
      content: any[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
    }>(`/feed?sort=${sort}&page=${page}&size=${size}`);
    return response;
  },

  getFeedCursor: async (
    params: {
      sort?: "recent" | "upvotes";
      category?: string;
      cursor?: string;
    }
  ) => {
    const queryParams = new URLSearchParams();
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.category && params.category !== "All") queryParams.append("category", params.category);
    if (params.cursor) queryParams.append("cursor", params.cursor);

    const response = await apiRequest<{
      content: any[];
      nextCursor: string | null;
      previousCursor: string | null;
      hasNext: boolean;
      hasPrevious: boolean;
      size: number;
    }>(`/feed/cursor?${queryParams.toString()}`);
    return response;
  },
};

export const commentsAPI = {
  getByPostId: async (postId: string) => {
    const response = await apiRequest<any[]>(`/posts/${postId}/comments`);
    return response;
  },

  create: async (
    postId: string,
    data: { content: string; parentCommentId?: number }
  ) => {
    const response = await apiRequest<any>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  update: async (
    postId: string,
    commentId: string,
    data: { content: string }
  ) => {
    const response = await apiRequest<any>(
      `/posts/${postId}/comments/${commentId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  delete: async (postId: string, commentId: string) => {
    await apiRequest(`/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    });
  },
};


