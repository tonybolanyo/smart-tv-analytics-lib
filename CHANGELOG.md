# Registro de Cambios

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2025-10-15

### Corregido
- **Dependencia zone.js**: Eliminada la importación de polyfills (incluyendo zone.js) del public API de la librería. Las aplicaciones ahora deben importar zone.js y otros polyfills en sus propios archivos `polyfills.ts`. Esto resuelve el error "The target entry-point 'smart-tv-analytics' has missing dependencies: - zone.js/dist/zone" al construir aplicaciones.

### Documentación
- Actualizada la guía de configuración para Smart TVs para aclarar que las aplicaciones deben importar polyfills directamente
- Actualizada la documentación en README.md y docs/README.md con instrucciones sobre polyfills

## [1.1.0] - 2025-10-10

### Agregado
- **Compatibilidad ES5 completa**: Compilación específica para ES5 con máxima compatibilidad en Smart TVs
- **Angular Ivy habilitado**: Migración completa a Angular Ivy para mejor rendimiento y tree-shaking
- **Polyfills automáticos**: Polyfills incluidos para APIs modernas de JavaScript en Smart TVs antiguos
- **Configuraciones preestablecidas**: Configuraciones optimizadas para Tizen, WebOS y dispositivos con recursos limitados
- **Detección automática de plataforma**: Configuración automática basada en user agent del dispositivo
- **Documentación en español**: Toda la documentación traducida al español
- **Bundles ES5**: Generación de bundles específicos para ES5 (fesm5, esm5)
- **Transpilación automática Babel**: Script automático que convierte el código a ES5 puro usando Babel
- **Guía para Smart TVs**: Documentación específica con ejemplos para Smart TVs (SMART_TV_GUIDE.md)

### Mejorado
- **Rendimiento en Smart TVs**: Optimizaciones específicas para dispositivos con recursos limitados
- **Compatibilidad de red**: Mejor manejo de conexiones lentas e inestables típicas de Smart TVs
- **Tamaño de bundle**: Reducción significativa del tamaño final gracias a Ivy y tree-shaking
- **Documentación de ejemplos**: Casos de uso específicos para aplicaciones de Smart TV

### Corregido
- **Warnings de compilación**: Eliminados warnings sobre el uso de eval en polyfills
- **Dependencias circulares**: Reestructuración de imports para reducir dependencias circulares
- **Compatibilidad con Tizen 2.4+**: Polyfills adicionales para versiones antiguas de Tizen

## [1.0.0] - 2025-10-10

### Added
- Initial release of Smart TV Analytics library
- Support for Firebase Analytics via REST API (Measurement Protocol v2)
- Automatic event tracking (session_start, first_visit, page_view, app_update, engagement_time)
- Device detection for Smart TV platforms (Tizen, WebOS, Android TV, etc.)
- Event batching with configurable batch size and flush intervals
- Automatic retry mechanism with exponential backoff
- Session management with timeout handling
- Storage service with localStorage fallback to in-memory storage
- Comprehensive TypeScript support with full type definitions
- Angular 12+ compatibility
- Complete unit test suite with Jasmine/Karma
- JSDoc documentation for all public APIs

### Features
- **Cross-platform compatibility**: Works on Tizen, WebOS, and other Smart TV browsers
- **No IndexedDB dependency**: Uses REST API directly, avoiding browser storage limitations
- **Resilient architecture**: Multiple fallback mechanisms for network and storage issues
- **Automatic platform detection**: Identifies Smart TV platforms and configures accordingly
- **Configurable batching**: Optimizes network usage with intelligent event batching
- **Privacy compliant**: Respects user privacy settings and provides data collection controls
- **Production ready**: Includes comprehensive error handling and logging

### Technical Details
- Built for Angular 12+ with full TypeScript support
- Uses Firebase Measurement Protocol v2 for direct REST API communication
- Implements exponential backoff retry strategy for failed requests
- Provides both localStorage and in-memory storage options
- Includes automatic session timeout and renewal
- Supports custom event parameters and user properties
- Generates unique client IDs for user tracking
- Includes comprehensive unit tests with >80% coverage

### Documentation
- Complete README with installation and usage instructions
- API reference documentation with JSDoc comments
- Architecture overview and best practices guide
- Troubleshooting guide for common Smart TV issues
- Migration guide from other analytics solutions

## [Unreleased]

### Planned Features
- Support for custom dimensions and metrics
- Enhanced device fingerprinting for Smart TVs
- Offline event queuing with sync when online
- Integration with other Firebase services
- Performance monitoring capabilities
- A/B testing support
- Custom event validation
- Enhanced debugging tools