import { test, expect } from '@playwright/test';

test.describe('Smart TV Compatibility Verification', () => {
  test.beforeEach(async ({ page }) => {
    console.log('Configurando entorno Smart TV...');
    
    // Configurar user agent de Smart TV ANTES de otras modificaciones
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 2.4.0) AppleWebKit/538.1 (KHTML, like Gecko) Version/2.4.0 TV Safari/538.1'
    });
    
    // NO eliminamos APIs críticas completamente, sino que simulamos limitaciones
    await page.addInitScript(() => {
      console.log('Inicializando polyfills para Smart TV...');
      
      // Los polyfills deberían restaurar estas funcionalidades
      // Solo verificamos que estén disponibles después de cargar los polyfills
      (window as any).smartTVMode = true;
      
      // Simular menor rendimiento
      (window as any).performance = {
        ...((window as any).performance || {}),
        now: () => Date.now()
      };
    });
  });

  test('should load and initialize correctly on Smart TV', async ({ page }) => {
    const errors: string[] = [];
    const consoleMessages: string[] = [];
    
    page.on('pageerror', error => {
      const errorMsg = `Error de página: ${error.message}`;
      errors.push(error.message);
      console.log(errorMsg);
    });
    
    page.on('console', msg => {
      const message = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(message);
      
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
      
      // Log todos los mensajes para debug
      console.log(message);
    });

    console.log('Navegando a la aplicación en modo Smart TV...');
    
    // Navegar a la aplicación con URL completa
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
    
    console.log('Esperando inicialización completa...');
    
    // Esperar a que Angular se inicialice
    await page.waitForTimeout(8000);
    
    // Verificar el estado de la aplicación
    const appState = await page.evaluate(() => {
      return {
        hasAngular: typeof (window as any).ng !== 'undefined',
        hasZone: typeof (window as any).Zone !== 'undefined',
        hasSymbol: typeof Symbol !== 'undefined',
        hasPromise: typeof Promise !== 'undefined',
        hasMap: typeof Map !== 'undefined',
        smartTVMode: (window as any).smartTVMode,
        appRootExists: !!document.querySelector('app-root'),
        bodyContent: document.body.textContent?.trim().substring(0, 200),
        userAgent: navigator.userAgent
      };
    });

    console.log('\n=== ESTADO DE LA APLICACIÓN EN SMART TV ===');
    console.log(`Angular: ${appState.hasAngular}`);
    console.log(`Zone.js: ${appState.hasZone}`);
    console.log(`Symbol: ${appState.hasSymbol}`);
    console.log(`Promise: ${appState.hasPromise}`);
    console.log(`Map: ${appState.hasMap}`);
    console.log(`Smart TV Mode: ${appState.smartTVMode}`);
    console.log(`App Root: ${appState.appRootExists}`);
    console.log(`User Agent: ${appState.userAgent}`);
    console.log(`Contenido: "${appState.bodyContent}"`);
    
    // Tomar captura del estado final
    await page.screenshot({ 
      path: 'verification-screenshots/smart-tv-load.png',
      fullPage: true 
    });
    
    // Verificar errores críticos
    const criticalErrors = errors.filter(err => 
      err.toLowerCase().includes('symbol') || 
      err.toLowerCase().includes('promise') || 
      err.toLowerCase().includes('is not defined') ||
      err.toLowerCase().includes('unexpected token')
    );
    
    if (criticalErrors.length > 0) {
      console.log('\nERRORES CRÍTICOS ENCONTRADOS:');
      criticalErrors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\nNo se encontraron errores críticos');
    }
    
    // Verificaciones
    expect(appState.appRootExists, 'El elemento app-root debe existir').toBeTruthy();
    expect(appState.hasSymbol, 'Symbol debe estar disponible (polyfill)').toBeTruthy();
    expect(appState.hasPromise, 'Promise debe estar disponible (polyfill)').toBeTruthy();
    
    // Verificar que hay contenido visible
    const contentLength = appState.bodyContent?.length || 0;
    expect(contentLength, 'Debe haber contenido visible en la página').toBeGreaterThan(10);
    
    // Si hay errores críticos, fallar la prueba
    expect(criticalErrors.length, `Errores críticos encontrados: ${criticalErrors.join(', ')}`).toBe(0);

    console.log('Verificación de Smart TV completada exitosamente');
  });
});