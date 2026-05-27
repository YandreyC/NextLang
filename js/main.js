/**
 * NextLang OS Main - Orquestador de Arranque e Interfaz Global
 */

const OSMain = {
    /**
     * Inicialización del ecosistema al cargar el DOM
     */
    init() {
        this.initClock();
        this.initStartMenu();
        this.initDesktopIcons();
        
        // Disparador del sistema de usuarios y pantalla de bloqueo al arrancar
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
     * Control del Panel Central / Menú de Inicio (Abrir / Cerrar)
     */
    initStartMenu() {
        const startButton = document.getElementById('start-button');
        const startMenu = document.getElementById('start-menu');

        if (!startButton || !startMenu) return;

        // Alternar visibilidad del menú al hacer click en la gema central
        startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.toggle('hidden');
        });

        // Cerrar el panel automáticamente si se hace clic en el escritorio vacío
        document.getElementById('desktop').addEventListener('click', () => {
            startMenu.classList.add('hidden');
        });

        // Eventos para los accesos y aplicaciones dentro del panel central
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
     * Manejador de iconos del escritorio (Doble clic optimizado)
     */
    initDesktopIcons() {
        const icons = document.querySelectorAll('.desktop-icon');

        icons.forEach(icon => {
            icon.addEventListener('dblclick', () => {
                const appName = icon.getAttribute('data-app');
                if (appName) {
                    this.launchApp(appName);
                }
            });
        });
    },

    /**
     * Lanzador de aplicaciones centralizado (Enrutador de Procesos)
     * Interconecta la interfaz con los scripts de las apps cargados en memoria
     * @param {string} appName - Nombre clave de la aplicación (data-app)
     */
    launchApp(appName) {
        switch (appName) {
            case 'notepad':
                if (window.AppNotepad) window.AppNotepad.open();
                break;

            case 'calculator':
                if (window.AppCalculator) window.AppCalculator.open();
                break;

            case 'explorer':
                if (window.AppExplorer) window.AppExplorer.open();
                break;

            case 'settings':
                if (window.AppSettings) window.AppSettings.open();
                break;

            case 'taskmanager':
                if (window.AppTaskManager) window.AppTaskManager.open();
                break;

            case 'terminal':
                if (window.AppTerminal) window.AppTerminal.open();
                break;

            default:
                console.warn(`Proceso denegado por el Kernel. Aplicación no registrada: ${appName}`);
        }
    },

    /**
     * Simulación cinematográfica de apagado del entorno
     */
    shutdownSystem() {
        const container = document.getElementById('os-container');
        if (!container) return;

        // Animación de desvanecimiento y desenfoque futurista
        container.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        container.style.opacity = '0';
        container.style.transform = 'scale(0.97)';
        container.style.filter = 'blur(20px) brightness(0)';

        setTimeout(() => {
            document.body.innerHTML = `
                <div style="
                    background: #07080d; 
                    color: rgba(255,255,255,0.7); 
                    width: 100vw; 
                    height: 100vh; 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: center; 
                    align-items: center; 
                    font-family: monospace;
                ">
                    <p style="font-size: 15px; letter-spacing: 1px; margin-bottom: 25px;">NextLang OS environment successfully terminated.</p>
                    <button onclick="window.location.reload()" style="
                        background: rgba(255,255,255,0.03); 
                        color: #fff; 
                        border: 1px solid rgba(255,255,255,0.1); 
                        padding: 10px 24px; 
                        cursor: pointer; 
                        border-radius: 12px;
                        font-family: inherit;
                        font-size: 12px;
                        transition: all 0.3s;
                    " onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'">
                        Reboot System
                    </button>
                </div>
            `;
        }, 800);
    }
};

// Arrancar cuando el DOM esté completamente listo
document.addEventListener('DOMContentLoaded', () => {
    OSMain.init();
});