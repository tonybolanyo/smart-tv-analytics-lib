# Aplicación de ejemplo - Smart TV Analytics

Esta es una aplicación de ejemplo completa que demuestra cómo integrar y usar la librería **smart-tv-analytics** en aplicaciones Angular para Smart TVs (Tizen y webOS).

## Contenido

- [Características](#características)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Desarrollo](#desarrollo)
- [Compilación](#compilación)
- [Testing](#testing)
- [Empaquetado](#empaquetado)
- [Funcionalidades demostradas](#funcionalidades-demostradas)

## Características

Esta aplicación de ejemplo incluye:

- Integración completa de smart-tv-analytics
- Tracking automático de sesiones y páginas
- Eventos personalizados de interacción
- Simulador de reproductor de video con analytics
- Navegación entre páginas
- Optimización para Smart TVs (Tizen y webOS)
- Scripts de empaquetado para ambas plataformas
- Configuración lista para producción
- Suite completa de tests end-to-end con Playwright

## Requisitos previos

### Para desarrollo

- Node.js 14 o superior
- npm 6 o superior
- Angular CLI 12 o superior

```bash
npm install -g @angular/cli@12
```

### Para empaquetado webOS

- webOS CLI tools

```bash
npm install -g @webosose/ares-cli
```

### Para empaquetado Tizen

- [Tizen Studio](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html)
- Tizen CLI configurado en el PATH

## Instalación

### Opción 1: Desde el repositorio (para desarrollo)

Si has clonado el repositorio completo de smart-tv-analytics:

1. **Compila la librería primero (desde la raíz del repositorio):**

```bash
cd /path/to/smart-tv-analytics-lib
npm install
npm run build
```

2. **Navega al directorio de la aplicación de ejemplo:**

```bash
cd examples/sample-app
```

3. **Instala las dependencias:**

```bash
npm install
```

La aplicación está configurada para usar la librería local mediante `"smart-tv-analytics": "file:../../dist"` en package.json.

4. **Inicia el servidor de desarrollo:**

```bash
# Para Node.js 14-16
npm start

# Para Node.js 17+ (requiere flag adicional debido a OpenSSL 3.0)
NODE_OPTIONS="--openssl-legacy-provider" npm start
```

> **Nota**: Si encuentras el error "digital envelope routines::unsupported", es porque usas Node.js 17+. Usa el comando con NODE_OPTIONS mostrado arriba, o cambia a Node.js 14 o 16 con nvm.

### Opción 2: Desde NPM (cuando la librería esté publicada)

Si la librería ya está publicada en NPM:

1. **Navega al directorio de la aplicación de ejemplo:**

```bash
cd examples/sample-app
```

2. **Actualiza package.json para usar la versión de NPM:**

```json
{
  "dependencies": {
    "smart-tv-analytics": "^1.0.0"
  }
}
```

3. **Instala las dependencias:**

```bash
npm install
```

## Configuración

Edita el archivo `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  analytics: {
    measurementId: 'G-XXXXXXXXXX',      // Tu Measurement ID
    apiSecret: 'your-api-secret-here',  // Tu API Secret
    appName: 'SampleSmartTVApp',
    appVersion: '1.0.0'
  }
};
```

Para obtener estas credenciales:
- Ve a [Google Analytics](https://analytics.google.com/)
- Crea o selecciona una propiedad GA4
- Ve a Admin > Data Streams > Web > Measurement Protocol API secrets
- Crea un nuevo secret y copia el valor

## Estructura del proyecto

```
sample-app/
├── src/
│   ├── app/
│   │   ├── home/              # Página de inicio con catálogo
│   │   ├── video/             # Simulador de reproductor de video
│   │   ├── app.component.*    # Componente raíz
│   │   ├── app.module.ts      # Módulo principal con configuración de analytics
│   │   └── app-routing.module.ts
│   ├── environments/          # Configuración de entornos
│   ├── polyfills.ts          # Polyfills para Smart TVs
│   └── index.html
├── tizen/
│   ├── config.xml            # Configuración de Tizen
│   └── icon-placeholder.txt  # Placeholder para ícono
├── webos/
│   ├── appinfo.json          # Configuración de webOS
│   └── icon-placeholder.txt  # Placeholder para ícono
├── scripts/
│   ├── build-tizen.sh        # Script de empaquetado para Tizen
│   ├── build-webos.sh        # Script de empaquetado para webOS
│   ├── copy-to-tizen.js      # Helper para copiar archivos
│   └── copy-to-webos.js      # Helper para copiar archivos
└── package.json
```

## Desarrollo

### Servidor de desarrollo

Inicia el servidor de desarrollo:

```bash
npm start
```

Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias algún archivo.

### Modo debug

La aplicación está configurada para activar el modo debug en desarrollo automáticamente. Verás los eventos de analytics en la consola del navegador.

## Compilación

### Build de producción

```bash
npm run build:prod
```

Los archivos compilados se guardarán en `dist/sample-app/`.

### Build para Tizen

```bash
npm run build:tizen
```

Este comando:
1. Compila la aplicación en modo producción
2. Copia los archivos al directorio `tizen/dist/`

### Build para webOS

```bash
npm run build:webos
```

Este comando:
1. Compila la aplicación en modo producción
2. Copia los archivos al directorio `webos/dist/`

## Testing

Esta aplicación incluye una suite completa de tests end-to-end (E2E) usando Playwright.

### Tests unitarios

```bash
npm test
```

### Tests End-to-End

```bash
# Ejecutar todos los tests E2E
npm run e2e

# Ejecutar con interfaz visual
npm run e2e:headed

# Modo interactivo
npm run e2e:ui

# Ver reporte de tests
npm run e2e:report
```

### Cobertura de tests E2E

Los tests E2E cubren los siguientes flujos críticos:

- **Página de inicio**: Carga, visualización del catálogo, navegación
- **Reproductor de video**: Controles de reproducción, pausa, seek
- **Navegación**: Flujos completos de usuario entre páginas
- **Analytics**: Verificación de eventos de tracking

## Empaquetado

### Empaquetar para webOS

```bash
npm run package:webos
```

Esto generará un archivo `.ipk` en `dist/packages/` que puede ser instalado en TVs LG.

**Requisitos:**
- webOS CLI tools instalado (`@webosose/ares-cli`)
- Configuración de `webos/appinfo.json` actualizada

Ver [EMPAQUETADO.md](../draft-docs/EMPAQUETADO.md) para más detalles.

### Empaquetar para Tizen

```bash
npm run package:tizen
```

Esto generará un archivo `.wgt` en `dist/packages/` que puede ser instalado en TVs Samsung.

**Requisitos:**
- Tizen Studio instalado
- Perfil de certificado configurado
- Configuración de `tizen/config.xml` actualizada

Ver [EMPAQUETADO.md](../draft-docs/EMPAQUETADO.md) para más detalles.

## Funcionalidades Demostradas

### 1. Tracking automático

La aplicación demuestra el tracking automático de:

- **Sesiones**: Se registra automáticamente cuando el usuario inicia la app
- **Navegación**: Cada cambio de página se registra automáticamente
- **Engagement**: Se calcula y envía el tiempo de interacción

### 2. Eventos personalizados

#### Página de inicio (HomeComponent)

```typescript
// Al cargar la página
this.analytics.logEvent('view_home', {
  total_videos: this.videos.length
});

// Al seleccionar un video
this.analytics.logEvent('select_content', {
  content_type: 'video',
  content_id: video.id.toString(),
  item_name: video.title
});
```

#### Página de video (VideoComponent)

```typescript
// Inicio del video
this.analytics.logEvent('video_start', {
  video_id: this.videoId,
  video_title: this.videoTitle
});

// Reproducción
this.analytics.logEvent('video_play', {
  video_id: this.videoId,
  video_current_time: this.currentTime
});

// Pausa
this.analytics.logEvent('video_pause', {
  video_id: this.videoId,
  watch_time_seconds: watchTime
});

// Búsqueda (seek)
this.analytics.logEvent('video_seek', {
  video_current_time: this.currentTime
});

// Completado
this.analytics.logEvent('video_complete', {
  video_duration: this.duration
});
```

### 3. Configuración optimizada para Smart TVs

En `app.module.ts`:

```typescript
SmartTVAnalyticsModule.forRoot({
  measurementId: environment.analytics.measurementId,
  apiSecret: environment.analytics.apiSecret,
  appName: environment.analytics.appName,
  appVersion: environment.analytics.appVersion,
  // Configuración optimizada para Smart TVs
  batchSize: 5,              // Lotes pequeños para mejor rendimiento
  flushInterval: 60000,      // Envío cada 60 segundos
  requestTimeout: 15000,     // Timeout generoso para conexiones lentas
  maxRetryAttempts: 2        // Reintentos limitados
})
```

### 4. Detección de plataforma

```typescript
private detectPlatform(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('tizen')) return 'Tizen';
  if (userAgent.includes('webos')) return 'WebOS';
  return 'Unknown';
}
```

## Verificar eventos en Google Analytics

1. Ve a tu propiedad de Google Analytics 4
2. Navega a **Informes > Engagement > Events**
3. Deberías ver los siguientes eventos:
   - `session_start` (automático)
   - `first_visit` (automático, primera vez)
   - `page_view` (automático)
   - `app_opened` (personalizado)
   - `view_home` (personalizado)
   - `select_content` (personalizado)
   - `video_start`, `video_play`, `video_pause`, etc. (personalizados)

## Personalización

### Cambiar estilos

Los estilos están en archivos CSS separados por componente. Puedes modificarlos para adaptarlos a tu marca.

### Agregar nuevas páginas

1. Genera un nuevo componente:
   ```bash
   ng generate component nombre-componente
   ```

2. Agrega la ruta en `app-routing.module.ts`

3. Agrega eventos de analytics según necesites

### Modificar eventos

Puedes crear tus propios eventos personalizados:

```typescript
this.analytics.logEvent('nombre_evento', {
  parametro1: 'valor1',
  parametro2: 'valor2'
});
```

## Recursos adicionales

- [Documentación de smart-tv-analytics](../README.md)
- [Guía de Empaquetado](./EMPAQUETADO.md)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [Tizen Developer Guide](https://developer.samsung.com/smarttv/develop/guides/fundamentals.html)
- [webOS Developer Guide](https://webostv.developer.lge.com/develop/guides)

## Solución de Problemas

### Los eventos no aparecen en Google Analytics

1. Verifica que el `measurementId` y `apiSecret` sean correctos
2. Activa el modo debug (`enableDebugMode: true`) y revisa la consola
3. Los eventos pueden tardar hasta 24 horas en aparecer en informes estándar (usa DebugView para ver eventos en tiempo real)

### Error al compilar

1. Asegúrate de tener todas las dependencias instaladas: `npm install`
2. Verifica la versión de Node.js: `node --version` (debe ser 14+)
3. Limpia el caché: `npm cache clean --force`

### Error al empaquetar

- **webOS**: Verifica que `ares-package` esté instalado: `ares-package --version`
- **Tizen**: Verifica que Tizen CLI esté en el PATH: `tizen version`
