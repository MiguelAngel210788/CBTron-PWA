# CBTron PWA

Distribución pública de la carcasa instalable de CBTron.

Este repositorio contiene únicamente los archivos estáticos necesarios para instalar la aplicación:
- `index.html`
- `config.js`
- `manifest.webmanifest`
- `sw.js`
- iconos PNG
- flujo de publicación de GitHub Pages

El código fuente, los documentos, las pruebas y los archivos de Google Apps Script se mantienen en el repositorio privado `CBTron`.

## Publicación

La rama `main` se publica con GitHub Actions. En la primera configuración del repositorio, abre:

**Settings > Pages > Build and deployment > Source > GitHub Actions**

Después, revisa el flujo **Deploy CBTron PWA** en **Actions**. La URL esperada es:

`https://miguelangel210788.github.io/CBTron-PWA/`

La carcasa solicita la URL pública `/exec` de Google Apps Script en el primer acceso y la conserva únicamente en el dispositivo.
