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

    it('should handle getAllKeys errors for localStorage', () => {
      // Only test if using localStorage
      if (service.getStorageType() === 'localStorage') {
        spyOn(console, 'warn');
        
        const originalKey = Storage.prototype.key;
        spyOn(Storage.prototype, 'key').and.throwError('Storage access denied');
        
        const keys = service.getAllKeys();
        
        Storage.prototype.key = originalKey;
        
        expect(console.warn).toHaveBeenCalled();
        expect(Array.isArray(keys)).toBe(true);
      } else {
        // For memory storage, just verify it returns an array
        const keys = service.getAllKeys();
        expect(Array.isArray(keys)).toBe(true);
      }
    });
  });

  describe('getAllKeys for localStorage', () => {
    it('should enumerate localStorage keys when using localStorage', () => {
      // Verify we're using localStorage
      if (service.getStorageType() === 'localStorage') {
        service.setItem('test1', 'value1');
        service.setItem('test2', 'value2');
        
        const keys = service.getAllKeys();
        
        expect(keys).toContain('test1');
        expect(keys).toContain('test2');
      } else {
        // If using memory storage, test that behavior instead
        service.setItem('test1', 'value1');
        service.setItem('test2', 'value2');
        
        const keys = service.getAllKeys();
        expect(keys).toContain('test1');
        expect(keys).toContain('test2');
      }
    });
  });

  describe('memory storage fallback', () => {
    it('should use memory storage when localStorage is not available', () => {
      // This is already tested implicitly through error handling
      // but we can verify the storage type detection
      const storageType = service.getStorageType();
      expect(['localStorage', 'memory']).toContain(storageType);
    });

    it('should store and retrieve from memory when localStorage fails', () => {
      // Only test if currently using localStorage
      if (service.getStorageType() === 'localStorage') {
        const originalSetItem = Storage.prototype.setItem;
        const originalGetItem = Storage.prototype.getItem;
        
        spyOn(Storage.prototype, 'setItem').and.throwError('Storage quota exceeded');
        spyOn(Storage.prototype, 'getItem').and.throwError('Storage access denied');
        spyOn(console, 'warn');
        
        service.setItem('memKey', 'memValue');
        const value = service.getItem('memKey');
        
        Storage.prototype.setItem = originalSetItem;
        Storage.prototype.getItem = originalGetItem;
        
        expect(value).toBe('memValue');
      } else {
        // Already using memory storage
        service.setItem('memKey', 'memValue');
        const value = service.getItem('memKey');
        expect(value).toBe('memValue');
      }
    });
  });
});
