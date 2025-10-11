#!/bin/bash

###############################################################################
# Script de empaquetado para LG webOS
# Este script crea un paquete .ipk listo para instalar en dispositivos LG webOS
###############################################################################

set -e

echo "========================================="
echo "Empaquetado para LG webOS"
echo "========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$BASE_DIR/dist/sample-app"
WEBOS_DIR="$BASE_DIR/webos"
OUTPUT_DIR="$BASE_DIR/dist/packages"

# Verificar que existe el build
if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}Error: No se encontró el directorio de build${NC}"
    echo "Ejecuta primero: npm run build:prod"
    exit 1
fi

# Crear directorio de salida
mkdir -p "$OUTPUT_DIR"

echo -e "${YELLOW}Paso 1: Copiando archivos a la estructura webOS...${NC}"

# Limpiar y crear directorio webOS
rm -rf "$WEBOS_DIR/dist"
mkdir -p "$WEBOS_DIR/dist"

# Copiar archivos del build
cp -r "$DIST_DIR"/* "$WEBOS_DIR/dist/"

echo -e "${GREEN}✓ Archivos copiados${NC}"

echo -e "${YELLOW}Paso 2: Verificando configuración webOS...${NC}"

# Verificar que existe appinfo.json
if [ ! -f "$WEBOS_DIR/appinfo.json" ]; then
    echo -e "${RED}Error: No se encontró appinfo.json en $WEBOS_DIR${NC}"
    exit 1
fi

# Verificar que existe icon.png
if [ ! -f "$WEBOS_DIR/icon.png" ]; then
    echo -e "${YELLOW}Advertencia: No se encontró icon.png, se creará un ícono por defecto${NC}"
fi

echo -e "${GREEN}✓ Configuración verificada${NC}"

echo -e "${YELLOW}Paso 3: Empaquetando aplicación...${NC}"

# Verificar si ares-package está instalado
if ! command -v ares-package &> /dev/null; then
    echo -e "${RED}Error: ares-package no está instalado${NC}"
    echo "Instala webOS CLI tools:"
    echo "  npm install -g @webosose/ares-cli"
    exit 1
fi

# Empaquetar usando ares-package
cd "$BASE_DIR"
APP_NAME=$(grep -o '"id": *"[^"]*"' "$WEBOS_DIR/appinfo.json" | cut -d'"' -f4)
VERSION=$(grep -o '"version": *"[^"]*"' "$WEBOS_DIR/appinfo.json" | cut -d'"' -f4)
PACKAGE_NAME="${APP_NAME}_${VERSION}_all.ipk"

ares-package "$WEBOS_DIR" -o "$OUTPUT_DIR"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Empaquetado completado${NC}"
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}Paquete creado exitosamente:${NC}"
    echo -e "${GREEN}$OUTPUT_DIR/$PACKAGE_NAME${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo "Para instalar en un dispositivo webOS:"
    echo "  1. Conecta tu TV LG a la misma red"
    echo "  2. Activa el modo desarrollador en la TV"
    echo "  3. Ejecuta: ares-setup-device"
    echo "  4. Ejecuta: ares-install --device <nombre-tv> $OUTPUT_DIR/$PACKAGE_NAME"
    echo ""
else
    echo -e "${RED}Error durante el empaquetado${NC}"
    exit 1
fi
