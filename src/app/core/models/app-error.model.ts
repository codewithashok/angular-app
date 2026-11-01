/**
 * Normalized error shape. The error interceptor converts every HttpErrorResponse
 * into this, so components handle one predictable type instead of raw HTTP errors.
 */
export interface AppError {
  status: number;
  message: string;
  url?: string | null;
  details?: unknown;
}
