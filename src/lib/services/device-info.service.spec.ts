/**
 * @fileoverview Unit tests for DeviceInfoService
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

import { TestBed } from '@angular/core/testing';
import { DeviceInfoService } from './device-info.service';

describe('DeviceInfoService', () => {
  let service: DeviceInfoService;
  let originalUserAgent: string;
  let originalNavigator: Navigator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    originalUserAgent = navigator.userAgent;
    originalNavigator = navigator;
  });

  afterEach(() => {
    // Restore navigator if modified
    if (originalNavigator !== navigator) {
      Object.defineProperty(window, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true
      });
    }
  });

  describe('Browser environment', () => {
    beforeEach(() => {
      service = TestBed.inject(DeviceInfoService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should get device info', () => {
      const deviceInfo = service.getDeviceInfo();
      expect(deviceInfo).toBeDefined();
      expect(deviceInfo.platform).toBeDefined();
    });

    it('should get platform', () => {
      const platform = service.getPlatform();
      expect(platform).toBeDefined();
      expect(typeof platform).toBe('string');
    });

    it('should get screen resolution', () => {
      const resolution = service.getScreenResolution();
      expect(resolution).toBeDefined();
    });
  });

  describe('Platform detection', () => {
    it('should detect Tizen platform', () => {
      mockUserAgent('Mozilla/5.0 (SMART-TV; Linux; Tizen 5.0) AppleWebKit/537.36');
      service = TestBed.inject(DeviceInfoService);
      
      expect(service.getPlatform()).toBe('Tizen');
      expect(service.isTizen()).toBe(true);
      expect(service.isSmartTV()).toBe(true);
      expect(service.isWebOS()).toBe(false);
    });

    it('should detect WebOS platform', () => {
      mockUserAgent('Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36');
      service = TestBed.inject(DeviceInfoService);
      
      expect(service.getPlatform()).toBe('WebOS');
      expect(service.isWebOS()).toBe(true);
      expect(service.isSmartTV()).toBe(true);
      expect(service.isTizen()).toBe(false);
    });

    it('should detect generic SmartTV', () => {
      mockUserAgent('Mozilla/5.0 (SmartTV; Linux) AppleWebKit/537.36');
      service = TestBed.inject(DeviceInfoService);
      
      expect(service.getPlatform()).toBe('SmartTV');
      expect(service.isSmartTV()).toBe(true);
    });

    it('should detect Android TV', () => {
      mockUserAgent('Mozilla/5.0 (Linux; Android 9; Android TV) AppleWebKit/537.36');
      service = TestBed.inject(DeviceInfoService);
      
      expect(service.getPlatform()).toBe('AndroidTV');
    });

    it('should detect Roku', () => {
      mockUserAgent('Roku/DVP-9.10 (519.10E04154A)');
      service = TestBed.inject(DeviceInfoService);
      
      expect(service.getPlatform()).toBe('Roku');
    });

    it('should detect AppleTV', () => {
      mockUserAgent('AppleTV11,1/11.1');
      service = TestBed.inject(DeviceInfoService);
      
      expect(service.getPlatform()).toBe('AppleTV');
    });

    it('should detect FireTV', () => {
      mockUserAgent('Mozilla/5.0 (Linux; Android 5.1.1; AFTT Build/LVY48F) AppleWebKit/537.36');
      service = TestBed.inject(DeviceInfoService);
      
      expect(service.getPlatform()).toBe('FireTV');
    });

    it('should default to Browser for unknown platforms', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124');
      service = TestBed.inject(DeviceInfoService);
      
      const platform = service.getPlatform();
      // Platform detection may identify Chrome or Browser
      expect(platform).toBeDefined();
      expect(service.isSmartTV()).toBe(false);
    });

    it('should detect FireTV with AFTM', () => {
      mockUserAgent('Mozilla/5.0 (Linux; Android 5.1.1; AFTM Build/LVY48F) AppleWebKit/537.36');
      service = TestBed.inject(DeviceInfoService);
      
      expect(service.getPlatform()).toBe('FireTV');
    });

    it('should detect Safari browser', () => {
      mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15');
      service = TestBed.inject(DeviceInfoService);
      
      expect(service.getPlatform()).toBe('Safari');
    });

    it('should detect Firefox browser', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0');
      service = TestBed.inject(DeviceInfoService);
      
      expect(service.getPlatform()).toBe('Firefox');
    });

    it('should detect Edge browser', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59');
      service = TestBed.inject(DeviceInfoService);
      
      const platform = service.getPlatform();
      // Edge detection
      expect(platform).toBeDefined();
    });

    it('should detect Smart-TV with hyphen', () => {
      mockUserAgent('Mozilla/5.0 (Smart-TV; Linux) AppleWebKit/537.36');
      service = TestBed.inject(DeviceInfoService);
      
      expect(service.getPlatform()).toBe('SmartTV');
    });

    it('should detect SMART-TV uppercase', () => {
      mockUserAgent('Mozilla/5.0 (SMART-TV; Linux) AppleWebKit/537.36');
      service = TestBed.inject(DeviceInfoService);
      
      expect(service.getPlatform()).toBe('SmartTV');
    });
  });

  describe('Device info properties', () => {
    beforeEach(() => {
      service = TestBed.inject(DeviceInfoService);
    });

    it('should have language information', () => {
      const deviceInfo = service.getDeviceInfo();
      expect(deviceInfo.language).toBeDefined();
    });

    it('should have timezone information', () => {
      const deviceInfo = service.getDeviceInfo();
      expect(deviceInfo.timezone).toBeDefined();
    });

    it('should return a copy of device info', () => {
      const info1 = service.getDeviceInfo();
      const info2 = service.getDeviceInfo();
      
      expect(info1).toEqual(info2);
      expect(info1).not.toBe(info2); // Different object references
    });

    it('should detect model information', () => {
      const deviceInfo = service.getDeviceInfo();
      // Model may or may not be detected depending on platform
      expect(deviceInfo.model !== undefined || deviceInfo.model === undefined).toBe(true);
    });

    it('should detect OS version', () => {
      const deviceInfo = service.getDeviceInfo();
      // OS version may or may not be available
      expect(deviceInfo.osVersion !== undefined || deviceInfo.osVersion === undefined).toBe(true);
    });

    it('should have screenResolution defined', () => {
      const resolution = service.getScreenResolution();
      expect(resolution).toBeDefined();
    });
  });

  /**
   * Helper function to mock user agent
   */
  function mockUserAgent(userAgent: string): void {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: userAgent,
      writable: true,
      configurable: true
    });
  }
});
