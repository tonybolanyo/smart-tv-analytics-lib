# Scripts

Este directorio contiene scripts de utilidad para la librería Smart TV Analytics.

## update-readme-badges.js

Actualiza el archivo README.md con los badges actuales del proyecto incluyendo:
- Badge de versión (desde package.json)
- Badge de paquete NPM
- Badge de licencia  
- Badges de cobertura (desde reportes de cobertura de pruebas)
  - Cobertura general
  - Cobertura de declaraciones
  - Cobertura de ramas
  - Cobertura de funciones

### Uso

```bash
# Primero ejecutar pruebas con cobertura
npm run test:coverage

# Luego actualizar badges
npm run update-badges
```

El script hará lo siguiente:
1. Leer la versión desde package.json
2. Parsear datos de cobertura desde coverage/smart-tv-analytics/lcov.info
3. Generar URLs de badges con colores apropiados basados en porcentajes de cobertura
4. Actualizar README.md con los badges

### Colores de Badges

Los badges de cobertura usan el siguiente esquema de colores:
- 90%+ = verde brillante
- 80-89% = verde
- 70-79% = amarillo-verde
- 60-69% = amarillo
- 50-59% = naranja
- <50% = rojo

### Requisitos

- Node.js
- El reporte de cobertura debe existir en `coverage/smart-tv-analytics/lcov.info`
- Esto se genera automáticamente al ejecutar `npm run test:coverage`
