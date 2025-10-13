/**
 * @fileoverview Servicio de información de dispositivo para Smart TV Analytics
 * @author Smart TV Analytics Team
 * @version 1.0.0
 */

import { Injectable } from '@angular/core';
import { DeviceInfo } from '../models/config.interface';

/**
 * Servicio para detectar y proporcionar información del dispositivo
 */
@Injectable({
  providedIn: 'root'
})
export class DeviceInfoService {
  private deviceInfo: DeviceInfo;

  constructor() {
    this.deviceInfo = this.detectDeviceInfo();
  }

  /**
   * Obtiene información completa del dispositivo
   * @returns Objeto de información del dispositivo
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  /**
   * Obtiene la plataforma detectada
   * @returns Nombre de la plataforma (Tizen, WebOS, Browser, etc.)
   */
  getPlatform(): string {
    return this.deviceInfo.platform;
  }

  /**
   * Verifica si se ejecuta en un Smart TV
   * @returns True si se detecta como Smart TV
   */
  isSmartTV(): boolean {
    return ['Tizen', 'WebOS', 'SmartTV'].includes(this.deviceInfo.platform);
  }

  /**
   * Verifica si se ejecuta en Samsung Tizen
   * @returns True si es plataforma Tizen
   */
  isTizen(): boolean {
    return this.deviceInfo.platform === 'Tizen';
  }

  /**
   * Verifica si se ejecuta en LG WebOS
   * @returns True si es plataforma WebOS
   */
  isWebOS(): boolean {
    return this.deviceInfo.platform === 'WebOS';
  }

  /**
   * Obtiene información de resolución de pantalla
   * @returns Cadena de resolución de pantalla o undefined
   */
  getScreenResolution(): string | undefined {
    return this.deviceInfo.screenResolution;
  }

  /**
   * Detecta información completa del dispositivo
   * @private
   */
  private detectDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const platform = this.detectPlatform(userAgent);
    
    return {
      platform,
      model: this.detectModel(userAgent, platform),
      osVersion: this.detectOSVersion(userAgent, platform),
      screenResolution: this.detectScreenResolution(),
      language: this.detectLanguage(),
      timezone: this.detectTimezone()
    };
  }

  /**
   * Detecta la plataforma/SO
   * @private
   */
  private detectPlatform(userAgent: string): string {
    // Convert to lowercase for case-insensitive matching
    const ua = userAgent.toLowerCase();
    
    // Samsung Tizen
    if (ua.includes('tizen')) {
      return 'Tizen';
    }
    
    // LG WebOS (case-insensitive: webos, webOS, Web0S, WEB0S)
    if (ua.includes('webos') || ua.includes('web0s')) {
      return 'WebOS';
    }
    
    // Generic Smart TV detection
    if (ua.includes('smarttv') || 
        ua.includes('smart-tv')) {
      return 'SmartTV';
    }
    
    // Android TV
    if (ua.includes('android') && ua.includes('tv')) {
      return 'AndroidTV';
    }
    
    // Roku
    if (ua.includes('roku')) {
      return 'Roku';
    }
    
    // Apple TV
    if (ua.includes('appletv')) {
      return 'AppleTV';
    }
    
    // Fire TV
    if (ua.includes('aftt') || ua.includes('aftm')) {
      return 'FireTV';
    }
    
    // Fallback to browser detection
    if (ua.includes('chrome')) {
      return 'Chrome';
    }
    
    if (ua.includes('safari') && !ua.includes('chrome')) {
      return 'Safari';
    }
    
    if (ua.includes('firefox')) {
      return 'Firefox';
    }
    
    if (ua.includes('edge')) {
      return 'Edge';
    }
    
    return 'Unknown';
  }

  /**
   * Detecta el modelo del dispositivo
   * @private
   */
  private detectModel(userAgent: string, platform: string): string | undefined {
    let model: string | undefined;
    
    if (platform === 'Tizen') {
      // Samsung TV model detection
      const samsungMatch = userAgent.match(/SAMSUNG[;\s]([^;\s)]+)/i);
      if (samsungMatch) {
        model = samsungMatch[1];
      }
    } else if (platform === 'WebOS') {
      // LG TV model detection
      const lgMatch = userAgent.match(/LG[;\s]([^;\s)]+)/i);
      if (lgMatch) {
        model = lgMatch[1];
      }
    }
    
    return model;
  }

  /**
   * Detecta la versión del SO
   * @private
   */
  private detectOSVersion(userAgent: string, platform: string): string | undefined {
    let version: string | undefined;
    
    if (platform === 'Tizen') {
      const tizenMatch = userAgent.match(/Tizen[;\s]([0-9.]+)/i);
      if (tizenMatch) {
        version = tizenMatch[1];
      }
    } else if (platform === 'WebOS') {
      const webosMatch = userAgent.match(/webOS[;\s]([0-9.]+)/i);
      if (webosMatch) {
        version = webosMatch[1];
      }
    } else if (platform === 'AndroidTV') {
      const androidMatch = userAgent.match(/Android[;\s]([0-9.]+)/i);
      if (androidMatch) {
        version = androidMatch[1];
      }
    }
    
    return version;
  }

  /**
   * Detecta la resolución de pantalla
   * @private
   */
  private detectScreenResolution(): string | undefined {
    try {
      const width = screen.width;
      const height = screen.height;
      
      if (width && height) {
        return `${width}x${height}`;
      }
    } catch (error) {
      // Screen API not available
    }
    
    return undefined;
  }

  /**
   * Detecta el idioma del dispositivo
   * @private
   */
  private detectLanguage(): string {
    try {
      return navigator.language || navigator.languages?.[0] || 'en-US';
    } catch (error) {
      return 'en-US';
    }
  }

  /**
   * Detecta la zona horaria
   * @private
   */
  private detectTimezone(): string | undefined {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      // Intl API not available
      return undefined;
    }
  }
}