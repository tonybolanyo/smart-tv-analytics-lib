# Guía de solución de problemas - Smart TV Analytics

## Índice

- [Problemas de instalación](#problemas-de-instalación)
- [Problemas de configuración](#problemas-de-configuración)
- [Problemas de conectividad](#problemas-de-conectividad)
- [Problemas por plataforma](#problemas-por-plataforma)
- [Problemas de rendimiento](#problemas-de-performance)
- [Problemas de depuración](#problemas-de-debugging)
- [FAQ](#faq)
- [Herramientas de diagnóstico](#herramientas-de-diagnóstico)

## Problemas de instalación

### Error: Cannot resolve dependency 'smart-tv-analytics'

**Síntomas:**
```
npm ERR! Could not resolve dependency:
npm ERR! peer smart-tv-analytics@"^1.0.0" from your-app@1.0.0
```

**Soluciones:**

1. **Limpiar cache de npm:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. **Verificar compatibilidad de versiones:**
```bash
npm ls smart-tv-analytics
npm outdated
```

3. **Instalar con flag de force (último recurso):**
```bash
npm install smart-tv-analytics --force
```

### Error: Module not found '@angular/common'

**Síntomas:**
```
Error: Cannot find module '@angular/common/http'
```

**Solución:**
```bash
npm install @angular/common @angular/core @angular/router rxjs zone.js
```

### Error de TypeScript en la compilación

**Síntomas:**
```
error TS2307: Cannot find module 'smart-tv-analytics'
```

**Soluciones:**

1. **Verificar tsconfig.json:**
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true
  }
}
```

2. **Crear declaración manual (temporal):**
```typescript
// src/types/smart-tv-analytics.d.ts
declare module 'smart-tv-analytics' {
  export * from 'smart-tv-analytics/lib/public-api';
}
```

### Error de compilación con Angular 12+

**Síntomas:**
```
ERROR in The target entry-point "smart-tv-analytics" has missing dependencies
```

**Solución:**
```bash
# Configurar ngcc
npx ngcc --packages smart-tv-analytics

# O crear ngcc.config.js
echo 'module.exports = {
  packages: {
    "smart-tv-analytics": {
      ignorableDeepImportMatchers: [/rxjs\//]
    }
  }
}' > ngcc.config.js
```

## Problemas de configuración

### Error: Invalid Measurement ID

**Síntomas:**
```
AnalyticsConfigError: Invalid measurement ID format
```

**Verificación:**
```typescript
// Measurement ID debe tener formato G-XXXXXXXXXX
const measurementId = 'G-ABC123XYZ';
const isValid = /^G-[A-Z0-9]+$/.test(measurementId);
console.log('ID válido:', isValid);
```

**Solución:**
1. Verificar el Measurement ID en Google Analytics
2. Asegurarse de usar GA4 (no Universal Analytics)
3. Copiar exactamente desde Admin > Property > Data Streams

### Error: API Secret Invalid

**Síntomas:**
```
HTTP 403: Invalid API secret
```

**Verificación:**
```typescript
// Generar nuevo API secret
// 1. Ir a Google Analytics
// 2. Admin > Property > Data Streams
// 3. Seleccionar stream
// 4. Measurement Protocol API secrets
// 5. Create new secret
```

### Error: Module Configuration

**Síntomas:**
```
NullInjectorError: No provider for SmartTVAnalyticsService
```

**Solución:**
```typescript
// Verificar que está importado correctamente
@NgModule({
  imports: [
    SmartTVAnalyticsModule.forRoot({
      measurementId: 'G-XXXXXXXXXX',
      apiSecret: 'your-api-secret'
    })
  ]
})
export class AppModule { }
```

### Error: Environment Variables

**Síntomas:**
```
Cannot read property 'measurementId' of undefined
```

**Solución:**
```typescript
// Verificar environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    measurementId: 'G-XXXXXXXXXX',
    apiSecret: 'your-secret'
  }
};

// Verificar importación
import { environment } from '../environments/environment';
```

## Problemas de conectividad

### Error: CORS Policy

**Síntomas:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Soluciones:**

1. **Usar Proxy Strategy:**
```typescript
SmartTVAnalyticsModule.forRoot({
  sendingStrategy: 'proxy',
  proxyUrl: '/api/analytics-proxy',
  // ... otras configuraciones
})
```

2. **Configurar servidor proxy:**
```javascript
// proxy.conf.json (Angular CLI)
{
  "/api/analytics-proxy/*": {
    "target": "https://www.google-analytics.com",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/api/analytics-proxy": "/mp/collect"
    }
  }
}
```

3. **Usar Beacon Strategy (recomendado):**
```typescript
SmartTVAnalyticsModule.forRoot({
  sendingStrategy: 'beacon',
  fallbackStrategy: 'fetch',
  // ... otras configuraciones
})
```

### Error: Network Timeout

**Síntomas:**
```
NetworkError: Request timeout after 15000ms
```

**Solución:**
```typescript
SmartTVAnalyticsModule.forRoot({
  requestTimeout: 30000, // Aumentar timeout
  maxRetryAttempts: 5,   // Más reintentos
  retryDelay: 2000,      // Delay entre reintentos
  // ... otras configuraciones
})
```

### Error: DNS Resolution

**Síntomas:**
```
NetworkError: DNS resolution failed for www.google-analytics.com
```

**Verificación:**
```bash
# En el dispositivo Smart TV (si tienes acceso)
nslookup www.google-analytics.com
ping www.google-analytics.com
```

**Soluciones:**
1. Verificar conectividad a internet
2. Usar DNS alternativo (8.8.8.8)
3. Configurar proxy local

### Error: SSL/TLS Certificate

**Síntomas:**
```
SSL certificate error
```

**Solución:**
```typescript
// Para desarrollo únicamente
SmartTVAnalyticsModule.forRoot({
  enableHttpFallback: true, // Solo en desarrollo
  // ... otras configuraciones
})
```

## Problemas por plataforma

### Samsung Tizen

#### Error: Security Privilege

**Síntomas:**
```
Security Error: Network access denied
```

**Solución en config.xml:**
```xml
<tizen:privilege name="http://tizen.org/privilege/internet"/>
<tizen:privilege name="http://tizen.org/privilege/network.get"/>
<tizen:privilege name="http://tizen.org/privilege.externalstorage"/>
```

#### Error: Content Security Policy

**Síntomas:**
```
CSP: Refused to connect to 'https://www.google-analytics.com'
```

**Solución:**
```html
<!-- En index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com;
               script-src 'self' 'unsafe-inline' 'unsafe-eval';">
```

### LG webOS

#### Error: Application Permissions

**Síntomas:**
```
Permission denied: network.operation
```

**Solución en appinfo.json:**
```json
{
  "requiredPermissions": [
    "network.operation",
    "storage.operation"
  ],
  "allowedDomains": [
    "*.google-analytics.com",
    "*.googleapis.com"
  ]
}
```

#### Error: webOS Service

**Síntomas:**
```
webOS service not available
```

**Verificación:**
```javascript
// Verificar disponibilidad de servicios webOS
if (window.webOS) {
  console.log('webOS platform detected');
  console.log('webOS version:', window.webOS.platform.version);
} else {
  console.log('webOS not detected');
}
```

## Problemas de rendimiento

### Error: Memory Leaks

**Síntomas:**
```
JavaScript heap out of memory
```

**Soluciones:**

1. **Configurar límites de batch:**
```typescript
SmartTVAnalyticsModule.forRoot({
  batchSize: 5,           // Lotes pequeños
  maxEventQueueSize: 50,  // Cola limitada
  memoryThreshold: 80,    // Límite de memoria
  // ... otras configuraciones
})
```

2. **Limpiar subscripciones:**
```typescript
export class YourComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.analytics.events$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(event => {
      // Manejar eventos
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Error: CPU Usage High

**Síntomas:**
La app consume mucha CPU.

**Solución:**
```typescript
// Configuración de bajo recurso
import { LOW_RESOURCE_CONFIG } from 'smart-tv-analytics';

SmartTVAnalyticsModule.forRoot({
  ...LOW_RESOURCE_CONFIG,
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: 'your-secret'
})
```

### Error: Storage Quota

**Síntomas:**
```
QuotaExceededError: Storage quota exceeded
```

**Solución:**
```typescript
SmartTVAnalyticsModule.forRoot({
  maxStorageSize: 5 * 1024 * 1024, // 5MB límite
  storageStrategy: 'memory',        // Usar memoria en lugar de disco
  autoCleanup: true,                // Limpieza automática
  // ... otras configuraciones
})
```

## Problemas de depuración

### Error: Debug Mode No Funciona

**Síntomas:**
No aparecen logs en consola.

**Solución:**
```typescript
SmartTVAnalyticsModule.forRoot({
  enableDebugMode: true,
  logLevel: 'verbose',
  mockMode: true, // Para evitar envíos reales
  // ... otras configuraciones
})
```

### Error: Events Not Visible in Firebase

**Síntomas:**
Los eventos no aparecen en Firebase Analytics.

**Verificación:**
1. Revisar Real-time Events en Firebase Console
2. Esperar hasta 24 horas para datos no real-time
3. Verificar filtros de fecha en Firebase
4. Confirmar que usas GA4 (no Universal Analytics)

**Debug:**
```typescript
// Habilitar logging detallado
this.analytics.logEvent('debug_test', {
  timestamp: Date.now(),
  client_id: this.analytics.getClientId(),
  session_id: this.analytics.getSessionId()
}).then(() => {
  console.log('Event sent successfully');
}).catch(error => {
  console.error('Event failed:', error);
});
```

### Error: Source Maps

**Síntomas:**
Errores difíciles de debuggear en producción.

**Solución:**
```json
// angular.json
{
  "configurations": {
    "production": {
      "sourceMap": true,
      "namedChunks": true
    }
  }
}
```

## FAQ

### ¿Por qué los eventos no aparecen inmediatamente en Firebase?

Los eventos pueden tardar hasta 24 horas en aparecer en informes estándar de Firebase. Para verificación inmediata, usa:
- Real-time Events en Firebase Console
- DebugView (requiere debug mode)

### ¿Cómo sé si mi configuración es correcta?

```typescript
ngOnInit() {
  // Verificar inicialización
  console.log('Analytics initialized:', this.analytics.isInitialized());
  console.log('Client ID:', this.analytics.getClientId());
  console.log('Session ID:', this.analytics.getSessionId());
  
  // Test event
  this.analytics.logEvent('config_test', {
    platform: this.detectPlatform(),
    timestamp: Date.now()
  });
}
```

### ¿Qué hacer si la app es muy lenta?

1. Usar configuración de bajo recurso
2. Reducir frecuencia de eventos
3. Aumentar batch size e interval
4. Usar strategy 'beacon' para mejor performance

### ¿Cómo depurar problemas de CORS?

1. Verificar en Network tab del navegador
2. Usar strategy 'beacon' (evita CORS)
3. Configurar proxy en desarrollo
4. Verificar headers de respuesta

### ¿Qué hacer si falla en una plataforma específica?

1. Verificar user agent detection
2. Usar configuración específica de plataforma
3. Revisar permisos de la plataforma
4. Testear en emulador/dispositivo real

## Herramientas de diagnóstico

### Script de diagnóstico básico

```typescript
// diagnostic.service.ts
@Injectable()
export class DiagnosticService {
  constructor(private analytics: SmartTVAnalyticsService) {}

  async runDiagnostics(): Promise<DiagnosticReport> {
    const report: DiagnosticReport = {
      timestamp: Date.now(),
      platform: this.detectPlatform(),
      analytics: {
        initialized: this.analytics.isInitialized(),
        clientId: this.analytics.getClientId(),
        sessionId: this.analytics.getSessionId()
      },
      network: await this.testNetworkConnectivity(),
      storage: this.testStorageAvailability(),
      permissions: this.testPermissions()
    };

    console.log('Diagnostic Report:', report);
    return report;
  }

  private async testNetworkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('https://www.google-analytics.com/mp/collect', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      console.error('Network test failed:', error);
      return false;
    }
  }

  private testStorageAvailability(): boolean {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (error) {
      return false;
    }
  }

  private testPermissions(): any {
    return {
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      navigator: !!navigator,
      fetch: !!window.fetch,
      beacon: !!(navigator && navigator.sendBeacon)
    };
  }

  private detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('tizen')) return 'tizen';
    if (userAgent.includes('webos')) return 'webos';
    if (userAgent.includes('android')) return 'android_tv';
    return 'unknown';
  }
}

interface DiagnosticReport {
  timestamp: number;
  platform: string;
  analytics: {
    initialized: boolean;
    clientId: string;
    sessionId: string;
  };
  network: boolean;
  storage: boolean;
  permissions: any;
}
```

### Monitor de rendimiento

```typescript
@Injectable()
export class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = [];

  startMonitoring() {
    // Monitor memory usage
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.push({
          timestamp: Date.now(),
          type: 'memory',
          value: memory.usedJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
      }
    }, 30000);

    // Monitor analytics queue size
    setInterval(() => {
      const queueSize = this.getAnalyticsQueueSize();
      this.metrics.push({
        timestamp: Date.now(),
        type: 'queue_size',
        value: queueSize
      });
    }, 10000);
  }

  getReport(): PerformanceReport {
    return {
      averageMemoryUsage: this.calculateAverage('memory'),
      maxQueueSize: this.calculateMax('queue_size'),
      recommendations: this.generateRecommendations()
    };
  }

  private calculateAverage(type: string): number {
    const values = this.metrics
      .filter(m => m.type === type)
      .map(m => m.value);
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateMax(type: string): number {
    const values = this.metrics
      .filter(m => m.type === type)
      .map(m => m.value);
    return Math.max(...values);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const avgMemory = this.calculateAverage('memory');
    if (avgMemory > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Consider reducing batch size or enabling auto cleanup');
    }

    const maxQueue = this.calculateMax('queue_size');
    if (maxQueue > 100) {
      recommendations.push('Consider reducing flush interval or increasing batch size');
    }

    return recommendations;
  }

  private getAnalyticsQueueSize(): number {
    // Implementar según la API interna del servicio
    return 0; // Placeholder
  }
}

interface PerformanceMetric {
  timestamp: number;
  type: string;
  value: number;
  limit?: number;
}

interface PerformanceReport {
  averageMemoryUsage: number;
  maxQueueSize: number;
  recommendations: string[];
}
```

### FAQ

#### Verificar las credenciales en environment.ts

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  analytics: {
    measurementId: 'G-XXXXXXXXXX',      // Debe empezar con 'G-'
    apiSecret: 'your-api-secret-here',  // No debe estar vacío
    appName: 'MyApp',
    appVersion: '1.0.0'
  }
};
```

#### No usar el servicio en el constructor

**Incorrecto:**
```typescript
constructor(private analytics: SmartTVAnalyticsService) {
  // No hacer esto en el constructor
  this.analytics.logEvent('app_opened', {});
}
```

**Correcto:**
```typescript
constructor(private analytics: SmartTVAnalyticsService) {}

ngOnInit() {
  // Usar el servicio en ngOnInit o después
  this.analytics.logEvent('app_opened', {});
}
```

## Problemas de credenciales

### Error: Eventos no se envían o errores de autenticación

**Síntomas:**
- Errores 401 o 403 en la consola de red
- Eventos no llegan a Google Analytics
- Mensajes de "Invalid credentials"

**Causa común:**
Estás usando credenciales incorrectas o de un tipo incorrecto de proyecto de Analytics.

### Importante: Google Analytics 4 vs Firebase

**Esta librería usa Google Analytics 4 (GA4), NO Firebase Analytics directamente.**

Si estás viendo errores como:
- "Invalid API Key"
- "Firebase API key not valid"

Es porque estás usando credenciales de Firebase en lugar de Google Analytics 4.

### Configuración correcta

#### Paso 1: Crear o acceder a Google Analytics 4

1. Ve a https://analytics.google.com/
2. Crea una nueva propiedad **Google Analytics 4** (no Universal Analytics)
3. Configura un **Data Stream de tipo Web**

#### Paso 2: Obtener el Measurement ID

1. En tu propiedad GA4, ve a **Admin** (⚙️)
2. En la columna "Property", selecciona **Data Streams**
3. Click en tu Web stream
4. Copia el **Measurement ID** (formato: `G-XXXXXXXXXX`)

#### Paso 3: Crear un API Secret

1. En la misma página del Data Stream, busca la sección **Measurement Protocol API secrets**
2. Click en **Create**
3. Dale un nombre descriptivo (ej: "SmartTV Production")
4. Click en **Create**
5. **Copia el "Secret value"** (solo se muestra una vez)

#### Paso 4: Configurar en tu aplicación

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  analytics: {
    measurementId: 'G-XXXXXXXXXX',      // Del paso 2
    apiSecret: 'tu_secret_copiado',     // Del paso 3
    appName: 'MySmartTVApp',
    appVersion: '1.0.0'
  }
};
```

### NO uses:
- Firebase API Key
- Firebase Project ID
- Universal Analytics Tracking ID (UA-XXXXXX)
- Google Cloud API Key

### SÍ usa:
- Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`)
- Measurement Protocol API Secret

---

## Eventos no aparecen en Google Analytics

### Problema: Los eventos se envían pero no aparecen en GA4

**Solución rápida: Usa DebugView**

Los eventos pueden tardar 24-48 horas en aparecer en los reportes estándar. Para ver eventos en tiempo real:

1. Habilita modo debug en tu app:
   ```typescript
   SmartTVAnalyticsModule.forRoot({
     // ... otras opciones
     enableDebugMode: true
   })
   ```

2. Abre Google Analytics
3. Ve a **Admin** > **DebugView**
4. Los eventos deberían aparecer en tiempo real

### Verificar que los eventos se están enviando

Abre la consola del navegador (F12) y busca mensajes como:

```
[SmartTVAnalytics] Initializing with config: {...}
[SmartTVAnalytics] Event logged: page_view
[SmartTVAnalytics] Batch sent successfully
```

Si ves estos mensajes, los eventos se están enviando correctamente.

### Causas de eventos no visibles

1. **Bloqueadores de anuncios**
   - Algunos bloqueadores bloquean las llamadas a Google Analytics
   - Prueba en modo incógnito sin extensiones

2. **Credenciales incorrectas**
   - Verifica que el Measurement ID y API Secret sean correctos
   - Asegúrate de usar GA4, no Firebase o UA

3. **Filtros en GA4**
   - Verifica que no haya filtros que excluyan tu tráfico
   - Admin > Data Settings > Data Filters

## Problemas en localhost

### Eventos no se envían desde localhost

**Síntoma:**
La aplicación funciona en localhost pero los eventos no llegan a GA4.

**Solución:**

#### 1. Habilitar modo debug

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  analytics: {
    measurementId: 'G-XXXXXXXXXX',
    apiSecret: 'your-api-secret',
    appName: 'MyApp',
    appVersion: '1.0.0'
  }
};

// src/app/app.module.ts
SmartTVAnalyticsModule.forRoot({
  measurementId: environment.analytics.measurementId,
  apiSecret: environment.analytics.apiSecret,
  appName: environment.analytics.appName,
  appVersion: environment.analytics.appVersion,
  enableDebugMode: !environment.production  // true en desarrollo
})
```

#### 2. Verificar en la consola

Deberías ver logs detallados:

```
[SmartTVAnalytics] Initializing with config: {...}
[SmartTVAnalytics] Event logged: app_opened
[SmartTVAnalytics] Sending batch with 1 events
[SmartTVAnalytics] Batch sent successfully
```

#### 3. Verificar CORS

Google Analytics 4 Measurement Protocol debería funcionar sin problemas de CORS. Si ves errores CORS:

- Asegúrate de estar usando la URL correcta de GA4 Measurement Protocol
- La librería usa `https://www.google-analytics.com/mp/collect` automáticamente

#### 4. Verificar conexión a internet

En localhost, asegúrate de tener conexión a internet para que los eventos se envíen a GA4.

## Problemas en producción

### Los eventos funcionan en desarrollo pero no en producción

**Checklist:**

1. **Verifica el archivo environment.prod.ts**
   ```typescript
   // src/environments/environment.prod.ts
   export const environment = {
     production: true,
     analytics: {
       measurementId: 'G-XXXXXXXXXX',  // ¿Está correcto?
       apiSecret: 'production-secret',  // ¿Es el secret de producción?
       appName: 'MyApp',
       appVersion: '1.0.0'
     }
   };
   ```

2. **Compilar con --configuration production**
   ```bash
   ng build --configuration production
   ```

3. **Verificar que no haya errores de minificación**
   - Angular Ivy debería manejar esto automáticamente
   - Si hay problemas, revisa la consola del navegador en producción

4. **Contenido Security Policy (CSP)**
   - Asegúrate de que tu CSP permite conexiones a `*.google-analytics.com`

## Problemas específicos de Smart TV

### Tizen (Samsung)

#### Error: "Network request failed"

**Causa:** Tizen tiene restricciones de red más estrictas.

**Solución:**

1. Verifica los privilegios en `tizen/config.xml`:
   ```xml
   <tizen:privilege name="http://tizen.org/privilege/internet"/>
   <tizen:privilege name="http://tizen.org/privilege/network.get"/>
   ```

2. Aumenta los timeouts:
   ```typescript
   SmartTVAnalyticsModule.forRoot({
     // ... otras opciones
     requestTimeout: 15000,  // 15 segundos
     maxRetryAttempts: 2
   })
   ```

#### Error: Eventos no se envían en lotes

**Solución:** Reduce el tamaño de lote para Tizen:

```typescript
SmartTVAnalyticsModule.forRoot({
  // ... otras opciones
  batchSize: 5,           // Lotes más pequeños
  flushInterval: 60000    // Intervalo más largo
})
```

### webOS (LG)

#### Error: "Quota exceeded"

**Causa:** webOS tiene límites de almacenamiento más restrictivos.

**Solución:**

La librería no usa localStorage extensivamente, pero si ves este error:

```typescript
SmartTVAnalyticsModule.forRoot({
  // ... otras opciones
  batchSize: 8,           // Tamaño de lote moderado
  flushInterval: 45000    // Intervalo equilibrado
})
```

## Diagnóstico general

### Lista de verificación completa

Usa esta checklist para diagnosticar problemas:

#### Configuración
- [ ] `SmartTVAnalyticsModule.forRoot()` está en `app.module.ts`
- [ ] Las credenciales están en `environment.ts` y `environment.prod.ts`
- [ ] El Measurement ID tiene formato `G-XXXXXXXXXX`
- [ ] El API Secret no está vacío

#### Google Analytics
- [ ] Tienes una propiedad **Google Analytics 4** (no UA)
- [ ] El Data Stream es de tipo **Web**
- [ ] El API Secret está activo (no revocado)
- [ ] DebugView muestra eventos en tiempo real

#### Código
- [ ] El servicio se usa en `ngOnInit()` o después, no en el constructor
- [ ] `enableDebugMode: true` en desarrollo
- [ ] No hay errores en la consola del navegador
- [ ] La red muestra requests a `google-analytics.com`

#### Compilación
- [ ] `ng build --configuration production` sin errores
- [ ] Los archivos de producción incluyen las credenciales correctas
- [ ] No hay errores de minificación en la consola

## Recursos adicionales

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Measurement Protocol Reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
