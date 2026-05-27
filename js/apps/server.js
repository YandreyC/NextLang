/**
 * NextLang OS - Servidor Puente Anfitrión (Local Backend)
 * Ejecuta aplicaciones reales del sistema mediante peticiones desde el navegador
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');

// Intentar requerir CORS de forma segura para evitar bloqueos del navegador
let cors;
try {
    cors = require('cors')();
} catch (e) {
    console.log("Aviso: Para evitar problemas de bloqueo de red, se recomienda ejecutar: npm install cors");
    cors = (req, res, next) => next();
}

const PORT = 3000;

// Mapeo seguro de aplicaciones permitidas y sus rutas reales en tu computador
// Nota: para Rufus, validamos que el EXE exista antes de ejecutarlo.
const APP_ROUTES = {
    'rufus': {
        exePath: 'C:\\Users\\johan\\Downloads\\rufus-4.14.exe',
        command: 'cmd /c start "" "{exe}"'
    },
    'notepad': { command: 'notepad.exe' },
    'calc': { command: 'calc.exe' },
    'cmd': { command: 'start cmd.exe' }
};

const server = http.createServer((req, res) => {
    // Manejo manual de cabeceras CORS por si no se instaló el módulo npm
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/launch' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const appKey = data.app ? data.app.toLowerCase() : '';

                if (APP_ROUTES[appKey]) {
                    const route = APP_ROUTES[appKey];
                    const command = route.command || '';

                    if (route.exePath) {
                        const ok = fs.existsSync(route.exePath);
                        if (!ok) {
                            const msg = `Rufus/EXE no encontrado en: ${route.exePath}`;
                            console.error(`[Kernel Anfitrión] ${msg}`);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: msg }));
                            return;
                        }
                    }


                    const finalCommand = command.replace('{exe}', route.exePath);
                    console.log(`[Kernel Anfitrión] Intentando lanzar aplicación nativa: ${appKey} via ${finalCommand}`);

                    // Ejecución real en el Sistema Operativo Anfitrión
                    exec(finalCommand, (error) => {
                        if (error) {
                            console.error(`Error al ejecutar la aplicación nativa: ${error.message}`);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: error.message }));
                            return;
                        }
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: `App ${appKey} lanzada con éxito.` }));
                    });
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'La aplicación solicitada no está registrada en el puente seguro.' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Cuerpo de petición inválido.' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    }
});

server.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(` NextLang OS - Servidor Puente Activo en http://localhost:${PORT}`);
    console.log(` Escuchando peticiones del simulador para abrir apps nativas...`);
    console.log(`================================================================`);
});