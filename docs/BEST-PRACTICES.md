# Guía de buenas prácticas - Smart TV Analytics

## Índice

- [Principios generales](#principios-generales)
- [Configuración óptima](#configuración-óptima)
- [Gestión de eventos](#gestión-de-eventos)
- [Rendimiento y optimización](#performance-y-optimización)
- [Manejo de errores](#manejo-de-errores)
- [Seguridad y privacidad](#seguridad-y-privacidad)
- [Testing](#testing)
- [Despliegue](#deployment)
- [Monitorización](#monitorizacion)

## Principios generales

### 1. Piensa en las limitaciones de Smart TV

Los Smart TVs tienen características únicas que debes considerar:

```typescript
// ✅ BUENO: Configuración optimizada para TV
const config: SmartTVAnalyticsConfig = {
  batchSize: 10,           // Lotes más grandes
  flushInterval: 30000,    // Menos frecuente
  requestTimeout: 15000,   // Timeout más generoso
  maxRetryAttempts: 5      // Más reintentos
};

// ❌ MALO: Configuración típica de web
const config: SmartTVAnalyticsConfig = {
  batchSize: 1,            // Muy frecuente
  flushInterval: 1000,     // Demasiado agresivo
  requestTimeout: 5000,    // Timeout muy corto
  maxRetryAttempts: 2      // Pocos reintentos
};
```

### 2. Usa configuraciones predefinidas

Aprovecha las configuraciones optimizadas para cada plataforma:

```typescript
import { TIZEN_CONFIG, WEBOS_CONFIG, DEBUG_CONFIG } from 'smart-tv-analytics';

// ✅ BUENO: Usa configuraciones predefinidas
@NgModule({
  imports: [
    SmartTVAnalyticsModule.forRoot({
      ...TIZEN_CONFIG,
      measurementId: 'G-XXXXXXXXXX',
      apiSecret: process.env.GA_API_SECRET
    })
  ]
})
export class AppModule { }
```

### 3. Inicialización defensiva

Siempre maneja posibles fallos en la inicialización:

```typescript
// ✅ BUENO: Inicialización robusta
@Component({ ... })
export class AppComponent implements OnInit {
  constructor(private analytics: SmartTVAnalyticsService) {}

  ngOnInit() {
    try {
      // Los eventos automáticos ya están configurados
      this.trackAppLaunch();
    } catch (error) {
      console.error('Analytics initialization failed:', error);
      // App continúa funcionando sin analytics
    }
  }

  private trackAppLaunch() {
    this.analytics.logEvent('app_start', {
      platform: this.detectPlatform(),
      version: environment.version
    });
  }
}
```

## Configuración óptima

### 1. Configuración por entorno

Establece configuraciones diferentes para cada entorno:

```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  analyticsConfig: {
    ...TIZEN_CONFIG,
    enableDebugMode: false,
    sendingStrategy: 'direct' as const,
    batchSize: 15,
    flushInterval: 45000
  }
};

// environments/environment.ts
export const environment = {
  production: false,
  analyticsConfig: {
    ...DEBUG_CONFIG,
    enableDebugMode: true,
    sendingStrategy: 'mock' as const,
    mockMode: true
  }
};
```

### 2. Configuración condicional

Adapta la configuración según las capacidades del dispositivo:

```typescript
function getOptimalConfig(): Partial<SmartTVAnalyticsConfig> {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('tizen')) {
    return {
      ...TIZEN_CONFIG,
      // Tizen específico
      requestTimeout: 20000,
      batchSize: 12
    };
  }
  
  if (userAgent.includes('webos')) {
    return {
      ...WEBOS_CONFIG,
      // webOS específico
      requestTimeout: 15000,
      batchSize: 8
    };
  }
  
  // Configuración genérica para otros Smart TVs
  return {
    batchSize: 10,
    flushInterval: 30000,
    requestTimeout: 15000,
    maxRetryAttempts: 3
  };
}
```

### 3. Variables de entorno seguras

Gestiona secretos de forma segura:

```typescript
// ✅ BUENO: API Secret desde variables de entorno
const config = {
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: process.env['GA_API_SECRET'], // Nunca en código
  appName: 'MySmartTVApp',
  appVersion: require('../../package.json').version
};

// ❌ MALO: Secretos hardcoded
const config = {
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: 'abc123secret', // ¡Nunca hagas esto!
  appName: 'MySmartTVApp'
};
```

## Gestión de eventos

### 1. Nombres de eventos consistente

Establece una nomenclatura clara y consistente:

```typescript
// ✅ BUENO: Nomenclatura consistente
class AnalyticsEvents {
  // Navegación
  static readonly SCREEN_VIEW = 'screen_view';
  static readonly PAGE_VIEW = 'page_view';
  
  // Video
  static readonly VIDEO_PLAY = 'video_play';
  static readonly VIDEO_PAUSE = 'video_pause';
  static readonly VIDEO_COMPLETE = 'video_complete';
  
  // Interacciones
  static readonly BUTTON_CLICK = 'button_click';
  static readonly MENU_OPEN = 'menu_open';
  static readonly SEARCH_PERFORM = 'search_perform';
}

// Uso
this.analytics.logEvent(AnalyticsEvents.VIDEO_PLAY, {
  video_id: 'abc123',
  content_type: 'movie'
});
```

### 2. Parámetros estructurados

Usa interfaces para garantizar consistencia en parámetros:

```typescript
interface VideoEventParams {
  video_id: string;
  video_title: string;
  video_duration?: number;
  content_type: 'movie' | 'series' | 'documentary';
  genre?: string;
  quality?: '720p' | '1080p' | '4k';
}

// ✅ BUENO: Tipado fuerte
logVideoEvent(action: string, params: VideoEventParams) {
  this.analytics.logEvent(`video_${action}`, {
    ...params,
    timestamp: Date.now()
  });
}

// Uso
this.logVideoEvent('play', {
  video_id: 'movie_123',
  video_title: 'Sample Movie',
  content_type: 'movie',
  genre: 'action'
});
```

### 3. Contexto automático

Enriquece eventos con contexto automático:

```typescript
@Injectable()
export class AnalyticsContextService {
  private baseContext: Record<string, any> = {};

  constructor(
    private deviceInfo: DeviceInfoService,
    private router: Router
  ) {
    this.setupBaseContext();
  }

  private setupBaseContext() {
    this.baseContext = {
      platform: this.deviceInfo.getPlatform(),
      app_version: environment.version,
      screen_resolution: `${screen.width}x${screen.height}`
    };
  }

  enrichEvent(eventName: string, params: EventParameters = {}) {
    return {
      ...this.baseContext,
      current_route: this.router.url,
      ...params
    };
  }
}

// Uso en servicio
@Injectable()
export class EnhancedAnalyticsService {
  constructor(
    private analytics: SmartTVAnalyticsService,
    private context: AnalyticsContextService
  ) {}

  logEvent(name: string, params?: EventParameters) {
    const enrichedParams = this.context.enrichEvent(name, params);
    return this.analytics.logEvent(name, enrichedParams);
  }
}
```

### 4. Debouncing para eventos frecuentes

Evita spam de eventos similares:

```typescript
@Injectable()
export class DebouncedAnalyticsService {
  private debounceTimers = new Map<string, any>();

  constructor(private analytics: SmartTVAnalyticsService) {}

  logDebouncedEvent(
    eventName: string, 
    params: EventParameters, 
    delay: number = 1000
  ) {
    const key = `${eventName}_${JSON.stringify(params)}`;
    
    // Cancelar timer previo
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    // Nuevo timer
    const timer = setTimeout(() => {
      this.analytics.logEvent(eventName, params);
      this.debounceTimers.delete(key);
    }, delay);
    
    this.debounceTimers.set(key, timer);
  }
}

// Uso para scroll events
onScroll() {
  this.debouncedAnalytics.logDebouncedEvent('content_scroll', {
    direction: 'down',
    position: window.scrollY
  }, 2000); // Solo envía después de 2s sin scroll
}
```

## Rendimiento y optimización

### 1. Lazy Loading

Carga analytics solo cuando sea necesario:

```typescript
// ✅ BUENO: Lazy loading del módulo
const routes: Routes = [
  {
    path: 'video',
    loadChildren: () => import('./video/video.module').then(m => m.VideoModule)
  }
];

// En VideoModule
@NgModule({
  imports: [
    SmartTVAnalyticsModule.forFeature({
      enableVideoTracking: true
    })
  ]
})
export class VideoModule {}
```

### 2. Batch inteligente

Optimiza el batching según la actividad:

```typescript
@Injectable()
export class AdaptiveBatchingService {
  private currentBatchSize = 10;
  private readonly minBatchSize = 5;
  private readonly maxBatchSize = 20;

  constructor(private analytics: SmartTVAnalyticsService) {}

  adaptBatchSize(networkQuality: 'slow' | 'medium' | 'fast') {
    switch (networkQuality) {
      case 'slow':
        this.currentBatchSize = Math.max(this.minBatchSize, this.currentBatchSize - 2);
        break;
      case 'fast':
        this.currentBatchSize = Math.min(this.maxBatchSize, this.currentBatchSize + 2);
        break;
      // medium mantiene el tamaño actual
    }
    
    // Aplicar nueva configuración
    this.analytics.updateConfig({
      batchSize: this.currentBatchSize
    });
  }
}
```

### 3. Gestión de memoria

Evita memory leaks en componentes:

```typescript
@Component({ ... })
export class VideoPlayerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private playbackTimer?: number;

  constructor(private analytics: SmartTVAnalyticsService) {}

  ngOnInit() {
    // Tracking de progreso cada 30 segundos
    this.startProgressTracking();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Limpiar timers
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
    }
  }

  private startProgressTracking() {
    this.playbackTimer = setInterval(() => {
      this.analytics.logEvent('video_progress', {
        video_id: this.videoId,
        progress_percent: this.getProgressPercent()
      });
    }, 30000);
  }
}
```

## Manejo de errores

### 1. Gestión de errores sin bloqueos

Nunca permitas que errores de analytics rompan la app:

```typescript
@Injectable()
export class SafeAnalyticsService {
  constructor(private analytics: SmartTVAnalyticsService) {}

  async safeLogEvent(eventName: string, params?: EventParameters) {
    try {
      await this.analytics.logEvent(eventName, params);
    } catch (error) {
      // Log para debugging pero no bloquea la app
      console.warn(`Analytics event failed: ${eventName}`, error);
      
      // Opcional: Fallback a storage local
      this.storeEventForRetry(eventName, params);
    }
  }

  private storeEventForRetry(eventName: string, params?: EventParameters) {
    try {
      const failedEvents = JSON.parse(
        localStorage.getItem('failed_analytics') || '[]'
      );
      
      failedEvents.push({
        eventName,
        params,
        timestamp: Date.now()
      });
      
      // Mantener solo los últimos 50 eventos fallidos
      const trimmed = failedEvents.slice(-50);
      localStorage.setItem('failed_analytics', JSON.stringify(trimmed));
    } catch {
      // Si no se puede guardar, simplemente ignora
    }
  }
}
```

### 2. Patrón Circuit Breaker

Evita intentos continuos cuando el servicio está fallando:

```typescript
@Injectable()
export class CircuitBreakerAnalyticsService {
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold = 5;
  private readonly recoveryTimeout = 60000; // 1 minuto
  
  private get isCircuitOpen(): boolean {
    return this.failureCount >= this.failureThreshold &&
           (Date.now() - this.lastFailureTime) < this.recoveryTimeout;
  }

  async logEvent(eventName: string, params?: EventParameters) {
    if (this.isCircuitOpen) {
      console.warn('Analytics circuit breaker is open, skipping event');
      return;
    }

    try {
      await this.analytics.logEvent(eventName, params);
      this.resetFailureCount();
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }

  private resetFailureCount() {
    this.failureCount = 0;
  }
}
```

## Seguridad y privacidad

### 1. Validación de datos

Valida todos los datos antes de enviar:

```typescript
@Injectable()
export class SecureAnalyticsService {
  private readonly maxParamLength = 1000;
  private readonly allowedEventNames = /^[a-zA-Z][a-zA-Z0-9_]{1,39}$/;

  validateEvent(eventName: string, params?: EventParameters): boolean {
    // Validar nombre del evento
    if (!this.allowedEventNames.test(eventName)) {
      console.warn(`Invalid event name: ${eventName}`);
      return false;
    }

    // Validar parámetros
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (!this.isValidParam(key, value)) {
          console.warn(`Invalid parameter: ${key} = ${value}`);
          return false;
        }
      }
    }

    return true;
  }

  private isValidParam(key: string, value: any): boolean {
    // Longitud de clave
    if (key.length > 40) return false;
    
    // Longitud de valor
    if (typeof value === 'string' && value.length > this.maxParamLength) {
      return false;
    }
    
    // Tipos permitidos
    const allowedTypes = ['string', 'number', 'boolean'];
    return allowedTypes.includes(typeof value);
  }

  async logEvent(eventName: string, params?: EventParameters) {
    if (this.validateEvent(eventName, params)) {
      await this.analytics.logEvent(eventName, params);
    }
  }
}
```

### 2. Datos sensibles

Nunca envíes información personal identificable:

```typescript
// ✅ BUENO: Sin PII
this.analytics.logEvent('user_action', {
  action_type: 'purchase',
  content_category: 'movies',
  price_tier: 'premium',
  user_segment: 'returning_customer' // Segmento, no ID
});

// ❌ MALO: Con PII
this.analytics.logEvent('user_action', {
  user_email: 'user@example.com',     // ¡No!
  credit_card: '1234-5678-9012-3456', // ¡Nunca!
  user_name: 'John Doe'               // ¡No!
});
```

### 3. Anonimización automática

Implementa anonimización automática:

```typescript
@Injectable()
export class AnonymizedAnalyticsService {
  private hashData(input: string): string {
    // Implementación simple de hash (usar crypto en producción)
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  logUserAction(userId: string, action: string, params?: EventParameters) {
    // Hash del user ID en lugar de usar el valor real
    const hashedUserId = this.hashData(userId);
    
    this.analytics.logEvent('user_action', {
      user_hash: hashedUserId, // ID hasheado
      action_type: action,
      ...params
    });
  }
}
```

## Testing

### 1. Mock para tests

Usa mocks comprehensivos para testing:

```typescript
// analytics.mock.ts
export class MockSmartTVAnalyticsService {
  private events: Array<{name: string, params?: any}> = [];

  logEvent(name: string, params?: any): Promise<void> {
    this.events.push({ name, params });
    return Promise.resolve();
  }

  getRecordedEvents() {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }

  getEventCount(eventName?: string): number {
    if (eventName) {
      return this.events.filter(e => e.name === eventName).length;
    }
    return this.events.length;
  }
}

// En tests
describe('VideoPlayerComponent', () => {
  let mockAnalytics: MockSmartTVAnalyticsService;

  beforeEach(() => {
    mockAnalytics = new MockSmartTVAnalyticsService();
    
    TestBed.configureTestingModule({
      providers: [
        { provide: SmartTVAnalyticsService, useValue: mockAnalytics }
      ]
    });
  });

  it('should track video play events', () => {
    component.playVideo();
    
    expect(mockAnalytics.getEventCount('video_play')).toBe(1);
    
    const playEvent = mockAnalytics.getRecordedEvents()[0];
    expect(playEvent.params.video_id).toBe('test_video');
  });
});
```

### 2. Tests de integración

Prueba la integración real con configuración de test:

```typescript
describe('Analytics Integration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SmartTVAnalyticsModule.forRoot({
          ...DEBUG_CONFIG,
          mockMode: true,
          enableDebugMode: true
        })
      ]
    });
  });

  it('should initialize and track events', fakeAsync(() => {
    const service = TestBed.inject(SmartTVAnalyticsService);
    
    service.logEvent('test_event', { param: 'value' });
    
    tick(1000); // Avanzar tiempo para batching
    
    // Verificar que el evento fue procesado
    expect(consoleSpy).toHaveBeenCalledWith(
      jasmine.stringMatching(/test_event/)
    );
  }));
});
```

## Despliegue

### 1. Optimización de la compilación

Optimiza el build para producción:

```json
// angular.json
{
  "build": {
    "configurations": {
      "production": {
        "optimization": true,
        "budgets": [
          {
            "type": "initial",
            "maximumWarning": "500kb",
            "maximumError": "1mb"
          }
        ]
      }
    }
  }
}
```

### 2. Configuración por entorno

Separa configuración por entorno:

```typescript
// deployment.service.ts
@Injectable()
export class DeploymentConfigService {
  getAnalyticsConfig(): SmartTVAnalyticsConfig {
    const baseConfig = this.getBaseConfigForPlatform();
    
    if (environment.production) {
      return {
        ...baseConfig,
        enableDebugMode: false,
        sendingStrategy: 'direct',
        requestTimeout: 15000
      };
    } else {
      return {
        ...baseConfig,
        enableDebugMode: true,
        sendingStrategy: 'mock',
        mockMode: true
      };
    }
  }

  private getBaseConfigForPlatform(): Partial<SmartTVAnalyticsConfig> {
    // Detectar plataforma y retornar configuración optimizada
    if (this.isTizen()) return TIZEN_CONFIG;
    if (this.isWebOS()) return WEBOS_CONFIG;
    return DEFAULT_CONFIG;
  }
}
```

## Monitorización

### 1. Health Checks

Implementa health checks para el servicio:

```typescript
@Injectable()
export class AnalyticsHealthService {
  private lastSuccessfulEvent = 0;
  private consecutiveFailures = 0;

  constructor(private analytics: SmartTVAnalyticsService) {}

  async performHealthCheck(): Promise<boolean> {
    try {
      await this.analytics.logEvent('health_check', {
        timestamp: Date.now()
      });
      
      this.recordSuccess();
      return true;
    } catch (error) {
      this.recordFailure();
      return false;
    }
  }

  getHealthStatus() {
    const timeSinceLastSuccess = Date.now() - this.lastSuccessfulEvent;
    
    return {
      isHealthy: this.consecutiveFailures < 3 && timeSinceLastSuccess < 300000, // 5 min
      lastSuccess: this.lastSuccessfulEvent,
      consecutiveFailures: this.consecutiveFailures
    };
  }

  private recordSuccess() {
    this.lastSuccessfulEvent = Date.now();
    this.consecutiveFailures = 0;
  }

  private recordFailure() {
    this.consecutiveFailures++;
  }
}
```

### 2. Métricas de rendimiento

Monitoriza el rendimiento de analytics:

```typescript
@Injectable()
export class AnalyticsMetricsService {
  private metrics = {
    eventsLogged: 0,
    eventsFailed: 0,
    averageResponseTime: 0,
    batchesSent: 0
  };

  recordEventLogged() {
    this.metrics.eventsLogged++;
  }

  recordEventFailed() {
    this.metrics.eventsFailed++;
  }

  recordResponseTime(time: number) {
    // Promedio móvil simple
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + time) / 2;
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.calculateSuccessRate(),
      totalEvents: this.metrics.eventsLogged + this.metrics.eventsFailed
    };
  }

  private calculateSuccessRate(): number {
    const total = this.metrics.eventsLogged + this.metrics.eventsFailed;
    return total > 0 ? (this.metrics.eventsLogged / total) * 100 : 100;
  }
}
```
