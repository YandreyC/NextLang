/**
 * NextLang OS Main - Orquestador de Arranque e Interfaz Global
 * Versión optimizada para persistencia de traducción dinámica con animación de inicio y apagado
 */

const OSMain = {
    /**
     * Inicialización del ecosistema al cargar el DOM
     */
    init() {
        this.initClock();
        this.initStartMenu();
        this.initDesktopIcons();
        
        // INTEGRACIÓN DE TRADUCCIÓN
        if (window.OSTranslator) {
            // Traducción inicial de toda la UI cargada en el DOM
            window.OSTranslator.init();
            
            // Forzamos traducción del Menú de Inicio tras la carga
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

        // Cola de logs del sistema para simular la terminal
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
            progress += 2; // Incremento progresivo de la barra de carga
            if (progress > 100) progress = 100;
            progressFill.style.width = `${progress}%`;

            // Control de tiempos de impresión de logs según el porcentaje actual
            if (currentLogIndex < bootLogs.length && progress >= (currentLogIndex + 1) * (100 / bootLogs.length)) {
                const logData = bootLogs[currentLogIndex];
                const line = document.createElement('div');
                line.className = `boot-log-line ${logData.type}`;
                line.innerText = `>> ${logData.text}`;
                
                logsContainer.appendChild(line);
                logsContainer.scrollTop = logsContainer.scrollHeight; // Auto-scroll inferior
                currentLogIndex++;
            }

            // Fin de la secuencia de carga
            if (progress >= 100) {
                clearInterval(bootInterval);
                
                // Transición fluida de salida para ocultar el splash screen
                setTimeout(() => {
                    bootScreen.style.opacity = '0';
                    bootScreen.style.pointerEvents = 'none';
                    
                    // Mostrar el contenedor del sistema operativo (Login / Escritorio)
                    container.style.transition = 'opacity 0.6s ease';
                    container.style.opacity = '1';
                    container.style.pointerEvents = 'all';
                }, 300);
            }
        }, 40); // Duración total aproximada: 2 segundos
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
                
                // CORRECCIÓN CRÍTICA: Validar primero si es el botón de apagado antes de mapear apps
                if (appName === 'shutdown' || item.classList.contains('shutdown')) {
                    this.shutdownSystem();
                } else if (appName) {
                    this.launchApp(appName);
                }
                
                startMenu.classList.add('hidden');
            });
        });
    },

    /**
     * Manejador de iconos del escritorio
     */
    initDesktopIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach(icon => {
            icon.addEventListener('dblclick', () => {
                const appName = icon.getAttribute('data-app');
                if (appName) this.launchApp(appName);
            });
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
            'browser': window.AppBrowser
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