const fs = require('fs');
const path = require('path');

/**
 * Script para copiar el build de Angular al directorio webOS
 */

const distDir = path.join(__dirname, '..', 'dist', 'sample-app');
const webosDir = path.join(__dirname, '..', 'webos', 'dist');

console.log('Copiando archivos a webOS...');

// Verificar que existe el directorio de origen
if (!fs.existsSync(distDir)) {
  console.error('Error: No se encontró el directorio dist/sample-app');
  console.error('Ejecuta primero: npm run build:prod');
  process.exit(1);
}

// Crear directorio webOS/dist si no existe
if (!fs.existsSync(webosDir)) {
  fs.mkdirSync(webosDir, { recursive: true });
}

// Función para copiar recursivamente
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copiar archivos
try {
  copyRecursive(distDir, webosDir);
  console.log('✓ Archivos copiados exitosamente a webOS/dist');
} catch (error) {
  console.error('Error al copiar archivos:', error.message);
  process.exit(1);
}
