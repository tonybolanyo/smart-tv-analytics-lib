# Smart TV Analytics Library

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Angular](https://img.shields.io/badge/angular-12+-red.svg)
![RxJS](https://img.shields.io/badge/rxjs-7+-red.svg)
![TypeScript](https://img.shields.io/badge/typescript-4.3+-blue.svg)
![Node 14](https://img.shields.io/badge/node-14+-blue.svg)
![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

Una librería de Firebase Analytics optimizada para aplicaciones Angular en Smart TVs, compatible con ES5 y diseñada específicamente para funcionar en Tizen, WebOS y otros sistemas de televisión inteligente.

## Índice

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración Rápida](#configuración-rápida)
- [Arquitectura](#arquitectura)
- [Documentación Completa](#documentación-completa)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Características

### Caracteristicas _core_
- **Compatibilidad Smart TV**: Optimizado para navegadores de TV con limitaciones de JavaScript
- **Compatible con ES5**: Transpilado automáticamente para máxima compatibilidad
- **Sin IndexedDB**: Evita APIs de almacenamiento que pueden estar bloqueadas
- **Firebase Measurement Protocol**: Integración directa con GA4 usando API REST
- **Angular Ivy**: Compilado para mejor tree-shaking y rendimiento

### Caracteristicas de analíticas
- **Eventos automáticos**: Tracking de sesiones, páginas y engagement sin configuración
- **Batching inteligente**: Agrupa eventos para optimizar peticiones de red
- **Reintentos automáticos**: Manejo robusto de errores con backoff exponencial
- **Múltiples estrategias de envío**: Soporte para envío directo, proxy o modo mock
- **Modo debug**: Logging detallado para desarrollo y debugging

### Experiencia de desarrollo
- **TypeScript completo**: Tipado fuerte con documentación JSDoc
- **Configuración flexible**: Múltiples presets para diferentes entornos
- **Testing integrado**: Suite completa de tests unitarios, integración y E2E
- **Hot reload**: Soporte para desarrollo local sin publicar a npm

## Requisitos

| Dependencia | Versión | Notas |
|-------------|---------|-------|
| Angular | 12+ | Compilado con Angular Ivy |
| TypeScript | 4.3+ | Para compatibilidad con Angular 12 |
| Node.js | 14.x-16.x | Recomendado para desarrollo |
| RxJS | 7+ | Para manejo de streams |

> **Importante**: Para Node.js 17+, usar `NODE_OPTIONS="--openssl-legacy-provider"` debido a cambios en OpenSSL 3.0.

## Compatibilidad

| Plataforma | Versión | Estado |
|------------|---------|--------|
| Samsung Tizen | 2.4+ | Soportado |
| LG webOS | 3.0+ | Soportado |

## Changelog

Ver [CHANGELOG.md](docs/CHANGELOG.md) para el historial completo de versiones.

## Privacidad y Cumplimiento

- No almacena datos personales sin consentimiento
- Respeta las configuraciones de privacidad del usuario
- Compatible con GDPR y otras regulaciones
- Método `enableCollection(false)` para deshabilitar completamente

## Documentación

## Instalación

```bash
# Instalación desde npm
npm install smart-tv-analytics

# O con yarn
yarn add smart-tv-analytics
```

### Desarrollo local

Para desarrollo sin publicar a npm:

```bash
# En el directorio de la librería
npm run build
npm pack

# En tu proyecto
npm install path/to/smart-tv-analytics-1.0.0.tgz
```

## Configuración rápida

### 1. Importar el módulo

```typescript
import { NgModule } from '@angular/core';
import { SmartTVAnalyticsModule } from 'smart-tv-analytics';

@NgModule({
  imports: [
    SmartTVAnalyticsModule.forRoot({
      measurementId: 'G-XXXXXXXXXX',
      apiSecret: 'your-api-secret',
      appName: 'MySmartTVApp',
      appVersion: '1.0.0',
      enableDebugMode: true
    })
  ]
})
export class AppModule { }
```

### 2. Usar el servicio

```typescript
import { Component, OnInit } from '@angular/core';
import { SmartTVAnalyticsService } from 'smart-tv-analytics';

@Component({
  selector: 'app-home',
  template: '<h1>App Smart TV</h1>'
})
export class HomeComponent implements OnInit {
  constructor(private analytics: SmartTVAnalyticsService) {}

  ngOnInit() {
    // Eventos automáticos ya están activos
    
    // Evento personalizado
    this.analytics.logEvent('page_view', {
      page_title: 'Home',
      page_location: '/home'
    });
  }

  onVideoPlay() {
    this.analytics.logEvent('video_play', {
      video_id: 'abc123',
      video_title: 'Vídeo de ejemplo'
    });
  }
}
```

## Arquitectura

### Estructura del proyecto

```
smart-tv-analytics/
├── src/
│   ├── lib/
│   │   ├── models/           # Interfaces y tipos
│   │   ├── services/         # Servicios core
│   │   └── smart-tv-analytics.module.ts
│   ├── smart-tv-configs.ts   # Configuraciones predefinidas
│   └── public-api.ts         # API pública
├── examples/
│   └── sample-app/           # App de ejemplo completa
├── docs/                     # Documentación detallada
├── scripts/                  # Scripts de build y utilities
└── dist/                     # Build output
```

### Servicios _core_

| Servicio | Descripción | Responsabilidades |
|----------|-------------|-------------------|
| `SmartTVAnalyticsService` | Servicio principal | API pública, orquestación |
| `EventBatchingService` | Batching de eventos | Agrupa y envía eventos |
| `SessionService` | Gestión de sesiones | Tracking de sesiones automático |
| `DeviceInfoService` | Información del dispositivo | Detección de plataforma y specs |
| `StorageService` | Almacenamiento local | Persistencia sin IndexedDB |

### Flujo de datos

```
Component → SmartTVAnalyticsService → EventBatchingService → Firebase GA4
    ↑              ↑                          ↑
DeviceInfo    SessionService           StorageService
```

## Documentación completa

### Documentos principales

- **[Guía de instalación y configuración](docs/INSTALLATION.md)** - Setup detallado
- **[Guía API](docs/API.md)** - Referencia completa de la API
- **[Arquitectura del sistema](docs/ARCHITECTURE.md)** - Diseño y patrones
- **[Buenas prácticas](docs/BEST-PRACTICES.md)** - Recomendaciones de uso
- **[Análisis funcional](docs/FUNCTIONAL-ANALYSIS.md)** - Casos de uso y requisitos

### Documentos de desarrollo

- **[Guía de testing](docs/TESTING.md)** - Tests unitarios, integración y E2E
- **[Desarrollo local](docs/LOCAL-DEVELOPMENT.md)** - Setup para desarrollo
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Solución de problemas
- **[Compatibilidad ES5](docs/ES5-COMPATIBILITY.md)** - Detalles técnicos

### Ejemplos y tutoriales

- **[Aplicación de ejemplo](docs/SAMPLE-APP.md)** - Tutorial paso a paso
- **[Ejemplos de código](docs/EXAMPLES.md)** - Casos de uso comunes
- **[Configuraciones avanzadas](docs/ADVANCED-CONFIG.md)** - Configuraciones personalizadas

## Ejemplos de uso

### Configuraciones predefinidas

```typescript
import { TIZEN_CONFIG, WEBOS_CONFIG, DEBUG_CONFIG } from 'smart-tv-analytics';

// Para Tizen
SmartTVAnalyticsModule.forRoot({
  ...TIZEN_CONFIG,
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: 'your-secret'
})

// Para desarrollo
SmartTVAnalyticsModule.forRoot({
  ...DEBUG_CONFIG,
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: 'your-secret',
  mockMode: true
})
```

### Eventos personalizados

```typescript
// Evento de navegación
this.analytics.logEvent('screen_view', {
  screen_name: 'VideoPlayer',
  screen_class: 'VideoComponent'
});

// Evento de interacción
this.analytics.logEvent('select_content', {
  content_type: 'video',
  content_id: 'video_123',
  content_name: 'Episode 1'
});

// Propiedades de usuario
this.analytics.setUserProperties({
  platform: 'tizen',
  app_version: '1.0.0'
});
```

### Manejo de errores

```typescript
try {
  await this.analytics.logEvent('custom_event', { param: 'value' });
} catch (error) {
  console.error('Analytics error:', error);
  // Fallback o logging local
}
```

## Testing

### Tests unitarios

```bash
# Ejecutar todos los tests
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Tests para CI
npm run test:ci
```

### Tests de integración

```bash
# En la aplicación de ejemplo
cd examples/sample-app
npm run test
```

### Tests E2E

```bash
# Tests end-to-end con Playwright
cd examples/sample-app
npm run e2e

# Tests con UI
npm run e2e:ui

# Tests en modo debug
npm run e2e:debug
```

### Cobertura de tests

- **Statements**: 95%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 95%+

## Contribución

### Desarrollo local

```bash
# Clonar repositorio
git clone ...
cd smart-tv-analytics-lib

# Instalar dependencias
npm install

# Build de desarrollo
npm run build

# Ejecutar tests
npm run test

# Ejecutar ejemplo
cd examples/sample-app
npm install
npm start
```

### Guías de desarrollo

1. **[Guía de contribución](CONTRIBUTING.md)** - Proceso y estándares
2. **[Código de conducta](CODE_OF_CONDUCT.md)** - Normas de la comunidad
3. **[Guía de incidencias](docs/ISSUE-TEMPLATE.md)** - Cómo reportar bugs
4. **[Guía de PR](docs/PR-TEMPLATE.md)** - Guía para los Pull Request

### Estándares de código

- **Linting**: ESLint + Prettier
- **Testing**: Mínimo 85% de cobertura
- **Documentation**: JSDoc para todas las APIs públicas
- **Commits**: Conventional Commits


