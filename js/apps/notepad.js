/**
 * NextLang OS Application: Bloc de Notas (Notepad v3.0 - Persistente VFS)
 */

const AppNotepad = {
    instanceCount: 0,

    /**
     * Abre una instancia del Bloc de Notas
     * @param {string} initialText - Texto inicial que se cargará en el editor
     * @param {string} fileName - Nombre del archivo actual
     */
    open(initialText = "", fileName = "untitled.txt") {
        this.instanceCount++;
        const appId = `notepad-${this.instanceCount}`;
        const title = `Notepad - ${fileName}`;

        // Plantilla interactiva con barra de herramientas superior y área de texto libre
        const htmlContent = `
            <div class="notepad-wrapper" style="display: flex; flex-direction: column; height: 100%; gap: 10px;">
                <div class="notepad-toolbar" style="display: flex; gap: 10px; align-items: center; background: rgba(0,0,0,0.2); padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <span style="font-size: 11px; color: rgba(255,255,255,0.4); font-family: monospace;">File Name:</span>
                    <input type="text" class="np-filename" value="${fileName}" placeholder="document.txt" style="
                        background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff;
                        padding: 3px 8px; border-radius: 6px; font-size: 11px; font-family: monospace; width: 140px; outline: none;
                    ">
                    <button class="np-save-btn" style="
                        background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.4); color: #818cf8;
                        padding: 3px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;
                        margin-left: auto;
                    }">💾 Save to VFS</button>
                </div>

                <textarea class="notepad-textarea" style="
                    flex: 1; background: rgba(0, 0, 0, 0.15); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 10px; color: rgba(255,255,255,0.9); padding: 12px; font-family: 'Courier New', Courier, monospace;
                    font-size: 13px; resize: none; outline: none; line-height: 1.5;
                }">${initialText}</textarea>
            </div>
        `;

        if (window.OSKernel) {
            window.OSKernel.createWindow(appId, title, htmlContent);
            
            // Forzar proporciones cómodas en pantalla para edición de código o texto
            const winEl = document.getElementById(`win-${appId}`);
            if (winEl) {
                winEl.style.width = '440px';
                winEl.style.height = '340px';
            }

            this.setupEvents(appId);
        }
    },

    /**
     * Gestiona la lógica de guardado y empaquetado de inodos en el almacenamiento físico simulado
     */
    setupEvents(appId) {
        const winEl = document.getElementById(`win-${appId}`);
        if (!winEl) return;

        const saveBtn = winEl.querySelector('.np-save-btn');
        const filenameInput = winEl.querySelector('.np-filename');
        const textarea = winEl.querySelector('.notepad-textarea');

        // Efectos dinámicos hover sobre el botón de guardado
        saveBtn.onmouseover = () => { saveBtn.style.background = '#6366f1'; saveBtn.style.color = '#fff'; };
        saveBtn.onmouseout = () => { saveBtn.style.background = 'rgba(99, 102, 241, 0.2)'; saveBtn.style.color = '#818cf8'; };

        // Operación de Escritura en Bloque (I/O)
        saveBtn.onclick = () => {
            let name = filenameInput.value.trim();
            const textContent = textarea.value;

            if (name === "") {
                alert("Please enter a valid file name.");
                return;
            }

            // Sanitización de extensiones
            if (!name.endsWith('.txt')) {
                name += '.txt';
                filenameInput.value = name;
            }

            // Interconexión de Capas: Escribir directo en la estructura persistente del explorador
            if (window.AppExplorer) {
                const disk = window.AppExplorer.getDisk();
                const currentNode = window.AppExplorer.getCurrentNode(disk);

                // Construcción o actualización del Inodo del archivo
                currentNode[name] = {
                    "type": "file",
                    "metadata": {
                        // Preservar la fecha de creación si el archivo ya existía, o asignar una nueva
                        created: currentNode[name] ? currentNode[name].metadata.created : new Date().toLocaleString(),
                        // Medición real del tamaño del string codificado en memoria
                        size: new Blob([textContent]).size
                    },
                    "content": textContent
                };

                // Commitear cambios en el almacenamiento local del navegador
                window.AppExplorer.saveDisk(disk);

                // Actualizar el título de la ventana activa para reflejar el nombre actual
                const titleEl = winEl.querySelector('.window-title');
                if (titleEl) titleEl.innerText = `Notepad.exe - ${name}`;

                // Forzar refresco asíncrono de la interfaz gráfica del Explorador si está abierto en segundo plano
                if (typeof window.AppExplorer.refresh === 'function') {
                    window.AppExplorer.refresh();
                }

                // Feedback visual de escritura exitosa en el hilo de la UI
                const originalText = saveBtn.innerText;
                saveBtn.innerText = "✓ Saved to VFS";
                saveBtn.style.background = '#27c93f';
                saveBtn.style.borderColor = '#27c93f';
                saveBtn.style.color = '#fff';

                setTimeout(() => {
                    saveBtn.innerText = originalText;
                    saveBtn.style.background = 'rgba(99, 102, 241, 0.2)';
                    saveBtn.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                    saveBtn.style.color = '#818cf8';
                }, 1200);

            } else {
                alert("Kernel Error: The File Explorer (VFS) module is not loaded.");
            }
        };
    }
};

// Exponer la aplicación globalmente en el scope del sistema operativo
window.AppNotepad = AppNotepad;