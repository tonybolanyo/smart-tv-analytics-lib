import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Función para inicialización con manejo de errores
function bootstrapApp() {
  return platformBrowserDynamic()
    .bootstrapModule(AppModule, {
      // Configuraciones específicas para Smart TVs
      preserveWhitespaces: false,
      ngZone: 'zone.js',
    })
    .catch(err => {
      console.error('Error inicializando la aplicación:', err);
      
      // Mostrar error en la página para debugging
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'padding: 20px; background: red; color: white; font-family: monospace;';
      errorDiv.innerHTML = `
        <h3>Error de Inicialización</h3>
        <pre>${err.message}</pre>
        <pre>${err.stack}</pre>
      `;
      document.body.appendChild(errorDiv);
    });
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}