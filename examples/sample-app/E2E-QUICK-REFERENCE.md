# Referencia Rápida de Pruebas E2E

## Comandos Rápidos

```bash
# Ejecutar todas las pruebas (headless)
npm run e2e

# Ejecutar con navegador visible
npm run e2e:headed

# Modo UI interactivo
npm run e2e:ui

# Depurar prueba específica
npm run e2e:debug

# Ver reporte de pruebas
npm run e2e:report

# Ejecutar archivo de prueba específico
npx playwright test e2e/home.spec.ts

# Ejecutar pruebas que coincidan con patrón
npx playwright test --grep "video player"

# Listar todas las pruebas
npx playwright test --list
```

## Selectores de Prueba Comunes

### Página de Inicio
```typescript
page.getByTestId('home-page')           // Contenedor principal
page.getByTestId('video-grid')          // Cuadrícula de videos
page.getByTestId('video-card-1')        // Tarjeta de video por ID
page.getByTestId('video-title-1')       // Título de video
```

### Página de Video
```typescript
page.getByTestId('video-page')          // Contenedor principal
page.getByTestId('play-button')         // Botón reproducir
page.getByTestId('pause-button')        // Botón pausar
page.getByTestId('seek-forward-button') // Adelantar +10s
page.getByTestId('seek-backward-button')// Retroceder -10s
page.getByTestId('back-button')         // Volver a inicio
page.getByTestId('video-time')          // Visualización de tiempo
```

## Plantilla de Prueba

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nombre de Característica', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debería hacer algo', async ({ page }) => {
    // Preparar
    const element = page.getByTestId('mi-elemento');
    
    // Actuar
    await element.click();
    
    // Afirmar
    await expect(element).toBeVisible();
  });
});
```

## Aserciones Comunes

```typescript
await expect(element).toBeVisible()
await expect(element).toBeHidden()
await expect(element).toBeEnabled()
await expect(element).toBeDisabled()
await expect(element).toBeFocused()
await expect(element).toHaveText('texto')
await expect(element).toContainText('texto')
await expect(page).toHaveURL('/ruta-esperada')
await expect(page).toHaveTitle('Título')
```

## Consejos de Depuración

1. **Ejecutar en modo headed**: Ver qué está sucediendo
   ```bash
   npm run e2e:headed
   ```

2. **Usar Inspector de Playwright**:
   ```bash
   npm run e2e:debug
   ```

3. **Agregar pausa en prueba**:
   ```typescript
   await page.pause(); // Abre inspector
   ```

4. **Tomar captura de pantalla**:
   ```typescript
   await page.screenshot({ path: 'debug.png' });
   ```

5. **Verificar contenido de página**:
   ```typescript
   console.log(await page.content());
   ```

## Agregar Nuevas Pruebas

1. Crear archivo en directorio `e2e/`: `mi-caracteristica.spec.ts`
2. Agregar `data-testid` a elementos HTML
3. Escribir pruebas siguiendo patrones existentes
4. Ejecutar pruebas: `npx playwright test e2e/mi-caracteristica.spec.ts`
5. Verificar que todas pasen
6. Hacer commit de cambios

## Estructura de Pruebas

```
examples/sample-app/
├── e2e/
│   ├── home.spec.ts              # Pruebas de página de inicio
│   ├── video-player.spec.ts      # Pruebas de reproductor de video
│   ├── navigation.spec.ts        # Pruebas de navegación
│   └── analytics.spec.ts         # Pruebas de analytics
├── playwright.config.ts          # Configuración
└── playwright-report/            # Reportes generados
```

## Documentación

- **Guía Completa**: [E2E-TESTING.md](./E2E-TESTING.md)
- **Reporte de Cobertura**: [E2E-TEST-COVERAGE.md](./E2E-TEST-COVERAGE.md)
- **README de Directorio**: [e2e/README.md](./e2e/README.md)

## CI/CD

Las pruebas se ejecutan automáticamente en:
- Push a main/develop
- Pull requests
- Vía GitHub Actions

Ver: `.github/workflows/e2e-tests.yml`

## Solución de Problemas

**¿Navegador no instalado?**
```bash
npx playwright install chromium
```

**¿Puerto 4200 en uso?**
```bash
# Terminar proceso en puerto 4200
lsof -ti:4200 | xargs kill -9
```

**¿Pruebas agotando tiempo?**
- Aumentar timeout en `playwright.config.ts`
- Verificar velocidad de red
- Verificar que la app compile correctamente

**¿Necesitas ayuda?**
- Consulta la sección de solución de problemas en [E2E-TESTING.md](./E2E-TESTING.md)
- Revisa documentación de Playwright: https://playwright.dev
- Verifica ejemplos de pruebas en directorio `e2e/`
