# Guía de instalación - Smart TV Analytics

## Índice

- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación de la Librería](#instalación-de-la-librería)
- [Configuración del Proyecto](#configuración-del-proyecto)
- [Configuración de Firebase](#configuración-de-firebase)
- [Integración con Angular](#integración-con-angular)
- [Configuración por Plataforma](#configuración-por-plataforma)
- [Verificación de Instalación](#verificación-de-instalación)
- [Troubleshooting](#troubleshooting)

## Requisitos del sistema

### Dependencias Principales

| Dependencia | Versión Mínima | Versión Recomendada | Notas |
|-------------|---------------|-------------------|-------|
| **Angular** | 12.0.0 | 12.2.0+ | Core framework |
| **TypeScript** | 4.3.0 | 4.3.5+ | Para compatibilidad |
| **Node.js** | 14.15.0 | 16.14.0 | Para desarrollo |
| **npm** | 6.14.0 | 8.0.0+ | Gestor de paquetes |

### Dependencias peer

```json
{
  "@angular/common": "^12.0.0",
  "@angular/core": "^12.0.0",
  "@angular/router": "^12.0.0",
  "core-js": "^3.0.0",
  "rxjs": "^7.0.0",
  "zone.js": "~0.11.4"
}
```

### Compatibilidad de plataformas Smart TV

| Plataforma | Versión Mínima | Estado | Notas |
|------------|---------------|--------|-------|
| **Samsung Tizen** | 2.4 | Completo | Totalmente soportado |
| **LG webOS** | 3.0 | Completo | Totalmente soportado |

### Requisitos adicionales

- **Firebase project**: Proyecto configurado con GA4
- **HTTPS**: Requerido para requests de analytics
- **CORS**: Configuración según estrategia de envío

## Instalación de la librería

### Opción 1: NPM (Recomendado)

```bash
# Instalar la librería
npm install smart-tv-analytics

# Verificar instalación
npm list smart-tv-analytics
```

### Opción 2: Yarn

```bash
# Instalar con Yarn
yarn add smart-tv-analytics

# Verificar instalación
yarn list smart-tv-analytics
```

### Opción 3: Desarrollo local

Para desarrollo local sin publicar a npm:

```bash
# En el directorio de la librería
git clone https://...
cd smart-tv-analytics-lib
npm install
npm run build
npm pack

# En tu proyecto
npm install path/to/smart-tv-analytics-1.0.0.tgz
```

## Configuración del proyecto

### 1. Actualizar `package.json`

Asegúrate de tener las dependencias correctas:

```json
{
  "dependencies": {
    "@angular/animations": "^12.2.0",
    "@angular/common": "^12.2.0",
    "@angular/compiler": "^12.2.0",
    "@angular/core": "^12.2.0",
    "@angular/platform-browser": "^12.2.0",
    "@angular/platform-browser-dynamic": "^12.2.0",
    "@angular/router": "^12.2.0",
    "rxjs": "^7.0.0",
    "smart-tv-analytics": "^1.0.0",
    "tslib": "^2.0.0",
    "zone.js": "~0.11.4"
  }
}
```

### 2. Configurar TypeScript

Asegúrate de que `tsconfig.json` tenga la configuración correcta:

```json
{
  "compilerOptions": {
    "target": "es2015",
    "lib": ["es2018", "dom"],
    "module": "es2020",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

### 3. Configurar angular build

En `angular.json`, asegúrate de tener configuración para ES5:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/your-app",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "tsconfig.app.json",
            "scripts": [],
            "styles": ["src/styles.css"]
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                }
              ],
              "outputHashing": "all",
              "extractCss": true,
              "namedChunks": false,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true
            }
          }
        }
      }
    }
  }
}
```

## Configuración de Firebase

### 1. Crear proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Habilita Google Analytics para tu proyecto

### 2. Configurar Google Analytics 4

1. En Firebase Console, ve a Analytics > Dashboard
2. Si no tienes GA4 configurado, sigue el wizard de configuración
3. Anota tu **Measurement ID** (formato: `G-XXXXXXXXXX`)

### 3. Generar API Secret

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Admin > Property > Data Streams
3. Selecciona tu stream de datos
4. Ve a "Measurement Protocol API secrets"
5. Crea un nuevo secret y anota el valor

### 4. Configurar permisos (Opcional)

Para proyectos empresariales, configura permisos específicos:

```bash
# Firebase CLI
firebase projects:addrole user@example.com --role roles/firebase.analyticsAdmin
```

## Integración con Angular

### 1. Configuración básica en AppModule

```typescript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { SmartTVAnalyticsModule } from 'smart-tv-analytics';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule, // Requerido para requests HTTP
    SmartTVAnalyticsModule.forRoot({
      measurementId: environment.firebase.measurementId,
      apiSecret: environment.firebase.apiSecret,
      appName: environment.appName,
      appVersion: environment.appVersion,
      enableDebugMode: !environment.production
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 2. Configurar environments

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  appName: 'Smart TV App',
  appVersion: '1.0.0',
  firebase: {
    measurementId: 'G-XXXXXXXXXX',
    apiSecret: 'your-api-secret'
  }
};
```

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  appName: 'Smart TV App',
  appVersion: '1.0.0',
  firebase: {
    measurementId: 'G-XXXXXXXXXX',
    apiSecret: 'your-api-secret'
  }
};
```

### 3. Uso en componentes

```typescript
// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { SmartTVAnalyticsService } from 'smart-tv-analytics';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Smart TV Analytics Demo';

  constructor(private analytics: SmartTVAnalyticsService) {}

  ngOnInit(): void {
    // El servicio ya está inicializado automáticamente
    // Registrar evento de inicio de app
    this.analytics.logEvent('app_start', {
      platform: this.detectPlatform(),
      app_version: '1.0.0'
    });
  }

  private detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('tizen')) return 'tizen';
    if (userAgent.includes('webos')) return 'webos';
    if (userAgent.includes('android')) return 'android_tv';
    return 'unknown';
  }
}
```

## Configuración por plataforma

### Samsung Tizen

```typescript
import { TIZEN_CONFIG } from 'smart-tv-analytics';

@NgModule({
  imports: [
    SmartTVAnalyticsModule.forRoot({
      ...TIZEN_CONFIG,
      measurementId: 'G-XXXXXXXXXX',
      apiSecret: 'your-api-secret',
      appName: 'Tizen App',
      appVersion: '1.0.0'
    })
  ]
})
export class AppModule { }
```

**Configuración adicional para Tizen:**

1. **config.xml**: Agregar permisos de red
```xml
<tizen:privilege name="http://tizen.org/privilege/internet"/>
<tizen:privilege name="http://tizen.org/privilege/network.get"/>
```

2. **Certificado**: Usar certificado de distribución para HTTPS

### LG webOS

```typescript
import { WEBOS_CONFIG } from 'smart-tv-analytics';

@NgModule({
  imports: [
    SmartTVAnalyticsModule.forRoot({
      ...WEBOS_CONFIG,
      measurementId: 'G-XXXXXXXXXX',
      apiSecret: 'your-api-secret',
      appName: 'webOS App',
      appVersion: '1.0.0'
    })
  ]
})
export class AppModule { }
```

**Configuración adicional para webOS:**

1. **appinfo.json**: Configurar permisos
```json
{
  "requiredPermissions": [
    "network.operation"
  ]
}
```

### Configuración universal

Para soportar múltiples plataformas dinámicamente:

```typescript
function getPlatformConfig(): Partial<SmartTVAnalyticsConfig> {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('tizen')) {
    return TIZEN_CONFIG;
  } else if (userAgent.includes('webos')) {
    return WEBOS_CONFIG;
  } else {
    // Configuración genérica
    return {
      batchSize: 10,
      flushInterval: 30000,
      requestTimeout: 15000
    };
  }
}

@NgModule({
  imports: [
    SmartTVAnalyticsModule.forRoot({
      measurementId: environment.firebase.measurementId,
      apiSecret: environment.firebase.apiSecret,
      appName: environment.appName,
      appVersion: environment.appVersion,
      ...getPlatformConfig()
    })
  ]
})
export class AppModule { }
```

## Verificación de instalación

### 1. Verificar importación

```typescript
import { SmartTVAnalyticsService } from 'smart-tv-analytics';

// En el constructor de un componente
constructor(private analytics: SmartTVAnalyticsService) {
  console.log('Analytics service loaded:', !!this.analytics);
}
```

### 2. Test de configuración

```typescript
ngOnInit() {
  // Verificar que el servicio está inicializado
  if (this.analytics.isInitialized()) {
    console.log('Analytics initialized successfully');
    console.log('Client ID:', this.analytics.getClientId());
  } else {
    console.error('Analytics initialization failed');
  }
}
```

### 3. Test de eventos

```typescript
async testAnalytics() {
  try {
    await this.analytics.logEvent('installation_test', {
      timestamp: Date.now(),
      platform: navigator.userAgent
    });
    console.log('Test event sent successfully');
  } catch (error) {
    console.error('Test event failed:', error);
  }
}
```

### 4. Verificar en Firebase

1. Ve a Firebase Console > Analytics > Events
2. Busca eventos en tiempo real
3. Verifica que aparecen los eventos de tu app

### 5. Debug mode

Para verificar el funcionamiento detallado:

```typescript
SmartTVAnalyticsModule.forRoot({
  // ... otras configuraciones
  enableDebugMode: true,
  mockMode: true // Para evitar envios reales durante tests
})
```

## Troubleshooting

### Error: "Cannot resolve dependency"

```bash
# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Module not found"

Verifica que tienes las peer dependencies:

```bash
npm install @angular/common @angular/core @angular/router rxjs
```

### Error de CORS

Configura la estrategia de envío:

```typescript
SmartTVAnalyticsModule.forRoot({
  // ... configuración
  sendingStrategy: 'proxy',
  proxyUrl: '/api/analytics-proxy'
})
```

### Error de build para ES5

Si tienes problemas con la transpilación ES5:

```bash
# Usar Node.js legacy provider
NODE_OPTIONS="--openssl-legacy-provider" ng build
```

### Eventos no aparecen en Firebase

1. Verifica Measurement ID y API Secret
2. Revisa logs de consola para errores
3. Confirma que HTTPS está configurado
4. Verifica que no hay bloqueadores de analytics

### Problemas de rendimiento

Para dispositivos con recursos limitados:

```typescript
import { LOW_RESOURCE_CONFIG } from 'smart-tv-analytics';

SmartTVAnalyticsModule.forRoot({
  ...LOW_RESOURCE_CONFIG,
  // ... otras configuraciones
})
```

---

¿Tienes problemas con la instalación? Revisa la [Guía de Troubleshooting](TROUBLESHOOTING.md) completa.