# Pruebas E2E

Este directorio contiene pruebas end-to-end para la aplicación de ejemplo usando Playwright.

## 📚 Documentación

La documentación completa de testing E2E ha sido movida a la carpeta de documentación:

- **[Guía Completa de E2E Testing](../../../draft-docs/E2E-TESTING.md)**
- **[Resumen de Implementación](../../../draft-docs/E2E-IMPLEMENTATION-SUMMARY.md)**
- **[Reporte de Cobertura](../../../draft-docs/E2E-TEST-COVERAGE.md)**
- **[Referencia Rápida](../../../draft-docs/E2E-QUICK-REFERENCE.md)**

## Ejecutar Pruebas

Desde el directorio `examples/sample-app`:

```bash
# Ejecutar todas las pruebas
npm run e2e

# Ejecutar con UI
npm run e2e:headed

# Modo interactivo
npm run e2e:ui

# Depurar pruebas
npm run e2e:debug
```

## Archivos de Prueba

- **`home.spec.ts`** - Pruebas para la página de inicio
- **`video-player.spec.ts`** - Pruebas para el reproductor de video
- **`navigation.spec.ts`** - Pruebas para navegación
- **`analytics.spec.ts`** - Pruebas para eventos de analytics
