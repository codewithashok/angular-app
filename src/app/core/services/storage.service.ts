import { Injectable } from '@angular/core';

/**
 * Safe, typed access to localStorage. Handles JSON (de)serialization and swallows
 * storage exceptions (private mode, quota exceeded) so callers never crash.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable; ignore.
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable; ignore.
    }
  }
}
