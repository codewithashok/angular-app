/**
 * Single source of truth for backend endpoint paths (relative to environment.apiUrl).
 * Components and services never hard-code URLs; they reference these constants.
 */
export const API_ENDPOINTS = {
  posts: '/posts',
  postById: (id: number) => `/posts/${id}`,
  users: '/users',
} as const;
