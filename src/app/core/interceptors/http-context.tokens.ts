import { HttpContextToken } from '@angular/common/http';

/**
 * Per-request flags read by interceptors. Usage:
 *   api.get(url, { context: new HttpContext().set(SKIP_LOADER, true) })
 */
export const SKIP_LOADER = new HttpContextToken<boolean>(() => false);
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);
