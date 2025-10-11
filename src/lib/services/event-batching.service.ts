/**
 * @fileoverview Event batching service for Smart TV Analytics
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import {
  AnalyticsEvent,
  DEFAULT_RETRY_CONFIG,
  MeasurementPayload,
  RetryConfig,
  SmartTVAnalyticsConfig,
  UserProperties
} from '../models/config.interface';
import { StorageService } from './storage.service';

/**
 * Service responsible for batching and sending events to Firebase Analytics
 */
@Injectable({
  providedIn: 'root'
})
export class EventBatchingService {
  private readonly destroy$ = new Subject<void>();
  private config!: SmartTVAnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private userProperties: UserProperties = {};
  private userId?: string;
  private clientId!: string;
  private flushTimer?: any;
  private retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG;

  private readonly FIREBASE_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
  private readonly CLIENT_ID_KEY = 'smarttv_analytics_client_id';

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    this.initializeClientId();
  }

  /**
   * Initialize the service with configuration
   * @param config - Analytics configuration
   */
  initialize(config: SmartTVAnalyticsConfig): void {
    this.config = config;
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      maxAttempts: config.maxRetryAttempts || DEFAULT_RETRY_CONFIG.maxAttempts
    };

    this.setupFlushTimer();

    if (this.config.enableDebugMode) {
      console.log('[EventBatching] Initialized with client ID:', this.clientId);
    }
  }

  /**
   * Add an event to the batch queue
   * @param event - Analytics event to add
   */
  async addEvent(event: AnalyticsEvent): Promise<void> {
    this.eventQueue.push(event);

    if (this.config.enableDebugMode) {
      console.log('[EventBatching] Event added to queue. Queue size:', this.eventQueue.length);
    }

    // Check if we should flush immediately
    if (this.eventQueue.length >= (this.config.batchSize || 10)) {
      await this.flush();
    }
  }

  /**
   * Set user property
   * @param propertyName - Property name
   * @param value - Property value
   */
  setUserProperty(propertyName: string, value: string): void {
    this.userProperties[propertyName] = value;
  }

  /**
   * Set user ID
   * @param userId - User identifier
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Flush all pending events immediately
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEvents(eventsToSend);

      if (this.config.enableDebugMode) {
        console.log('[EventBatching] Successfully sent batch of', eventsToSend.length, 'events');
      }
    } catch (error) {
      // Re-add events to queue for retry
      this.eventQueue.unshift(...eventsToSend);

      console.error('[EventBatching] Failed to send events, re-queued for retry:', error);

      // Schedule retry with exponential backoff
      setTimeout(() => {
        this.flush().catch(retryError => {
          console.error('[EventBatching] Retry failed:', retryError);
        });
      }, this.retryConfig.baseDelay);
    }
  }

  /**
   * Reset the service state
   */
  reset(): void {
    this.eventQueue = [];
    this.userProperties = {};
    this.userId = undefined;
    this.initializeClientId();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Flush remaining events
    this.flush().catch(error => {
      console.error('[EventBatching] Error flushing events on destroy:', error);
    });
  }

  /**
   * Send events to Firebase Analytics
   * @private
   */
  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    const payload: MeasurementPayload = {
      client_id: this.clientId,
      events: events,
      timestamp_micros: Date.now() * 1000
    };

    if (this.userId) {
      payload.user_id = this.userId;
    }

    if (Object.keys(this.userProperties).length > 0) {
      payload.user_properties = this.userProperties;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const url = `${this.FIREBASE_ENDPOINT}?measurement_id=${this.config.measurementId}&api_secret=${this.config.apiSecret}`;

    if (this.config.enableDebugMode) {
      console.log('[EventBatching] Sending payload to Firebase:', payload);
      console.log('[EventBatching] Request URL:', url);
    }

    return this.sendWithRetry(url, payload, headers, this.retryConfig.maxAttempts);
  }

  /**
   * Send HTTP request with retry logic
   * @private
   */
  private async sendWithRetry(
    url: string,
    payload: MeasurementPayload,
    headers: HttpHeaders,
    attemptsLeft: number
  ): Promise<void> {
    try {
      await this.http.post(url, payload, {
        headers
      }).toPromise();

      if (this.config.enableDebugMode) {
        console.log('[EventBatching] Request successful');
      }
    } catch (error) {
      if (attemptsLeft <= 1) {
        throw error;
      }

      const delay = Math.min(
        this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, this.retryConfig.maxAttempts - attemptsLeft),
        this.retryConfig.maxDelay
      );

      if (this.config.enableDebugMode) {
        console.log(`[EventBatching] Request failed, retrying in ${delay}ms. Attempts left:`, attemptsLeft - 1);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.sendWithRetry(url, payload, headers, attemptsLeft - 1);
    }
  }

  /**
   * Initialize or retrieve client ID
   * @private
   */
  private initializeClientId(): void {
    let clientId = this.storage.getItem(this.CLIENT_ID_KEY);

    if (!clientId) {
      // Generate UUID-like client ID
      clientId = 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => {
        return Math.floor(Math.random() * 16).toString(16);
      }) + '.' + Date.now();

      this.storage.setItem(this.CLIENT_ID_KEY, clientId);
    }

    this.clientId = clientId;
  }

  /**
   * Set up automatic flush timer
   * @private
   */
  private setupFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    const flushInterval = this.config.flushInterval || 30000;

    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush().catch(error => {
          console.error('[EventBatching] Scheduled flush failed:', error);
        });
      }
    }, flushInterval);
  }
}