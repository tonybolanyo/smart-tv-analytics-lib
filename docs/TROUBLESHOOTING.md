# Guía de Solución de Problemas

Esta guía te ayudará a resolver los problemas más comunes al usar Smart TV Analytics Library.

## 📋 Tabla de Contenidos

- [Problemas de Inicialización](#problemas-de-inicialización)
- [Problemas de Credenciales](#problemas-de-credenciales)
- [Eventos no aparecen en Google Analytics](#eventos-no-aparecen-en-google-analytics)
- [Problemas en Localhost](#problemas-en-localhost)
- [Problemas en Producción](#problemas-en-producción)
- [Problemas Específicos de Smart TV](#problemas-específicos-de-smart-tv)

---

## Problemas de Inicialización

### ❌ Error: "SmartTVAnalytics service is not initialized"

**Síntomas:**
- El servicio no se inicializa
- Los eventos no se envían
- Error en consola: "Service not initialized"

**Causas comunes:**
1. El módulo no está configurado correctamente en `app.module.ts`
2. Faltan las credenciales de Google Analytics 4
3. El servicio se usa antes de que Angular lo haya inicializado

**Solución:**

#### 1. Verificar la configuración del módulo

Asegúrate de que `SmartTVAnalyticsModule.forRoot()` esté en el array `imports` de tu `AppModule`:

```typescript
import { SmartTVAnalyticsModule } from 'smart-tv-analytics';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    // ... otros componentes
  ],
  imports: [
    BrowserModule,
    // ... otros módulos
    SmartTVAnalyticsModule.forRoot({
      measurementId: environment.analytics.measurementId,
      apiSecret: environment.analytics.apiSecret,
      appName: environment.analytics.appName,
      appVersion: environment.analytics.appVersion,
      enableDebugMode: !environment.production
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

#### 2. Verificar las credenciales en environment.ts

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

#### 3. No usar el servicio en el constructor

**❌ Incorrecto:**
```typescript
constructor(private analytics: SmartTVAnalyticsService) {
  // No hacer esto en el constructor
  this.analytics.logEvent('app_opened', {});
}
```

**✅ Correcto:**
```typescript
constructor(private analytics: SmartTVAnalyticsService) {}

ngOnInit() {
  // Usar el servicio en ngOnInit o después
  this.analytics.logEvent('app_opened', {});
}
```

---

## Problemas de Credenciales

### ❌ Error: Eventos no se envían o errores de autenticación

**Síntomas:**
- Errores 401 o 403 en la consola de red
- Eventos no llegan a Google Analytics
- Mensajes de "Invalid credentials"

**Causa común:**
Estás usando credenciales incorrectas o de un tipo incorrecto de proyecto de Analytics.

### ⚠️ Importante: Google Analytics 4 vs Firebase

**Esta librería usa Google Analytics 4 (GA4), NO Firebase Analytics directamente.**

Si estás viendo errores como:
- "Invalid API Key"
- "Firebase API key not valid"

Es porque estás usando credenciales de Firebase en lugar de Google Analytics 4.

### ✅ Configuración Correcta

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

### ❌ NO uses:
- Firebase API Key
- Firebase Project ID
- Universal Analytics Tracking ID (UA-XXXXXX)
- Google Cloud API Key

### ✅ SÍ usa:
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

---

## Problemas en Localhost

### ❌ Eventos no se envían desde localhost

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

---

## Problemas en Producción

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

---

## Problemas Específicos de Smart TV

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

---

## Diagnóstico General

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

#### Build
- [ ] `ng build --configuration production` sin errores
- [ ] Los archivos de producción incluyen las credenciales correctas
- [ ] No hay errores de minificación en la consola

---

## Obtener Ayuda

Si después de seguir esta guía aún tienes problemas:

1. **Revisa los issues existentes:**
   https://github.com/tonybolanyo/smart-tv-analytics-lib/issues

2. **Abre un nuevo issue con:**
   - Descripción del problema
   - Pasos para reproducir
   - Logs de consola (con datos sensibles removidos)
   - Versión de Angular y de la librería
   - Plataforma (Tizen, webOS, navegador web)

3. **Documentación de Google Analytics 4:**
   https://developers.google.com/analytics/devguides/collection/ga4

---

## Recursos Adicionales

- [Guía Principal](./README.md)
- [Índice de Documentación](./INDEX.md)
- [Aplicación de Ejemplo](./SAMPLE-APP.md)
- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Measurement Protocol Reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
