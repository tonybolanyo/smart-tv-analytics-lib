/**
 * @fileoverview Unit tests for SmartTVAnalyticsService
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

import { TestBed } from '@angular/core/testing';
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
    const routerSpy = jasmine.createSpyObj('Router', ['events']);

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
    router.events = of();
    eventBatchingService.addEvent.and.returnValue(Promise.resolve());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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
    it('should track first visit event', () => {
      const firstSessionInfo = { ...mockSessionInfo, isFirstSession: true };
      sessionService.getCurrentSession.and.returnValue(firstSessionInfo);
      storageService.getItem.and.returnValue(null);

      service.initialize(mockConfig);

      expect(eventBatchingService.addEvent).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'first_visit'
        })
      );
    });

    it('should track app update event', () => {
      storageService.getItem.and.returnValue('0.9.0');

      service.initialize(mockConfig);

      expect(eventBatchingService.addEvent).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'app_update',
          params: jasmine.objectContaining({
            previous_version: '0.9.0',
            current_version: '1.0.0'
          })
        })
      );
    });
  });
});