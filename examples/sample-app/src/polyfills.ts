/**
 * Polyfills para Smart TVs (Tizen y WebOS)
 */

// Polyfills de core-js para compatibilidad ES5
import 'core-js/es/array';
import 'core-js/es/date';
import 'core-js/es/function';
import 'core-js/es/map';
import 'core-js/es/object';
import 'core-js/es/promise';
import 'core-js/es/set';
import 'core-js/es/string';
import 'core-js/es/symbol';
import 'core-js/es/parse-int';
import 'core-js/es/parse-float';
import 'core-js/es/number';
import 'core-js/es/math';
import 'core-js/es/regexp';
import 'core-js/es/weak-map';

// Promise ANTES de Zone.js
import 'core-js/es/promise';

// Polyfills adicionales para Smart TVs
import 'core-js/es/reflect';
import 'core-js/web/dom-collections';

// Polyfill para fetch - importar siempre
import 'whatwg-fetch';

// Zone.js AL FINAL - requerido por Angular
import 'zone.js/dist/zone';

// Verificación de compatibilidad en desarrollo
if (typeof window !== 'undefined') {
  if (!window.Symbol || !window.Promise || !window.Map) {
    console.error('Polyfills críticos no cargaron correctamente');
  }
}
