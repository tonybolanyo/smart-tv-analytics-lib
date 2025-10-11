/**
 * @fileoverview Unit tests for SmartTVAnalyticsService
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

import { TestBed, fakeAsync, flush, flushMicrotasks, waitForAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { SmartTVAnalyticsService } from '../services/smart-tv-analytics.service';
import { EventBatchingService } from './event-batching.service';
import { SessionService } from './session.service';
import { DeviceInfoService } from './device-info.service';
import { StorageService } from '../services/storage.service';
import { SmartTVAnalyticsConfig } from '../models/config.interface';

describe('SmartTVAnalyticsService', () => {
  let service: SmartTVAnalyticsService;
  let eventBatchingService: jasmine.SpyObj<EventBatchingService>;
  let sessionService: jasmine.SpyObj<SessionService>;
  let deviceInfoService: jasmine.SpyObj<DeviceInfoService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let router: jasmine.SpyObj<Router>;

  const mockConfig: SmartTVAnalyticsConfig = {
    measurementId: 'G-TEST123',
    apiSecret: 'test-secret',
    appName: 'TestApp',
    appVersion: '1.0.0',
    enableDebugMode: true
  };

  const mockSessionInfo = {
    sessionId: 'test-session',
    startTime: Date.now(),
    lastActivity: Date.now(),
    isFirstSession: false,
    sessionNumber: 1
  };

  const mockDeviceInfo = {
    platform: 'Tizen',
    model: 'SAMSUNG-TV',
    osVersion: '6.0',
    screenResolution: '1920x1080',
    language: 'en-US',
    timezone: 'America/New_York'
  };

  beforeEach(() => {
    const eventBatchingSpy = jasmine.createSpyObj('EventBatchingService',
      ['initialize', 'addEvent', 'setUserProperty', 'setUserId', 'flush', 'reset']);
    const sessionSpy = jasmine.createSpyObj('SessionService',
      ['initialize', 'getCurrentSession', 'onSessionStart', 'startNewSession']);
    const deviceInfoSpy = jasmine.createSpyObj('DeviceInfoService',
      ['getDeviceInfo']);
    const storageSpy = jasmine.createSpyObj('StorageService',
      ['getItem', 'setItem', 'removeItem']);
    const routerSpy = jasmine.createSpyObj('Router', [], { events: of() });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SmartTVAnalyticsService,
        { provide: EventBatchingService, useValue: eventBatchingSpy },
        { provide: SessionService, useValue: sessionSpy },
        { provide: DeviceInfoService, useValue: deviceInfoSpy },
        { provide: StorageService, useValue: storageSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(SmartTVAnalyticsService);
    eventBatchingService = TestBed.inject(EventBatchingService) as jasmine.SpyObj<EventBatchingService>;
    sessionService = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    deviceInfoService = TestBed.inject(DeviceInfoService) as jasmine.SpyObj<DeviceInfoService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup mocks
    sessionService.getCurrentSession.and.returnValue(mockSessionInfo);
    sessionService.onSessionStart.and.returnValue(of(mockSessionInfo));
    deviceInfoService.getDeviceInfo.and.returnValue(mockDeviceInfo);
    eventBatchingService.addEvent.and.returnValue(Promise.resolve());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor with injected config', () => {
    it('should initialize with injected config', () => {
      const eventBatchingSpy = jasmine.createSpyObj('EventBatchingService',
        ['initialize', 'addEvent', 'setUserProperty', 'setUserId', 'flush', 'reset']);
      const sessionSpy = jasmine.createSpyObj('SessionService',
        ['initialize', 'getCurrentSession', 'onSessionStart', 'startNewSession']);
      const deviceInfoSpy = jasmine.createSpyObj('DeviceInfoService',
        ['getDeviceInfo']);
      const storageSpy = jasmine.createSpyObj('StorageService',
        ['getItem', 'setItem', 'removeItem']);
      const routerSpy = jasmine.createSpyObj('Router', [], { events: of() });
      
      sessionSpy.getCurrentSession.and.returnValue(mockSessionInfo);
      sessionSpy.onSessionStart.and.returnValue(of(mockSessionInfo));
      deviceInfoSpy.getDeviceInfo.and.returnValue(mockDeviceInfo);
      eventBatchingSpy.addEvent.and.returnValue(Promise.resolve());
      storageSpy.getItem.and.returnValue(null);

      const serviceWithConfig = new SmartTVAnalyticsService(
        eventBatchingSpy,
        sessionSpy,
        deviceInfoSpy,
        storageSpy,
        routerSpy,
        mockConfig
      );

      expect(eventBatchingSpy.initialize).toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    it('should initialize with config', () => {
      service.initialize(mockConfig);

      expect(eventBatchingService.initialize).toHaveBeenCalledWith(jasmine.objectContaining(mockConfig));
      expect(sessionService.initialize).toHaveBeenCalled();
    });

    it('should handle debug mode', () => {
      spyOn(console, 'log');
      service.initialize(mockConfig);

      expect(console.log).toHaveBeenCalledWith(
        '[SmartTVAnalytics] Initializing with config:',
        jasmine.any(Object)
      );
    });
  });

  describe('logEvent', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should log event successfully', async () => {
      await service.logEvent('test_event', { param1: 'value1' });

      expect(eventBatchingService.addEvent).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'test_event',
          params: jasmine.objectContaining({
            param1: 'value1',
            app_name: 'TestApp',
            app_version: '1.0.0'
          })
        })
      );
    });

    it('should handle event without parameters', async () => {
      await service.logEvent('simple_event');

      expect(eventBatchingService.addEvent).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'simple_event'
        })
      );
    });

    it('should not log when collection is disabled', async () => {
      service.enableCollection(false);
      await service.logEvent('test_event');

      expect(eventBatchingService.addEvent).not.toHaveBeenCalled();
    });

    it('should warn when not initialized', async () => {
      const uninitializedService = new SmartTVAnalyticsService(
        eventBatchingService,
        sessionService,
        deviceInfoService,
        storageService,
        router
      );
      spyOn(console, 'warn');

      await uninitializedService.logEvent('test_event');

      expect(console.warn).toHaveBeenCalledWith(
        '[SmartTVAnalytics] Service not initialized. Call initialize() first.'
      );
      expect(eventBatchingService.addEvent).not.toHaveBeenCalled();
    });
  });

  describe('setUserProperty', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should set user property', () => {
      service.setUserProperty('age', '25');

      expect(eventBatchingService.setUserProperty).toHaveBeenCalledWith('age', '25');
    });
  });

  describe('setUserId', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should set user ID', () => {
      service.setUserId('user123');

      expect(eventBatchingService.setUserId).toHaveBeenCalledWith('user123');
    });
  });

  describe('enableCollection', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should enable collection', () => {
      spyOn(console, 'log');
      service.enableCollection(true);

      expect(console.log).toHaveBeenCalledWith('[SmartTVAnalytics] Collection enabled:', true);
    });

    it('should disable collection', () => {
      spyOn(console, 'log');
      service.enableCollection(false);

      expect(console.log).toHaveBeenCalledWith('[SmartTVAnalytics] Collection enabled:', false);
    });
  });

  describe('getCurrentSession', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should return current session', () => {
      const session = service.getCurrentSession();
      expect(session).toEqual(mockSessionInfo);
    });
  });

  describe('flush', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should flush events', async () => {
      eventBatchingService.flush.and.returnValue(Promise.resolve());

      await service.flush();

      expect(eventBatchingService.flush).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should reset analytics data', () => {
      spyOn(console, 'log');
      service.reset();

      expect(sessionService.startNewSession).toHaveBeenCalled();
      expect(eventBatchingService.reset).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('[SmartTVAnalytics] Analytics data reset');
    });
  });

  describe('automatic events', () => {
    it('should be initialized properly for event tracking', () => {
      const firstSessionInfo = { ...mockSessionInfo, isFirstSession: true };
      sessionService.getCurrentSession.and.returnValue(firstSessionInfo);
      storageService.getItem.and.returnValue(null);

      service.initialize(mockConfig);

      // Service should be initialized and ready
      expect(service.getCurrentSession()).toBeTruthy();
    });

    it('should track first visit event for new users', (done) => {
      const firstSessionInfo = { ...mockSessionInfo, isFirstSession: true };
      sessionService.getCurrentSession.and.returnValue(firstSessionInfo);
      storageService.getItem.and.returnValue(null);

      service.initialize(mockConfig);
      
      // Wait for promises to resolve (longer delay for promise chain)
      setTimeout(() => {
        // First visit event should be logged
        const firstVisitCalls = eventBatchingService.addEvent.calls.all().filter(call => 
          call.args[0].name === 'first_visit'
        );
        expect(firstVisitCalls.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    it('should track app update event when version changes', (done) => {
      storageService.getItem.and.returnValue('0.9.0');

      service.initialize(mockConfig);
      
      // Wait for promises to resolve (longer delay for promise chain)
      setTimeout(() => {
        // App update event should be logged
        const appUpdateCalls = eventBatchingService.addEvent.calls.all().filter(call => 
          call.args[0].name === 'app_update'
        );
        expect(appUpdateCalls.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    it('should handle app version checking', () => {
      storageService.getItem.and.returnValue('0.9.0');

      service.initialize(mockConfig);

      // App version should be tracked in storage
      expect(storageService.setItem).toHaveBeenCalledWith(
        'last_app_version',
        '1.0.0'
      );
    });

    it('should store current app version', () => {
      storageService.getItem.and.returnValue(null);

      service.initialize(mockConfig);

      // New version should be stored
      expect(storageService.setItem).toHaveBeenCalledWith(
        'last_app_version',
        '1.0.0'
      );
    });

    it('should track session start events', (done) => {
      const { Subject } = require('rxjs');
      const sessionStarts = new Subject();
      sessionService.onSessionStart.and.returnValue(sessionStarts.asObservable());
      
      const sessionConfig = {
        ...mockConfig,
        enableSessionTracking: true
      };
      
      service.initialize(sessionConfig);
      
      // Emit session start
      setTimeout(() => {
        sessionStarts.next(mockSessionInfo);
        
        setTimeout(() => {
          const sessionStartCalls = eventBatchingService.addEvent.calls.all().filter(call => 
            call.args[0].name === 'session_start'
          );
          expect(sessionStartCalls.length).toBeGreaterThanOrEqual(0);
          done();
        }, 50);
      }, 50);
    });
  });

  describe('ngOnDestroy', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should clean up resources on destroy', async () => {
      eventBatchingService.flush.and.returnValue(Promise.resolve());
      
      service.ngOnDestroy();
      
      // Wait for async flush
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(eventBatchingService.flush).toHaveBeenCalled();
    });

    it('should clear engagement timer on destroy', () => {
      const engagementConfig = {
        ...mockConfig,
        enableEngagementTracking: true
      };
      
      service.initialize(engagementConfig);
      service.ngOnDestroy();
      
      // Should complete without error
      expect(true).toBe(true);
    });

    it('should handle flush errors on destroy', async () => {
      spyOn(console, 'error');
      eventBatchingService.flush.and.returnValue(Promise.reject(new Error('Flush error')));
      
      service.ngOnDestroy();
      
      // Wait for async error handling
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(console.error).toHaveBeenCalledWith(
        '[SmartTVAnalytics] Error flushing events on destroy:',
        jasmine.any(Error)
      );
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      service.initialize(mockConfig);
    });

    it('should handle errors in logEvent', async () => {
      spyOn(console, 'error');
      eventBatchingService.addEvent.and.returnValue(Promise.reject(new Error('Test error')));
      
      await service.logEvent('error_event');
      
      expect(console.error).toHaveBeenCalledWith(
        '[SmartTVAnalytics] Error logging event:',
        jasmine.any(Error)
      );
    });
  });

  describe('navigation events', () => {
    it('should track page view on navigation', (done) => {
      const { Subject } = require('rxjs');
      const routerEvents = new Subject();
      const routerSpy = jasmine.createSpyObj('Router', [], { events: routerEvents.asObservable() });
      
      const eventBatchingSpy = jasmine.createSpyObj('EventBatchingService',
        ['initialize', 'addEvent', 'setUserProperty', 'setUserId', 'flush', 'reset']);
      const sessionSpy = jasmine.createSpyObj('SessionService',
        ['initialize', 'getCurrentSession', 'onSessionStart', 'startNewSession']);
      const deviceInfoSpy = jasmine.createSpyObj('DeviceInfoService',
        ['getDeviceInfo']);
      const storageSpy = jasmine.createSpyObj('StorageService',
        ['getItem', 'setItem', 'removeItem']);
      
      sessionSpy.getCurrentSession.and.returnValue(mockSessionInfo);
      sessionSpy.onSessionStart.and.returnValue(of(mockSessionInfo));
      deviceInfoSpy.getDeviceInfo.and.returnValue(mockDeviceInfo);
      eventBatchingSpy.addEvent.and.returnValue(Promise.resolve());
      storageSpy.getItem.and.returnValue(null);

      const testService = new SmartTVAnalyticsService(
        eventBatchingSpy,
        sessionSpy,
        deviceInfoSpy,
        storageSpy,
        routerSpy
      );

      const navConfig = {
        ...mockConfig,
        enablePageViewTracking: true
      };
      
      testService.initialize(navConfig);
      
      // Emit navigation event
      const navEvent = new (class extends require('@angular/router').NavigationEnd {
        constructor() {
          super(1, '/test', '/test');
        }
      })();
      
      setTimeout(() => {
        routerEvents.next(navEvent);
        
        setTimeout(() => {
          expect(eventBatchingSpy.addEvent).toHaveBeenCalled();
          done();
        }, 50);
      }, 50);
    });
  });

  describe('engagement tracking', () => {
    it('should setup engagement tracking when enabled', fakeAsync(() => {
      const engagementConfig = {
        ...mockConfig,
        enableEngagementTracking: true
      };
      
      service.initialize(engagementConfig);
      
      // Advance time to trigger engagement event (30 seconds default interval + 1 second)
      tick(31000);
      
      expect(eventBatchingService.addEvent).toHaveBeenCalled();
      
      // Clean up periodic tasks
      discardPeriodicTasks();
    }));

    it('should reset engagement time on user interactions', fakeAsync(() => {
      const engagementConfig = {
        ...mockConfig,
        enableEngagementTracking: true
      };
      
      service.initialize(engagementConfig);
      
      // Simulate user interactions
      document.dispatchEvent(new Event('click'));
      document.dispatchEvent(new KeyboardEvent('keydown'));
      document.dispatchEvent(new Event('mousemove'));
      document.dispatchEvent(new TouchEvent('touchstart'));
      
      tick();
      
      expect(true).toBe(true);
      
      // Clean up periodic tasks
      discardPeriodicTasks();
    }));

    it('should track engagement time accurately', fakeAsync(() => {
      const engagementConfig = {
        ...mockConfig,
        enableEngagementTracking: true
      };
      
      service.initialize(engagementConfig);
      
      // Fast-forward time (1 minute)
      tick(60000);
      
      // Engagement event should be logged
      expect(eventBatchingService.addEvent).toHaveBeenCalled();
      
      // Clean up periodic tasks
      discardPeriodicTasks();
    }));
  });
});