/**
 * WebOS Kernel - Gestor de Procesos, Ventanas y Multitarea
 * Versión Integrada con OSTranslator v3.2
 */

const OSKernel = {
    activeWindows: new Map(),
    zIndexCounter: 100,

    appIcons: {
        'notepad': `<svg viewBox="0 0 24 24" style="width:20px; height:20px;"><path fill="#6366f1" d="M14,2H6A2,2 0 0 0 4,4V20A2,2 0 0 0 6,21H18A2,2 0 0 0 20,19V8L14,2M13,3.5L18.5,9H13V3.5M6,19V4H12V10H18V19H6Z"/></svg>`,
        'calculator': `<svg viewBox="0 0 24 24" style="width:20px; height:20px;"><path fill="#d946ef" d="M7,2H17A2,2 0 0 1 19,4V20A2,2 0 0 1 17,22H7A2,2 0 0 1 5,20V4A2,2 0 0 1 7,2H7M7,4V6H9V4H7M11,4V6H13V4H11M15,4V6H17V4H15M7,8V10H9V8H7M11,8V10H13V8H11M15,8V10H17V8H15M7,12V14H9V12H7M11,12V14H13V12H11M15,12V16H17V12H15M7,16V20H13V16H7Z"/></svg>`,
        'explorer': `<svg viewBox="0 0 24 24" style="width:20px; height:20px;"><path fill="#a855f7" d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0 0 4,20H20A2,2 0 0 0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/></svg>`,
        'terminal': `<svg viewBox="0 0 24 24" style="width:20px; height:20px;"><path fill="#27c93f" d="M20,19H4A2,2 0 0 1 2,17V7A2,2 0 0 1 4,5H20A2,2 0 0 1 22,7V17A2,2 0 0 1 20,19M4,7V17H20V7H4M6,9H11V11H6V9M6,13H14V15H6V13Z"/></svg>`,
        'taskmanager': `<svg viewBox="0 0 24 24" style="width:20px; height:20px;"><path fill="#ff5f56" d="M19,3H5C3.89,3 3,3.89 3,4V20A2,2 0 0 0 5,22H19A2,2 0 0 0 21,20V4C21,3.89 20.1,3 19,3M19,20H5V4H19V20M7,12H9V17H7V12M11,7H13V17H11V7M15,10H17V17H15V10Z"/></svg>`,
        'browser': `<svg viewBox="0 0 24 24" style="width:20px; height:20px;"><path fill="#38bdf8" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12C4,15.11 5.78,17.81 8.39,19.16L11.5,13.78C10.6,13.43 10,12.54 10,11.5A2,2 0 0 1 12,9.5C12.8,9.5 13.5,10 13.84,10.68L17.74,7.44C16.37,5.33 14.05,4 12,4M19.93,11A8,8 0 0,0 12,4.07V7.5C13,7.5 13.9,8 14.44,8.77L11.5,13.87C11.66,13.95 11.83,14 12,14A2,2 0 0 1 14,12C14,11.23 13.57,10.57 12.93,10.23L16.41,4.2C18.6,5.55 20,11 19.93,11Z"/></svg>`,
        'settings': `<svg viewBox="0 0 24 24" style="width:20px; height:20px;"><path fill="#94a3b8" d="M12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15M19.62,12.25C19.66,12 19.67,11.75 19.67,11.5C19.67,11.25 19.66,11 19.62,10.75L21.84,9.03C22.04,8.87 22.09,8.59 21.96,8.37L19.87,4.74C19.73,4.5 19.45,4.42 19.23,4.5L16.62,5.55C16.08,5.13 15.47,4.8 14.82,4.53L14.43,1.75C14.4,1.5 14.18,1.33 13.93,1.33H9.74C9.5,1.33 9.28,1.5 9.24,1.75L8.85,4.53C8.2,4.8 7.59,5.13 7.05,5.55L4.44,4.5C4.22,4.41 3.94,4.5 3.81,4.74L1.71,8.36C1.58,8.58 1.64,8.87 1.83,9.03L4.05,10.75C4.02,11 4,11.25 4,11.5C4,11.75 4.02,12 4.05,12.25L1.83,13.97C1.64,14.13 1.58,14.41 1.71,14.63L3.8,18.26C3.93,18.5 4.22,18.58 4.44,18.5L7.05,17.45C7.59,17.87 8.2,18.2 8.85,18.47L9.24,21.25C9.28,21.5 9.5,21.67 9.74,21.67H13.93C14.18,21.67 14.4,21.5 14.43,21.25L14.82,18.47C15.47,18.2 16.08,17.87 16.62,17.45L19.23,18.5C19.45,18.59 19.73,18.5 19.87,18.26L21.96,14.63C22.09,14.41 22.04,14.13 21.84,13.97L19.62,12.25Z"/></svg>`
    },

    createWindow(id, title, contentHtml) {
        if (this.activeWindows.has(id)) {
            this.focusWindow(id);
            return;
        }

        this.zIndexCounter++;
        const win = document.createElement('div');
        win.id = `win-${id}`;
        win.className = 'window';
        win.style.zIndex = this.zIndexCounter;
        const offset = (this.activeWindows.size * 25) % 200;
        win.style.top = `${100 + offset}px`;
        win.style.left = `${150 + offset}px`;

        win.innerHTML = `
            <div class="window-header">
                <span class="window-title">${title}</span>
                <div class="window-controls">
                    <button class="btn-minimize">_</button>
                    <button class="btn-maximize">[]</button>
                    <button class="btn-close">X</button>
                </div>
            </div>
            <div class="window-body">${contentHtml}</div>
        `;

        document.getElementById('desktop').appendChild(win);
        this.activeWindows.set(id, { element: win, isMaximized: false });

        // INTEGRACIÓN DEL TRADUCTOR CON DELAY
        if (window.OSTranslator && typeof window.OSTranslator.translateContainerText === 'function') {
            setTimeout(() => {
                const bodyEl = win.querySelector('.window-body');
                window.OSTranslator.translateContainerText(bodyEl);
            }, 100);
        }

        this.updateTaskbar();
        this.setupWindowEvents(id);
    },

    setupWindowEvents(id) {
        const win = document.getElementById(`win-${id}`);
        const header = win.querySelector('.window-header');
        win.addEventListener('mousedown', () => this.focusWindow(id));

        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            isDragging = true;
            startX = e.clientX; startY = e.clientY;
            initialLeft = win.offsetLeft; initialTop = win.offsetTop;
            this.focusWindow(id);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || this.activeWindows.get(id).isMaximized) return;
            win.style.left = `${initialLeft + (e.clientX - startX)}px`;
            win.style.top = `${initialTop + (e.clientY - startY)}px`;
        });

        document.addEventListener('mouseup', () => isDragging = false);

        win.querySelector('.btn-close').onclick = () => this.closeWindow(id);
        win.querySelector('.btn-maximize').onclick = () => {
            const winData = this.activeWindows.get(id);
            if (winData.isMaximized) {
                win.classList.remove('maximized');
                win.style.top = winData.oldTop; win.style.left = winData.oldLeft;
                win.style.width = winData.oldWidth; win.style.height = winData.oldHeight;
                winData.isMaximized = false;
            } else {
                winData.oldTop = win.style.top; winData.oldLeft = win.style.left;
                winData.oldWidth = win.style.width; winData.oldHeight = win.style.height;
                win.classList.add('maximized');
                win.style.top = '0'; win.style.left = '0';
                win.style.width = '100vw'; win.style.height = 'calc(100vh - 105px)';
                winData.isMaximized = true;
            }
        };

        win.querySelector('.btn-minimize').onclick = () => {
            win.style.display = 'none';
            this.updateTaskbar();
        };
    },

    focusWindow(id) {
        const winData = this.activeWindows.get(id);
        if (!winData) return;
        this.zIndexCounter++;
        winData.element.style.zIndex = this.zIndexCounter;
        if (winData.element.style.display === 'none') winData.element.style.display = 'flex';
        this.updateTaskbar();
    },

    closeWindow(id) {
        const winData = this.activeWindows.get(id);
        if (winData) {
            winData.element.remove();
            this.activeWindows.delete(id);
            this.updateTaskbar();
        }
    },

    updateTaskbar() {
        const taskbarContainer = document.getElementById('active-apps');
        if (!taskbarContainer) return;
        taskbarContainer.innerHTML = '';
        
        let topWindowId = null;
        let highestZIndex = -1;

        this.activeWindows.forEach((winData, id) => {
            const currentZ = parseInt(winData.element.style.zIndex) || 0;
            if (winData.element.style.display !== 'none' && currentZ > highestZIndex) {
                highestZIndex = currentZ;
                topWindowId = id;
            }
        });

        this.activeWindows.forEach((winData, id) => {
            const appType = id.split('-')[0];
            const btn = document.createElement('button');
            btn.className = 'taskbar-item' + (id === topWindowId ? ' active' : '');
            btn.innerHTML = this.appIcons[appType] || '<span>[]</span>';

            // Hover traducción (dock) usando la key del appType (ej: notepad, calculator, explorer...)
            if (window.OSTranslator && typeof window.OSTranslator.bindHoverToKey === 'function') {
                window.OSTranslator.bindHoverToKey(btn, appType);
            }

            btn.onclick = () => {
                if (winData.element.style.display !== 'none' && id === topWindowId) {
                    winData.element.style.display = 'none';
                    this.updateTaskbar();
                } else {
                    this.focusWindow(id);
                }
            };
            taskbarContainer.appendChild(btn);
        });
    }
};

window.OSKernel = OSKernel;