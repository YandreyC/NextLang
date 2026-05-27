/**
 * WebOS Application: Terminal de Comandos (CLI)
 */

const AppTerminal = {
    /**
     * Abre la consola de comandos
     */
    open() {
        const appId = 'terminal';
        const title = 'System Terminal v2.0';

        const htmlContent = `
            <div class="terminal-wrapper" style="
                display: flex; 
                flex-direction: column; 
                height: 100%; 
                font-family: 'Courier New', Courier, monospace; 
                color: #27c93f; 
                background: rgba(5, 5, 8, 0.85);
                padding: 10px;
                box-sizing: border-box;
            ">
                <div id="term-history" style="
                    flex: 1; 
                    overflow-y: auto; 
                    white-space: pre-wrap; 
                    font-size: 13px; 
                    line-height: 1.4;
                    margin-bottom: 10px;
                ">WebOS Architecture [Version 2026.05]\nType "help" to see available system commands.\n\n</div>

                <div class="term-input-line" style="display: flex; align-items: center; gap: 5px; font-size: 13px;">
                    <span style="color: #a855f7; font-weight: bold;">core@webos:~$</span>
                    <input type="text" id="term-input" autocomplete="off" autofocus style="
                        flex: 1;
                        background: transparent;
                        border: none;
                        color: #27c93f;
                        font-family: inherit;
                        font-size: inherit;
                    ">
                </div>
            </div>
        `;

        if (window.OSKernel) {
            window.OSKernel.createWindow(appId, title, htmlContent);
            
            // Forzar proporciones horizontales de terminal clásica
            const winEl = document.getElementById(`win-${appId}`);
            if (winEl) {
                winEl.style.width = '550px';
                winEl.style.height = '350px';
            }

            this.setupEvents();
        }
    },

    /**
     * Captura el teclado dentro de la terminal
     */
    setupEvents() {
        const winEl = document.getElementById('win-terminal');
        if (!winEl) return;

        const input = winEl.querySelector('#term-input');
        const history = winEl.querySelector('#term-history');
        const body = winEl.querySelector('.window-body');

        // Enfocar el input automáticamente al hacer click en cualquier parte interna de la terminal
        body.onclick = () => input.focus();

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const commandLine = input.value.trim();
                input.value = ''; // Limpiar prompt

                if (commandLine === '') return;

                // Agregar el eco del comando ingresado al historial
                history.innerText += `core@webos:~$ ${commandLine}\n`;
                
                // Procesar la cadena por el intérprete
                this.executeCommand(commandLine, history);
                
                // Scroll automático hacia el final del historial
                history.scrollTop = history.scrollHeight;
            }
        };
    },

    /**
     * Intérprete sintáctico de comandos (Shell básica)
     */
    executeCommand(cmdLine, historyElement) {
        const parts = cmdLine.split(' ');
        const baseCmd = parts[0].toLowerCase();
        const arg = parts[1];

        switch (baseCmd) {
            case 'help':
                historyElement.innerText += `Available commands:\n` +
                    `  help               - Displays this instruction log.\n` +
                    `  clear              - Clears the terminal screen buffer.\n` +
                    `  ps                 - Lists all running kernel processes.\n` +
                    `  run [app_name]     - Launches a native process (notepad, calculator, explorer, settings).\n` +
                    `  ping [host]        - Network packet diagnostic tool.\n` +
                    `  neofetch           - Displays kernel and environment meta-data.\n\n`;
                break;

            case 'clear':
                historyElement.innerText = '';
                break;

            case 'ps':
                if (window.OSKernel && window.OSKernel.activeWindows.size > 0) {
                    historyElement.innerText += `PID\t\tAPPLICATION\n`;
                    window.OSKernel.activeWindows.forEach((value, key) => {
                        historyElement.innerText += `${key}\t--> Active window state\n`;
                    });
                    historyElement.innerText += `\n`;
                } else {
                    historyElement.innerText += `No active processes managed by the kernel.\n\n`;
                }
                break;

            case 'run':
                if (!arg) {
                    historyElement.innerText += `Error: Syntax error. Usage: run [notepad | calculator | explorer | settings]\n\n`;
                } else if (window.OSMain && typeof window.OSMain.launchApp === 'function') {
                    // Reutilizamos el orquestador global para abrir apps por comando
                    window.OSMain.launchApp(arg.toLowerCase());
                    historyElement.innerText += `Process successfully spawned for system app: ${arg}\n\n`;
                } else {
                    historyElement.innerText += `Critical Error: Application manager unreachable.\n\n`;
                }
                break;

            case 'ping':
                const host = arg || 'google.com';
                historyElement.innerText += `PING ${host} with 32 bytes of system data:\n` +
                    `Reply from ${host}: bytes=32 time=14ms TTL=54\n` +
                    `Reply from ${host}: bytes=32 time=11ms TTL=54\n` +
                    `Ping statistics: Packets sent = 2, Received = 2, Lost = 0 (0% loss).\n\n`;
                break;

            case 'neofetch':
                historyElement.innerText += 
                    `   /\\_/\\      OS: WebOS Simulation Core 2.0\n` +
                    `  ( o.o )     Kernel: Vanilla JS V8 Multitask Engine\n` +
                    `   > ^ <      Shell: WebOS Custom BASH v26.05\n` +
                    `  /     \\     Uptime: Operational and stable\n` +
                    ` |       |    UI Architecture: Glassmorphism / CSS Neon\n\n`;
                break;

            default:
                historyElement.innerText += `Command not recognized: "${baseCmd}". Type "help" for support.\n\n`;
        }
    }
};

// Exponer la app globalmente
window.AppTerminal = AppTerminal;