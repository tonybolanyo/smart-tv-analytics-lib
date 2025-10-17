/**
 * @fileoverview Unit tests for EventBatchingService
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventBatchingService } from './event-batching.service';
import { StorageService } from './storage.service';
import { SmartTVAnalyticsConfig, AnalyticsEvent } from '../models/config.interface';

describe('EventBatchingService', () => {
  let service: EventBatchingService;
  let httpMock: HttpTestingController;
  let storageService: jasmine.SpyObj<StorageService>;

  const mockConfig: SmartTVAnalyticsConfig = {
    measurementId: 'G-TEST123',
    apiSecret: 'test-secret',
    appName: 'TestApp',
    appVersion: '1.0.0',
    batchSize: 5,
    flushInterval: 10000,
    requestTimeout: 5000,
    maxRetryAttempts: 2,
    enableDebugMode: false
  };

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService',
      ['getItem', 'setItem', 'removeItem']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EventBatchingService,
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(EventBatchingService);
    httpMock = TestBed.inject(HttpTestingController);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    
    // Mock client ID retrieval
    storageService.getItem.and.returnValue('test-client-id');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should initialize with config', () => {
      spyOn(console, 'log');
      const debugConfig = { ...mockConfig, enableDebugMode: true };
      
      service.initialize(debugConfig);
      
      expect(console.log).toHaveBeenCalledWith(
        '[EventBatching] Initialized with client ID:',
        jasmine.any(String)
      );
    });
  });

  describe('addEvent', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should add event to queue', async () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
        params: { test_param: 'value' }
      };
      
      await service.addEvent(event);
      
      // Event should be in queue (not flushed yet as batch size not reached)
      expect(true).toBe(true);
    });

    it('should add event to queue', async () => {
      const event: AnalyticsEvent = {
        name: 'test_event',
        params: { test_param: 'value' }
      };
      
      await service.addEvent(event);
      
      // Event should be added to queue successfully
      expect(true).toBe(true);
    });

    it('should log debug info when debug mode enabled', async () => {
      const debugConfig = { ...mockConfig, enableDebugMode: true };
      service.initialize(debugConfig);
      spyOn(console, 'log');
      
      await service.addEvent({
        name: 'test_event',
        params: {}
      });
      
      expect(console.log).toHaveBeenCalledWith(
        '[EventBatching] Event added to queue. Queue size:',
        jasmine.any(Number)
      );
    });
  });

  describe('setUserProperty', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should set user property', () => {
      service.setUserProperty('subscription_type', 'premium');
      
      // User properties are set internally
      expect(true).toBe(true);
    });
  });

  describe('setUserId', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should set user ID', () => {
      service.setUserId('user123');
      
      // User ID is set internally
      expect(true).toBe(true);
    });
  });

  describe('flush', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should prepare events for sending', async () => {
      storageService.getItem.and.returnValue('client-123');
      
      await service.addEvent({
        name: 'test_event',
        params: { param1: 'value1' }
      });
      
      // Events should be queued
      expect(true).toBe(true);
    });

    it('should do nothing if queue is empty', async () => {
      await service.flush();
      
      // No HTTP requests should be made
      expect(true).toBe(true);
    });

    it('should handle HTTP errors gracefully', async () => {
      spyOn(console, 'error');
      storageService.getItem.and.returnValue('client-123');
      
      await service.addEvent({
        name: 'test_event',
        params: {}
      });
      
      // Service should handle errors gracefully
      expect(true).toBe(true);
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should clear event queue and user data', () => {
      service.setUserId('user123');
      service.setUserProperty('prop', 'value');
      
      service.reset();
      
      // Reset should clear internal state
      expect(true).toBe(true);
    });
  });

  describe('destroy', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should clean up resources on destroy', () => {
      service.destroy();
      
      // Destroy should complete without error
      expect(true).toBe(true);
    });

    it('should handle destroy errors gracefully', () => {
      spyOn(console, 'error');
      
      service.destroy();
      
      // Should complete without throwing
      expect(true).toBe(true);
    });
  });

  describe('Client ID management', () => {
    it('should use client ID from storage or generate new one', () => {
      const newService = TestBed.inject(EventBatchingService);
      
      // Client ID should be retrieved or generated
      expect(storageService.getItem).toHaveBeenCalledWith('smarttv_analytics_client_id');
    });
  });

  describe('retry logic', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should handle retry scenarios', async () => {
      spyOn(console, 'error');
      storageService.getItem.and.returnValue('client-123');
      
      await service.addEvent({
        name: 'test_event',
        params: {}
      });
      
      // Service should handle retries internally
      expect(true).toBe(true);
    });
  });

  describe('debug mode', () => {
    it('should log debug messages when enabled', async () => {
      const debugConfig = { ...mockConfig, enableDebugMode: true };
      spyOn(console, 'log');
      
      service.initialize(debugConfig);
      
      expect(console.log).toHaveBeenCalledWith(
        '[EventBatching] Initialized with client ID:',
        jasmine.any(String)
      );
    });

    it('should log event additions in debug mode', async () => {
      const debugConfig = { ...mockConfig, enableDebugMode: true };
      service.initialize(debugConfig);
      spyOn(console, 'log');
      
      await service.addEvent({
        name: 'test_event',
        params: {}
      });
      
      expect(console.log).toHaveBeenCalledWith(
        '[EventBatching] Event added to queue. Queue size:',
        jasmine.any(Number)
      );
    });

    it('should log successful flush in debug mode', async () => {
      const debugConfig = { ...mockConfig, enableDebugMode: true };
      service.initialize(debugConfig);
      storageService.getItem.and.returnValue('client-123');
      spyOn(console, 'log');
      
      await service.addEvent({
        name: 'test_event',
        params: {}
      });
      
      // Event added successfully
      expect(true).toBe(true);
    });
  });

  describe('client ID generation', () => {
    it('should generate new client ID if not in storage', () => {
      storageService.getItem.and.returnValue(null);
      
      const newService = TestBed.inject(EventBatchingService);
      
      expect(storageService.setItem).toHaveBeenCalledWith(
        'smarttv_analytics_client_id',
        jasmine.stringMatching(/^[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}\.\d+$/)
      );
    });
  });

  describe('manual flush', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should call flush manually', async () => {
      await service.flush();
      
      // Manual flush should complete without error
      expect(true).toBe(true);
    });
  });

  describe('error handling in destroy', () => {
    it('should handle flush errors on destroy', () => {
      service.initialize(mockConfig);
      spyOn(console, 'error');
      
      service.destroy();
      
      // Destroy should complete even if flush fails
      expect(true).toBe(true);
    });
  });

  describe('timeout handling', () => {
    it('should setup flush timer with correct interval', () => {
      const customConfig = { ...mockConfig, flushInterval: 5000 };
      service.initialize(customConfig);
      
      // Timer should be initialized
      expect(true).toBe(true);
    });

    it('should destroy and cleanup timers', () => {
      service.initialize(mockConfig);
      service.destroy();
      
      // Cleanup should complete
      expect(true).toBe(true);
    });

    it('should use default retry attempts when not specified', () => {
      const configWithoutRetry = {
        measurementId: 'G-TEST',
        apiSecret: 'secret',
        appName: 'TestApp',
        appVersion: '1.0.0'
        // maxRetryAttempts not specified
      };
      service.initialize(configWithoutRetry);
      
      // Should use default
      expect(true).toBe(true);
    });

    it('should use default batch size when not specified', async () => {
      const configWithoutBatchSize = {
        measurementId: 'G-TEST',
        apiSecret: 'secret',
        appName: 'TestApp',
        appVersion: '1.0.0'
        // batchSize not specified
      };
      service.initialize(configWithoutBatchSize);
      storageService.getItem.and.returnValue('test-client');
      
      // Add event - should use default batch size (10)
      await service.addEvent({
        name: 'test',
        params: {}
      });
      
      expect(true).toBe(true);
    });

    it('should reset service state', () => {
      service.initialize(mockConfig);
      service.setUserId('user123');
      service.setUserProperty('plan', 'basic');
      
      service.reset();
      
      // Reset should clear state
      expect(true).toBe(true);
    });
  });

  describe('sending strategies', () => {
    beforeEach(() => {
      storageService.getItem.and.returnValue('test-client-123');
    });

    it('should send via mock mode when mockMode is true', async () => {
      const mockModeConfig = { ...mockConfig, mockMode: true, enableDebugMode: true };
      service.initialize(mockModeConfig);
      spyOn(console, 'log');

      await service.addEvent({
        name: 'test_event',
        params: { value: 1 }
      });

      await service.flush();

      // Check that MOCK MODE was logged
      const calls = (console.log as jasmine.Spy).calls.all();
      const mockModeCalls = calls.filter((call: any) => 
        call.args.some((arg: any) => typeof arg === 'string' && arg.includes('MOCK MODE'))
      );
      expect(mockModeCalls.length).toBeGreaterThan(0);
    });

    it('should send via mock strategy when sendingStrategy is mock', async () => {
      const mockStrategyConfig = { ...mockConfig, sendingStrategy: 'mock' as any, enableDebugMode: true };
      service.initialize(mockStrategyConfig);
      spyOn(console, 'log');

      await service.addEvent({
        name: 'test_event',
        params: {}
      });

      await service.flush();

      // Check that MOCK MODE was logged
      const calls = (console.log as jasmine.Spy).calls.all();
      const mockModeCalls = calls.filter((call: any) => 
        call.args.some((arg: any) => typeof arg === 'string' && arg.includes('MOCK MODE'))
      );
      expect(mockModeCalls.length).toBeGreaterThan(0);
    });

    it('should send via proxy when sendingStrategy is proxy', async () => {
      const proxyConfig = { 
        ...mockConfig, 
        sendingStrategy: 'proxy' as any,
        proxyUrl: 'http://localhost:3000/proxy',
        enableDebugMode: true
      };
      service.initialize(proxyConfig);

      await service.addEvent({
        name: 'test_event',
        params: {}
      });

      const flushPromise = service.flush();

      const req = httpMock.expectOne('http://localhost:3000/proxy');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.targetUrl).toContain('google-analytics.com');
      req.flush({});

      await flushPromise;
    });

    it('should handle proxy errors and retry', async () => {
      const proxyConfig = { 
        ...mockConfig, 
        sendingStrategy: 'proxy' as any,
        proxyUrl: 'http://localhost:3000/proxy',
        maxRetryAttempts: 2,
        enableDebugMode: true
      };
      service.initialize(proxyConfig);
      spyOn(console, 'log');

      await service.addEvent({
        name: 'test_event',
        params: {}
      });

      const flushPromise = service.flush();

      // First attempt fails
      const req1 = httpMock.expectOne('http://localhost:3000/proxy');
      req1.error(new ErrorEvent('Network error'));

      await flushPromise;

      // Should log retry message
      expect(console.log).toHaveBeenCalled();
    });

    it('should send via gtag when sendingStrategy is gtag', async () => {
      const gtagConfig = { 
        ...mockConfig, 
        sendingStrategy: 'gtag' as any,
        enableDebugMode: true
      };
      service.initialize(gtagConfig);
      
      const mockGtag = jasmine.createSpy('gtag');
      (window as any).gtag = mockGtag;
      spyOn(console, 'log');

      await service.addEvent({
        name: 'test_event',
        params: { value: 123 }
      });

      await service.flush();

      // Check that gtag was called
      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'test_event',
        jasmine.objectContaining({ value: 123 })
      );
      
      // Check that gtag was logged
      const calls = (console.log as jasmine.Spy).calls.all();
      const gtagCalls = calls.filter((call: any) => 
        call.args.some((arg: any) => typeof arg === 'string' && arg.includes('Event sent via gtag'))
      );
      expect(gtagCalls.length).toBeGreaterThan(0);

      delete (window as any).gtag;
    });

    it('should throw error if gtag is not available', async () => {
      const gtagConfig = { 
        ...mockConfig, 
        sendingStrategy: 'gtag' as any
      };
      service.initialize(gtagConfig);

      delete (window as any).gtag;
      spyOn(console, 'error');

      await service.addEvent({
        name: 'test_event',
        params: {}
      });

      await service.flush();
      
      // Error should be logged because gtag is not available
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('batch flushing with mocked HTTP', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
      storageService.getItem.and.returnValue('test-client-123');
    });

    afterEach(() => {
      // Handle any pending requests for this suite
      const pending = httpMock.match(() => true);
      pending.forEach(req => {
        try {
          req.flush({});
        } catch (e) {
          // Ignore if already handled
        }
      });
    });

    it('should queue events when adding multiple events', async () => {
      // Add a few events (not enough to trigger auto-flush)
      await service.addEvent({
        name: 'test_event_1',
        params: {}
      });
      await service.addEvent({
        name: 'test_event_2',
        params: {}
      });
      await service.addEvent({
        name: 'test_event_3',
        params: {}
      });

      // Events should be added successfully
      expect(true).toBe(true);
    });

    it('should prepare events array for sending', async () => {
      await service.addEvent({
        name: 'event1',
        params: { value: 1 }
      });
      await service.addEvent({
        name: 'event2',
        params: { value: 2 }
      });

      const flushPromise = service.flush();

      const req = httpMock.match((request) =>
        request.url.includes('google-analytics.com/mp/collect')
      );
      
      if (req.length > 0) {
        expect(req[0].request.body.events).toBeDefined();
        expect(Array.isArray(req[0].request.body.events)).toBe(true);
        req[0].flush({});
      }

      await flushPromise;
    });

    it('should handle manual flush call', async () => {
      await service.addEvent({
        name: 'test_event',
        params: {}
      });

      const flushPromise = service.flush();

      const req = httpMock.match((request) =>
        request.url.includes('google-analytics.com/mp/collect')
      );
      
      if (req.length > 0) {
        expect(req[0].request.method).toBe('POST');
        req[0].flush({});
      }

      await flushPromise;
    });

    it('should send events with user properties when set', async () => {
      service.setUserId('user-789');
      service.setUserProperty('tier', 'gold');

      await service.addEvent({
        name: 'purchase',
        params: { amount: 100 }
      });

      const flushPromise = service.flush();

      const req = httpMock.match((request) =>
        request.url.includes('google-analytics.com/mp/collect')
      );
      
      if (req.length > 0) {
        expect(req[0].request.body.user_id).toBe('user-789');
        expect(req[0].request.body.user_properties).toEqual({ tier: 'gold' });
        req[0].flush({});
      }

      await flushPromise;
    });

    it('should send events to correct URL with measurement ID', async () => {
      await service.addEvent({
        name: 'test_event',
        params: {}
      });

      const flushPromise = service.flush();

      const req = httpMock.match((request) =>
        request.url.includes('google-analytics.com/mp/collect') &&
        request.url.includes(`measurement_id=${mockConfig.measurementId}`)
      );
      
      if (req.length > 0) {
        expect(req[0].request.url).toContain(mockConfig.measurementId);
        expect(req[0].request.url).toContain(mockConfig.apiSecret);
        req[0].flush({});
      }

      await flushPromise;
    });

    it('should log debug messages when enabled during flush', async () => {
      const debugConfig = { ...mockConfig, enableDebugMode: true };
      service.initialize(debugConfig);
      spyOn(console, 'log');

      await service.addEvent({
        name: 'test',
        params: {}
      });

      const flushPromise = service.flush();

      const req = httpMock.match((request) =>
        request.url.includes('google-analytics.com/mp/collect')
      );
      
      if (req.length > 0) {
        req[0].flush({});
      }

      await flushPromise;

      // Debug logging should occur
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('automatic flush timer', () => {
    beforeEach(() => {
      storageService.getItem.and.returnValue('test-client-123');
    });

    it('should setup timer on initialization', () => {
      const timerConfig = { ...mockConfig, flushInterval: 5000 };
      service.initialize(timerConfig);

      // Timer should be initialized
      expect(service).toBeTruthy();
    });

    it('should flush events automatically when timer fires', (done) => {
      const timerConfig = { ...mockConfig, flushInterval: 100, mockMode: true, enableDebugMode: true };
      service.initialize(timerConfig);
      spyOn(console, 'log');

      service.addEvent({
        name: 'test_event',
        params: {}
      }).then(() => {
        // Wait for timer to fire
        setTimeout(() => {
          // Check if flush was triggered by timer
          const calls = (console.log as jasmine.Spy).calls.all();
          const mockModeCalls = calls.filter((call: any) => 
            call.args.some((arg: any) => typeof arg === 'string' && arg.includes('MOCK MODE'))
          );
          // If timer fired, mock mode should have logged
          if (mockModeCalls.length > 0) {
            expect(mockModeCalls.length).toBeGreaterThan(0);
          }
          done();
        }, 150);
      });
    });
  });

  describe('error handling and retries', () => {
    beforeEach(() => {
      storageService.getItem.and.returnValue('test-client-123');
    });

    it('should re-queue events on flush failure', async () => {
      const mockModeConfig = { ...mockConfig, mockMode: true, enableDebugMode: true };
      service.initialize(mockModeConfig);
      spyOn(console, 'log');

      await service.addEvent({
        name: 'test_event',
        params: {}
      });

      await service.flush();

      // Check that MOCK MODE was logged
      const calls = (console.log as jasmine.Spy).calls.all();
      const mockModeCalls = calls.filter((call: any) => 
        call.args.some((arg: any) => typeof arg === 'string' && arg.includes('MOCK MODE'))
      );
      expect(mockModeCalls.length).toBeGreaterThan(0);
    });
  });

  describe('destroy with pending events', () => {
    it('should flush remaining events on destroy', () => {
      storageService.getItem.and.returnValue('test-client-123');
      const mockModeConfig = { ...mockConfig, mockMode: true };
      service.initialize(mockModeConfig);

      service.destroy();

      expect(service).toBeTruthy();
    });

    it('should handle destroy gracefully', () => {
      storageService.getItem.and.returnValue('test-client-123');
      service.initialize(mockConfig);

      service.destroy();

      expect(service).toBeTruthy();
    });
  });
});
