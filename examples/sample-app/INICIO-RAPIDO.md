# Guía de Inicio Rápido - Smart TV Analytics Sample App

Esta guía te llevará paso a paso desde cero hasta tener la aplicación de ejemplo funcionando.

## ⏱️ Tiempo estimado: 15-20 minutos

## 📋 Paso a Paso

### Paso 1: Clonar el Repositorio (si aún no lo has hecho)

```bash
git clone https://github.com/tonybolanyo/smart-tv-analytics-lib.git
cd smart-tv-analytics-lib
```

### Paso 2: Instalar Dependencias de la Librería

```bash
npm install
```

### Paso 3: Compilar la Librería

```bash
npm run build
```

Este proceso tardará unos minutos. Deberías ver una salida similar a:
```
✔ Building entry point 'smart-tv-analytics'
✔ Compiling TypeScript sources...
✓ Transpilación completada
```

### Paso 4: Configurar Firebase Analytics

1. **Crear o acceder a tu proyecto de Google Analytics 4:**
   - Ve a https://analytics.google.com/
   - Crea un nuevo proyecto GA4 o selecciona uno existente

2. **Obtener el Measurement ID:**
   - En tu propiedad GA4, ve a Admin > Data Streams
   - Crea o selecciona un Web Stream
   - Copia el **Measurement ID** (formato: G-XXXXXXXXXX)

3. **Crear un API Secret:**
   - En la misma página de Data Stream, ve a "Measurement Protocol API secrets"
   - Click en "Create"
   - Dale un nombre (ej: "SmartTV Sample")
   - Copia el **Secret value**

### Paso 5: Configurar la Aplicación de Ejemplo

```bash
cd examples/sample-app
```

Edita `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  analytics: {
    measurementId: 'G-XXXXXXXXXX',      // Pega aquí tu Measurement ID
    apiSecret: 'tu-secret-aquí',        // Pega aquí tu API Secret
    appName: 'SampleSmartTVApp',
    appVersion: '1.0.0'
  }
};
```

También actualiza `src/environments/environment.ts` con los mismos valores.

### Paso 6: Instalar Dependencias de la App de Ejemplo

```bash
npm install
```

### Paso 7: Ejecutar en Modo Desarrollo

```bash
npm start
```

La aplicación se abrirá automáticamente en http://localhost:4200

### Paso 8: Probar la Aplicación

1. **Abre la consola del navegador** (F12 o Cmd+Option+I en Mac)
2. **Navega por la aplicación:**
   - Haz click en diferentes videos
   - Reproduce, pausa, adelanta
   - Vuelve a la página de inicio

3. **Verifica los eventos en la consola:**
   Deberías ver mensajes como:
   ```
   [SmartTVAnalytics] Event logged: app_opened
   [SmartTVAnalytics] Event logged: page_view
   [SmartTVAnalytics] Event logged: select_content
   [SmartTVAnalytics] Event logged: video_play
   ```

### Paso 9: Verificar en Google Analytics

1. **Abre Google Analytics en modo Debug:**
   - Ve a tu propiedad GA4
   - En el menú lateral, busca "DebugView"
   - Actualiza la vista

2. **Deberías ver los eventos en tiempo real:**
   - session_start
   - page_view
   - app_opened
   - select_content
   - video_play, video_pause, etc.

## 🎯 Próximos Pasos

### Compilar para Producción

```bash
npm run build:prod
```

Los archivos compilados estarán en `dist/sample-app/`.

### Empaquetar para webOS

1. **Instalar webOS CLI:**
   ```bash
   npm install -g @webosose/ares-cli
   ```

2. **Compilar y empaquetar:**
   ```bash
   npm run build:webos
   npm run package:webos
   ```

Ver [EMPAQUETADO.md](EMPAQUETADO.md#empaquetado-para-webos-lg) para más detalles.

### Empaquetar para Tizen

1. **Instalar Tizen Studio:**
   Descarga desde: https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html

2. **Configurar certificado** (ver [EMPAQUETADO.md](EMPAQUETADO.md#configurar-certificados))

3. **Compilar y empaquetar:**
   ```bash
   npm run build:tizen
   npm run package:tizen
   ```

Ver [EMPAQUETADO.md](EMPAQUETADO.md#empaquetado-para-tizen-samsung) para más detalles.

## 🐛 Solución de Problemas Comunes

### Error: "Cannot find module 'smart-tv-analytics'"

**Solución:** Asegúrate de haber compilado la librería primero:
```bash
cd ../..  # Vuelve a la raíz
npm run build
cd examples/sample-app
npm install
```

### Error: "port 4200 is already in use"

**Solución:** Usa un puerto diferente:
```bash
npm start -- --port 4300
```

### Los eventos no aparecen en la consola

**Solución:** Verifica que `enableDebugMode` esté en `true` en development:
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,  // Debe ser false
  analytics: {
    // ... tus credenciales
  }
};
```

### Los eventos no aparecen en Google Analytics

**Posibles causas:**

1. **Measurement ID o API Secret incorrectos**
   - Verifica que copiaste correctamente ambos valores
   - El Measurement ID debe empezar con "G-"

2. **Esperando demasiado pronto**
   - DebugView muestra eventos en tiempo real
   - Los informes estándar pueden tardar 24-48 horas

3. **Bloqueador de anuncios activo**
   - Algunos bloqueadores bloquean las llamadas a Google Analytics
   - Prueba en modo incógnito o desactiva el bloqueador

## 📚 Recursos Adicionales

- [README completo](README.md)
- [Guía de empaquetado](EMPAQUETADO.md)
- [Documentación de la librería](../../README.md)
- [Firebase Analytics Docs](https://firebase.google.com/docs/analytics)

## ❓ ¿Necesitas Ayuda?

- Revisa los [issues en GitHub](https://github.com/tonybolanyo/smart-tv-analytics-lib/issues)
- Crea un nuevo issue si encuentras un problema
- Consulta la documentación oficial de Firebase Analytics

## ✅ Checklist de Verificación

- [ ] Repositorio clonado
- [ ] Dependencias de la librería instaladas
- [ ] Librería compilada (`npm run build`)
- [ ] Credenciales de GA4 obtenidas (Measurement ID + API Secret)
- [ ] Archivo environment.prod.ts configurado
- [ ] Dependencias de sample-app instaladas
- [ ] App corriendo en localhost:4200
- [ ] Eventos visibles en la consola
- [ ] Eventos visibles en GA4 DebugView

¡Listo! Ahora tienes la aplicación de ejemplo funcionando y puedes empezar a explorar cómo integrar smart-tv-analytics en tus propios proyectos.
