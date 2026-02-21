import { apiRequest } from "../http";

export const articlesAPI = {
  getPublished: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = "publishedAt",
    sortDir: string = "DESC"
  ) => {
    return apiRequest<{
      content: any[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      last: boolean;
    }>(`/articles/published?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
  },

  getPublishedByCategory: async (
    category: string,
    page: number = 0,
    size: number = 10
  ) => {
    return apiRequest<{
      content: any[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      last: boolean;
    }>(`/articles/published/category/${encodeURIComponent(category)}?page=${page}&size=${size}`);
  },

  getById: async (id: number, incrementView: boolean = true) => {
    return apiRequest<any>(
      `/articles/${id}?incrementView=${incrementView ? "true" : "false"}`
    );
  },

  search: async (q: string, cursor?: string, limit: number = 10) => {
    let url = `/articles/search?q=${encodeURIComponent(q)}&limit=${limit}`;
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }
    return apiRequest<{
      data: any[];
      nextCursor: string | null;
    }>(url);
  },
};


