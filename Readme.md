# NextLang — Entorno tipo "sistema operativo" en el navegador

Proyecto educativo que simula un escritorio/`OS` en el navegador usando HTML, CSS y JavaScript.

Descripción
- Interfaz tipo escritorio con múltiples aplicaciones web integradas (explorador, navegador, bloc de notas, calculadora, reproductor, terminal, etc.).
- Pensado para demos, experimentación y aprendizaje sobre interfaces y apps web ligeras.

Aplicaciones incluidas
- `apps/browser.js`
- `apps/calculator.js`
- `apps/duolingo-app.js`
- `apps/explorer.js`
- `apps/music.js`
- `apps/notepad.js`
- `apps/settings.js`
- `apps/speechling.js`
- `apps/taskmanager.js`
- `apps/terminal.js`
- `apps/users.js`

Estructura del proyecto
- `index.html` — Página principal / entrada al entorno.
- `css/` — Estilos del proyecto (`style.css`, `windows.css`).
- `js/` — Lógica principal (`main.js`, `os-kernel.js`, `translator.js`) y `apps/`.
- `assets/` — Imágenes y fondos.

Cómo usar
- Abrir `index.html` directamente en el navegador.
- Para una experiencia más fiable usar un servidor local (recomendado):

```bash
cd d:/Proyectos/NextLang
python -m http.server 8000
# Abrir http://localhost:8000 en el navegador
```

Desarrollo
- Para agregar una nueva app, crear un archivo en `js/apps/` y seguir la convención usada por las apps existentes.
- Recargar la página para ver cambios; para desarrollo activo, usar una herramienta de live-reload si se desea.

Seguridad y datos sensibles
- Este repositorio no debe contener credenciales en texto plano. El README original incluía usuarios y contraseñas de ejemplo; han sido eliminados por seguridad.
- Gestiona usuarios y contraseñas a través de mecanismos seguros y evita publicarlos en el código fuente.

Contribuciones
- Pull requests: describir el cambio y los archivos afectados.
- Issue: abrir una issue para bugs o propuestas de mejora.

Contacto
- Abre una issue en el repositorio para preguntas o propuestas.
