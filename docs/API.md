# Referencia de la API - Smart TV Analytics

## Índice

- [SmartTVAnalyticsModule](#smarttvanalyticsmodule)
- [SmartTVAnalyticsService](#smarttvanalyticsservice)
- [Interfaces](#interfaces)
- [Configuraciones Predefinidas](#configuraciones-predefinidas)
- [Tipos y Enums](#tipos-y-enums)
- [Errores y Excepciones](#errores-y-excepciones)

## SmartTVAnalyticsModule

El módulo principal que debe importarse en tu aplicación Angular.

### forRoot()

Configura el módulo con las opciones de analytics.

```typescript
static forRoot(config: SmartTVAnalyticsConfig): ModuleWithProviders<SmartTVAnalyticsModule>
```

**Parámetros:**
- `config: SmartTVAnalyticsConfig` - Configuración de analytics

**Retorna:**
- `ModuleWithProviders<SmartTVAnalyticsModule>` - Módulo configurado

**Ejemplo:**
```typescript
import { SmartTVAnalyticsModule } from 'smart-tv-analytics';

@NgModule({
  imports: [
    SmartTVAnalyticsModule.forRoot({
      measurementId: 'G-XXXXXXXXXX',
      apiSecret: 'your-api-secret',
      appName: 'MyApp',
      appVersion: '1.0.0'
    })
  ]
})
export class AppModule { }
```

## SmartTVAnalyticsService

El servicio principal para interactuar con analytics.

### Métodos principales

#### initialize()

Inicializa el servicio con configuración específica.

```typescript
initialize(config: SmartTVAnalyticsConfig): void
```

**Parámetros:**
- `config: SmartTVAnalyticsConfig` - Configuración de analytics

**Ejemplo:**
```typescript
constructor(private analytics: SmartTVAnalyticsService) {}

ngOnInit() {
  this.analytics.initialize({
    measurementId: 'G-XXXXXXXXXX',
    apiSecret: 'your-secret',
    appName: 'MyApp',
    appVersion: '1.0.0'
  });
}
```

#### logEvent()

Registra un evento personalizado en Firebase Analytics.

```typescript
logEvent(eventName: string, parameters?: EventParameters): Promise<void>
```

**Parámetros:**
- `eventName: string` - Nombre del evento (requerido)
- `parameters?: EventParameters` - Parámetros opcionales del evento

**Retorna:**
- `Promise<void>` - Promise que se resuelve cuando el evento es encolado

**Ejemplo:**
```typescript
// Evento simple
await this.analytics.logEvent('button_click');

// Evento con parámetros
await this.analytics.logEvent('video_play', {
  video_id: 'abc123',
  video_title: 'Sample Video',
  video_duration: 120
});
```

#### setUserId()

Establece el ID de usuario para analytics.

```typescript
setUserId(userId: string): void
```

**Parámetros:**
- `userId: string` - ID único del usuario

**Ejemplo:**
```typescript
this.analytics.setUserId('user_12345');
```

#### setUserProperties()

Establece propiedades del usuario para analytics.

```typescript
setUserProperties(properties: UserProperties): void
```

**Parámetros:**
- `properties: UserProperties` - Objeto con propiedades del usuario

**Ejemplo:**
```typescript
this.analytics.setUserProperties({
  platform: 'tizen',
  user_type: 'premium',
  language: 'es'
});
```

#### enableCollection()

Habilita o deshabilita la recolección de datos de analytics.

```typescript
enableCollection(enabled: boolean): void
```

**Parámetros:**
- `enabled: boolean` - true para habilitar, false para deshabilitar

**Ejemplo:**
```typescript
// Deshabilitar analytics (por ejemplo, por preferencias de privacidad)
this.analytics.enableCollection(false);

// Habilitar analytics
this.analytics.enableCollection(true);
```

### Métodos de información

#### getClientId()

Obtiene el ID único del cliente.

```typescript
getClientId(): string
```

**Retorna:**
- `string` - ID único del cliente

#### getUserId()

Obtiene el ID de usuario actual.

```typescript
getUserId(): string | undefined
```

**Retorna:**
- `string | undefined` - ID del usuario o undefined si no está establecido

#### getSessionInfo()

Obtiene información de la sesión actual.

```typescript
getSessionInfo(): SessionInfo
```

**Retorna:**
- `SessionInfo` - Información de la sesión actual

#### isInitialized()

Verifica si el servicio está inicializado.

```typescript
isInitialized(): boolean
```

**Retorna:**
- `boolean` - `true` si está inicializado, `false` en caso contrario

## Interfaces

### SmartTVAnalyticsConfig

Configuración principal para el módulo de analytics.

```typescript
interface SmartTVAnalyticsConfig {
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
  sendingStrategy?: SendingStrategy;
  
  /** Proxy server URL when using proxy strategy */
  proxyUrl?: string;
  
  /** Mock mode - logs events to console instead of sending */
  mockMode?: boolean;
}
```

### EventParameters

Parámetros que pueden enviarse con eventos de analytics.

```typescript
interface EventParameters {
  [key: string]: string | number | boolean;
}
```

**Ejemplo:**
```typescript
const params: EventParameters = {
  video_id: 'abc123',
  video_duration: 120,
  is_premium: true,
  category: 'entertainment'
};
```

### UserProperties

Propiedades que pueden establecerse para el usuario.

```typescript
interface UserProperties {
  [key: string]: string;
}
```

**Ejemplo:**
```typescript
const properties: UserProperties = {
  platform: 'tizen',
  user_type: 'premium',
  language: 'es',
  region: 'europe'
};
```

### AnalyticsEvent

Estructura de un evento de analytics.

```typescript
interface AnalyticsEvent {
  /** Event name */
  name: string;
  
  /** Event parameters */
  params?: EventParameters;
  
  /** Timestamp when event was created */
  timestamp_micros?: number;
}
```

### SessionInfo

Información de la sesión actual.

```typescript
interface SessionInfo {
  /** Unique session identifier */
  sessionId: string;
  
  /** Session start time in milliseconds */
  startTime: number;
  
  /** Last activity time in milliseconds */
  lastActivityTime: number;
  
  /** Total engagement time in milliseconds */
  engagementTime: number;
  
  /** Whether this is the first session for the user */
  isFirstSession: boolean;
}
```

### DeviceInfo

Información del dispositivo detectada automáticamente.

```typescript
interface DeviceInfo {
  /** Platform name (e.g., 'tizen', 'webos') */
  platform: string;
  
  /** User agent string */
  userAgent: string;
  
  /** Screen resolution (e.g., '1920x1080') */
  screenResolution: string;
  
  /** Device language */
  language: string;
  
  /** Device timezone */
  timezone: string;
}
```

## Configuraciones predefinidas

### TIZEN_CONFIG

Configuración optimizada para Samsung Tizen.

```typescript
const TIZEN_CONFIG: Partial<SmartTVAnalyticsConfig> = {
  batchSize: 12,
  flushInterval: 45000,
  requestTimeout: 20000,
  maxRetryAttempts: 5,
  enablePageViewTracking: true,
  enableSessionTracking: true,
  enableEngagementTracking: true
};
```

### WEBOS_CONFIG

Configuración optimizada para LG webOS.

```typescript
const WEBOS_CONFIG: Partial<SmartTVAnalyticsConfig> = {
  batchSize: 8,
  flushInterval: 30000,
  requestTimeout: 15000,
  maxRetryAttempts: 4,
  enablePageViewTracking: true,
  enableSessionTracking: true,
  enableEngagementTracking: true
};
```

### DEBUG_CONFIG

Configuración para desarrollo y debugging.

```typescript
const DEBUG_CONFIG: Partial<SmartTVAnalyticsConfig> = {
  enableDebugMode: true,
  batchSize: 5,
  flushInterval: 10000,
  requestTimeout: 10000,
  maxRetryAttempts: 2,
  sendingStrategy: 'mock',
  mockMode: true
};
```

### LOW_RESOURCE_CONFIG

Configuración para dispositivos con recursos limitados.

```typescript
const LOW_RESOURCE_CONFIG: Partial<SmartTVAnalyticsConfig> = {
  batchSize: 20,
  flushInterval: 60000,
  requestTimeout: 25000,
  maxRetryAttempts: 3,
  enableEngagementTracking: false
};
```

## Tipos y enums

### SendingStrategy

Estrategias disponibles para el envío de eventos.

```typescript
type SendingStrategy = 'direct' | 'proxy' | 'mock' | 'gtag';
```

**Valores:**
- `'direct'` - Envío directo a Firebase (default)
- `'proxy'` - Envío a través de proxy server
- `'mock'` - Modo simulado para desarrollo
- `'gtag'` - Usando gtag (experimental)

### AutoEventConfig

Configuración para eventos automáticos.

```typescript
interface AutoEventConfig {
  /** Enable automatic page view tracking */
  pageView: boolean;
  
  /** Enable automatic session tracking */
  session: boolean;
  
  /** Enable automatic engagement tracking */
  engagement: boolean;
}
```

### RetryConfig

Configuración para reintentos de requests fallidos.

```typescript
interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  
  /** Initial delay in milliseconds */
  initialDelay: number;
  
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
  
  /** Maximum delay in milliseconds */
  maxDelay: number;
}
```

## Constantes

### DEFAULT_CONFIG

Configuración por defecto del sistema.

```typescript
const DEFAULT_CONFIG: Partial<SmartTVAnalyticsConfig> = {
  enableDebugMode: false,
  batchSize: 10,
  flushInterval: 30000,
  requestTimeout: 15000,
  maxRetryAttempts: 3,
  enablePageViewTracking: true,
  enableSessionTracking: true,
  enableEngagementTracking: true,
  sendingStrategy: 'direct',
  mockMode: false
};
```

### DEFAULT_AUTO_EVENTS

Eventos automáticos habilitados por defecto.

```typescript
const DEFAULT_AUTO_EVENTS: AutoEventConfig = {
  pageView: true,
  session: true,
  engagement: true
};
```

### DEFAULT_RETRY_CONFIG

Configuración de reintentos por defecto.

```typescript
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 30000
};
```

## Funciones de utilidad

### createSmartTVConfig()

Crea una configuración optimizada basada en la plataforma.

```typescript
function createSmartTVConfig(
  platform: 'tizen' | 'webos' | 'debug' | 'low-resource'
): Partial<SmartTVAnalyticsConfig>
```

**Parámetros:**
- `platform` - Plataforma objetivo

**Retorna:**
- `Partial<SmartTVAnalyticsConfig>` - Configuración optimizada

**Ejemplo:**
```typescript
import { createSmartTVConfig } from 'smart-tv-analytics';

const config = {
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: 'your-secret',
  appName: 'MyApp',
  appVersion: '1.0.0',
  ...createSmartTVConfig('tizen')
};
```

### getRecommendedConfig()

Obtiene la configuración recomendada detectando automáticamente la plataforma.

```typescript
function getRecommendedConfig(): Partial<SmartTVAnalyticsConfig>
```

**Retorna:**
- `Partial<SmartTVAnalyticsConfig>` - Configuración recomendada

**Ejemplo:**
```typescript
import { getRecommendedConfig } from 'smart-tv-analytics';

const config = {
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: 'your-secret',
  appName: 'MyApp',
  appVersion: '1.0.0',
  ...getRecommendedConfig()
};
```

## Errores y excepciones

### Tipos de error

La librería puede lanzar los siguientes tipos de errores:

#### ConfigurationError

Error de configuración inválida.

```typescript
class ConfigurationError extends Error {
  constructor(message: string, public configField?: string)
}
```

**Casos comunes:**
- Measurement ID inválido o faltante
- API Secret faltante
- Configuración de proxy inválida

#### NetworkError

Error de red durante el envío de eventos.

```typescript
class NetworkError extends Error {
  constructor(message: string, public statusCode?: number)
}
```

**Casos comunes:**
- Timeout de request
- Error HTTP (4xx, 5xx)
- Falta de conectividad

#### ValidationError

Error de validación de datos.

```typescript
class ValidationError extends Error {
  constructor(message: string, public invalidData?: any)
}
```

**Casos comunes:**
- Nombre de evento inválido
- Parámetros de evento inválidos
- Datos de usuario inválidos

### Manejo de errores

```typescript
try {
  await this.analytics.logEvent('custom_event', { param: 'value' });
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error('Configuration issue:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network issue:', error.message, error.statusCode);
  } else if (error instanceof ValidationError) {
    console.error('Validation issue:', error.message, error.invalidData);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Tokens de inyección

### SMART_TV_ANALYTICS_CONFIG

Token para inyectar la configuración en servicios.

```typescript
const SMART_TV_ANALYTICS_CONFIG = new InjectionToken<SmartTVAnalyticsConfig>(
  'SmartTVAnalyticsConfig'
);
```

**Uso en servicios personalizados:**
```typescript
@Injectable()
export class CustomAnalyticsService {
  constructor(
    @Inject(SMART_TV_ANALYTICS_CONFIG) private config: SmartTVAnalyticsConfig
  ) {}
}
```

---

Para ejemplos de uso específicos, consulta la [Guía de Ejemplos](EXAMPLES.md).