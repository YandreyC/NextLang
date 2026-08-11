/**
 * NextLang OS Main - Orquestador de Arranque e Interfaz Global
 * Versión optimizada para persistencia de traducción dinámica con aplicaciones externas y ejecución nativa
 */

const OSMain = {
    /**
     * Inicialización del ecosistema al cargar el DOM
     */
    init() {
        this.initClock();
        this.initStartMenu();
        this.initDesktopIcons();
        this.initShutdownModal();

        if (window.OSTranslator) {
            window.OSTranslator.init();

            if (typeof window.OSTranslator.run === 'function') {
                window.OSTranslator.run(document.body);
            } else if (typeof window.OSTranslator.translateContainerText === 'function') {
                const startMenu = document.getElementById('start-menu');
                if (startMenu) window.OSTranslator.translateContainerText(startMenu);
            }
        }

        if (window.OSUsers) {
            window.OSUsers.renderLoginScreen();
        }

        this.runBootAnimation();
    },

    /**
     * Controlador de la Animación de Carga/Inicio
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
            { text: "System active. Welcome to NextLang OS.", type: "success" }
        ];

        let currentLogIndex = 0;
        let progress = 0;

        const bootInterval = setInterval(() => {
            progress += 5;
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

    initClock() {
        const clockElement = document.getElementById('system-clock');
        if (!clockElement) return;
        const updateClock = () => {
            const now = new Date();
            clockElement.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        };
        updateClock();
        setInterval(updateClock, 1000);
    },

    initStartMenu() {
        const startButton = document.getElementById('start-button');
        const startMenu = document.getElementById('start-menu');
        if (!startButton || !startMenu) return;

        startButton.addEventListener('click', (e) => { e.stopPropagation(); startMenu.classList.toggle('hidden'); });
        document.getElementById('desktop').addEventListener('click', () => startMenu.classList.add('hidden'));

        startMenu.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const appName = item.getAttribute('data-app');
                if (appName === 'shutdown') this.showShutdownModal();
                else if (appName) this.launchApp(appName);
                startMenu.classList.add('hidden');
            });
        });
    },

    initShutdownModal() {
        const modal = document.getElementById('shutdown-modal');
        if (!modal) return;
        modal.addEventListener('click', (e) => { if (e.target === modal) this.hideShutdownModal(); });
        this.bindShutdownModalEvents();
    },

    bindShutdownModalEvents() {
        const closeBtn = document.getElementById('close-shutdown-modal');
        const btnRestart = document.getElementById('btn-restart');
        const btnShutdown = document.getElementById('btn-shutdown');
        const btnSwitchUser = document.getElementById('btn-switch-user');

        if (closeBtn) closeBtn.onclick = () => this.hideShutdownModal();
        if (btnRestart) btnRestart.onclick = () => window.location.reload();
        if (btnShutdown) btnShutdown.onclick = () => this.shutdownSystem();

        // Switch user: vuelve al login sin recargar la página
        if (btnSwitchUser) {
            btnSwitchUser.onclick = () => {
                this.hideShutdownModal();
                if (window.OSUsers) {
                    window.OSUsers.currentUser = null;
                    // Cierra todas las ventanas abiertas al cambiar de usuario
                    if (window.OSKernel) {
                        window.OSKernel.activeWindows.forEach((winData, winId) => {
                            try {
                                winData.element.remove();
                            } catch (e) {}
                        });
                        window.OSKernel.activeWindows.clear();
                        window.OSKernel.updateTaskbar();
                    }
                    window.OSUsers.renderLoginScreen();
                }

            };
        }
    },

    showShutdownModal() {
        const modal = document.getElementById('shutdown-modal');
        if (modal) modal.classList.remove('hidden');
    },

    hideShutdownModal() {
        const modal = document.getElementById('shutdown-modal');
        if (modal) modal.classList.add('hidden');
    },

    initDesktopIcons() {
        const desktop = document.getElementById('desktop');
        if (!desktop) return;
        desktop.addEventListener('dblclick', (e) => {
            const icon = e.target.closest('.desktop-icon');
            if (icon) this.launchApp(icon.getAttribute('data-app'));
        });
    },

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
            'browser': window.AppBrowser,
            'duolingo': window.AppDuolingo,
            'speechling': window.AppSpeechling,
            'music': window.AppYouTubeMusic // Asegúrate de que apunte a AppYouTubeMusic
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

    shutdownSystem() {
        document.body.innerHTML = `<div style="background:#07080d; color:#fff; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; font-family:monospace;">SYSTEM HALTED</div>`;
    }
};

// --- MÓDULOS DE APLICACIONES ---

window.AppSpeechling = {
    open() {
        console.log("Kernel: Redirigiendo proceso 'speechling'...");
        window.open('https://speechling.com/es/', '_blank');
    }
};

window.AppYouTubeMusic = {
    open() {
        console.log("Kernel: Redirigiendo proceso 'music'...");
        window.open('https://music.youtube.com/', '_blank');
    }
};

document.addEventListener('DOMContentLoaded', () => OSMain.init());

// --- CONFIGURACIÓN DE ARRANQUE: FONDO PREDETERMINADO ---
window.addEventListener('DOMContentLoaded', () => {
    // Timeout para asegurar que la AppSettings esté disponible y el DOM listo
    setTimeout(() => {
        const desktopEl = document.getElementById('os-container');
        if (desktopEl && window.AppSettings && window.AppSettings.wallpapers) {
            const wall3 = window.AppSettings.wallpapers.find(w => w.name === "Local Wall. 3");
            if (wall3) {
                desktopEl.style.background = wall3.url;
                desktopEl.style.backgroundSize = 'cover';
                desktopEl.style.backgroundPosition = 'center';
                desktopEl.style.backgroundRepeat = 'no-repeat';
            }
        }
    }, 200);
});