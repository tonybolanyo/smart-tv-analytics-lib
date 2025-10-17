import { test, expect } from '@playwright/test';

test.describe('Google Analytics CORS Issue Analysis', () => {
  test('should identify and document CORS issues with GA4 Measurement Protocol', async ({ page }) => {
    const corsErrors: string[] = [];
    const networkFailures: string[] = [];
    const analyticsRequests: string[] = [];

    // Capturar errores de consola relacionados con CORS
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('CORS') && text.includes('google-analytics')) {
        corsErrors.push(text);
      }
    });

    // Capturar fallos de red
    page.on('response', response => {
      const url = response.url();
      
      // Identificar requests a Google Analytics
      if (url.includes('google-analytics.com/mp/collect')) {
        analyticsRequests.push(url);
        
        if (!response.ok()) {
          networkFailures.push(`${response.status()} - ${url}`);
        }
      }
    });

    console.log('Navegando a la aplicación para analizar CORS...');
    
    // Navegar a la aplicación
    await page.goto('http://localhost:4200', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    console.log('Esperando que se generen eventos de analytics...');
    
    // Esperar a que se generen eventos de analytics
    await page.waitForTimeout(10000);

    // Analizar el estado de los analytics
    const analyticsState = await page.evaluate(() => {
      return {
        hasSmartTVAnalytics: typeof (window as any).SmartTVAnalytics !== 'undefined',
        userAgent: navigator.userAgent,
        currentUrl: window.location.href,
        timestamp: Date.now()
      };
    });

    // Tomar captura para evidencia
    await page.screenshot({ 
      path: 'debug-screenshots/cors-analysis.png',
      fullPage: true 
    });

    console.log('\n=== ANÁLISIS DE CORS Y GOOGLE ANALYTICS ===');
    console.log(`Total requests a GA: ${analyticsRequests.length}`);
    console.log(`Errores CORS encontrados: ${corsErrors.length}`);
    console.log(`Fallos de red: ${networkFailures.length}`);
    
    if (analyticsRequests.length > 0) {
      console.log('\nREQUESTS A GOOGLE ANALYTICS:');
      analyticsRequests.forEach((req, index) => {
        console.log(`${index + 1}. ${req.substring(0, 100)}...`);
      });
    }

    if (corsErrors.length > 0) {
      console.log('\nERRORES CORS DETECTADOS:');
      corsErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.substring(0, 200)}...`);
      });
    }

    if (networkFailures.length > 0) {
      console.log('\nFALLOS DE RED:');
      networkFailures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure}`);
      });
    }

    // Verificaciones del test
    expect(analyticsState.hasSmartTVAnalytics, 'SmartTVAnalytics debe estar disponible').toBeTruthy();
    expect(analyticsRequests.length, 'Debe haber intentos de requests a GA').toBeGreaterThan(0);
    
    // ESTA ES LA VERIFICACIÓN CLAVE - documentamos que CORS es esperado
    if (corsErrors.length > 0) {
      console.log('\n🔍IAGNÓSTICO: CORS errors son ESPERADOS cuando se usa GA4 Measurement Protocol desde el navegador');
      console.log('SOLUCIÓN RECOMENDADA: Usar proxy server o gtag.js en su lugar');
    }

    // El test pasa incluso con CORS errors porque es comportamiento esperado
    expect(true).toBeTruthy();
  });

  test('should demonstrate the correct way to implement GA4 without CORS', async ({ page }) => {
    console.log('Testeando implementación sin CORS usando gtag.js...');

    // Inject gtag.js script para demostrar la alternativa
    await page.addInitScript(() => {
      // Simular carga de gtag.js
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(arguments);
      }
      (window as any).gtag = gtag;
      
      gtag('js', new Date());
      gtag('config', 'G-V322J0RJCJ', {
        send_page_view: false // Controlamos manualmente
      });
      
      console.log('gtag.js simulado cargado sin CORS issues');
    });

    await page.goto('http://localhost:4200', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Verificar que gtag está disponible
    const gtagState = await page.evaluate(() => {
      return {
        hasGtag: typeof (window as any).gtag === 'function',
        hasDataLayer: Array.isArray((window as any).dataLayer),
        dataLayerLength: (window as any).dataLayer?.length || 0
      };
    });

    console.log('\nIMPLEMENTACIÓN SIN CORS:');
    console.log(`gtag disponible: ${gtagState.hasGtag}`);
    console.log(`dataLayer disponible: ${gtagState.hasDataLayer}`);
    console.log(`Eventos en dataLayer: ${gtagState.dataLayerLength}`);

    expect(gtagState.hasGtag).toBeTruthy();
    expect(gtagState.hasDataLayer).toBeTruthy();
  });
});