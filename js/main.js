/**
 * NextLang OS Main - Orquestador de Arranque e Interfaz Global
 * Versión optimizada para persistencia de traducción dinámica y ejecución nativa
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
            // Inicializa el contenedor o tooltip y procesa todo el cuerpo inicial
            window.OSTranslator.init();
            
            // Si tu traductor usa 'run', escanea todo el body de forma segura:
            if (typeof window.OSTranslator.run === 'function') {
                window.OSTranslator.run(document.body);
            } else if (typeof window.OSTranslator.translateContainerText === 'function') {
                // Alternativa basada en tu versión previa para forzar el menú de inicio
                const startMenu = document.getElementById('start-menu');
                if (startMenu) window.OSTranslator.translateContainerText(startMenu);
            }
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
        // INTERCEPCIÓN PORTABLE: Si la aplicación requiere el host anfitrión (ej. Rufus)
        if (appName === 'rufus') {
            if (window.OSPortableConnector) {
                window.OSPortableConnector.launchNativeApp('rufus');
            } else {
                console.error("Kernel Error: Módulo portable1.js (OSPortableConnector) no se encuentra cargado.");
            }
            return; // Interrumpe el flujo del DOM del navegador para abrir de forma nativa externa
        }

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

            // AUTO-TRADUCCIÓN ASÍNCRONA: Espera a que el Kernel monte la interfaz de la app en el DOM
            if (window.OSTranslator) {
                setTimeout(() => {
                    const targetWindows = document.querySelectorAll(`[id^="win-${appName}"]`);
                    targetWindows.forEach(win => {
                        // Invoca el método correspondiente según la estructura de tu traductor
                        if (typeof window.OSTranslator.run === 'function') {
                            window.OSTranslator.run(win);
                        } else if (typeof window.OSTranslator.translateContainerText === 'function') {
                            window.OSTranslator.translateContainerText(win);
                        }
                    });
                }, 60); // Pequeño delay de 60ms para sincronizarse con la inyección del Kernel
            }
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