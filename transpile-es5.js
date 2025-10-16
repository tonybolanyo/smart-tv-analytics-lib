const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

/**
 * Script para transpilizar los bundles generados por ng-packagr a ES5 puro
 * Esto es necesario para compatibilidad con Smart TVs que no soportan ES6+
 */

const distDir = path.join(__dirname, 'dist');
const jsFiles = [
  'fesm2015/smart-tv-analytics.js',
  'bundles/smart-tv-analytics.umd.js'
];

const babelConfig = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        // Target older Smart TV browsers explicitly
        browsers: [
          'ie 11',           // Baseline for ES5
          'Samsung >= 5',    // Tizen 2.4+
          'Chrome >= 38'     // webOS 3.0+
        ]
      },
      modules: false,
      useBuiltIns: 'entry',
      corejs: 3
    }]
  ],
  plugins: [
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-transform-block-scoped-functions',
    '@babel/plugin-transform-block-scoping',
    '@babel/plugin-transform-classes',
    '@babel/plugin-transform-computed-properties',
    '@babel/plugin-transform-destructuring',
    '@babel/plugin-transform-for-of',
    '@babel/plugin-transform-parameters',
    '@babel/plugin-transform-shorthand-properties',
    '@babel/plugin-transform-spread',
    '@babel/plugin-transform-template-literals'
  ]
};

async function transpileFile(filePath) {
  const fullPath = path.join(distDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Archivo no encontrado: ${fullPath}`);
    return;
  }

  console.log(`Transpilando ${filePath} a ES5...`);
  
  const code = fs.readFileSync(fullPath, 'utf8');
  
  try {
    const result = await babel.transformAsync(code, {
      ...babelConfig,
      filename: filePath
    });
    
    if (result && result.code) {
      // Crear versión ES5
      const es5Path = fullPath.replace('.js', '.es5.js');
      fs.writeFileSync(es5Path, result.code);
      console.log(`✓ Creado: ${path.relative(distDir, es5Path)}`);
      
      // Sobrescribir el archivo original también
      fs.writeFileSync(fullPath, result.code);
      console.log(`✓ Actualizado: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error transpilando ${filePath}:`, error.message);
  }
}

async function main() {
  console.log('Iniciando transpilación a ES5 para Smart TVs...\n');
  
  for (const file of jsFiles) {
    await transpileFile(file);
  }
  
  console.log('\n✓ Transpilación completada');
  console.log('Los bundles son ahora compatibles con Smart TVs Tizen 2.4+ y WebOS 3.0+');
}

main().catch(console.error);