#!/bin/bash

echo "Build y Debug para Smart TV Analytics"
echo "========================================"

set -e

# Función para mostrar errores
error_exit() {
    echo "Error: $1" >&2
    exit 1
}

# Verificar que estamos en el directorio correcto
if [[ ! -f "angular.json" ]]; then
    error_exit "No se encontró angular.json. Ejecuta desde examples/sample-app/"
fi

echo "1. Limpiando caches y builds previos..."
rm -rf .angular dist node_modules/.cache 2>/dev/null || true
echo "   Limpieza completada"

echo ""
echo "2. Verificando librería principal..."
if [[ ! -d "../../dist" ]]; then
    echo "   Compilando librería smart-tv-analytics..."
    cd ../..
    npm run build || error_exit "Falló la compilación de la librería"
    cd examples/sample-app
    echo "   Librería compilada"
else
    echo "   Librería ya disponible"
fi

echo ""
echo "3. Reinstalando dependencias..."
npm install --force || error_exit "Falló la instalación de dependencias"
echo "   Dependencias instaladas"

echo ""
echo "4. Ejecutando ngcc para procesamiento ES5..."
npx ngcc --properties es2015 es5 module main --first-only --create-ivy-entry-points || error_exit "Falló ngcc"
echo "   ngcc completado"

echo ""
echo "5. Compilando aplicación (con soporte legacy OpenSSL)..."
export NODE_OPTIONS="--openssl-legacy-provider"
npx ng build --configuration=development --aot --source-map --verbose || error_exit "Falló la compilación"
echo "   Aplicación compilada"

echo ""
echo "6. Verificando archivos generados..."
if [[ ! -d "dist/sample-app" ]]; then
    error_exit "No se generó el directorio dist/sample-app"
fi

ls -la dist/sample-app/
echo "   Archivos generados correctamente"

echo ""
echo "7. Verificando sintaxis ES5 en archivos principales..."
ES6_FOUND=false

# Verificar main.js
if [[ -f "dist/sample-app/main.js" ]] && grep -q "=>" "dist/sample-app/main.js" 2>/dev/null; then
    echo "   Se encontró sintaxis ES6 en main.js"
    ES6_FOUND=true
fi

# Verificar polyfills.js
if [[ -f "dist/sample-app/polyfills.js" ]] && grep -q "=>" "dist/sample-app/polyfills.js" 2>/dev/null; then
    echo "   Se encontró sintaxis ES6 en polyfills.js"
    ES6_FOUND=true
fi

if [[ "$ES6_FOUND" == "false" ]]; then
    echo "   Sintaxis ES5 verificada"
fi

echo ""
echo "8. Iniciando servidor de desarrollo..."
echo "   La aplicación estará disponible en http://localhost:4200"
echo "   Presiona Ctrl+C para detener"
echo ""

# Iniciar servidor con soporte legacy
export NODE_OPTIONS="--openssl-legacy-provider"
npx ng serve --host 0.0.0.0 --port 4200