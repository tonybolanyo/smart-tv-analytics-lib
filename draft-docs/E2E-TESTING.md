# Guía de Pruebas End-to-End

Esta guía cubre cómo usar, ejecutar y extender las pruebas end-to-end de Playwright para la aplicación de ejemplo de Smart TV Analytics.

## Tabla de Contenidos

- [Resumen](#resumen)
- [Configuración](#configuración)
- [Ejecutar Pruebas](#ejecutar-pruebas)
- [Estructura de Pruebas](#estructura-de-pruebas)
- [Escribir Nuevas Pruebas](#escribir-nuevas-pruebas)
- [Mejores Prácticas](#mejores-prácticas)
- [Solución de Problemas](#solución-de-problemas)

## Resumen

Las pruebas E2E están construidas usando [Playwright](https://playwright.dev/), un framework moderno de pruebas end-to-end que proporciona:

- Pruebas multi-navegador (Chromium, Firefox, WebKit)
- Espera automática de elementos
- Reportes y trazas integrados
- Captura de pantallas y videos en fallos
- Interceptación y simulación de red

### Cobertura de Pruebas

La suite de pruebas cubre las siguientes rutas críticas:

1. **Página de Inicio** (`e2e/home.spec.ts`)
   - Carga y visualización de página
   - Renderizado del catálogo de videos
   - Información de tarjetas de video
   - Navegación a páginas de video
   - Accesibilidad (gestión de foco)

2. **Reproductor de Video** (`e2e/video-player.spec.ts`)
   - Renderizado de UI del reproductor
   - Funcionalidad de reproducir/pausar
   - Controles de búsqueda
   - Finalización de video
   - Visualización de tiempo

3. **Flujo de Navegación** (`e2e/navigation.spec.ts`)
   - Recorridos completos de usuario
   - Gestión de estado de página
   - Navegación del navegador (atrás/adelante)
   - Flujos de trabajo multi-página

4. **Integración de Analytics** (`e2e/analytics.spec.ts`)
   - Verificación de seguimiento de eventos
   - Analytics de interacción de usuario
   - Seguimiento de sesión
   - Monitoreo de solicitudes de red

## Configuración

### Prerequisitos

- Node.js 14 o superior
- npm 6 o superior

### Instalación

1. **Instalar dependencias** (si aún no lo has hecho):

```bash
cd examples/sample-app
npm install
```

2. **Instalar navegadores de Playwright**:

```bash
npx playwright install chromium
```

Para navegadores adicionales:

```bash
npx playwright install  # Instala todos los navegadores
```

### Compilar la Librería

Antes de ejecutar las pruebas E2E, asegúrate de que la librería principal esté compilada:

```bash
# Desde la raíz del repositorio
cd /path/to/smart-tv-analytics-lib
npm install
npm run build
```

Luego instala las dependencias en la aplicación de ejemplo:

```bash
cd examples/sample-app
npm install
```

## Ejecutar Pruebas

### Ejecutar Todas las Pruebas

```bash
npm run e2e
```

Esto ejecuta todas las pruebas en modo headless (sin interfaz de navegador).

### Ejecutar Pruebas con UI

```bash
npm run e2e:headed
```

Abre una ventana de navegador para que puedas ver la ejecución de las pruebas.

### Modo UI Interactivo

```bash
npm run e2e:ui
```

Abre la interfaz interactiva de Playwright para ejecutar y depurar pruebas.

### Modo Depuración

```bash
npm run e2e:debug
```

Ejecuta pruebas en modo depuración con el Inspector de Playwright.

### Ejecutar Archivo de Prueba Específico

```bash
npx playwright test e2e/home.spec.ts
```

### Ejecutar Pruebas que Coincidan con un Patrón

```bash
npx playwright test --grep "video player"
```

### Ver Reporte de Pruebas

Después de ejecutar las pruebas, ver el reporte HTML:

```bash
npm run e2e:report
```

## Estructura de Pruebas

### Diseño de Directorios

```
examples/sample-app/
├── e2e/                          # Directorio de pruebas E2E
│   ├── home.spec.ts              # Pruebas de página de inicio
│   ├── video-player.spec.ts      # Pruebas de reproductor de video
│   ├── navigation.spec.ts        # Pruebas de flujo de navegación
│   └── analytics.spec.ts         # Pruebas de integración de analytics
├── playwright.config.ts          # Configuración de Playwright
├── playwright-report/            # Reportes de pruebas generados
└── test-results/                 # Artefactos de pruebas (capturas, videos)
```

### Configuración

El archivo `playwright.config.ts` configura:

- Ubicación del directorio de pruebas
- Tiempos de espera
- Reintentos
- Reporteros
- Configuraciones de navegador
- Servidor web (inicia automáticamente el servidor de desarrollo Angular)

### Atributos de Datos de Prueba

Los componentes usan atributos `data-testid` para selección confiable de elementos:

**Componente Home:**
- `home-page` - Contenedor principal
- `home-title` - Título de página
- `video-grid` - Cuadrícula de catálogo de video
- `video-card-{id}` - Tarjetas de video individuales
- `video-title-{id}` - Títulos de videos
- `video-duration-{id}` - Duraciones de videos

**Componente Video:**
- `video-page` - Contenedor principal
- `video-title` - Título del video
- `video-player` - Contenedor del reproductor
- `player-icon-paused` - Icono de estado pausado
- `player-icon-playing` - Icono de estado reproduciendo
- `play-button` - Control de reproducción
- `pause-button` - Control de pausa
- `seek-forward-button` - Adelantar (+10s)
- `seek-backward-button` - Retroceder (-10s)
- `complete-button` - Completar video
- `back-button` - Navegación atrás
- `video-time` - Visualización de tiempo

## Escribir Nuevas Pruebas

### Estructura Básica de Prueba

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nombre de Característica', () => {
  test.beforeEach(async ({ page }) => {
    // Código de configuración que se ejecuta antes de cada prueba
    await page.goto('/');
  });

  test('debería hacer algo específico', async ({ page }) => {
    // Código de prueba
    const element = page.getByTestId('mi-elemento');
    await expect(element).toBeVisible();
  });
});
```

### Ejemplo: Probar una Nueva Característica

Supongamos que agregas una característica de búsqueda a la página de inicio:

1. **Agregar data-testid al componente:**

```html
<!-- home.component.html -->
<input 
  type="text" 
  data-testid="search-input"
  [(ngModel)]="searchQuery"
  placeholder="Buscar videos..."
/>
<button data-testid="search-button" (click)="search()">
  Buscar
</button>
```

2. **Crear una prueba:**

```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Característica de Búsqueda', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debería filtrar videos por consulta de búsqueda', async ({ page }) => {
    // Escribir en el cuadro de búsqueda
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('Video 1');

    // Hacer clic en botón de búsqueda
    const searchButton = page.getByTestId('search-button');
    await searchButton.click();

    // Verificar resultados
    await expect(page.getByTestId('video-card-1')).toBeVisible();
    await expect(page.getByTestId('video-card-2')).not.toBeVisible();
  });
});
```

### Patrones Comunes

#### Esperar Navegación

```typescript
await page.getByTestId('link').click();
await page.waitForURL('/ruta-esperada');
```

#### Verificar Estado de Elemento

```typescript
const button = page.getByTestId('mi-boton');
await expect(button).toBeVisible();
await expect(button).toBeEnabled();
await expect(button).toHaveText('Texto Esperado');
```

#### Interactuar con Formularios

```typescript
await page.getByTestId('campo-entrada').fill('valor');
await page.getByTestId('checkbox').check();
await page.getByTestId('select').selectOption('valor-opcion');
```

#### Simulación de Red

```typescript
await page.route('**/api/analytics', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true })
  });
});
```

#### Tomar Capturas de Pantalla

```typescript
await page.screenshot({ path: 'captura.png' });
await page.getByTestId('elemento').screenshot({ path: 'elemento.png' });
```

## Mejores Prácticas

### 1. Usar Atributos data-testid

Siempre usa `data-testid` para seleccionar elementos en lugar de clases CSS o XPath:

```typescript
// Bueno
page.getByTestId('boton-enviar')

// Evitar
page.locator('.btn.btn-primary.submit')
```

### 2. Escribir Nombres de Prueba Descriptivos

```typescript
// Bueno
test('debería mostrar mensaje de error cuando el formulario se envía con campos vacíos', ...)

// Evitar
test('probar validación de formulario', ...)
```

### 3. Mantener Pruebas Independientes

Cada prueba debe poder ejecutarse independientemente:

```typescript
test.beforeEach(async ({ page }) => {
  // Restablecer estado antes de cada prueba
  await page.goto('/');
});
```

### 4. Usar Aserciones Liberalmente

Verificar comportamiento esperado explícitamente:

```typescript
await expect(page.getByTestId('video-page')).toBeVisible();
await expect(page).toHaveURL(/\/video\/1/);
```

### 5. Manejar Async Apropiadamente

Playwright espera automáticamente, pero sé explícito cuando sea necesario:

```typescript
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="cargado"]');
```

### 6. Agrupar Pruebas Relacionadas

```typescript
test.describe('Controles del Reproductor de Video', () => {
  test.describe('Reproducir/Pausar', () => {
    // Pruebas de reproducir/pausar
  });
  
  test.describe('Controles de Búsqueda', () => {
    // Pruebas de búsqueda
  });
});
```

### 7. Pruebas Específicas para Smart TV

Para aplicaciones de Smart TV, prueba la navegación con teclado:

```typescript
test('debería navegar con teclas de dirección', async ({ page }) => {
  await page.goto('/');
  
  const firstCard = page.getByTestId('video-card-1');
  await firstCard.focus();
  
  // Simular tecla de dirección del control remoto
  await page.keyboard.press('ArrowRight');
  
  const secondCard = page.getByTestId('video-card-2');
  await expect(secondCard).toBeFocused();
});
```

## Solución de Problemas

### Las Pruebas Fallan al Iniciar

**Problema:** `Error: browserType.launch: Executable doesn't exist`

**Solución:** Instalar navegadores:
```bash
npx playwright install
```

### Puerto Ya en Uso

**Problema:** `Error: listen EADDRINUSE: address already in use :::4200`

**Solución:** Terminar el proceso usando el puerto 4200:
```bash
# Linux/Mac
lsof -ti:4200 | xargs kill -9

# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### Tiempo de Espera de Pruebas

**Problema:** Las pruebas agotan el tiempo de espera esperando elementos

**Solución:** Aumentar el tiempo de espera en `playwright.config.ts`:
```typescript
timeout: 60 * 1000, // 60 segundos
```

### Pruebas Inestables

**Problema:** Las pruebas pasan a veces y fallan otras veces

**Soluciones:**
- Agregar esperas explícitas: `await page.waitForLoadState('networkidle')`
- Usar reintentos automáticos: Configurar `retries: 2` en config
- Verificar condiciones de carrera en código del componente

### Consejos de Depuración

1. **Ejecutar en modo headed:**
   ```bash
   npm run e2e:headed
   ```

2. **Usar modo depuración:**
   ```bash
   npm run e2e:debug
   ```

3. **Agregar logs de consola:**
   ```typescript
   test('mi prueba', async ({ page }) => {
     console.log(await page.title());
     console.log(await page.content());
   });
   ```

4. **Pausar ejecución:**
   ```typescript
   await page.pause(); // Abre el Inspector de Playwright
   ```

5. **Ver archivos de traza:**
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```

## Integración CI/CD

### Ejemplo de GitHub Actions

```yaml
name: Pruebas E2E
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Instalar dependencias
        run: |
          npm install
          cd examples/sample-app && npm install
      
      - name: Instalar navegadores de Playwright
        run: cd examples/sample-app && npx playwright install --with-deps chromium
      
      - name: Compilar librería
        run: npm run build
      
      - name: Ejecutar pruebas E2E
        run: cd examples/sample-app && npm run e2e
      
      - name: Subir reporte de pruebas
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: examples/sample-app/playwright-report/
```

## Reportes de Cobertura

Playwright genera reportes de pruebas detallados automáticamente:

- **Reporte HTML:** Reporte visual con resultados de pruebas, capturas de pantalla y videos
- **Reporte JSON:** Resultados legibles por máquina para integración CI/CD

Ver el reporte HTML:
```bash
npm run e2e:report
```

El reporte muestra:
- Tiempo de ejecución de pruebas
- Estado de éxito/fallo
- Mensajes de error y trazas de pila
- Capturas de pantalla de fallos
- Grabaciones de video (si está habilitado)
- Archivos de traza para depuración

## Recursos Adicionales

- [Documentación de Playwright](https://playwright.dev/)
- [Mejores Prácticas de Playwright](https://playwright.dev/docs/best-practices)
- [Librería Smart TV Analytics](../../README.md)
- [README de Aplicación de Ejemplo](./README.md)

## Soporte

Para problemas o preguntas:
- Abre un issue en GitHub
- Consulta la documentación de Playwright
- Revisa los ejemplos de pruebas existentes en el directorio `e2e/`
