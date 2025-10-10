/**
 * @fileoverview Session management service for Smart TV Analytics
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SessionInfo } from '../models/config.interface';
import { StorageService } from './storage.service';

/**
 * Service responsible for managing user sessions
 */
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly SESSION_KEY = 'smarttv_analytics_session';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly FIRST_SESSION_KEY = 'smarttv_analytics_first_session';
  
  private currentSession: SessionInfo | null = null;
  private sessionStartSubject = new BehaviorSubject<SessionInfo | null>(null);
  private sessionTimeoutId?: number;

  constructor(private storage: StorageService) {}

  /**
   * Initialize the session service
   */
  initialize(): void {
    this.loadOrCreateSession();
    this.setupSessionTimeout();
  }

  /**
   * Get the current session information
   * @returns Current session info or null if no active session
   */
  getCurrentSession(): SessionInfo | null {
    return this.currentSession;
  }

  /**
   * Observable that emits when a new session starts
   * @returns Observable of session start events
   */
  onSessionStart(): Observable<SessionInfo> {
    return this.sessionStartSubject.asObservable().pipe(
      filter(session => session !== null)
    ) as Observable<SessionInfo>;
  }

  /**
   * Start a new session
   * @returns The new session information
   */
  startNewSession(): SessionInfo {
    const now = Date.now();
    const sessionId = this.generateSessionId();
    const isFirstSession = this.isFirstSessionEver();
    const sessionNumber = this.getNextSessionNumber();

    const newSession: SessionInfo = {
      sessionId,
      startTime: now,
      lastActivity: now,
      isFirstSession,
      sessionNumber
    };

    this.currentSession = newSession;
    this.saveSession();
    this.sessionStartSubject.next(newSession);
    this.setupSessionTimeout();

    return newSession;
  }

  /**
   * Update the last activity time for the current session
   */
  updateActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActivity = Date.now();
      this.saveSession();
      this.setupSessionTimeout();
    }
  }

  /**
   * End the current session
   */
  endSession(): void {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }
    
    this.currentSession = null;
    this.storage.removeItem(this.SESSION_KEY);
  }

  /**
   * Check if the current session is expired
   * @returns True if session is expired
   */
  isSessionExpired(): boolean {
    if (!this.currentSession) {
      return true;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - this.currentSession.lastActivity;
    
    return timeSinceLastActivity > this.SESSION_TIMEOUT;
  }

  /**
   * Load existing session or create a new one
   * @private
   */
  private loadOrCreateSession(): void {
    const savedSession = this.storage.getItem(this.SESSION_KEY);
    
    if (savedSession) {
      try {
        const session: SessionInfo = JSON.parse(savedSession);
        
        if (!this.isSessionExpiredForSession(session)) {
          this.currentSession = session;
          this.currentSession.lastActivity = Date.now();
          this.saveSession();
          return;
        }
      } catch (error) {
        console.warn('[SessionService] Error parsing saved session:', error);
      }
    }

    // Create new session if no valid session exists
    this.startNewSession();
  }

  /**
   * Check if a specific session is expired
   * @private
   */
  private isSessionExpiredForSession(session: SessionInfo): boolean {
    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;
    
    return timeSinceLastActivity > this.SESSION_TIMEOUT;
  }

  /**
   * Save the current session to storage
   * @private
   */
  private saveSession(): void {
    if (this.currentSession) {
      this.storage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
    }
  }

  /**
   * Generate a unique session ID
   * @private
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
  }

  /**
   * Check if this is the very first session for this user
   * @private
   */
  private isFirstSessionEver(): boolean {
    const hasFirstSession = this.storage.getItem(this.FIRST_SESSION_KEY);
    
    if (!hasFirstSession) {
      this.storage.setItem(this.FIRST_SESSION_KEY, 'true');
      return true;
    }
    
    return false;
  }

  /**
   * Get the next session number for this user
   * @private
   */
  private getNextSessionNumber(): number {
    const SESSION_COUNT_KEY = 'smarttv_analytics_session_count';
    const currentCount = parseInt(this.storage.getItem(SESSION_COUNT_KEY) || '0', 10);
    const nextCount = currentCount + 1;
    
    this.storage.setItem(SESSION_COUNT_KEY, nextCount.toString());
    
    return nextCount;
  }

  /**
   * Set up session timeout handling
   * @private
   */
  private setupSessionTimeout(): void {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }

    this.sessionTimeoutId = window.setTimeout(() => {
      if (this.currentSession && this.isSessionExpired()) {
        this.endSession();
      }
    }, this.SESSION_TIMEOUT);
  }
}

/**
 * Filter function for RxJS (needed for Angular 12 compatibility)
 */
function filter<T>(predicate: (value: T) => boolean): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>) => {
    return new Observable<T>(subscriber => {
      return source.subscribe({
        next: value => {
          if (predicate(value)) {
            subscriber.next(value);
          }
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      });
    });
  };
}