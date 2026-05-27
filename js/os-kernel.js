/**
 * WebOS Kernel - Gestor de Procesos, Ventanas y Multitarea
 */

const OSKernel = {
    activeWindows: new Map(), // Almacena las instancias de ventanas abiertas (PID -> Datos)
    zIndexCounter: 100,       // Controla qué ventana se dibuja al frente

    /**
     * Crea y renderiza una nueva ventana flotante (Proceso)
     * @param {string} id - Identificador único del proceso (PID)
     * @param {string} title - Título que se mostrará en la cabecera
     * @param {string} contentHtml - HTML interno de la aplicación
     */
    createWindow(id, title, contentHtml) {
        // Si el proceso ya existe, lo enfocamos al frente en lugar de duplicarlo
        if (this.activeWindows.has(id)) {
            this.focusWindow(id);
            return;
        }

        this.zIndexCounter++;

        // 1. Fabricar el contenedor principal de la ventana con las clases CSS premium
        const win = document.createElement('div');
        win.id = `win-${id}`;
        win.className = 'window';
        win.style.zIndex = this.zIndexCounter;
        
        // Posicionamiento en cascada inicial para que no se solapen exactamente
        const offset = (this.activeWindows.size * 25) % 200;
        win.style.top = `${100 + offset}px`;
        win.style.left = `${150 + offset}px`;

        // 2. Inyectar la estructura de la ventana (Cabecera, Botones estilo gema, Cuerpo)
        win.innerHTML = `
            <div class="window-header">
                <span class="window-title">${title}</span>
                <div class="window-controls">
                    <button class="btn-minimize" title="Minimizar">_</button>
                    <button class="btn-maximize" title="Maximizar">[]</button>
                    <button class="btn-close" title="Cerrar">X</button>
                </div>
            </div>
            <div class="window-body">${contentHtml}</div>
        `;

        // 3. Agregar la ventana al Escritorio
        document.getElementById('desktop').appendChild(win);

        // 4. Registrar el proceso en el mapa del Kernel
        this.activeWindows.set(id, {
            element: win,
            isMaximized: false
        });

        // 5. Agregar la ventana al Dock inferior (Isla Activa)
        this.addToTaskbar(id, title);

        // 6. Vincular eventos de interacción de bajo nivel
        this.setupWindowEvents(id);
        
        // 7. INTERCONEXIÓN CON EL TRADUCTOR: Escanear el cuerpo si el motor existe
        if (window.OSTranslator && typeof window.OSTranslator.tokenizeContent === 'function') {
            const bodyEl = win.querySelector('.window-body');
            window.OSTranslator.tokenizeContent(bodyEl);
        }
    },

    /**
     * Hace que la ventana sea arrastrable y vincula sus botones de control
     */
    setupWindowEvents(id) {
        const win = document.getElementById(`win-${id}`);
        const header = win.querySelector('.window-header');

        // Enfocar al hacer click en cualquier parte de la ventana
        win.addEventListener('mousedown', () => this.focusWindow(id));

        // --- LÓGICA DE ARRASTRE (DRAG & DROP) ---
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        header.addEventListener('mousedown', (e) => {
            // Evitar arrastrar si se hace click en los botones de control
            if (e.target.closest('.window-controls')) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = win.offsetLeft;
            initialTop = win.offsetTop;
            
            this.focusWindow(id);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            // No permitir arrastrar si la ventana está maximizada
            if (this.activeWindows.get(id).isMaximized) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            win.style.left = `${initialLeft + dx}px`;
            win.style.top = `${initialTop + dy}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // --- BOTONES DE CONTROL ---
        win.querySelector('.btn-close').onclick = () => this.closeWindow(id);
        
        win.querySelector('.btn-maximize').onclick = () => {
            const winData = this.activeWindows.get(id);
            if (winData.isMaximized) {
                win.classList.remove('maximized');
                win.style.top = winData.oldTop;
                win.style.left = winData.oldLeft;
                win.style.width = winData.oldWidth;
                win.style.height = winData.oldHeight;
                winData.isMaximized = false;
            } else {
                // Guardar dimensiones anteriores antes de estirar
                winData.oldTop = win.style.top;
                winData.oldLeft = win.style.left;
                winData.oldWidth = win.style.width;
                winData.oldHeight = win.style.height;

                win.classList.add('maximized');
                win.style.top = '0';
                win.style.left = '0';
                win.style.width = '100vw';
                win.style.height = 'calc(100vh - 105px)'; // Respeta el espacio del Dock flotante
                winData.isMaximized = true;
            }
        };

        win.querySelector('.btn-minimize').onclick = () => {
            win.style.display = 'none'; // Ocultar visualmente, se restaura desde el Dock
        };
    },

    /**
     * Trae una ventana al frente visual
     */
    focusWindow(id) {
        const winData = this.activeWindows.get(id);
        if (!winData) return;

        this.zIndexCounter++;
        winData.element.style.zIndex = this.zIndexCounter;

        // Si estaba oculta por minimizar, la muestra
        if (winData.element.style.display === 'none') {
            winData.element.style.display = 'flex';
        }

        // Marcar el botón del Dock como activo
        document.querySelectorAll('.taskbar-item').forEach(item => item.classList.remove('active'));
        const dockItem = document.getElementById(`dock-${id}`);
        if (dockItem) dockItem.classList.add('active');
    },

    /**
     * Termina el proceso y limpia los contenedores
     */
    closeWindow(id) {
        const winData = this.activeWindows.get(id);
        if (!winData) return;

        // Remover del DOM
        winData.element.remove();
        const dockItem = document.getElementById(`dock-${id}`);
        if (dockItem) dockItem.remove();

        // Eliminar del mapa del núcleo
        this.activeWindows.delete(id);
    },

    /**
     * Registra el proceso en la barra de tareas flotante (Dock)
     */
    addToTaskbar(id, title) {
        const activeAppsContainer = document.getElementById('active-apps');
        if (!activeAppsContainer) return;

        const btn = document.createElement('button');
        btn.id = `dock-${id}`;
        btn.className = 'taskbar-item active';
        btn.innerText = title;

        btn.onclick = () => {
            const winData = this.activeWindows.get(id);
            // Si está al frente y visible, la minimiza. Si no, la trae al frente.
            if (winData.element.style.display !== 'none' && parseInt(winData.element.style.zIndex) === this.zIndexCounter) {
                winData.element.style.display = 'none';
                btn.classList.remove('active');
            } else {
                this.focusWindow(id);
            }
        };

        activeAppsContainer.appendChild(btn);
    }
};

// Registrar el Kernel en el entorno global
window.OSKernel = OSKernel;