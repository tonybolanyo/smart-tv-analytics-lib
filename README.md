# Smart TV Analytics Library

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![npm](https://img.shields.io/npm/v/smart-tv-analytics.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg) ![Coverage](https://img.shields.io/badge/coverage-95.19%25-brightgreen.svg)

![Statements](https://img.shields.io/badge/statements-95.19%25-brightgreen.svg) ![Branches](https://img.shields.io/badge/branches-85.85%25-green.svg) ![Functions](https://img.shields.io/badge/functions-89.77%25-green.svg)

![Statements](https://img.shields.io/badge/statements-93.72%25-brightgreen.svg) ![Branches](https://img.shields.io/badge/branches-77.36%25-yellowgreen.svg) ![Functions](https://img.shields.io/badge/functions-89.77%25-green.svg)

![Statements](https://img.shields.io/badge/statements-88.28%25-green.svg) ![Branches](https://img.shields.io/badge/branches-67.45%25-yellow.svg) ![Functions](https://img.shields.io/badge/functions-87.50%25-green.svg)

Una librería de Firebase Analytics para aplicaciones Angular en Smart TVs compatible con ES5, diseñada específicamente para funcionar en Tizen, WebOS y otros sistemas de Smart TVs.

## Características

- **Compatible con Smart TVs**: Optimizado para Tizen, WebOS y otros navegadores de TV
- **Compatibilidad ES5**: Compilado para ES5 garantizando máxima compatibilidad
- **Sin IndexedDB**: No depende de APIs de almacenamiento local que pueden estar bloqueadas en Smart TVs
- **API REST directa**: Utiliza Firebase Measurement Protocol v2
- **Eventos automáticos**: Seguimiento automático de sesiones, páginas y engagement
- **Batching inteligente**: Agrupa eventos para optimizar el rendimiento de red
- **Reintentos automáticos**: Manejo robusto de errores de red con backoff exponencial
- **Angular Ivy**: Compilado con Angular Ivy para mejor tree-shaking y rendimiento
- **TypeScript completo**: Tipado fuerte y documentación JSDoc completa

## Requisitos

- Angular 12 o superior
- TypeScript 4.3 o superior
- Node.js 14.x o superior (recommended: 14.x or 16.x)

> **Nota para Node.js 17+**: Si usas Node.js 17 o superior, necesitarás usar `NODE_OPTIONS="--openssl-legacy-provider"` debido a cambios en OpenSSL 3.0. Ver [Guía de Desarrollo Local](./LOCAL_DEVELOPMENT.md) para más detalles.

## Documentación

**Toda la documentación actualizada está disponible en la carpeta [`/docs`](./docs/INDEX.md).**

- **[Índice de Documentación](./docs/INDEX.md)** - Inicio y guía completa
- **[Guía Principal](./docs/README.md)** - Instalación, configuración y API
- **[Guía de Desarrollo Local](./LOCAL_DEVELOPMENT.md)** - 🆕 Build y ejecución sin publicar a npm
- **[Compatibilidad ES5](./ES5-COMPATIBILITY.md)** - 🆕 Cómo usar TypeScript moderno que se transpila a ES5
- **[Solución de Problemas](./docs/TROUBLESHOOTING.md)** - Guía para resolver problemas comunes
- **[Aplicación de Ejemplo](./docs/SAMPLE-APP.md)** - Tutorial completo con ejemplo
- **[Historial de Cambios](./docs/CHANGELOG.md)** - Versiones y actualizaciones

> **Nota**: Los documentos en borrador y en desarrollo están en [`/draft-docs`](./draft-docs/README.md)

## Instalación

```bash
npm install smart-tv-analytics
```

## Ejemplos

Tenemos una **aplicación de ejemplo completa** que demuestra cómo integrar y usar esta librería:

- **[Aplicación de Ejemplo](./docs/SAMPLE-APP.md)**: App Angular completa con tracking de video
- **[Más Ejemplos](./docs/EXAMPLES.md)**: Índice completo de ejemplos disponibles
- **[Scripts de Empaquetado](./draft-docs/EMPAQUETADO.md)**: Guía detallada para crear paquetes Tizen (.wgt) y webOS (.ipk)

### Inicio Rápido con el Ejemplo

Para ejecutar la aplicación de ejemplo localmente sin publicar a npm:

```bash
# 1. Compilar la librería
npm install
npm run build

# 2. Ir al directorio del ejemplo
cd examples/sample-app

# 3. Instalar dependencias
npm install

# 4. Iniciar el servidor de desarrollo
npm start
```

**Nota**: Si usas Node.js 17+, ejecuta: `NODE_OPTIONS="--openssl-legacy-provider" npm start`

Para instrucciones detalladas, consulta la **[Guía de Desarrollo Local](./LOCAL_DEVELOPMENT.md)**.

## Configuración

### 1. Configurar en app.module.ts

```typescript
import { SmartTVAnalyticsModule } from 'smart-tv-analytics';

@NgModule({
  imports: [
    SmartTVAnalyticsModule.forRoot({
      measurementId: 'G-XXXXXXXXXX',
      apiSecret: 'your-measurement-protocol-api-secret',
      appName: 'MySmartTVApp',
      appVersion: '1.0.0',
      enableDebugMode: false,
      batchSize: 10,
      flushInterval: 30000
    })
  ]
})
export class AppModule { }
```

### 2. Configuración para Smart TVs

Para garantizar la compatibilidad con Tizen y WebOS, debes importar los polyfills necesarios en tu aplicación. Asegúrate de que tu archivo `polyfills.ts` incluya:

```typescript
// Polyfills necesarios para Smart TVs
import 'core-js/es/array';
import 'core-js/es/object';
import 'core-js/es/promise';
// ... otros polyfills según sea necesario

// Zone.js requerido por Angular
import 'zone.js/dist/zone';
```

Se recomienda la siguiente configuración para cada plataforma:

#### Tizen (Samsung Smart TVs)

```typescript
// En app.module.ts, configuración recomendada para Tizen
SmartTVAnalyticsModule.forRoot({
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: 'your-api-secret',
  appName: 'MyTizenApp',
  appVersion: '1.0.0',
  enableDebugMode: false,
  batchSize: 5,           // Menor tamaño de lote para Tizen
  flushInterval: 60000,   // Mayor intervalo para conservar recursos
  requestTimeout: 15000   // Timeout más largo para conexiones lentas
})
```

#### WebOS (LG Smart TVs)

```typescript
// En app.module.ts, configuración recomendada para WebOS
SmartTVAnalyticsModule.forRoot({
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: 'your-api-secret',
  appName: 'MyWebOSApp',
  appVersion: '1.0.0',
  enableDebugMode: false,
  batchSize: 8,           // Tamaño óptimo para WebOS
  flushInterval: 45000,   // Intervalo equilibrado
  maxRetries: 2           // Menos reintentos para evitar congestión
})
```

### 3. Usar en componentes

```typescript
import { SmartTVAnalyticsService } from 'smart-tv-analytics';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(private analytics: SmartTVAnalyticsService) {}

  onButtonClick() {
    this.analytics.logEvent('button_click', {
      button_name: 'play_video',
      content_id: 'movie_123',
      value: 1
    });
  }

  onUserLogin(userId: string) {
    this.analytics.setUserId(userId);
    this.analytics.setUserProperty('user_type', 'premium');
  }
}
```

## Eventos Automáticos

La librería envía automáticamente estos eventos:

- **session_start**: Al iniciar la aplicación
- **first_visit**: Primera vez que se abre la app
- **page_view**: Navegación entre rutas de Angular
- **app_update**: Cuando cambia la versión de la app
- **engagement**: Tiempo de uso cada 30 segundos

## API Referencia

### SmartTVAnalyticsService

#### logEvent(eventName: string, parameters?: EventParameters)
Envía un evento personalizado a Firebase Analytics.

```typescript
this.analytics.logEvent('video_play', {
  video_title: 'Movie Title',
  video_duration: 120,
  user_engagement: true
});
```

#### setUserProperty(propertyName: string, value: string)
Establece una propiedad de usuario.

```typescript
this.analytics.setUserProperty('subscription_type', 'premium');
```

#### setUserId(userId: string)
Establece el ID único del usuario.

```typescript
this.analytics.setUserId('user_12345');
```

#### enableCollection(enabled: boolean)
Habilita o deshabilita la recolección de datos.

```typescript
this.analytics.enableCollection(false); // Deshabilitar
```

#### flush(): Promise<void>
Fuerza el envío inmediato de todos los eventos pendientes.

```typescript
await this.analytics.flush();
```

#### reset()
Reinicia todos los datos de usuario y comienza una nueva sesión.

```typescript
this.analytics.reset();
```

## Configuración Avanzada

### Opciones de SmartTVAnalyticsConfig

```typescript
interface SmartTVAnalyticsConfig {
  measurementId: string;           // ID de medición GA4
  apiSecret: string;               // API Secret del Measurement Protocol
  appName: string;                 // Nombre de la aplicación
  appVersion: string;              // Versión de la aplicación
  enableDebugMode?: boolean;       // Modo debug (default: false)
  batchSize?: number;              // Eventos por lote (default: 10)
  flushInterval?: number;          // Intervalo de envío en ms (default: 30000)
  requestTimeout?: number;         // Timeout de requests (default: 10000)
  maxRetryAttempts?: number;       // Intentos de reintento (default: 3)
  enablePageViewTracking?: boolean; // Tracking automático de páginas
  enableSessionTracking?: boolean;  // Tracking automático de sesiones
  enableEngagementTracking?: boolean; // Tracking automático de engagement
  customUserAgent?: string;        // User agent personalizado
  defaultParameters?: EventParameters; // Parámetros por defecto
}
```

### Parámetros de Evento

```typescript
interface EventParameters {
  [key: string]: string | number | boolean;
}

// Ejemplo de uso
this.analytics.logEvent('purchase', {
  transaction_id: 'T12345',
  value: 15.99,
  currency: 'USD',
  item_category: 'movies',
  payment_method: 'credit_card'
});
```

## Arquitectura

La librería está compuesta por varios servicios especializados:

- **SmartTVAnalyticsService**: Servicio principal y API pública
- **EventBatchingService**: Manejo de lotes y envío a Firebase
- **SessionService**: Gestión de sesiones de usuario
- **DeviceInfoService**: Detección de información del dispositivo
- **StorageService**: Almacenamiento con fallback a memoria

## Testing

La librería incluye tests unitarios completos usando Jasmine y Karma.

```bash
npm test
```

### Tests End-to-End

La aplicación de ejemplo incluye una suite completa de tests E2E usando Playwright:

```bash
cd examples/sample-app
npm run e2e
```

Para más información sobre testing E2E, consulta la [guía completa de E2E testing](./draft-docs/E2E-TESTING.md).

### Ejemplo de test personalizado

```typescript
import { TestBed } from '@angular/core/testing';
import { SmartTVAnalyticsService } from 'smart-tv-analytics';

describe('Analytics Integration', () => {
  let service: SmartTVAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SmartTVAnalyticsModule.forRoot({
        measurementId: 'G-TEST',
        apiSecret: 'test-secret',
        appName: 'TestApp',
        appVersion: '1.0.0'
      })]
    });
    
    service = TestBed.inject(SmartTVAnalyticsService);
  });

  it('should track custom events', async () => {
    await service.logEvent('test_event', { test_param: 'value' });
    // Assertions...
  });
});
```

## Privacidad y Cumplimiento

- No almacena datos personales sin consentimiento
- Respeta las configuraciones de privacidad del usuario
- Compatible con GDPR y otras regulaciones
- Método `enableCollection(false)` para deshabilitar completamente

## Troubleshooting

### Eventos no se envían
1. Verificar el `measurementId` y `apiSecret`
2. Comprobar conectividad de red
3. Habilitar `enableDebugMode` para logs detallados

### Errores de CORS
La librería usa el Measurement Protocol que no tiene restricciones CORS, pero verifica la configuración de red del Smart TV.

### Memoria limitada
La librería está optimizada para Smart TVs con recursos limitados y usa almacenamiento en memoria como fallback.

## Mejores Prácticas para Smart TVs

### Optimización de Rendimiento

1. **Usar lotes pequeños** (5-8 eventos) para conservar memoria
2. **Intervalos de flush más largos** (45-60 segundos) para reducir tráfico de red
3. **Limitar parámetros por evento** (máximo 25 por evento)
4. **Implementar error handling** robusto para conexiones inestables

### Compatibilidad con Smart TVs

1. **Tizen (Samsung)**:
   - Usar `batchSize: 5` para mejor rendimiento
   - Timeout de red de al menos 15 segundos
   - Evitar operaciones intensivas durante la reproducción de video

2. **WebOS (LG)**:
   - Configurar `batchSize: 8` para aprovecha mejor los recursos
   - Usar `maxRetries: 2` para evitar congestión de red
   - Implementar debounce en eventos de navegación frecuentes

3. **Dispositivos con recursos limitados**:
   - Deshabilitar debug mode en producción
   - Usar `flush()` manual en momentos apropiados (fin de sesión, pausa de contenido)
   - Monitorear el uso de memoria con herramientas de desarrollo del TV

### Eventos Recomendados para Smart TVs

```typescript
// Eventos específicos para aplicaciones de TV
this.analytics.logEvent('content_start', {
  content_type: 'video',
  content_id: 'movie_123',
  content_title: 'Título de la película',
  content_duration: 7200,
  quality: '4K'
});

this.analytics.logEvent('remote_control_action', {
  action: 'pause',
  content_position: 1800,
  device_type: 'samsung_tizen'
});

this.analytics.logEvent('app_navigation', {
  from_screen: 'home',
  to_screen: 'movie_details',
  navigation_method: 'remote_control'
});
```

### Mejores Prácticas Generales

1. **Usar nombres descriptivos** para eventos y parámetros
2. **Agrupar eventos relacionados** con prefijos consistentes
3. **Respetar la privacidad** del usuario
4. **Testear en dispositivos reales** siempre que sea posible

## Changelog

### v1.0.0
- Lanzamiento inicial
- Soporte completo para Tizen y WebOS
- API REST con Firebase Measurement Protocol
- Eventos automáticos y batching
- Tests unitarios completos
- **Suite completa de tests E2E con Playwright**

## Contribuir

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## Soporte

- [Issues en GitHub](https://github.com/your-org/smart-tv-analytics/issues)
- [Documentación completa](https://your-org.github.io/smart-tv-analytics)
- Email: support@your-org.com
