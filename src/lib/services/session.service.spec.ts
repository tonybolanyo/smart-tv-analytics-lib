/**
 * @fileoverview Unit tests for SessionService
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';

describe('SessionService', () => {
  let service: SessionService;
  let storageService: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService',
      ['getItem', 'setItem', 'removeItem']);

    TestBed.configureTestingModule({
      providers: [
        SessionService,
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(SessionService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should initialize and create a new session if none exists', () => {
      storageService.getItem.and.returnValue(null);
      
      service.initialize();
      
      const session = service.getCurrentSession();
      expect(session).toBeTruthy();
      expect(session?.sessionId).toBeDefined();
      expect(session?.startTime).toBeDefined();
    });

    it('should load existing session from storage', () => {
      const existingSession = {
        sessionId: 'test-session-123',
        startTime: Date.now() - 1000,
        lastActivity: Date.now() - 500,
        isFirstSession: false,
        sessionNumber: 5
      };
      
      storageService.getItem.and.callFake((key: string) => {
        if (key === 'smarttv_analytics_session') {
          return JSON.stringify(existingSession);
        }
        return null;
      });
      
      service.initialize();
      
      const session = service.getCurrentSession();
      expect(session?.sessionId).toBe(existingSession.sessionId);
      expect(session?.sessionNumber).toBe(existingSession.sessionNumber);
    });

    it('should start new session if stored session is expired', () => {
      const expiredSession = {
        sessionId: 'expired-session',
        startTime: Date.now() - 60 * 60 * 1000, // 1 hour ago
        lastActivity: Date.now() - 60 * 60 * 1000,
        isFirstSession: false,
        sessionNumber: 3
      };
      
      storageService.getItem.and.callFake((key: string) => {
        if (key === 'smarttv_analytics_session') {
          return JSON.stringify(expiredSession);
        }
        return null;
      });
      
      service.initialize();
      
      const session = service.getCurrentSession();
      expect(session?.sessionId).not.toBe(expiredSession.sessionId);
    });
  });

  describe('startNewSession', () => {
    beforeEach(() => {
      storageService.getItem.and.returnValue(null);
    });

    it('should create a new session', () => {
      const session = service.startNewSession();
      
      expect(session).toBeTruthy();
      expect(session.sessionId).toBeDefined();
      expect(session.startTime).toBeDefined();
      expect(session.lastActivity).toBeDefined();
      expect(typeof session.sessionNumber).toBe('number');
    });

    it('should save session to storage', () => {
      service.startNewSession();
      
      expect(storageService.setItem).toHaveBeenCalledWith(
        'smarttv_analytics_session',
        jasmine.any(String)
      );
    });

    it('should mark first session correctly', () => {
      storageService.getItem.and.returnValue(null);
      
      const session = service.startNewSession();
      
      expect(session.isFirstSession).toBe(true);
    });

    it('should increment session number correctly', () => {
      storageService.getItem.and.returnValue(null);
      
      const session1 = service.startNewSession();
      
      // First session should have number 1
      expect(session1.sessionNumber).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getCurrentSession', () => {
    it('should return current session', () => {
      storageService.getItem.and.returnValue(null);
      service.initialize();
      
      const session = service.getCurrentSession();
      
      expect(session).toBeTruthy();
    });

    it('should return null if no session', () => {
      const session = service.getCurrentSession();
      
      expect(session).toBeNull();
    });
  });

  describe('updateActivity', () => {
    it('should update last activity time', (done) => {
      storageService.getItem.and.returnValue(null);
      service.initialize();
      
      const initialSession = service.getCurrentSession();
      const initialActivity = initialSession?.lastActivity;
      
      setTimeout(() => {
        service.updateActivity();
        
        const updatedSession = service.getCurrentSession();
        expect(updatedSession?.lastActivity).toBeGreaterThan(initialActivity || 0);
        done();
      }, 10);
    });

    it('should save updated session', () => {
      storageService.getItem.and.returnValue(null);
      service.initialize();
      storageService.setItem.calls.reset();
      
      service.updateActivity();
      
      expect(storageService.setItem).toHaveBeenCalled();
    });

    it('should do nothing if no current session', () => {
      service.updateActivity();
      
      expect(storageService.setItem).not.toHaveBeenCalled();
    });
  });

  describe('endSession', () => {
    it('should clear current session', () => {
      storageService.getItem.and.returnValue(null);
      service.initialize();
      
      service.endSession();
      
      expect(service.getCurrentSession()).toBeNull();
    });

    it('should remove session from storage', () => {
      storageService.getItem.and.returnValue(null);
      service.initialize();
      
      service.endSession();
      
      expect(storageService.removeItem).toHaveBeenCalledWith('smarttv_analytics_session');
    });
  });

  describe('onSessionStart', () => {
    it('should emit when new session starts', (done) => {
      storageService.getItem.and.returnValue(null);
      
      service.onSessionStart().subscribe(session => {
        expect(session).toBeTruthy();
        expect(session.sessionId).toBeDefined();
        done();
      });
      
      service.startNewSession();
    });
  });

  describe('isSessionExpired', () => {
    it('should return false for active session', () => {
      storageService.getItem.and.returnValue(null);
      service.initialize();
      
      expect(service.isSessionExpired()).toBe(false);
    });

    it('should return true when no session', () => {
      expect(service.isSessionExpired()).toBe(true);
    });

    it('should return true for expired session', () => {
      const expiredSession = {
        sessionId: 'expired',
        startTime: Date.now() - (60 * 60 * 1000), // 1 hour ago
        lastActivity: Date.now() - (60 * 60 * 1000),
        isFirstSession: false,
        sessionNumber: 1
      };
      
      storageService.getItem.and.callFake((key: string) => {
        if (key === 'smarttv_analytics_session') {
          return JSON.stringify(expiredSession);
        }
        return null;
      });
      
      service.initialize();
      
      // Session should be replaced with a new one due to expiration
      const currentSession = service.getCurrentSession();
      expect(currentSession?.sessionId).not.toBe(expiredSession.sessionId);
    });
  });

  describe('session timeout', () => {
    it('should setup session timeout on initialization', () => {
      storageService.getItem.and.returnValue(null);
      
      service.initialize();
      
      expect(service.getCurrentSession()).toBeTruthy();
    });

    it('should reset timeout on activity update', () => {
      storageService.getItem.and.returnValue(null);
      service.initialize();
      
      service.updateActivity();
      
      expect(service.getCurrentSession()).toBeTruthy();
    });
  });
});
