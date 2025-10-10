/**
 * @fileoverview Polyfills necesarios para compatibilidad con Smart TVs
 * Este archivo incluye los polyfills requeridos para Tizen y WebOS
 */

// Polyfills para ES5 compatibility
import 'core-js/es/array';
import 'core-js/es/date';
import 'core-js/es/function';
import 'core-js/es/map';
import 'core-js/es/math';
import 'core-js/es/number';
import 'core-js/es/object';
import 'core-js/es/parse-float';
import 'core-js/es/parse-int';
import 'core-js/es/regexp';
import 'core-js/es/set';
import 'core-js/es/string';
import 'core-js/es/symbol';
import 'core-js/es/weak-map';

// Polyfills para Promises
import 'core-js/es/promise';

// Zone.js is required by default for Angular itself
import 'zone.js/dist/zone';

// Polyfills específicos para Smart TVs
(function () {
  'use strict';

  // Polyfill para Object.assign si no está disponible
  if (typeof Object.assign !== 'function') {
    Object.assign = function (target: any) {
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }
      const to = Object(target);
      for (let index = 1; index < arguments.length; index++) {
        const nextSource = arguments[index];
        if (nextSource != null) {
          for (const nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    };
  }

  // Polyfill para Array.from si no está disponible
  if (!Array.from) {
    Array.from = function (arrayLike: any, mapFn?: any, thisArg?: any) {
      const C = this;
      const items = Object(arrayLike);
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }
      const mapFunction = mapFn === undefined ? undefined : mapFn;
      let T: any;
      if (typeof mapFunction !== 'undefined') {
        if (typeof mapFunction !== 'function') {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        if (arguments.length > 2) {
          T = thisArg;
        }
      }
      const len = parseInt(items.length);
      const A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
      let k = 0;
      let kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFunction) {
          A[k] = typeof T === 'undefined' ? mapFunction(kValue, k) : mapFunction.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };
  }

  // Polyfill para String.prototype.includes si no está disponible
  if (!String.prototype.includes) {
    String.prototype.includes = function (search: string, start?: number) {
      if (typeof start !== 'number') {
        start = 0;
      }
      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    };
  }

  // Polyfill para Array.prototype.includes si no está disponible
  if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement: any, fromIndex?: number) {
      return this.indexOf(searchElement, fromIndex) !== -1;
    };
  }

  // Polyfill para Array.prototype.find si no está disponible
  if (!Array.prototype.find) {
    Array.prototype.find = function (predicate: any) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }
      const o = Object(this);
      const len = parseInt(o.length) || 0;
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      const thisArg = arguments[1];
      let k = 0;
      while (k < len) {
        const kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        k++;
      }
      return undefined;
    };
  }

  // Polyfill para requestAnimationFrame si no está disponible
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback: FrameRequestCallback) {
      return window.setTimeout(callback, 1000 / 60);
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id: number) {
      clearTimeout(id);
    };
  }

  // Polyfill para JSON si no está disponible (muy raro, pero por seguridad)
  if (typeof JSON === 'undefined') {
    (window as any).JSON = {
      parse: function (text: string) {
        // Implementación sin eval para mayor seguridad
        return (new Function('return ' + text))();
      },
      stringify: function (obj: any) {
        // Implementación básica de JSON.stringify
        const type = typeof obj;
        if (type === 'undefined') return undefined;
        if (obj === null) return 'null';
        if (type === 'string') return '"' + obj.replace(/\"/g, '\\"') + '"';
        if (type === 'number' || type === 'boolean') return obj.toString();
        if (obj instanceof Array) {
          const items = obj.map(function (item) { return JSON.stringify(item); });
          return '[' + items.join(',') + ']';
        }
        if (type === 'object') {
          const pairs = [];
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              pairs.push(JSON.stringify(key) + ':' + JSON.stringify(obj[key]));
            }
          }
          return '{' + pairs.join(',') + '}';
        }
        return '{}';
      }
    };
  }
})();