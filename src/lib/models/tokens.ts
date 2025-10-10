/**
 * @fileoverview Configuration tokens for Smart TV Analytics
 * @author Smart TV Analytics Team  
 * @version 1.1.0
 */

import { InjectionToken } from '@angular/core';
import { SmartTVAnalyticsConfig } from './config.interface';

/**
 * Configuration token for dependency injection
 * Used to provide analytics configuration throughout the application
 * 
 * @example
 * ```typescript
 * providers: [
 *   {
 *     provide: SMART_TV_ANALYTICS_CONFIG,
 *     useValue: myConfig
 *   }
 * ]
 * ```
 */
export const SMART_TV_ANALYTICS_CONFIG = new InjectionToken<SmartTVAnalyticsConfig>('SMART_TV_ANALYTICS_CONFIG');