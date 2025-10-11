/**
 * @fileoverview Unit tests for StorageService
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
    // Clear storage before each test
    service.clear();
  });

  afterEach(() => {
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setItem and getItem', () => {
    it('should store and retrieve a value', () => {
      service.setItem('testKey', 'testValue');
      const value = service.getItem('testKey');
      expect(value).toBe('testValue');
    });

    it('should return null for non-existent key', () => {
      const value = service.getItem('nonExistentKey');
      expect(value).toBeNull();
    });

    it('should overwrite existing value', () => {
      service.setItem('key', 'value1');
      service.setItem('key', 'value2');
      const value = service.getItem('key');
      expect(value).toBe('value2');
    });
  });

  describe('removeItem', () => {
    it('should remove an item', () => {
      service.setItem('key', 'value');
      service.removeItem('key');
      const value = service.getItem('key');
      expect(value).toBeNull();
    });

    it('should not throw when removing non-existent key', () => {
      expect(() => service.removeItem('nonExistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      service.setItem('key1', 'value1');
      service.setItem('key2', 'value2');
      service.clear();
      expect(service.getItem('key1')).toBeNull();
      expect(service.getItem('key2')).toBeNull();
    });
  });

  describe('hasItem', () => {
    it('should return true for existing item', () => {
      service.setItem('key', 'value');
      expect(service.hasItem('key')).toBe(true);
    });

    it('should return false for non-existent item', () => {
      expect(service.hasItem('nonExistent')).toBe(false);
    });
  });

  describe('getAllKeys', () => {
    it('should return all keys', () => {
      service.setItem('key1', 'value1');
      service.setItem('key2', 'value2');
      const keys = service.getAllKeys();
      expect(keys.length).toBeGreaterThanOrEqual(2);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    it('should return empty array when no items', () => {
      service.clear();
      const keys = service.getAllKeys();
      expect(keys.length).toBe(0);
    });
  });

  describe('getStorageType', () => {
    it('should return storage type', () => {
      const storageType = service.getStorageType();
      expect(storageType).toMatch(/^(localStorage|memory)$/);
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Spy on console.warn to verify error handling
      spyOn(console, 'warn');
      
      // Create a spy that throws an error
      const originalSetItem = Storage.prototype.setItem;
      spyOn(Storage.prototype, 'setItem').and.throwError('Storage quota exceeded');
      
      // This should fall back to memory storage
      service.setItem('errorKey', 'errorValue');
      
      // Restore original
      Storage.prototype.setItem = originalSetItem;
      
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle getItem errors gracefully', () => {
      spyOn(console, 'warn');
      
      const originalGetItem = Storage.prototype.getItem;
      spyOn(Storage.prototype, 'getItem').and.throwError('Storage access denied');
      
      const value = service.getItem('testKey');
      
      Storage.prototype.getItem = originalGetItem;
      
      expect(console.warn).toHaveBeenCalled();
      expect(value).toBeNull();
    });

    it('should handle removeItem errors gracefully', () => {
      spyOn(console, 'warn');
      
      const originalRemoveItem = Storage.prototype.removeItem;
      spyOn(Storage.prototype, 'removeItem').and.throwError('Storage access denied');
      
      service.removeItem('testKey');
      
      Storage.prototype.removeItem = originalRemoveItem;
      
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle clear errors gracefully', () => {
      spyOn(console, 'warn');
      
      const originalClear = Storage.prototype.clear;
      spyOn(Storage.prototype, 'clear').and.throwError('Storage access denied');
      
      service.clear();
      
      Storage.prototype.clear = originalClear;
      
      expect(console.warn).toHaveBeenCalled();
    });
  });
});
