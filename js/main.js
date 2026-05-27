/**
 * NextLang OS Main - Orquestador de Arranque e Interfaz Global
 * Versión optimizada para persistencia de traducción dinámica
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
                if (appName) {
                    this.launchApp(appName);
                } else if (item.classList.contains('shutdown')) {
                    this.shutdownSystem();
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
                <div style="background: #07080d; color: rgba(255,255,255,0.7); width: 100vw; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: monospace;">
                    <p>NextLang OS environment successfully terminated.</p>
                    <button onclick="window.location.reload()" style="background: rgba(255,255,255,0.03); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 10px 24px; cursor: pointer; border-radius: 12px; margin-top: 20px;">
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