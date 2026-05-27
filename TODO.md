# TODO - Rufus host launch fixes

- [x] Inspeccionar el flujo de apertura de Rufus desde `js/main.js` (usa `window.OSPortableConnector` y endpoint `/launch`).
- [x] Inspeccionar el puente nativo `js/apps/server.js` (endpoint/puerto/command mapping).
- [x] Corregir/validar el comando de Rufus en el puente nativo para que falle con error claro si falta el EXE.
- [ ] Asegurar que el comando generado sea consistente (check de `{exe}` / comillas / start "").
- [ ] Reordenar scripts en `index.html` si se confirma conflicto entre `os-kernel.js` y `main.js` (solo si hace falta).
- [ ] Probar manualmente llamando al endpoint `POST http://localhost:3000/launch` con `{app:'rufus'}` y revisar logs del servidor.

