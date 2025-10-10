/**
 * @fileoverview Storage service for Smart TV Analytics
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

import { Injectable } from '@angular/core';

/**
 * Service for handling data storage in Smart TV environments
 * Uses localStorage with fallback to in-memory storage
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private memoryStorage = new Map<string, string>();
  private storageType: 'localStorage' | 'memory' = 'memory';

  constructor() {
    this.detectStorageSupport();
  }

  /**
   * Store a value with the given key
   * @param key - Storage key
   * @param value - Value to store
   */
  setItem(key: string, value: string): void {
    try {
      if (this.storageType === 'localStorage') {
        localStorage.setItem(key, value);
      } else {
        this.memoryStorage.set(key, value);
      }
    } catch (error) {
      console.warn('[StorageService] Failed to store item, falling back to memory:', error);
      this.memoryStorage.set(key, value);
    }
  }

  /**
   * Retrieve a value by key
   * @param key - Storage key
   * @returns Stored value or null if not found
   */
  getItem(key: string): string | null {
    try {
      if (this.storageType === 'localStorage') {
        return localStorage.getItem(key);
      } else {
        return this.memoryStorage.get(key) || null;
      }
    } catch (error) {
      console.warn('[StorageService] Failed to retrieve item from localStorage, checking memory:', error);
      return this.memoryStorage.get(key) || null;
    }
  }

  /**
   * Remove an item by key
   * @param key - Storage key
   */
  removeItem(key: string): void {
    try {
      if (this.storageType === 'localStorage') {
        localStorage.removeItem(key);
      } else {
        this.memoryStorage.delete(key);
      }
    } catch (error) {
      console.warn('[StorageService] Failed to remove item from localStorage:', error);
      this.memoryStorage.delete(key);
    }
  }

  /**
   * Clear all stored data
   */
  clear(): void {
    try {
      if (this.storageType === 'localStorage') {
        localStorage.clear();
      } else {
        this.memoryStorage.clear();
      }
    } catch (error) {
      console.warn('[StorageService] Failed to clear localStorage:', error);
      this.memoryStorage.clear();
    }
  }

  /**
   * Check if a key exists in storage
   * @param key - Storage key
   * @returns True if key exists
   */
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * Get all keys in storage (memory storage only)
   * @returns Array of all keys
   */
  getAllKeys(): string[] {
    if (this.storageType === 'memory') {
      return Array.from(this.memoryStorage.keys());
    }
    
    // For localStorage, this would require enumeration
    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
    } catch (error) {
      console.warn('[StorageService] Failed to enumerate localStorage keys:', error);
    }
    
    return keys;
  }

  /**
   * Get the current storage type being used
   * @returns Storage type identifier
   */
  getStorageType(): 'localStorage' | 'memory' {
    return this.storageType;
  }

  /**
   * Detect storage support and set appropriate storage type
   * @private
   */
  private detectStorageSupport(): void {
    try {
      const testKey = '__smarttv_analytics_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.storageType = 'localStorage';
    } catch (error) {
      console.warn('[StorageService] localStorage not available, using memory storage:', error);
      this.storageType = 'memory';
    }
  }
}