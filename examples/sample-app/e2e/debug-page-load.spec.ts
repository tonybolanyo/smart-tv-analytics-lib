import { test, expect } from '@playwright/test';

test.describe('Page Load Debugging', () => {
  test('capture page state and console errors', async ({ page }) => {
    const consoleMessages: string[] = [];
    const errors: string[] = [];
    const networkErrors: string[] = [];

    // Capturar todos los mensajes de consola
    page.on('console', msg => {
      const message = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(message);
      console.log(message);
    });

    // Capturar errores de página
    page.on('pageerror', error => {
      const errorMsg = `Page Error: ${error.message}`;
      errors.push(errorMsg);
      console.log(errorMsg);
    });

    // Capturar errores de red
    page.on('response', response => {
      if (!response.ok()) {
        const errorMsg = `Network Error: ${response.status()} - ${response.url()}`;
        networkErrors.push(errorMsg);
        console.log(errorMsg);
      }
    });

    console.log('Navegando a la aplicación...');
    
    // Navegar a la página con URL completa
    try {
      await page.goto('http://localhost:4200', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      console.log('Navegación exitosa');
    } catch (error) {
      console.log(`Error de navegación: ${error}`);
      // Intentar con la URL base configurada
      await page.goto('/', { 
        waitUntil: 'load',
        timeout: 30000 
      });
    }

    console.log('Esperando inicialización de Angular...');
    
    // Esperar un momento para que Angular se inicialice
    await page.waitForTimeout(8000);

    console.log('Tomando captura de pantalla...');
    
    // Tomar captura de pantalla del estado actual
    await page.screenshot({ 
      path: 'debug-screenshots/page-state.png',
      fullPage: true 
    });

    // Verificar elementos Angular
    const angularRoot = await page.locator('app-root').count();
    console.log(`Elementos app-root encontrados: ${angularRoot}`);

    // Verificar contenido del body
    const bodyContent = await page.textContent('body');
    const contentLength = bodyContent?.length || 0;
    console.log(`Longitud del contenido del body: ${contentLength}`);
    
    if (contentLength < 50) {
      console.log(`Contenido del body: "${bodyContent}"`);
    }

    // Evaluar estado de Angular y JavaScript en el navegador
    const browserState = await page.evaluate(() => {
      const state = {
        hasAngular: typeof (window as any).ng !== 'undefined',
        hasZone: typeof (window as any).Zone !== 'undefined',
        hasSymbol: typeof Symbol !== 'undefined',
        hasPromise: typeof Promise !== 'undefined',
        hasMap: typeof Map !== 'undefined',
        bodyHTML: document.body.innerHTML.substring(0, 500),
        headHTML: document.head.innerHTML.substring(0, 500),
        scripts: Array.from(document.scripts).map(s => ({
          src: s.src || 'inline',
          content: s.src ? null : s.innerHTML.substring(0, 100)
        })),
        userAgent: navigator.userAgent,
        documentReadyState: document.readyState,
        location: window.location.href
      };
      
      return state;
    });

    console.log('\n=== ESTADO DEL NAVEGADOR ===');
    console.log(`Angular disponible: ${browserState.hasAngular}`);
    console.log(`Zone.js disponible: ${browserState.hasZone}`);
    console.log(`Symbol disponible: ${browserState.hasSymbol}`);
    console.log(`Promise disponible: ${browserState.hasPromise}`);
    console.log(`Map disponible: ${browserState.hasMap}`);
    console.log(`URL actual: ${browserState.location}`);
    console.log(`Estado del documento: ${browserState.documentReadyState}`);
    console.log(`User Agent: ${browserState.userAgent}`);
    
    console.log('\n=== SCRIPTS CARGADOS ===');
    browserState.scripts.forEach((script, index) => {
      if (script.src) {
        console.log(`${index + 1}. ${script.src}`);
      } else {
        console.log(`${index + 1}. Inline script: ${script.content}...`);
      }
    });

    console.log('\n=== CONTENIDO DEL HEAD ===');
    console.log(browserState.headHTML);
    
    console.log('\n=== CONTENIDO DEL BODY ===');
    console.log(browserState.bodyHTML);

    console.log('\n=== MENSAJES DE CONSOLA ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    console.log('\n=== ERRORES DE PÁGINA ===');
    errors.forEach(err => console.log(err));
    
    console.log('\n=== ERRORES DE RED ===');
    networkErrors.forEach(err => console.log(err));

    // Verificaciones
    expect(angularRoot).toBeGreaterThan(0);
    expect(contentLength).toBeGreaterThan(0);
    
    // Si no hay contenido significativo, fallar con información útil
    if (contentLength < 100) {
      throw new Error(`La página parece estar en blanco. Contenido: "${bodyContent}"`);
    }
  });
});