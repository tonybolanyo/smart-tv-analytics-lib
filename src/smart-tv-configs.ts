/**
 * @fileoverview Configuraciones preestablecidas para diferentes plataformas de Smart TV
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

import { SmartTVAnalyticsConfig } from './lib/models/config.interface';

/**
 * Configuración optimizada para Samsung Tizen
 */
export const TIZEN_CONFIG: Partial<SmartTVAnalyticsConfig> = {
  batchSize: 5,
  flushInterval: 60000,
  requestTimeout: 15000,
  maxRetryAttempts: 2,
  enableDebugMode: false,
  enablePageViewTracking: true,
  enableSessionTracking: true,
  enableEngagementTracking: true
};

/**
 * Configuración optimizada para LG WebOS
 */
export const WEBOS_CONFIG: Partial<SmartTVAnalyticsConfig> = {
  batchSize: 8,
  flushInterval: 45000,
  requestTimeout: 12000,
  maxRetryAttempts: 2,
  enableDebugMode: false,
  enablePageViewTracking: true,
  enableSessionTracking: true,
  enableEngagementTracking: true
};

/**
 * Configuración conservadora para Smart TVs con recursos limitados
 */
export const LOW_RESOURCE_CONFIG: Partial<SmartTVAnalyticsConfig> = {
  batchSize: 3,
  flushInterval: 90000,
  requestTimeout: 20000,
  maxRetryAttempts: 1,
  enableDebugMode: false,
  enablePageViewTracking: true,
  enableSessionTracking: true,
  enableEngagementTracking: false
};

/**
 * Configuración para desarrollo y testing
 */
export const DEBUG_CONFIG: Partial<SmartTVAnalyticsConfig> = {
  batchSize: 1,
  flushInterval: 5000,
  requestTimeout: 10000,
  maxRetryAttempts: 3,
  enableDebugMode: true,
  enablePageViewTracking: true,
  enableSessionTracking: true,
  enableEngagementTracking: true
};

/**
 * Detecta automáticamente la plataforma y devuelve la configuración apropiada
 */
export function getRecommendedConfig(): Partial<SmartTVAnalyticsConfig> {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
  
  if (userAgent.includes('tizen')) {
    return TIZEN_CONFIG;
  }
  
  if (userAgent.includes('webos')) {
    return WEBOS_CONFIG;
  }
  
  // Para otros Smart TVs o navegadores con recursos limitados
  if (userAgent.includes('smarttv') || userAgent.includes('smart-tv')) {
    return LOW_RESOURCE_CONFIG;
  }
  
  // Configuración por defecto para navegadores normales
  return WEBOS_CONFIG;
}

/**
 * Combina configuración base con configuración específica de plataforma
 */
export function createSmartTVConfig(
  baseConfig: SmartTVAnalyticsConfig,
  platformOverrides?: Partial<SmartTVAnalyticsConfig>
): SmartTVAnalyticsConfig {
  const recommendedConfig = getRecommendedConfig();
  
  return {
    ...baseConfig,
    ...recommendedConfig,
    ...platformOverrides
  };
}