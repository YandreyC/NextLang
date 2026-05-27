/**
 * WebOS Application: Explorador de Archivos Virtual
 */

const AppExplorer = {
    // Disco duro simulado en memoria
    fileSystem: {
        "root": {
            "Documents": {
                "welcome.txt": "Welcome to your new futuristic operating system. Hover your mouse here to test the system.",
                "features.txt": "This system features process management, a virtual file system, and an automatic translation module.",
                "readme.txt": "Project requirements: Built completely with vanilla HTML, CSS, and modern JavaScript."
            },
            "System_Logs": {
                "kernel.txt": "Kernel status: Running. Memory allocation: Stable. All systems nominal.",
                "security.txt": "Firewall status: Active. No unauthorized access detected in the environment."
            }
        }
    },
    
    currentPath: ["root"], // Rastro de la carpeta actual

    /**
     * Abre el Explorador de Archivos
     */
    open() {
        const appId = 'explorer';
        const title = 'Explorador de Archivos';
        this.currentPath = ["root"]; // Reiniciar a la raíz al abrir

        if (window.OSKernel) {
            window.OSKernel.createWindow(appId, title, this.renderDiskContent());
            this.setupEvents();
        }
    },

    /**
     * Navega hacia el directorio actual y genera el HTML de carpetas y archivos
     */
    renderDiskContent() {
        // Obtener el objeto del directorio actual recorriendo el path
        let currentDir = this.fileSystem;
        for (const folder of this.currentPath) {
            currentDir = currentDir[folder];
        }

        // Crear la barra de navegación superior
        let html = `
            <div class="explorer-wrapper" style="display: flex; flex-direction: column; height: 100%;">
                <div class="explorer-nav" style="display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 10px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);">
                    <button id="exp-back" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 11px;">⬅ Atrás</button>
                    <span style="color: rgba(255,255,255,0.5); font-size: 12px; font-family: monospace;">/${this.currentPath.join('/')}</span>
                </div>
                <div class="explorer-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 20px; flex: 1; overflow-y: auto;">
        `;

        // Renderizar subcarpetas o archivos internos
        for (const key in currentDir) {
            const isFolder = typeof currentDir[key] === 'object';
            
            // Icono SVG según si es carpeta (Violeta) o archivo TXT (Azul)
            const iconSvg = isFolder 
                ? `<svg viewBox="0 0 24 24" style="width: 40px; height: 40px;"><path fill="#a855f7" d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0 0 4,20H20A2,2 0 0 0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/></svg>`
                : `<svg viewBox="0 0 24 24" style="width: 40px; height: 40px;"><path fill="#6366f1" d="M14,2H6A2,2 0 0 0 4,4V20A2,2 0 0 0 6,21H18A2,2 0 0 0 20,19V8L14,2M13,3.5L18.5,9H13V3.5M6,19V4H12V10H18V19H6Z"/></svg>`;

            html += `
                <div class="file-item" data-name="${key}" data-type="${isFolder ? 'folder' : 'file'}" style="display: flex; flex-direction: column; align-items: center; text-align: center; cursor: pointer; padding: 8px; border-radius: 10px; transition: background 0.2s;">
                    <div style="margin-bottom: 5px;">${iconSvg}</div>
                    <span style="font-size: 11px; color: rgba(255,255,255,0.8); word-break: break-all; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${key}</span>
                </div>
            `;
        }

        html += `</div></div>`;
        return html;
    },

    /**
     * Vincula los eventos de clic, doble clic y el botón atrás
     */
    setupEvents() {
        const winEl = document.getElementById('win-explorer');
        if (!winEl) return;

        // Botón Atrás
        const backBtn = winEl.querySelector('#exp-back');
        if (backBtn) {
            backBtn.onclick = () => {
                if (this.currentPath.length > 1) {
                    this.currentPath.pop();
                    this.refresh();
                }
            };
        }

        // Doble clic en los elementos de la rejilla
        const items = winEl.querySelectorAll('.file-item');
        items.forEach(item => {
            // Efecto hover visual controlado por JS
            item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.05)';
            item.onmouseout = () => item.style.background = 'transparent';

            item.ondblclick = () => {
                const name = item.getAttribute('data-name');
                const type = item.getAttribute('data-type');

                if (type === 'folder') {
                    this.currentPath.push(name);
                    this.refresh();
                } else if (type === 'file') {
                    this.openFileWithNotepad(name);
                }
            };
        });
    },

    /**
     * Actualiza la ventana sin destruirla por completo
     */
    refresh() {
        const winBody = document.querySelector('#win-explorer .window-body');
        if (winBody) {
            winBody.innerHTML = this.renderDiskContent();
            this.setupEvents();
        }
    },

    /**
     * Interconectividad de Procesos: Abre el bloc de notas pasando el texto del archivo
     */
    openFileWithNotepad(fileName) {
        // Buscar el contenido del archivo recorriendo el path virtual
        let currentDir = this.fileSystem;
        for (const folder of this.currentPath) {
            currentDir = currentDir[folder];
        }
        const fileText = currentDir[fileName];

        // Forzar al Bloc de Notas a abrir una ventana con este contenido personalizado
        if (window.OSKernel) {
            AppNotepad.instanceCount++;
            const appId = `notepad-${AppNotepad.instanceCount}`;
            const title = `Notepad.exe - ${fileName}`;
            
            // Envolvemos el texto plano en un contenedor limpio
            const formattedContent = `<div class="notepad-container"><p>${fileText}</p></div>`;
            
            window.OSKernel.createWindow(appId, title, formattedContent);
        }
    }
};

// Exponer la app globalmente
window.AppExplorer = AppExplorer;