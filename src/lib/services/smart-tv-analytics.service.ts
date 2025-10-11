/**
 * @fileoverview Main Analytics Service for Smart TV Analytics
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import {
  AnalyticsEvent,
  DEFAULT_AUTO_EVENTS,
  DEFAULT_CONFIG,
  EventParameters,
  SessionInfo,
  SmartTVAnalyticsConfig
} from '../models/config.interface';
import { SMART_TV_ANALYTICS_CONFIG } from '../models/tokens';
import { DeviceInfoService } from './device-info.service';
import { EventBatchingService } from './event-batching.service';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';

/**
 * Main service for Smart TV Analytics
 * Provides methods to track events, manage user properties, and handle automatic events
 */
@Injectable({
  providedIn: 'root'
})
export class SmartTVAnalyticsService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private config!: SmartTVAnalyticsConfig;
  private isInitialized = false;
  private collectionEnabled = true;
  private userId?: string;
  private userProperties: { [key: string]: string } = {};
  private engagementTimer?: number;
  private lastEngagementTime = Date.now();

  constructor(
    private eventBatching: EventBatchingService,
    private sessionService: SessionService,
    private deviceInfo: DeviceInfoService,
    private storage: StorageService,
    private router: Router,
    @Optional() @Inject(SMART_TV_ANALYTICS_CONFIG) private injectedConfig?: SmartTVAnalyticsConfig
  ) {
    if (this.injectedConfig) {
      this.initialize(this.injectedConfig);
    }
  }

  /**
   * Initialize the analytics service with configuration
   * @param config - Analytics configuration
   */
  initialize(config: SmartTVAnalyticsConfig): void {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (this.config.enableDebugMode) {
      console.log('[SmartTVAnalytics] Initializing with config:', this.config);
    }

    // Initialize services
    this.eventBatching.initialize(this.config);
    this.sessionService.initialize();

    // Mark as initialized before sending events
    this.isInitialized = true;

    // Set up automatic events
    this.setupAutomaticEvents();

    // Send initial events
    this.sendInitialEvents();

    if (this.config.enableDebugMode) {
      console.log('[SmartTVAnalytics] Initialization complete');
    }
  }

  /**
   * Log a custom event to Firebase Analytics
   * @param eventName - Name of the event
   * @param parameters - Optional event parameters
   * @returns Promise that resolves when event is queued
   */
  async logEvent(eventName: string, parameters?: EventParameters): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[SmartTVAnalytics] Service not initialized. Call initialize() first.');
      return;
    }

    if (!this.collectionEnabled) {
      if (this.config.enableDebugMode) {
        console.log('[SmartTVAnalytics] Collection disabled, skipping event:', eventName);
      }
      return;
    }

    try {
      const event = this.createEvent(eventName, parameters);
      await this.eventBatching.addEvent(event);

      if (this.config.enableDebugMode) {
        console.log('[SmartTVAnalytics] Event logged:', event);
      }
    } catch (error) {
      console.error('[SmartTVAnalytics] Error logging event:', error);
    }
  }

  /**
   * Set a user property
   * @param propertyName - Name of the property
   * @param value - Value of the property
   */
  setUserProperty(propertyName: string, value: string): void {
    this.userProperties[propertyName] = value;
    this.eventBatching.setUserProperty(propertyName, value);

    if (this.config.enableDebugMode) {
      console.log('[SmartTVAnalytics] User property set:', propertyName, value);
    }
  }

  /**
   * Set the user ID
   * @param userId - Unique identifier for the user
   */
  setUserId(userId: string): void {
    this.userId = userId;
    this.eventBatching.setUserId(userId);

    if (this.config.enableDebugMode) {
      console.log('[SmartTVAnalytics] User ID set:', userId);
    }
  }

  /**
   * Enable or disable analytics collection
   * @param enabled - Whether to enable collection
   */
  enableCollection(enabled: boolean): void {
    this.collectionEnabled = enabled;

    if (this.config.enableDebugMode) {
      console.log('[SmartTVAnalytics] Collection enabled:', enabled);
    }
  }

  /**
   * Get the current session information
   * @returns Current session info
   */
  getCurrentSession(): SessionInfo | null {
    return this.sessionService.getCurrentSession();
  }

  /**
   * Force flush all pending events
   * @returns Promise that resolves when all events are sent
   */
  async flush(): Promise<void> {
    return this.eventBatching.flush();
  }

  /**
   * Reset all user data and start a new session
   */
  reset(): void {
    this.userId = undefined;
    this.userProperties = {};
    this.sessionService.startNewSession();
    this.eventBatching.reset();

    if (this.config.enableDebugMode) {
      console.log('[SmartTVAnalytics] Analytics data reset');
    }
  }

  /**
   * Clean up resources when service is destroyed
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.engagementTimer) {
      clearInterval(this.engagementTimer);
    }

    // Flush remaining events
    this.flush().catch(error => {
      console.error('[SmartTVAnalytics] Error flushing events on destroy:', error);
    });
  }

  /**
   * Create an analytics event with standard parameters
   * @private
   */
  private createEvent(eventName: string, parameters?: EventParameters): AnalyticsEvent {
    const session = this.sessionService.getCurrentSession();
    const device = this.deviceInfo.getDeviceInfo();

    const baseParams: Record<string, string | number | boolean> = {
      app_name: this.config.appName,
      app_version: this.config.appVersion,
      platform: device.platform,
      language: device.language || '',
      engagement_time_msec: Date.now() - this.lastEngagementTime,
      ...this.config.defaultParameters,
      ...parameters
    };
    
    if (session?.sessionId) {
      baseParams['session_id'] = session.sessionId;
    }
    if (session?.sessionNumber !== undefined) {
      baseParams['session_number'] = session.sessionNumber;
    }

    return {
      name: eventName,
      params: baseParams as EventParameters,
      timestamp_micros: Date.now() * 1000
    };
  }

  /**
   * Set up automatic event tracking
   * @private
   */
  private setupAutomaticEvents(): void {
    // Page view tracking
    if (this.config.enablePageViewTracking && DEFAULT_AUTO_EVENTS.pageView) {
      this.router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          takeUntil(this.destroy$)
        )
        .subscribe((event: NavigationEnd) => {
          this.logEvent('page_view', {
            page_location: event.url,
            page_title: document.title
          });
        });
    }

    // Engagement time tracking
    if (this.config.enableEngagementTracking && DEFAULT_AUTO_EVENTS.engagementTime) {
      this.setupEngagementTracking();
    }

    // Session tracking
    if (this.config.enableSessionTracking) {
      this.sessionService.onSessionStart()
        .pipe(takeUntil(this.destroy$))
        .subscribe((session: SessionInfo) => {
          if (DEFAULT_AUTO_EVENTS.sessionStart) {
            this.logEvent('session_start', {
              session_id: session.sessionId,
              is_first_session: session.isFirstSession
            });
          }
        });
    }
  }

  /**
   * Send initial events when service starts
   * @private
   */
  private sendInitialEvents(): void {
    const session = this.sessionService.getCurrentSession();

    // First visit event
    if (session?.isFirstSession && DEFAULT_AUTO_EVENTS.firstVisit) {
      this.logEvent('first_visit');
    }

    // App update event
    const lastVersion = this.storage.getItem('last_app_version');
    if (lastVersion && lastVersion !== this.config.appVersion && DEFAULT_AUTO_EVENTS.appUpdate) {
      this.logEvent('app_update', {
        previous_version: lastVersion,
        current_version: this.config.appVersion
      });
    }

    this.storage.setItem('last_app_version', this.config.appVersion);
  }

  /**
   * Set up engagement time tracking
   * @private
   */
  private setupEngagementTracking(): void {
    const interval = DEFAULT_AUTO_EVENTS.engagementInterval * 1000;

    this.engagementTimer = window.setInterval(() => {
      const now = Date.now();
      const engagementTime = now - this.lastEngagementTime;

      this.logEvent('engagement', {
        engagement_time_msec: engagementTime
      });

      this.lastEngagementTime = now;
    }, interval);

    // Reset engagement time on user interaction
    const resetEngagement = () => {
      this.lastEngagementTime = Date.now();
    };

    ['click', 'keydown', 'mousemove', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, resetEngagement, { passive: true });
    });
  }
}