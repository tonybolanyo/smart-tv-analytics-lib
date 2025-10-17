# Arquitectura del sistema - Smart TV Analytics

## Visión general

Smart TV Analytics está diseñado como una librería modular para Angular que proporciona capacidades de analytics específicamente optimizadas para Smart TVs. La arquitectura sigue principios de separación de responsabilidades, inyección de dependencias y patrones reactivos.

## Principios de diseño

### 1. Modularidad
- Cada servicio tiene una responsabilidad específica
- Interfaces claramente definidas entre componentes
- Facilita testing y mantenimiento

### 2. Compatibilidad Smart TV
- Sin dependencias de APIs no disponibles en TVs
- Optimizado para recursos limitados
- Manejo robusto de conectividad intermitente

### 3. Extensibilidad
- Configuración flexible mediante interfaces
- Estrategias de envío intercambiables
- Hooks para customización

## Diagrama de arquitectura

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Aplicación Angular                              │
├──────────────────────────────────────────────────────────────────────┤
│                  SmartTVAnalyticsModule                              │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              SmartTVAnalyticsService                         │    │
│  │              (API Pública)                                   │    │
│  └─────────────────────┬────────────────────────────────────────┘    │
│                        │                                             │
│  ┌─────────────────────┼────────────────────────────────────────┐    │
│  │                     │                      Servicios Core    │    │
│  │  ┌──────────────────▼──────────────────┐                     │    │
│  │  │     EventBatchingService            │                     │    │
│  │  │  • Batching de eventos              │                     │    │
│  │  │  • Lógica de reintento              │                     │    │
│  │  │  • Optimización de red              │                     │    │
│  │  └────────────┬────────────────────────┘                     │    │
│  │               │                                              │    │
│  │  ┌────────────▼────────────┐  ┌────────────────────────────┐ │    │
│  │  │    SessionService       │  │   DeviceInfoService        │ │    │
│  │  │  • Tracking de sesión   │  │  • Detección de plataforma │ │    │
│  │  │  • Identif. de usuario  │  │  • Device capabilities     │ │    │
│  │  └─────────────────────────┘  └────────────────────────────┘ │    │
│  │                                                              │    │
│  │  ┌─────────────────────────────────────────────────────────┐ │    │
│  │  │              StorageService                             │ │    │
│  │  │  • Abstracción de almacenamiento local                  │ │    │
│  │  │  • Sin dependencia de IndexedDB                         │ │    │
│  │  └─────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────────────┤
│                     Integracione externas                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐        │
│  │  Firebase GA4   │  │  Proxy Server   │  │  Local Storage │        │
│  │  (HTTP API)     │  │  (CORS bypass)  │  │  (Fallback)    │        │
│  └─────────────────┘  └─────────────────┘  └────────────────┘        │
└──────────────────────────────────────────────────────────────────────┘
```

## Componentes del sistema

### SmartTVAnalyticsModule

**Responsabilidades:**
- Configuración del módulo Angular
- Registro de servicios y providers
- Inyección de configuración

**Características:**
- Método `forRoot()` para configuración global
- Lazy loading compatible
- Tree-shaking optimizado

### SmartTVAnalyticsService

**Responsabilidades:**
- API pública de la librería
- Orquestación entre servicios
- Manejo de eventos automáticos

**Métodos principales:**
```typescript
class SmartTVAnalyticsService {
  initialize(config: SmartTVAnalyticsConfig): void
  logEvent(name: string, params?: EventParameters): Promise<void>
  setUserProperties(properties: UserProperties): void
  setUserId(userId: string): void
  enableCollection(enabled: boolean): void
}
```

### EventBatchingService

**Responsabilidades:**
- Agrupación eficiente de eventos
- Retry con backoff exponencial
- Optimización de requests de red

**Algoritmos:**
- **Batching por tiempo**: Flush cada N milisegundos
- **Batching por cantidad**: Flush cada N eventos
- **Retry exponential backoff**: 1s, 2s, 4s, 8s, ...

```typescript
interface BatchingStrategy {
  batchSize: number;          // Eventos por batch
  flushInterval: number;      // Interval de flush (ms)
  maxRetryAttempts: number;   // Máximo reintentos
  retryDelay: number;         // Delay inicial para retry
}
```

### SessionService

**Responsabilidades:**
- Tracking automático de sesiones
- Generación de session IDs únicos
- Cálculo de engagement time

**Flujo de sesión:**
```
App Start → Session Begin → [User Activity] → Session Timeout → Session End
```

### DeviceInfoService

**Responsabilidades:**
- Detección de plataforma (Tizen, webOS, etc.)
- Recolección de información del dispositivo
- Generación de fingerprint único

**Información detectada:**
- User agent y platform
- Resolución de pantalla
- Capacidades del navegador
- Versión del OS de TV

### StorageService

**Responsabilidades:**
- Abstracción de localStorage
- Fallback cuando storage no está disponible
- Serialización/deserialización automática

**Estrategias de storage:**
1. **localStorage**: Principal
2. **sessionStorage**: Fallback
3. **Memory storage**: Último recurso

## Patrones de diseño implementados

### 1. Inyección de dependencias
Angular DI para servicios y configuración:
```typescript
constructor(
  private eventBatching: EventBatchingService,
  @Inject(SMART_TV_ANALYTICS_CONFIG) private config: SmartTVAnalyticsConfig
) {}
```

### 2. Patrón de Strategy
Múltiples estrategias de envío:
```typescript
interface SendingStrategy {
  send(payload: MeasurementPayload): Promise<void>;
}

class DirectSendingStrategy implements SendingStrategy { }
class ProxySendingStrategy implements SendingStrategy { }
class MockSendingStrategy implements SendingStrategy { }
```

### 3. Patrón Observer
RxJS para eventos reactivos:
```typescript
private destroy$ = new Subject<void>();

this.router.events
  .pipe(
    filter(event => event instanceof NavigationEnd),
    takeUntil(this.destroy$)
  )
  .subscribe(event => this.trackPageView(event));
```

### 4. Patrón Factory
Configuraciones predefinidas:
```typescript
export function createSmartTVConfig(
  platform: 'tizen' | 'webos' | 'debug'
): Partial<SmartTVAnalyticsConfig> {
  // Factory logic
}
```

## Flujo de datos

### 1. Inicialización
```
Module.forRoot(config) → 
Service.initialize() → 
Setup automatic events → 
Start session tracking
```

### 2. Log de eventos
```
Component.logEvent() → 
SmartTVAnalyticsService → 
Add metadata → 
EventBatchingService → 
Queue → 
Batch → 
HTTP Request → 
Firebase GA4
```

### 3. Gestión de errores
```
Network Error → 
Retry Logic → 
Exponential Backoff → 
Max Retries → 
Log Error → 
Continue
```

## Configuración y Eetensibilidad

### Configuración por capas

1. **Por defecto**: `DEFAULT_CONFIG`
2. **Presets por platforma**: `TIZEN_CONFIG`, `WEBOS_CONFIG`
3. **Configuración de usuario**: Proporcionado en `forRoot()`
4. **Overrides en tiempo de ejecución**: Métodos del servicio

### Puntos de extensión

1. **Custom sending strategies**
2. **Event interceptors**
3. **Storage adapters**
4. **Device info providers**

## Consideraciones de rendimiento

### Optimizaciones implementadas

1. **Agrupación de eventos**: Reduce requests HTTP
2. **Servicios _lazy_**: Servicios se inicializan solo cuando se necesitan
3. **Gestión de memoria**: Cleanup automático con `takeUntil`
4. **Tree shaking**: Código no usado se elimina del bundle

### Métricas de rendimiento

- **Tamaño del bundle**: < 50KB gzipped
- **Uso de memoria**: < 5MB en runtime
- **Peticiones de red**: 1 request cada 30 segundos máximo
- **Uso de CPU**: < 1% en idle

## Seguridad

### Medidas implementadas

1. **API Secret**: Nunca expuesto en client-side (está en el paquete de las TVs)
2. **HTTPS**: Todas las comunicaciones encriptadas
3. **Validación**: Validación de parámetros
4. **Limitación de flujo**: Control de frecuencia de eventos

### Consideraciones de privacidad

1. **User ID opcional**: No se requiere identificación personal
2. **Client ID anónimo**: UUID generado localmente
3. **Minimización de datos**: Solo datos necesarios para analytics
4. **Configuración de retention**: Configurable en Firebase

## Estrategias de testing

### Niveles de testing

1. **Tests unitarios**: Cada servicio individualmente
2. **Tests de integración**: Servicios trabajando juntos
3. **E2E Tests**: Flujo completo con Playwright
4. **Tests de rendimiento**: Load testing con métricas

### Patrones de tests

```typescript
describe('SmartTVAnalyticsService', () => {
  let service: SmartTVAnalyticsService;
  let mockEventBatching: jasmine.SpyObj<EventBatchingService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('EventBatchingService', ['addEvent']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: EventBatchingService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(SmartTVAnalyticsService);
    mockEventBatching = TestBed.inject(EventBatchingService) as jasmine.SpyObj<EventBatchingService>;
  });

  it('should log events through batching service', () => {
    service.logEvent('test_event', { param: 'value' });
    
    expect(mockEventBatching.addEvent).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'test_event',
        params: { param: 'value' }
      })
    );
  });
});
```

## Consideraciones para el despliegue

### Pipeline para compilación

1. **Compilación typescript**: `tsc`
2. **Compilación Angular**: `ng-packagr`
3. **Transpilación a ES5**: `babel`
4. **Optimización del bundle**: Webpack
5. **Calidad**: Tests + Linting

### Distribución

1. **NPM Package**: Distribución principal
2. **Releases**: Releases versionados
3. **Documentacion**: GitHub Pages
