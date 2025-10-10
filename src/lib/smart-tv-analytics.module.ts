/**
 * @fileoverview Angular module for Smart TV Analytics
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { SmartTVAnalyticsConfig } from './models/config.interface';
import { SMART_TV_ANALYTICS_CONFIG } from './models/tokens';
import { DeviceInfoService } from './services/device-info.service';
import { EventBatchingService } from './services/event-batching.service';
import { SessionService } from './services/session.service';
import { SmartTVAnalyticsService } from './services/smart-tv-analytics.service';
import { StorageService } from './services/storage.service';

/**
 * Main module for Smart TV Analytics
 * 
 * @example
 * ```typescript
 * @NgModule({
 *   imports: [
 *     SmartTVAnalyticsModule.forRoot({
 *       measurementId: 'G-XXXXXXXXXX',
 *       apiSecret: 'your-api-secret',
 *       appName: 'MyApp',
 *       appVersion: '1.0.0'
 *     })
 *   ]
 * })
 * export class AppModule { }
 * ```
 */
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    SmartTVAnalyticsService,
    EventBatchingService,
    SessionService,
    DeviceInfoService,
    StorageService
  ]
})
export class SmartTVAnalyticsModule {
  /**
   * Configure the module with analytics settings
   * @param config - Analytics configuration
   * @returns Module with providers configured
   */
  static forRoot(config: SmartTVAnalyticsConfig): ModuleWithProviders<SmartTVAnalyticsModule> {
    return {
      ngModule: SmartTVAnalyticsModule,
      providers: [
        {
          provide: SMART_TV_ANALYTICS_CONFIG,
          useValue: config
        }
      ]
    };
  }
}