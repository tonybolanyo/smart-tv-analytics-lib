# Smart TV Analytics - Documentación

Bienvenido a la documentación de Smart TV Analytics, una librería de Firebase Analytics optimizada para aplicaciones Angular en Smart TVs (Tizen y webOS).

## 📚 Documentos Disponibles

### Documentación Principal

1. **[README.md](./README.md)** - Guía principal de la librería
   - Instalación y configuración
   - Uso básico y avanzado
   - Configuración específica para Tizen y webOS
   - API completa de referencia

2. **[CHANGELOG.md](./CHANGELOG.md)** - Historial de versiones
   - Cambios en cada versión
   - Nuevas características
   - Correcciones de errores

### Ejemplos y Tutoriales

3. **[EXAMPLES.md](./EXAMPLES.md)** - Índice de ejemplos
   - Visión general de ejemplos disponibles
   - Inicio rápido
   - Scripts de empaquetado

4. **[SAMPLE-APP.md](./SAMPLE-APP.md)** - Aplicación de ejemplo completa
   - Instalación y configuración
   - Funcionalidades demostradas
   - Testing y depuración
   - Estructura del proyecto

## 🚀 Inicio Rápido

### Instalación

```bash
npm install smart-tv-analytics
```

### Configuración Básica

```typescript
import { SmartTVAnalyticsModule } from 'smart-tv-analytics';

@NgModule({
  imports: [
    SmartTVAnalyticsModule.forRoot({
      measurementId: 'G-XXXXXXXXXX',
      apiSecret: 'your-api-secret',
      appName: 'MySmartTVApp',
      appVersion: '1.0.0'
    })
  ]
})
export class AppModule { }
```

### Uso Básico

```typescript
import { SmartTVAnalyticsService } from 'smart-tv-analytics';

constructor(private analytics: SmartTVAnalyticsService) {}

// Registrar un evento
this.analytics.logEvent('select_content', {
  content_type: 'video',
  content_id: '123'
});
```

## 📖 Guías por Tema

### Para Desarrolladores

- **Primeros Pasos**: Ver [README.md](./README.md#instalación)
- **Configuración**: Ver [README.md](./README.md#configuración)
- **API de Referencia**: Ver [README.md](./README.md#api-de-referencia)

### Para Smart TVs

- **Configuración Tizen**: Ver [README.md](./README.md#tizen-samsung-smart-tvs)
- **Configuración webOS**: Ver [README.md](./README.md#webos-lg-smart-tvs)
- **Optimizaciones**: Ver [README.md](./README.md#configuración-avanzada)

### Ejemplos Prácticos

- **Aplicación de Ejemplo**: Ver [SAMPLE-APP.md](./SAMPLE-APP.md)
- **Más Ejemplos**: Ver [EXAMPLES.md](./EXAMPLES.md)

## 🔧 Configuración para Producción

### Firebase Analytics (Google Analytics 4)

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Crea una propiedad GA4
3. En Admin > Data Streams > Web, obtén:
   - **Measurement ID** (formato: `G-XXXXXXXXXX`)
   - **API Secret** (en Measurement Protocol API secrets)

### Configuración Recomendada para Smart TVs

```typescript
SmartTVAnalyticsModule.forRoot({
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: 'your-api-secret',
  appName: 'MyApp',
  appVersion: '1.0.0',
  enableDebugMode: false,
  enablePageViewTracking: true,
  enableSessionTracking: true,
  enableEngagementTracking: true,
  // Optimizado para Smart TVs
  batchSize: 5,
  flushInterval: 60000,
  requestTimeout: 15000,
  maxRetryAttempts: 2
})
```

## 📦 Empaquetado para Smart TVs

### Para webOS (LG)

```bash
# Instalar CLI
npm install -g @webosose/ares-cli

# Empaquetar
npm run package:webos
```

Ver [SAMPLE-APP.md](./SAMPLE-APP.md) para más detalles.

### Para Tizen (Samsung)

```bash
# Instalar Tizen Studio
# https://developer.samsung.com/smarttv

# Empaquetar
npm run package:tizen
```

Ver [SAMPLE-APP.md](./SAMPLE-APP.md) para más detalles.

## 🐛 Solución de Problemas

### El servicio no se inicializa

**Problema**: "SmartTVAnalytics service is not initialized"

**Solución**: Asegúrate de haber configurado el módulo correctamente:

```typescript
// En app.module.ts
imports: [
  SmartTVAnalyticsModule.forRoot({
    measurementId: 'G-XXXXXXXXXX',  // Tu Measurement ID de GA4
    apiSecret: 'your-api-secret',    // Tu API Secret
    appName: 'MyApp',
    appVersion: '1.0.0'
  })
]
```

### Errores de credenciales

**Problema**: Errores al enviar eventos a Google Analytics

**Solución**: Verifica que estés usando:
- **Google Analytics 4** (no Universal Analytics)
- **Measurement ID** correcto (formato: `G-XXXXXXXXXX`)
- **API Secret** del Measurement Protocol (no Firebase API key)

Para obtener el API Secret:
1. Ve a tu propiedad GA4
2. Admin > Data Streams > Web
3. Measurement Protocol API secrets
4. Create > Copia el valor del secret

### Los eventos no aparecen en GA4

**Causas comunes**:
1. Credenciales incorrectas
2. Bloqueador de anuncios activo
3. Esperando en lugar incorrecto (usa DebugView para tiempo real)

**Solución**:
1. Verifica credenciales
2. Abre GA4 > DebugView para ver eventos en tiempo real
3. Habilita modo debug: `enableDebugMode: true`

## 📚 Documentación Adicional

### Borradores y Documentación de Desarrollo

Los documentos en desarrollo y borradores están disponibles en `/draft-docs`:
- Guías detalladas de empaquetado
- Documentación de testing E2E
- Guías de inicio rápido
- Resúmenes de implementación

Estos documentos pueden contener información más detallada pero posiblemente desactualizada.

## 🤝 Contribuir

¿Encontraste un error en la documentación? ¿Tienes una sugerencia?
- Abre un [issue](https://github.com/tonybolanyo/smart-tv-analytics-lib/issues)
- Envía un pull request

## 📄 Licencia

MIT License - Ver LICENSE en la raíz del proyecto.

## 🔗 Enlaces Útiles

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Tizen Developer Guide](https://developer.samsung.com/smarttv)
- [webOS Developer Guide](https://webostv.developer.lge.com/)
- [Angular Documentation](https://angular.io/docs)
