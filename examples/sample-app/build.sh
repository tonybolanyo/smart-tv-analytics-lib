#!/bin/bash

echo "=== Build Debug Script para Smart TV ==="
set -e

# Limpiar caches
echo "1. Limpiando caches..."
rm -rf .angular node_modules/.cache dist

# Verificar librería
echo "2. Verificando librería..."
if [ ! -d "../../dist" ]; then
    echo "   Compilando librería..."
    cd ../..
    npm run build
    cd examples/sample-app
fi

# Reinstalar dependencias
echo "3. Reinstalando dependencias..."
npm install

# Build con configuración ES5
echo "4. Compilando aplicación..."
npx ng build --configuration=production --aot --build-optimizer=false

# Verificar archivos generados
echo "5. Verificando archivos generados..."
ls -la dist/sample-app/

# Verificar que no hay sintaxis ES6 en archivos críticos
echo "6. Verificando sintaxis ES5..."
if grep -r "=>" dist/sample-app/*.js; then
    echo "    ADVERTENCIA: Se encontró sintaxis ES6 en los archivos compilados"
fi

echo "✓ Build completado"
