/**
 * @fileoverview Public API for Smart TV Analytics library
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

// Smart TV configurations
export {
  createSmartTVConfig, DEBUG_CONFIG,
  getRecommendedConfig, LOW_RESOURCE_CONFIG, TIZEN_CONFIG,
  WEBOS_CONFIG
} from './smart-tv-configs';

// Main service
export { SmartTVAnalyticsService } from './lib/services/smart-tv-analytics.service';

// Supporting services
export { DeviceInfoService } from './lib/services/device-info.service';
export { EventBatchingService } from './lib/services/event-batching.service';
export { SessionService } from './lib/services/session.service';
export { StorageService } from './lib/services/storage.service';

// Module and tokens
export { SMART_TV_ANALYTICS_CONFIG } from './lib/models/tokens';
export { SmartTVAnalyticsModule } from './lib/smart-tv-analytics.module';

// Interfaces and types
export {
  AnalyticsEvent, AutoEventConfig, DEFAULT_AUTO_EVENTS, DEFAULT_CONFIG, DEFAULT_RETRY_CONFIG, DeviceInfo, EventParameters, MeasurementPayload, RetryConfig, SessionInfo, SmartTVAnalyticsConfig, UserProperties
} from './lib/models/config.interface';
