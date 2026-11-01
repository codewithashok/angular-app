import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { QueryParams } from '@core/models/api-response.model';

export interface RequestOptions {
  params?: QueryParams;
  context?: HttpContext;
}

/**
 * The ONE place that talks to HttpClient for our backend API.
 * - Prefixes every path with environment.apiUrl
 * - Builds HttpParams from plain objects (dropping null/undefined)
 *
 * Feature services (e.g. PostService) inject this instead of HttpClient.
 * Cross-cutting concerns (auth header, errors, loader) live in interceptors.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(path: string, options: RequestOptions = {}): Observable<T> {
    return this.http.get<T>(this.url(path), this.httpOptions(options));
  }

  post<T>(path: string, body: unknown, options: RequestOptions = {}): Observable<T> {
    return this.http.post<T>(this.url(path), body, this.httpOptions(options));
  }

  put<T>(path: string, body: unknown, options: RequestOptions = {}): Observable<T> {
    return this.http.put<T>(this.url(path), body, this.httpOptions(options));
  }

  patch<T>(path: string, body: unknown, options: RequestOptions = {}): Observable<T> {
    return this.http.patch<T>(this.url(path), body, this.httpOptions(options));
  }

  delete<T>(path: string, options: RequestOptions = {}): Observable<T> {
    return this.http.delete<T>(this.url(path), this.httpOptions(options));
  }

  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private httpOptions({ params, context }: RequestOptions) {
    return { params: this.toHttpParams(params), context };
  }

  private toHttpParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }
}
