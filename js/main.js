/**
 * NextLang OS Main - Orquestador de Arranque e Interfaz Global
 * Versión optimizada para persistencia de traducción dinámica con cuadro modal de apagado
 */

const OSMain = {
    /**
     * Inicialización del ecosistema al cargar el DOM
     */
    init() {
        this.initClock();
        this.initStartMenu();
        this.initDesktopIcons(); // Inicializado con delegación segura de eventos
        this.initShutdownModal(); // Inicializa los listeners del nuevo recuadro
        
        // INTEGRACIÓN DE TRADUCCIÓN
        if (window.OSTranslator) {
            window.OSTranslator.init();
            const startMenu = document.getElementById('start-menu');
            if (startMenu) window.OSTranslator.translateContainerText(startMenu);
        }

        // Disparador del sistema de usuarios
        if (window.OSUsers) {
            window.OSUsers.renderLoginScreen();
        }

        // ACTIVAR ANIMACIÓN DE INICIO AUTOMÁTICA
        this.runBootAnimation();
    },

    /**
     * Controlador de la Animación de Carga/Inicio (Boot Animation)
     */
    runBootAnimation() {
        const bootScreen = document.getElementById('boot-screen');
        const container = document.getElementById('os-container');
        const progressFill = document.getElementById('boot-progress-fill');
        const logsContainer = document.getElementById('boot-logs');

        if (!bootScreen || !progressFill || !logsContainer) return;

        const bootLogs = [
            { text: "Loading NextLang WebOS Core Components...", type: "info" },
            { text: "Initializing Virtual Kernel & VFS System... OK", type: "success" },
            { text: "Mounting Language and Interface Frameworks...", type: "info" },
            { text: "Loading User Profile & UI Desktop Workspace...", type: "info" },
            { text: "Starting Active Modules Sync... READY", type: "success" },
            { text: "System active. Welcome to NextLang OS.", type: "success" }
        ];

        let currentLogIndex = 0;
        let progress = 0;

        const bootInterval = setInterval(() => {
            progress += 2;
            if (progress > 100) progress = 100;
            progressFill.style.width = `${progress}%`;

            if (currentLogIndex < bootLogs.length && progress >= (currentLogIndex + 1) * (100 / bootLogs.length)) {
                const logData = bootLogs[currentLogIndex];
                const line = document.createElement('div');
                line.className = `boot-log-line ${logData.type}`;
                line.innerText = `>> ${logData.text}`;
                
                logsContainer.appendChild(line);
                logsContainer.scrollTop = logsContainer.scrollHeight;
                currentLogIndex++;
            }

            if (progress >= 100) {
                clearInterval(bootInterval);
                
                setTimeout(() => {
                    bootScreen.style.opacity = '0';
                    bootScreen.style.pointerEvents = 'none';
                    
                    container.style.transition = 'opacity 0.6s ease';
                    container.style.opacity = '1';
                    container.style.pointerEvents = 'all';
                }, 300);
            }
        }, 40);
    },

    /**
     * Reloj del sistema (Actualización en tiempo real)
     */
    initClock() {
        const clockElement = document.getElementById('system-clock');
        if (!clockElement) return;

        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockElement.innerText = `${hours}:${minutes}:${seconds}`;
        };

        updateClock();
        setInterval(updateClock, 1000);
    },

    /**
     * Control del Panel Central / Menú de Inicio
     */
    initStartMenu() {
        const startButton = document.getElementById('start-button');
        const startMenu = document.getElementById('start-menu');

        if (!startButton || !startMenu) return;

        startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.toggle('hidden');
        });

        document.getElementById('desktop').addEventListener('click', () => {
            startMenu.classList.add('hidden');
        });

        const menuItems = startMenu.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const appName = item.getAttribute('data-app');
                
                if (appName === 'shutdown' || item.classList.contains('shutdown')) {
                    this.showShutdownModal();
                } else if (appName) {
                    this.launchApp(appName);
                }
                
                startMenu.classList.add('hidden');
            });
        });
    },

    /**
     * Inicialización del Recuadro Modal de Opciones del Sistema
     */
    initShutdownModal() {
        const modal = document.getElementById('shutdown-modal');
        if (!modal) return;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideShutdownModal();
        });

        if (window.OSTranslator) {
            window.OSTranslator.translateContainerText(modal);
        }

        this.bindShutdownModalEvents();
    },

    /**
     * Enlaza los clics a los botones del modal de apagado de forma segura
     */
    bindShutdownModalEvents() {
        const closeBtn = document.getElementById('close-shutdown-modal');
        const btnRestart = document.getElementById('btn-restart');
        const btnShutdown = document.getElementById('btn-shutdown');
        const btnSwitchUser = document.getElementById('btn-switch-user');

        if (closeBtn) closeBtn.onclick = () => this.hideShutdownModal();

        if (btnRestart) {
            btnRestart.onclick = () => {
                this.hideShutdownModal();
                window.location.reload();
            };
        }

        if (btnShutdown) {
            btnShutdown.onclick = () => {
                this.hideShutdownModal();
                this.shutdownSystem();
            };
        }

        if (btnSwitchUser) {
            btnSwitchUser.onclick = () => {
                this.hideShutdownModal();
                if (window.OSUsers && typeof window.OSUsers.renderLoginScreen === 'function') {
                    window.OSUsers.renderLoginScreen();
                } else {
                    console.warn("Módulo de usuarios (OSUsers) no disponible.");
                }
            };
        }
    },

    showShutdownModal() {
        const modal = document.getElementById('shutdown-modal');
        if (modal) {
            modal.classList.remove('hidden');
            if (window.OSTranslator) {
                window.OSTranslator.translateContainerText(modal);
            }
            this.bindShutdownModalEvents();
        }
    },

    hideShutdownModal() {
        const modal = document.getElementById('shutdown-modal');
        if (modal) modal.classList.add('hidden');
    },

    /**
     * Manejador de iconos del escritorio optimizado con Delegación de Eventos
     * Resiste las mutaciones de código hechas por el traductor dinámico.
     */
    initDesktopIcons() {
        const desktop = document.getElementById('desktop');
        if (!desktop) return;

        desktop.addEventListener('dblclick', (e) => {
            // Busca el contenedor '.desktop-icon' más cercano hacia arriba desde donde se hizo clic
            const icon = e.target.closest('.desktop-icon');
            if (icon) {
                const appName = icon.getAttribute('data-app');
                if (appName) this.launchApp(appName);
            }
        });
    },

    /**
     * Lanzador de aplicaciones centralizado
     */
    launchApp(appName) {
        const appMap = {
            'notepad': window.AppNotepad,
            'calculator': window.AppCalculator,
            'explorer': window.AppExplorer,
            'settings': window.AppSettings,
            'taskmanager': window.AppTaskManager,
            'terminal': window.AppTerminal,
            'browser': window.AppBrowser,
            'duolingo': window.AppDuolingo
        };

        if (appMap[appName] && typeof appMap[appName].open === 'function') {
            appMap[appName].open();
        } else {
            console.warn(`Kernel: Aplicación ${appName} no encontrada.`);
        }
    },

    /**
     * Simulación cinematográfica de apagado
     */
    shutdownSystem() {
        const container = document.getElementById('os-container');
        if (!container) return;

        container.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        container.style.opacity = '0';
        container.style.transform = 'scale(0.97)';
        container.style.filter = 'blur(20px) brightness(0)';

        setTimeout(() => {
            document.body.innerHTML = `
                <div style="background: #07080d; color: rgba(255,255,255,0.7); width: 100vw; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: monospace; user-select: none;">
                    <p style="color: #ef4444;">> NextLang OS environment successfully terminated.</p>
                    <p style="color: rgba(255,255,255,0.25); font-size: 11px; margin-top: 5px;">Memory blocks cleared. Systems halted.</p>
                    <button onclick="window.location.reload()" style="background: rgba(255,255,255,0.03); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 10px 24px; cursor: pointer; border-radius: 12px; margin-top: 20px; font-family: monospace; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                        Reboot System
                    </button>
                </div>
            `;
        }, 800);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    OSMain.init();
});