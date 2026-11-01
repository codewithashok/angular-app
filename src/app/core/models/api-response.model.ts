/** Common envelope for paginated list responses (adapt to your backend's contract). */
export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Query params accepted by ApiService. null/undefined values are dropped. */
export type QueryParams = Record<string, string | number | boolean | null | undefined>;
