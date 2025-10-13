# Pruebas E2E

Este directorio contiene pruebas end-to-end para la aplicación de ejemplo de Smart TV Analytics usando Playwright.

## Archivos de Prueba

- **`home.spec.ts`** - Pruebas para la página de inicio y catálogo de videos
- **`video-player.spec.ts`** - Pruebas para la funcionalidad del reproductor de video
- **`navigation.spec.ts`** - Pruebas para flujos de navegación y recorridos de usuario
- **`analytics.spec.ts`** - Pruebas para seguimiento de eventos de analytics

## Ejecutar Pruebas

Desde el directorio `examples/sample-app`:

```bash
# Ejecutar todas las pruebas
npm run e2e

# Ejecutar con UI
npm run e2e:headed

# Ejecutar archivo de prueba específico
npx playwright test e2e/home.spec.ts

# Depurar pruebas
npm run e2e:debug
```

## Estructura de Pruebas

Cada archivo de prueba sigue esta estructura:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nombre de Característica', () => {
  test.beforeEach(async ({ page }) => {
    // Configuración para cada prueba
  });

  test('debería hacer algo', async ({ page }) => {
    // Implementación de prueba
  });
});
```

## Escribir Nuevas Pruebas

1. Crear un nuevo archivo `.spec.ts` en este directorio
2. Usar atributos `data-testid` para seleccionar elementos
3. Seguir los patrones existentes en otros archivos de prueba
4. Ejecutar pruebas para verificar que pasen

Para orientación detallada, ver [E2E-TESTING.md](../E2E-TESTING.md)

## IDs de Datos de Prueba

Los componentes usan los siguientes atributos `data-testid`:

### Página de Inicio
- `home-page` - Contenedor principal
- `video-grid` - Cuadrícula de videos
- `video-card-{id}` - Tarjetas de video
- `video-title-{id}` - Títulos de videos

### Página de Video
- `video-page` - Contenedor principal
- `play-button` - Botón reproducir
- `pause-button` - Botón pausar
- `seek-forward-button` - Adelantar
- `seek-backward-button` - Retroceder
- `back-button` - Volver a inicio

Ver archivos HTML de componentes para lista completa de IDs de prueba.
