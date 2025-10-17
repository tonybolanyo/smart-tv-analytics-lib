# Ejemplos de uso - Smart TV Analytics

## Índice

- [Configuración básica](#configuración-básica)
- [Eventos de video](#eventos-de-video)
- [Eventos de navegación](#eventos-de-navegación)
- [Eventos de comercio](#eventos-de-comercio)
- [Eventos personalizados](#eventos-personalizados)
- [Configuraciones avanzadas](#configuraciones-avanzadas)
- [Patrones comunes](#patrones-comunes)
- [Integración con componentes](#integración-con-componentes)

### Sample App

Una aplicación Angular completa que demuestra:

- Integración de smart-tv-analytics
- Tracking de sesiones y navegación
- Eventos personalizados
- Simulador de reproductor de video
- Scripts de empaquetado para Tizen y webOS
- Documentación completa en español

**[Ver documentación completa →](./SAMPLE-APP.md)**

## Inicio rápido

### Prerrequisito: Compilar la librería

Si trabajas desde el repositorio clonado, primero compila la librería:

```bash
# Desde la raíz del repositorio
npm install
npm run build
```

### 1. Instalar dependencias

```bash
cd examples/sample-app
npm install
```

### 2. Configurar credenciales

Edita `examples/sample-app/src/environments/environment.ts` o `examples/sample-app/src/environments/environment.prod.ts`con tus credenciales de Google Analytics 4.

### 3. Ejecutar en desarrollo

```bash
npm start
```

### 4. Compilar para producción

```bash
npm run build:prod
```

### 5. Empaquetar para Smart TVs

**Para webOS (LG):**
```bash
npm run package:webos
```

**Para Tizen (Samsung):**
```bash
npm run package:tizen
```

## Documentación

- **[README - Sample App](./SAMPLE_APP.md)**: Guía completa de la aplicación de ejemplo
- **[EMPAQUETADO](./EMPAQUETADO.md)**: Guía detallada de empaquetado para Tizen y webOS

## Características demostradas

### Tracking automático

```typescript
// Configuración en app.module.ts
SmartTVAnalyticsModule.forRoot({
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: 'your-api-secret',
  enablePageViewTracking: true,    // Tracking automático de páginas
  enableSessionTracking: true,     // Tracking automático de sesiones
  enableEngagementTracking: true   // Tracking automático de engagement
})
```

### Eventos personalizados

```typescript
// Evento de navegación
this.analytics.logEvent('select_content', {
  content_type: 'video',
  content_id: '123',
  item_name: 'Video Title'
});

// Evento de reproducción de video
this.analytics.logEvent('video_play', {
  video_id: '123',
  video_title: 'Video Title',
  video_current_time: 30
});
```

### Optimización para Smart TVs

```typescript
// Configuración optimizada
SmartTVAnalyticsModule.forRoot({
  // ... credenciales ...
  batchSize: 5,              // Lotes pequeños
  flushInterval: 60000,      // 60 segundos
  requestTimeout: 15000,     // 15 segundos
  maxRetryAttempts: 2        // 2 reintentos
})
```

## Requisitos

### Para desarrollo
- Node.js 14+
- npm 6+
- Angular CLI 12+

### Para empaquetado webOS
- webOS CLI: `npm install -g @webosose/ares-cli`

### Para empaquetado Tizen
- [Tizen Studio](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html)

## Recursos adicionales

- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [Tizen Developer Guide](https://developer.samsung.com/smarttv/develop/guides/fundamentals.html)
- [webOS Developer Guide](https://webostv.developer.lge.com/develop/guides)
