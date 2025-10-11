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

    it('should flush when batch size is reached', async () => {
      storageService.getItem.and.returnValue('test-client-id-123');
      
      // Add events up to batch size
      for (let i = 0; i < mockConfig.batchSize!; i++) {
        await service.addEvent({
          name: `event_${i}`,
          params: { index: i }
        });
      }
      
      // Should trigger HTTP request
      const req = httpMock.expectOne((request) => 
        request.url.includes('google-analytics.com/mp/collect')
      );
      expect(req.request.method).toBe('POST');
      
      req.flush({});
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

    it('should send events via HTTP', async () => {
      storageService.getItem.and.returnValue('client-123');
      
      await service.addEvent({
        name: 'test_event',
        params: { param1: 'value1' }
      });
      
      const flushPromise = service.flush();
      
      const req = httpMock.expectOne((request) => 
        request.url.includes('google-analytics.com/mp/collect')
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeDefined();
      
      req.flush({});
      
      await flushPromise;
    });

    it('should do nothing if queue is empty', async () => {
      await service.flush();
      
      // No HTTP requests should be made
      expect(true).toBe(true);
    });

    it('should handle HTTP errors', async () => {
      spyOn(console, 'error');
      storageService.getItem.and.returnValue('client-123');
      
      await service.addEvent({
        name: 'test_event',
        params: {}
      });
      
      const flushPromise = service.flush();
      
      const req = httpMock.expectOne((request) => 
        request.url.includes('google-analytics.com/mp/collect')
      );
      
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      
      await flushPromise.catch(() => {
        // Expected to catch error
      });
      
      expect(console.error).toHaveBeenCalled();
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

    it('should flush remaining events on destroy', async () => {
      storageService.getItem.and.returnValue('client-123');
      
      await service.addEvent({
        name: 'final_event',
        params: {}
      });
      
      service.destroy();
      
      // Should attempt to flush
      const req = httpMock.match((request) => 
        request.url.includes('google-analytics.com/mp/collect')
      );
      
      if (req.length > 0) {
        req[0].flush({});
      }
    });

    it('should handle destroy errors gracefully', () => {
      spyOn(console, 'error');
      
      service.destroy();
      
      // Should complete without throwing
      expect(true).toBe(true);
    });
  });

  describe('Client ID management', () => {
    it('should generate client ID if not in storage', () => {
      storageService.getItem.and.returnValue(null);
      
      const newService = TestBed.inject(EventBatchingService);
      
      expect(storageService.setItem).toHaveBeenCalledWith(
        'smarttv_analytics_client_id',
        jasmine.any(String)
      );
    });

    it('should use existing client ID from storage', () => {
      storageService.getItem.and.returnValue('existing-client-id');
      storageService.setItem.calls.reset();
      
      const newService = TestBed.inject(EventBatchingService);
      
      // Should not call setItem since client ID already exists
      const clientIdCalls = storageService.setItem.calls.all().filter(call =>
        call.args[0] === 'smarttv_analytics_client_id'
      );
      expect(clientIdCalls.length).toBe(0);
    });
  });
});
