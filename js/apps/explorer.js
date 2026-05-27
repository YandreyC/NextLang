/**
 * NextLang OS Application: Virtual File System Engine (VFS v3.0)
 * Implementa persistencia real en LocalStorage y metadatos de inodos.
 */

const AppExplorer = {
    // Clave de almacenamiento en el disco físico del navegador
    STORAGE_KEY: "nextlang_vfs",
    
    // Directorio activo en la sesión actual
    currentPath: ["root"],

    /**
     * Inicializa el disco duro virtual. Si no existe, realiza un "formateo" con la estructura base.
     */
    initVFS() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            const defaultDisk = {
                "root": {
                    "type": "directory",
                    "metadata": { created: new Date().toLocaleString(), size: 0 },
                    "content": {
                        "Documents": {
                            "type": "directory",
                            "metadata": { created: new Date().toLocaleString(), size: 0 },
                            "content": {
                                "welcome.txt": {
                                    "type": "file",
                                    "metadata": { created: new Date().toLocaleString(), size: 180 },
                                    "content": "Welcome to NextLang OS. This system now tracks real metadata. Try hovering over words to translate them instantly!"
                                },
                                "architecture.txt": {
                                    "type": "file",
                                    "metadata": { created: new Date().toLocaleString(), size: 95 },
                                    "content": "VFS Layer connected successfully to Browser LocalStorage. Persistence is now fully active."
                                }
                            }
                        },
                        "System": {
                            "type": "directory",
                            "metadata": { created: new Date().toLocaleString(), size: 0 },
                            "content": {
                                "kernel_log.txt": {
                                    "type": "file",
                                    "metadata": { created: new Date().toLocaleString(), size: 54 },
                                    "content": "BOOT_SUCCESS\nVFS_MOUNTED: OK\nSessionManager: Active"
                                }
                            }
                        },
                        "Pictures": {
                            "type": "directory",
                            "metadata": { created: new Date().toLocaleString(), size: 0 },
                            "content": {}
                        }
                    }
                }
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultDisk));
        }
    },

    /**
     * Obtiene el árbol completo de directorios desde el LocalStorage
     */
    getDisk() {
        this.initVFS();
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    },

    /**
     * Guarda el estado actual del árbol en el LocalStorage
     */
    saveDisk(diskStructure) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(diskStructure));
    },

    /**
     * Retorna un puntero al nodo de la ruta actual
     */
    getCurrentNode(disk) {
        let currentNode = disk;
        for (const folder of this.currentPath) {
            if (currentNode[folder] && currentNode[folder].content) {
                currentNode = currentNode[folder].content;
            } else if (currentNode[folder]) {
                currentNode = currentNode[folder]; // Caso raíz
            }
        }
        return currentNode;
    },

    /**
     * Lanza la interfaz gráfica del Explorador
     */
    open() {
        const appId = 'explorer';
        const title = 'Explorador de Archivos (Persistente VFS)';

        if (window.OSKernel) {
            window.OSKernel.createWindow(appId, title, this.getTemplate());
            
            const winEl = document.getElementById(`win-${appId}`);
            if (winEl) {
                winEl.style.width = '560px';
                winEl.style.height = '380px';
            }

            this.setupGlobalEvents(winEl);
            this.refresh();
        }
    },

    getTemplate() {
        return `
            <div class="explorer-wrapper" style="display: flex; flex-direction: column; height: 100%; gap: 12px; color: #fff;">
                <div class="explorer-toolbar" style="display: flex; gap: 8px; align-items: center; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                    <button id="exp-back-btn" style="${this.getBtnStyle()}">← Volver</button>
                    <div id="exp-path-box" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-family: monospace; color: rgba(255,255,255,0.6);">/root</div>
                    <button id="exp-mkdir-btn" style="${this.getBtnStyle('#a855f7')}">+ Nueva Carpeta</button>
                </div>

                <div id="exp-grid-view" style="
                    flex: 1; background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.03); border-radius: 12px;
                    padding: 15px; display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 15px;
                    overflow-y: auto; align-content: start;
                "></div>
            </div>
        `;
    },

    getBtnStyle(color = 'rgba(255,255,255,0.05)') {
        return `background: ${color}; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.2s; font-family: monospace;`;
    },

    /**
     * Vincula eventos que no se destruyen al refrescar el directorio
     */
    setupGlobalEvents(winEl) {
        const mkdirBtn = winEl.querySelector('#exp-mkdir-btn');
        mkdirBtn.onclick = () => {
            const folderName = prompt("Introduce el nombre de la nueva carpeta:").trim();
            if (!folderName || folderName.includes(".") || folderName.includes("/")) {
                alert("Nombre de carpeta inválido.");
                return;
            }

            const disk = this.getDisk();
            const currentNode = this.getCurrentNode(disk);

            if (currentNode[folderName]) {
                alert("Ya existe un directorio o archivo con ese nombre.");
                return;
            }

            // Inyección de un nuevo Inodo de Directorio
            currentNode[folderName] = {
                "type": "directory",
                "metadata": { created: new Date().toLocaleString(), size: 0 },
                "content": {}
            };

            this.saveDisk(disk);
            this.refresh();
        };
    },

    /**
     * Redibuja la interfaz leyendo la estructura del LocalStorage
     */
    refresh() {
        const gridView = document.getElementById('exp-grid-view');
        const pathBox = document.getElementById('exp-path-box');
        const backBtn = document.getElementById('exp-back-btn');

        if (!gridView || !pathBox) return;

        pathBox.innerText = "/" + this.currentPath.join("/");

        // Lógica de navegación hacia atrás
        if (this.currentPath.length <= 1) {
            backBtn.style.opacity = "0.4";
            backBtn.style.cursor = "not-allowed";
            backBtn.onclick = null;
        } else {
            backBtn.style.opacity = "1";
            backBtn.style.cursor = "pointer";
            backBtn.onclick = () => {
                this.currentPath.pop();
                this.refresh();
            };
        }

        const disk = this.getDisk();
        const currentNode = this.getCurrentNode(disk);

        if (Object.keys(currentNode).length === 0) {
            gridView.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.15); font-size: 11px; margin-top: 40px; font-family: monospace;">[ Directorio Vacío ]</div>`;
            return;
        }

        let itemsHtml = "";
        Object.keys(currentNode).forEach(name => {
            const node = currentNode[name];
            const isFolder = node.type === 'directory';
            
            const iconSvg = isFolder 
                ? `<svg viewBox="0 0 24 24" style="width: 38px; height: 38px;"><path fill="#a855f7" d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0 0 4,20H20A2,2 0 0 0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/></svg>`
                : `<svg viewBox="0 0 24 24" style="width: 38px; height: 38px;"><path fill="#38bdf8" d="M14,2H6A2,2 0 0 0 4,4V20A2,2 0 0 0 6,21H18A2,2 0 0 0 20,19V8L14,2M13,3.5L18.5,9H13V3.5M6,19V4H12V10H18V19H6Z"/></svg>`;

            itemsHtml += `
                <div class="exp-item" data-name="${name}" data-type="${node.type}" title="Creado: ${node.metadata.created}\nTamaño: ${node.metadata.size} bytes" style="
                    display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px;
                    padding: 8px; border-radius: 8px; cursor: pointer; transition: background 0.2s; position: relative;
                ">
                    ${iconSvg}
                    <span style="color: rgba(255,255,255,0.8); font-size: 11px; font-family: monospace; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${name}</span>
                </div>
            `;
        });

        gridView.innerHTML = itemsHtml;
        this.bindGridEvents();
    },

    bindGridEvents() {
        const gridItems = document.querySelectorAll('.exp-item');
        gridItems.forEach(item => {
            item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.04)';
            item.onmouseout = () => item.style.background = 'transparent';

            item.ondblclick = () => {
                const name = item.getAttribute('data-name');
                const type = item.getAttribute('data-type');

                if (type === 'directory') {
                    this.currentPath.push(name);
                    this.refresh();
                } else {
                    this.openFileWithNotepad(name);
                }
            };
        });
    },

    /**
     * Interconexión de Procesos para lectura de inodo de archivo
     */
    openFileWithNotepad(fileName) {
        const disk = this.getDisk();
        const currentNode = this.getCurrentNode(disk);
        const fileNode = currentNode[fileName];

        if (window.AppNotepad && fileNode) {
            window.AppNotepad.open(fileNode.content, fileName);
        }
    }
};

// Autoejecución del formateo lógico del disco al cargar el script
AppExplorer.initVFS();
window.AppExplorer = AppExplorer;