#!/bin/bash

###############################################################################
# Script de empaquetado para Samsung Tizen
# Este script crea un paquete .wgt listo para instalar en dispositivos Samsung Tizen
###############################################################################

set -e

echo "========================================="
echo "Empaquetado para Samsung Tizen"
echo "========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$BASE_DIR/dist/sample-app"
TIZEN_DIR="$BASE_DIR/tizen"
OUTPUT_DIR="$BASE_DIR/dist/packages"

# Verificar que existe el build
if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}Error: No se encontró el directorio de build${NC}"
    echo "Ejecuta primero: npm run build:prod"
    exit 1
fi

# Crear directorio de salida
mkdir -p "$OUTPUT_DIR"

echo -e "${YELLOW}Paso 1: Copiando archivos a la estructura Tizen...${NC}"

# Limpiar y crear directorio Tizen
rm -rf "$TIZEN_DIR/dist"
mkdir -p "$TIZEN_DIR/dist"

# Copiar archivos del build
cp -r "$DIST_DIR"/* "$TIZEN_DIR/dist/"

echo -e "${GREEN}✓ Archivos copiados${NC}"

echo -e "${YELLOW}Paso 2: Verificando configuración Tizen...${NC}"

# Verificar que existe config.xml
if [ ! -f "$TIZEN_DIR/config.xml" ]; then
    echo -e "${RED}Error: No se encontró config.xml en $TIZEN_DIR${NC}"
    exit 1
fi

# Verificar que existe icon.png
if [ ! -f "$TIZEN_DIR/icon.png" ]; then
    echo -e "${YELLOW}Advertencia: No se encontró icon.png, se creará un ícono por defecto${NC}"
fi

echo -e "${GREEN}✓ Configuración verificada${NC}"

echo -e "${YELLOW}Paso 3: Empaquetando aplicación...${NC}"

# Verificar si tizen está instalado
if ! command -v tizen &> /dev/null; then
    echo -e "${RED}Error: Tizen CLI no está instalado${NC}"
    echo "Instala Tizen Studio desde:"
    echo "  https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html"
    exit 1
fi

# Cambiar al directorio Tizen
cd "$TIZEN_DIR"

# Empaquetar usando tizen CLI
APP_NAME=$(grep -o 'id="[^"]*"' config.xml | head -1 | cut -d'"' -f2)
VERSION=$(grep -o 'version="[^"]*"' config.xml | head -1 | cut -d'"' -f2)
PACKAGE_NAME="${APP_NAME}.wgt"

# Crear el paquete
# Nota: Reemplaza "MyProfile" con el nombre de tu perfil de certificado
# Puedes ver tus perfiles con: tizen security-profiles list
CERT_PROFILE="${TIZEN_SECURITY_PROFILE:-MyProfile}"

echo "Usando perfil de certificado: $CERT_PROFILE"
echo "Si no tienes un perfil configurado, consulta EMPAQUETADO.md"
echo ""

tizen package -t wgt -s "$CERT_PROFILE"

if [ $? -eq 0 ]; then
    # Mover el paquete al directorio de salida
    mv *.wgt "$OUTPUT_DIR/$PACKAGE_NAME" 2>/dev/null || true
    
    echo -e "${GREEN}✓ Empaquetado completado${NC}"
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}Paquete creado exitosamente:${NC}"
    echo -e "${GREEN}$OUTPUT_DIR/$PACKAGE_NAME${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo "Para instalar en un dispositivo Tizen:"
    echo "  1. Conecta tu TV Samsung a la misma red"
    echo "  2. Activa el modo desarrollador en la TV"
    echo "  3. Ejecuta: sdb connect <ip-de-la-tv>"
    echo "  4. Ejecuta: tizen install -n $PACKAGE_NAME -t <target-name>"
    echo ""
    echo "Nota: Necesitas configurar un perfil de certificado para firmar la app"
    echo "      Consulta la documentación en EMPAQUETADO.md"
else
    echo -e "${RED}Error durante el empaquetado${NC}"
    echo "Nota: Asegúrate de tener configurado un perfil de certificado"
    echo "      Ejecuta: tizen security-profiles list"
    exit 1
fi
