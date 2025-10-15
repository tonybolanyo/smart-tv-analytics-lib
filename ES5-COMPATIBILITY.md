# Compatibilidad ES5 para Smart TVs

## Resumen

Esta librería está completamente compatible con ES5, lo que permite su uso en Smart TVs antiguos como Tizen 2.4+ y webOS 3.0+ que no soportan características modernas de JavaScript (ES6+).

## Proceso de Transpilación

El proceso de construcción utiliza una pipeline de transpilación de dos etapas:

### 1. TypeScript → ES2015 (ng-packagr)

```bash
npm run build:lib
```

- **Entrada**: Código fuente TypeScript con características modernas
- **Salida**: JavaScript ES2015 
- **Herramienta**: ng-packagr + TypeScript compiler
- **Configuración**: `tsconfig.lib.json` con target `es2015`

En esta etapa puedes usar **todas las características modernas de TypeScript**, incluyendo:
- Tipos avanzados (generics, union types, intersection types, etc.)
- Decoradores (@Injectable, @Component, etc.)
- Async/await
- Clases y herencia
- Módulos ES6
- Arrow functions
- Destructuring
- Template literals
- Spread operator
- Y mucho más...

### 2. ES2015 → ES5 (Babel)

```bash
npm run build:es5
```

- **Entrada**: Bundles ES2015 generados por ng-packagr
- **Salida**: JavaScript ES5 puro compatible con navegadores antiguos
- **Herramienta**: Babel con @babel/preset-env
- **Configuración**: `transpile-es5.js`

Babel automáticamente transpila:
- ✅ Clases → Funciones con prototipos
- ✅ Arrow functions → Funciones regulares
- ✅ const/let → var
- ✅ Template literals → Concatenación de strings
- ✅ Destructuring → Asignaciones manuales
- ✅ Spread operator → Métodos Array/Object
- ✅ Computed properties → Asignaciones por corchetes
- ✅ For-of loops → For loops tradicionales
- ✅ Parámetros por defecto → Verificaciones manuales

## Configuración de Babel

La configuración en `transpile-es5.js` está optimizada para Smart TVs:

```javascript
{
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: [
          'ie 11',           // Baseline ES5 browser
          'Samsung >= 5',    // Tizen 2.4+
          'Chrome >= 38'     // webOS 3.0+
        ]
      },
      modules: false,
      useBuiltIns: false,
      loose: true
    }]
  ]
}
```

### ¿Por qué `useBuiltIns: false`?

No inyectamos polyfills automáticamente porque:
1. La aplicación que consume la librería puede gestionar sus propios polyfills
2. Evita duplicar polyfills si la app ya los incluye
3. Mantiene el tamaño de la librería pequeño

## Uso en tu Aplicación

### Opción 1: Bundles Pre-transpilados (Recomendado)

Los bundles ya están transpilados a ES5 durante el build:

```json
{
  "main": "bundles/smart-tv-analytics.umd.js",     // ES5 ✓
  "module": "fesm2015/smart-tv-analytics.js",      // ES5 ✓
  "es2015": "fesm2015/smart-tv-analytics.js"       // ES5 ✓
}
```

El proceso de build sobrescribe los bundles ES2015 con versiones ES5.

### Opción 2: Archivos .es5.js Separados

Si necesitas mantener ambas versiones, los archivos `.es5.js` se crean pero no se usan por defecto:

```
dist/
  ├── fesm2015/smart-tv-analytics.js      (ES5 transpilado)
  ├── fesm2015/smart-tv-analytics.es5.js  (Backup ES5)
  ├── bundles/smart-tv-analytics.umd.js   (ES5 transpilado)
  └── bundles/smart-tv-analytics.umd.es5.js (Backup ES5)
```

## Polyfills Necesarios

Aunque la librería está transpilada a ES5, necesitas incluir polyfills para características que no pueden ser transpiladas:

### En tu aplicación Angular (polyfills.ts):

```typescript
import 'core-js/es/symbol';
import 'core-js/es/object';
import 'core-js/es/function';
import 'core-js/es/parse-int';
import 'core-js/es/parse-float';
import 'core-js/es/number';
import 'core-js/es/math';
import 'core-js/es/string';
import 'core-js/es/date';
import 'core-js/es/array';
import 'core-js/es/regexp';
import 'core-js/es/map';
import 'core-js/es/weak-map';
import 'core-js/es/set';
import 'core-js/es/promise';

// Para async/await
import 'regenerator-runtime/runtime';

// Zone.js (requerido por Angular)
import 'zone.js';
```

### Para Tizen 2.4:

```html
<!-- En index.html antes de tus scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/core-js/3.25.0/minified.js"></script>
```

### Para webOS 3.0:

```html
<!-- webOS 3.0 tiene mejor soporte ES5, pero aún necesita algunos polyfills -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/core-js-bundle/3.25.0/minified.js"></script>
```

## Verificación de Compatibilidad

### Comprobar que el código es ES5

```bash
# Buscar características ES6+ que no deberían estar
grep -r "const \|let \|=>" dist/fesm2015/smart-tv-analytics.js
grep -r "class " dist/fesm2015/smart-tv-analytics.js

# Si no hay resultados, el código es ES5 puro
```

### Herramientas de Análisis

Puedes usar herramientas como [es-check](https://github.com/yowainwright/es-check) para verificar:

```bash
npx es-check es5 'dist/**/*.js'
```

## Desarrollo con Características Modernas

Sí, **puedes usar TypeScript moderno y características avanzadas** en el código fuente:

```typescript
// ✅ Esto funciona - será transpilado a ES5
export class MyService {
  private data: Map<string, any> = new Map();
  
  async fetchData(): Promise<void> {
    const response = await fetch('/api/data');
    const { items, total } = await response.json();
    
    items.forEach((item: any) => {
      this.data.set(item.id, { ...item, processed: true });
    });
  }
  
  getData = (id: string) => this.data.get(id) ?? null;
}
```

Después de la transpilación, esto se convierte en ES5 puro compatible con Smart TVs antiguos.

## Scripts de Build

```bash
# Build completo (ng-packagr + Babel)
npm run build

# Solo ng-packagr (ES2015)
npm run build:lib

# Solo Babel transpilation (ES2015 → ES5)
npm run build:es5
```

## Limitaciones Conocidas

1. **No se transpilan polyfills**: Features como Promise, Map, Set requieren polyfills externos
2. **Async/await**: Requiere regenerator-runtime
3. **Proxies**: No pueden ser polyfilled, evitar en código para Smart TV
4. **Symbols**: Requieren polyfill de core-js

## Ejemplo de Configuración para Tizen

```typescript
// tsconfig.app.json de tu aplicación Tizen
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["es5", "es2015.promise", "dom"]
  }
}
```

```json
// angular.json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "es5BrowserSupport": true
          }
        }
      }
    }
  }
}
```

## Soporte de Plataformas

| Plataforma | Versión | ES5 Compatible | Notas |
|------------|---------|----------------|-------|
| Tizen | 2.4+ | ✅ Sí | Requiere polyfills completos |
| Tizen | 4.0+ | ✅ Sí | Algunos polyfills incluidos |
| webOS | 3.0+ | ✅ Sí | Mejor soporte nativo ES5 |
| webOS | 4.0+ | ✅ Sí | Soporte parcial ES6 |

## Troubleshooting

### Error: "Promise is not defined"

**Solución**: Añade polyfill de Promise en tu app:
```typescript
import 'core-js/es/promise';
```

### Error: "regeneratorRuntime is not defined"

**Solución**: Añade regenerator-runtime si usas async/await:
```typescript
import 'regenerator-runtime/runtime';
```

### El código sigue siendo ES6

**Solución**: Asegúrate de ejecutar el build completo:
```bash
npm run build  # No solo build:lib
```

## Conclusión

La librería smart-tv-analytics está **100% compatible con ES5** gracias a la pipeline de transpilación TypeScript → Babel. Puedes:

1. ✅ Escribir código TypeScript moderno con todas las características avanzadas
2. ✅ El código se transpila automáticamente a ES5 durante el build
3. ✅ Funciona en Smart TVs antiguos (Tizen 2.4+, webOS 3.0+)
4. ✅ Solo necesitas añadir polyfills en tu aplicación consumidora

El proceso es completamente transparente para los desarrolladores.
