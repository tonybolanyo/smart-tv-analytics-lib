# Guía de Empaquetado para Smart TVs

Esta guía detalla el proceso completo para empaquetar e instalar la aplicación de ejemplo en dispositivos Samsung Tizen y LG webOS.

## 📑 Contenido

- [Empaquetado para webOS (LG)](#empaquetado-para-webos-lg)
- [Empaquetado para Tizen (Samsung)](#empaquetado-para-tizen-samsung)
- [Instalación en Dispositivos](#instalación-en-dispositivos)
- [Depuración](#depuración)
- [Solución de Problemas](#solución-de-problemas)

---

## 📺 Empaquetado para webOS (LG)

### Requisitos Previos

1. **Instalar webOS CLI Tools**

```bash
npm install -g @webosose/ares-cli
```

2. **Verificar instalación**

```bash
ares-package --version
```

### Preparar el Proyecto

1. **Actualizar configuración de la app**

Edita `webos/appinfo.json`:

```json
{
  "id": "com.tuempresa.tuapp",          // Identificador único
  "version": "1.0.0",                    // Versión de tu app
  "vendor": "Tu Empresa",                // Nombre de tu empresa
  "title": "Nombre de tu App",           // Título visible
  "appDescription": "Descripción",       // Descripción
  "icon": "icon.png"                     // Ícono (117x117px)
}
```

2. **Agregar ícono de la aplicación**

Coloca un archivo `icon.png` (117x117 píxeles) en el directorio `webos/`:

```bash
# Ejemplo con ImageMagick
convert -size 117x117 xc:blue -fill white -gravity center \
  -pointsize 24 -annotate +0+0 'App' webos/icon.png
```

### Compilar y Empaquetar

1. **Compilar la aplicación**

```bash
npm run build:webos
```

2. **Crear el paquete IPK**

```bash
npm run package:webos
```

O manualmente:

```bash
# Desde el directorio raíz de sample-app
ares-package webos -o dist/packages
```

Esto creará un archivo `.ipk` en `dist/packages/`.

### Estructura del Paquete webOS

```
webos/
├── appinfo.json       # Configuración de la app
├── icon.png          # Ícono de la app (117x117px)
└── dist/             # Archivos compilados de Angular
    ├── index.html
    ├── *.js
    └── assets/
```

---

## 🔷 Empaquetado para Tizen (Samsung)

### Requisitos Previos

1. **Instalar Tizen Studio**

Descarga desde: https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html

2. **Configurar PATH**

Agrega Tizen CLI al PATH (generalmente en `~/tizen-studio/tools/ide/bin`):

```bash
# En ~/.bashrc o ~/.zshrc
export PATH=$PATH:~/tizen-studio/tools/ide/bin
export PATH=$PATH:~/tizen-studio/tools
```

3. **Verificar instalación**

```bash
tizen version
sdb version
```

### Configurar Certificados

Las aplicaciones Tizen deben estar firmadas. Necesitas crear un perfil de certificado:

1. **Crear certificado de autor**

```bash
tizen certificate -a MyApp -p MyPassword -c ES -s Madrid -ct Madrid -o "Tu Empresa" -n "Tu Nombre" -e tu@email.com
```

2. **Crear perfil de seguridad**

```bash
tizen security-profiles add -n MyProfile -a ~/tizen-studio-data/keystore/author/MyApp.p12 -p MyPassword
```

3. **Verificar perfil**

```bash
tizen security-profiles list
```

### Preparar el Proyecto

1. **Actualizar configuración de la app**

Edita `tizen/config.xml`:

```xml
<widget xmlns="http://www.w3.org/ns/widgets" 
        id="http://tudominio.org/TuApp" 
        version="1.0.0">
    
    <tizen:application id="TuApp.TuApp" 
                       package="TuApp" 
                       required_version="2.4"/>
    
    <name>Nombre de tu App</name>
    <description>Descripción de tu aplicación</description>
    <author href="http://tudominio.org" email="tu@email.com">
        Tu Nombre
    </author>
    
    <content src="dist/index.html"/>
    <icon src="icon.png"/>
</widget>
```

2. **Agregar ícono de la aplicación**

Coloca un archivo `icon.png` (512x512 píxeles) en el directorio `tizen/`:

```bash
# Ejemplo con ImageMagick
convert -size 512x512 xc:blue -fill white -gravity center \
  -pointsize 72 -annotate +0+0 'App' tizen/icon.png
```

### Compilar y Empaquetar

1. **Compilar la aplicación**

```bash
npm run build:tizen
```

2. **Crear el paquete WGT**

**Opción A: Usando el script (recomendado)**

Primero, edita `scripts/build-tizen.sh` y reemplaza `<your-certificate-profile>` con el nombre de tu perfil:

```bash
tizen package -t wgt -s MyProfile
```

Luego ejecuta:

```bash
npm run package:tizen
```

**Opción B: Manualmente**

```bash
cd tizen
tizen package -t wgt -s MyProfile
mv *.wgt ../dist/packages/
```

Esto creará un archivo `.wgt` en `dist/packages/`.

### Estructura del Paquete Tizen

```
tizen/
├── config.xml        # Configuración de la app
├── icon.png         # Ícono de la app (512x512px)
└── dist/            # Archivos compilados de Angular
    ├── index.html
    ├── *.js
    └── assets/
```

---

## 🔌 Instalación en Dispositivos

### Instalar en webOS (LG TV)

1. **Activar modo desarrollador en la TV**

   - Abre la LG Content Store
   - Busca "Developer Mode"
   - Instala y abre la aplicación
   - Activa el modo desarrollador
   - Anota la dirección IP de la TV

2. **Configurar dispositivo**

```bash
ares-setup-device
```

Sigue las instrucciones para agregar tu TV:
- Nombre: `myLGTV`
- IP: La IP de tu TV
- Puerto: `9922` (por defecto)
- Usuario: `prisoner`
- Contraseña: (dejar vacío)

3. **Instalar aplicación**

```bash
ares-install --device myLGTV dist/packages/com.example.smarttvanalytics_1.0.0_all.ipk
```

4. **Lanzar aplicación**

```bash
ares-launch --device myLGTV com.example.smarttvanalytics
```

### Instalar en Tizen (Samsung TV)

1. **Activar modo desarrollador en la TV**

   - En el control remoto, ingresa: `12345` (o accede a Apps)
   - Busca "Developer Mode" en Apps
   - Instala y abre
   - Activa el modo desarrollador
   - Ingresa la IP de tu PC
   - Reinicia la TV

2. **Conectar al dispositivo**

```bash
sdb connect <IP-de-la-TV>:26101
```

Verifica la conexión:

```bash
sdb devices
```

Deberías ver tu TV listada.

3. **Instalar aplicación**

```bash
tizen install -n dist/packages/TuApp.wgt -t <nombre-del-dispositivo>
```

4. **Lanzar aplicación**

```bash
tizen run -p TuApp.TuApp -t <nombre-del-dispositivo>
```

---

## 🐛 Depuración

### Depurar en webOS

1. **Inspector Web**

```bash
ares-inspect --device myLGTV --app com.example.smarttvanalytics
```

Esto abrirá Chrome DevTools conectado a tu app en la TV.

2. **Ver logs**

```bash
ares-log --device myLGTV
```

### Depurar en Tizen

1. **Inspector Web**

En Chrome/Chromium, navega a:
```
chrome://inspect
```

O específicamente para Tizen:
```
http://<IP-de-la-TV>:9999
```

2. **Ver logs**

```bash
sdb dlog SmartTVAnalyticsSample
```

---

## 🔧 Solución de Problemas

### webOS

**Error: "ares-package: command not found"**

Solución:
```bash
npm install -g @webosose/ares-cli
```

**Error: "Connection refused"**

- Verifica que el modo desarrollador esté activo en la TV
- Verifica la IP de la TV
- Asegúrate de que TV y PC estén en la misma red

**Error al instalar: "Unknown error"**

- Desinstala la versión anterior primero:
  ```bash
  ares-install --device myLGTV --remove com.example.smarttvanalytics
  ```

### Tizen

**Error: "Author certificate is not found"**

Solución: Crea un certificado siguiendo la sección [Configurar Certificados](#configurar-certificados)

**Error: "sdb: not found"**

Solución: Agrega Tizen CLI al PATH:
```bash
export PATH=$PATH:~/tizen-studio/tools
```

**Error: "Device not found"**

- Verifica que el modo desarrollador esté activo
- Reinicia la TV después de activar modo desarrollador
- Verifica la conexión: `sdb connect <IP>:26101`

**Error al firmar: "Invalid password"**

Solución: Verifica la contraseña del certificado o crea uno nuevo.

---

## 📚 Recursos Adicionales

### webOS

- [webOS Developer Documentation](https://webostv.developer.lge.com/)
- [ares CLI Reference](https://webostv.developer.lge.com/develop/tools/cli-dev-guide)
- [webOS App Testing](https://webostv.developer.lge.com/develop/app-test/using-devmode-app)

### Tizen

- [Tizen Developer Documentation](https://developer.samsung.com/smarttv/develop/specifications/tv-model-groups.html)
- [Tizen CLI Guide](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/command-line-interface.html)
- [Certificate Management](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html)

---

## 💡 Consejos

1. **Versionado**: Incrementa la versión en `appinfo.json` / `config.xml` con cada build
2. **Íconos**: Usa íconos de alta calidad para mejor apariencia
3. **Testing**: Prueba en el dispositivo real, los emuladores no siempre reflejan el comportamiento real
4. **Permisos**: Declara solo los permisos necesarios
5. **Tamaño**: Minimiza el tamaño del paquete eliminando archivos innecesarios
6. **Red**: Ambas plataformas requieren permisos de internet para analytics

---

## 🎯 Checklist de Empaquetado

### webOS
- [ ] webOS CLI instalado
- [ ] `appinfo.json` configurado
- [ ] Ícono 117x117px agregado
- [ ] Build compilado
- [ ] Dispositivo configurado
- [ ] Paquete IPK creado
- [ ] App instalada y probada

### Tizen
- [ ] Tizen Studio instalado
- [ ] Certificado de autor creado
- [ ] Perfil de seguridad configurado
- [ ] `config.xml` configurado
- [ ] Ícono 512x512px agregado
- [ ] Build compilado
- [ ] Dispositivo conectado
- [ ] Paquete WGT creado y firmado
- [ ] App instalada y probada
