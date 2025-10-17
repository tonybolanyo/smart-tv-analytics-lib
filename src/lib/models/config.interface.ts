/**
 * @fileoverview Interfaces y tipos de configuración para Smart TV Analytics
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

/**
 * Configuration options for Smart TV Analytics
 */
export interface SmartTVAnalyticsConfig {
  /** Firebase GA4 Measurement ID (e.g., 'G-XXXXXXXXXX') */
  measurementId: string;
  
  /** Firebase Measurement Protocol API Secret */
  apiSecret: string;
  
  /** Application name */
  appName: string;
  
  /** Application version */
  appVersion: string;
  
  /** Enable debug mode for detailed logging */
  enableDebugMode?: boolean;
  
  /** Number of events to batch before sending */
  batchSize?: number;
  
  /** Interval in milliseconds to flush batched events */
  flushInterval?: number;
  
  /** Timeout for HTTP requests in milliseconds */
  requestTimeout?: number;
  
  /** Maximum retry attempts for failed requests */
  maxRetryAttempts?: number;
  
  /** Enable automatic page view tracking */
  enablePageViewTracking?: boolean;
  
  /** Enable automatic session tracking */
  enableSessionTracking?: boolean;
  
  /** Enable automatic engagement time tracking */
  enableEngagementTracking?: boolean;
  
  /** Custom user agent string for requests */
  customUserAgent?: string;
  
  /** Additional default parameters for all events */
  defaultParameters?: EventParameters;
  
  /** Analytics sending strategy to handle CORS issues */
  sendingStrategy?: 'direct' | 'proxy' | 'mock' | 'gtag';
  
  /** Proxy server URL when using proxy strategy */
  proxyUrl?: string;
  
  /** Mock mode - logs events to console instead of sending */
  mockMode?: boolean;
}

/**
 * Event parameters that can be sent with analytics events
 */
export interface EventParameters {
  [key: string]: string | number | boolean;
}

/**
 * User properties that can be set for analytics
 */
export interface UserProperties {
  [key: string]: string;
}

/**
 * Analytics event structure
 */
export interface AnalyticsEvent {
  /** Event name */
  name: string;
  
  /** Event parameters */
  params?: EventParameters;
  
  /** Timestamp when event was created */
  timestamp_micros?: number;
}

/**
 * Measurement Protocol payload structure
 */
export interface MeasurementPayload {
  /** Client ID (unique identifier for the user) */
  client_id: string;
  
  /** User ID (if set) */
  user_id?: string;
  
  /** User properties */
  user_properties?: UserProperties;
  
  /** Array of events to send */
  events: AnalyticsEvent[];
  
  /** Timestamp of the payload */
  timestamp_micros?: number;
}

/**
 * Session information
 */
export interface SessionInfo {
  /** Session ID */
  sessionId: string;
  
  /** Session start timestamp */
  startTime: number;
  
  /** Last activity timestamp */
  lastActivity: number;
  
  /** Is this the first session for this user */
  isFirstSession: boolean;
  
  /** Session number for this user */
  sessionNumber: number;
}

/**
 * Device and environment information
 */
export interface DeviceInfo {
  /** Device platform (e.g., 'Tizen', 'WebOS') */
  platform: string;
  
  /** Device model */
  model?: string;
  
  /** OS version */
  osVersion?: string;
  
  /** Screen resolution */
  screenResolution?: string;
  
  /** Language setting */
  language: string;
  
  /** Timezone */
  timezone?: string;
}

/**
 * Configuration for automatic events
 */
export interface AutoEventConfig {
  /** Enable automatic session_start events */
  sessionStart: boolean;
  
  /** Enable automatic page_view events */
  pageView: boolean;
  
  /** Enable automatic first_visit events */
  firstVisit: boolean;
  
  /** Enable automatic app_update events */
  appUpdate: boolean;
  
  /** Enable automatic engagement_time events */
  engagementTime: boolean;
  
  /** Interval for engagement time tracking (in seconds) */
  engagementInterval: number;
}

/**
 * Network retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  
  /** Base delay between retries in milliseconds */
  baseDelay: number;
  
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  
  /** Exponential backoff multiplier */
  backoffMultiplier: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Partial<SmartTVAnalyticsConfig> = {
  enableDebugMode: false,
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  requestTimeout: 10000, // 10 seconds
  maxRetryAttempts: 3,
  enablePageViewTracking: true,
  enableSessionTracking: true,
  enableEngagementTracking: true
};

/**
 * Default auto event configuration
 */
export const DEFAULT_AUTO_EVENTS: AutoEventConfig = {
  sessionStart: true,
  pageView: true,
  firstVisit: true,
  appUpdate: true,
  engagementTime: true,
  engagementInterval: 30 // seconds
};

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2
};