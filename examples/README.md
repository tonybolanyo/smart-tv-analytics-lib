# Ejemplos - Smart TV Analytics

Este directorio contiene ejemplos y aplicaciones de demostración para la librería **smart-tv-analytics**.

## Contenido

### Sample App

Una aplicación Angular completa que demuestra:

- Integración de smart-tv-analytics
- Tracking de sesiones y navegación
- Eventos personalizados
- Simulador de reproductor de video
- Scripts de empaquetado para Tizen y webOS
- Documentación completa en español

**[Ver documentación completa →](./sample-app/README.md)**

## Inicio Rápido

### Prerrequisito: Compilar la Librería

Si trabajas desde el repositorio clonado, primero compila la librería:

```bash
# Desde la raíz del repositorio
npm install
npm run build
```

### 1. Instalar Dependencias

```bash
cd sample-app
npm install
```

### 2. Configurar Credenciales

Edita `sample-app/src/environments/environment.prod.ts` con tus credenciales de Google Analytics 4.

### 3. Ejecutar en Desarrollo

```bash
npm start
```

### 4. Compilar para Producción

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

- **[README - Sample App](./sample-app/README.md)**: Guía completa de la aplicación de ejemplo
- **[EMPAQUETADO](./sample-app/EMPAQUETADO.md)**: Guía detallada de empaquetado para Tizen y webOS

## Características Demostradas

### Tracking Automático

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

### Eventos Personalizados

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

### Para Desarrollo
- Node.js 14+
- npm 6+
- Angular CLI 12+

### Para Empaquetado webOS
- webOS CLI: `npm install -g @webosose/ares-cli`

### Para Empaquetado Tizen
- [Tizen Studio](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html)

## Recursos Adicionales

- [Documentación Principal](../README.md)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [Tizen Developer Guide](https://developer.samsung.com/smarttv/develop/guides/fundamentals.html)
- [webOS Developer Guide](https://webostv.developer.lge.com/develop/guides)

## Próximos Ejemplos

Estamos trabajando en más ejemplos:

- [ ] Ejemplo minimalista (sin router)
- [ ] Ejemplo con múltiples plataformas de analytics
- [ ] Ejemplo con testing avanzado
- [ ] Ejemplo con configuración dinámica

## Contribuciones

Si tienes ideas para nuevos ejemplos o mejoras, ¡no dudes en contribuir!

## Licencia

MIT License - ver el archivo LICENSE en la raíz del proyecto.
