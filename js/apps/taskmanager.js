/**
 * WebOS Application: Monitor de Recursos y Tareas (Task Manager)
 * Permite visualizar el consumo simulado del sistema y cerrar procesos activos.
 */

const AppTaskManager = {
    timerId: null,

    /**
     * Abre el Monitor de Tareas
     */
    open() {
        const appId = 'taskmanager';
        const title = 'Task Manager';

        if (window.OSKernel) {
            window.OSKernel.createWindow(appId, title, this.getTemplate());
            this.startResourceSimulation();
            this.setupEvents();
        }
    },

    /**
     * Genera la plantilla HTML base con las barras de recursos y la lista de procesos
     */
    getTemplate() {
        let html = `
            <div class="taskmgr-wrapper" style="display: flex; flex-direction: column; gap: 20px; height: 100%;">
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
                            <span style="color: rgba(255,255,255,0.7); font-weight: 500;">Processor (CPU)</span>
                            <span id="tm-cpu-txt" style="color: #6366f1; font-family: monospace; font-weight: 600;">0%</span>
                        </div>
                        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                            <div id="tm-cpu-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); transition: width 0.4s ease;"></div>
                        </div>
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
                            <span style="color: rgba(255,255,255,0.7); font-weight: 500;">Memory (RAM)</span>
                            <span id="tm-ram-txt" style="color: #d946ef; font-family: monospace; font-weight: 600;">0%</span>
                        </div>
                        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                            <div id="tm-ram-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #d946ef, #ff5f56); transition: width 0.4s ease;"></div>
                        </div>
                    </div>
                </div>

                <div style="flex: 1; display: flex; flex-direction: column; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; padding: 10px; overflow: hidden;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.4); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 8px; font-weight: 600; padding-origin: 5px;">
                        <span>Proceso Activo</span>
                        <span>Acción</span>
                    </div>
                    <div id="tm-process-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;">
                        </div>
                </div>
            </div>
        `;
        return html;
    },

    /**
     * Escanea el Kernel e inyecta la lista de procesos interactivos en el DOM
     */
    renderProcessList() {
        const listContainer = document.getElementById('tm-process-list');
        if (!listContainer) return;

        if (!window.OSKernel || window.OSKernel.activeWindows.size === 0) {
            listContainer.innerHTML = `<div style="text-align: center; color: rgba(255,255,255,0.2); font-size: 12px; margin-top: 30px;">No hay aplicaciones en ejecución</div>`;
            return;
        }

        let listHtml = '';
        window.OSKernel.activeWindows.forEach((value, key) => {
            // Obtenemos el título real de la cabecera de la ventana
            const winTitle = value.element.querySelector('.window-title').innerText;
            
            listHtml += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.02);">
                    <span style="font-size: 12px; color: rgba(255,255,255,0.8); font-family: monospace;">${key} (${winTitle})</span>
                    <button class="kill-btn" data-pid="${key}" style="
                        background: rgba(239, 68, 68, 0.1); 
                        border: 1px solid rgba(239, 68, 68, 0.2); 
                        color: #ef4444; padding: 3px 8px; 
                        border-radius: 6px; font-size: 10px; 
                        cursor: pointer; font-weight: 600;
                        transition: all 0.2s;
                    ">Kill</button>
                </div>
            `;
        });

        listContainer.innerHTML = listHtml;
        this.bindKillEvents();
    },

    /**
     * Genera hilos de simulación numérica para alterar las barras de recursos
     */
    startResourceSimulation() {
        const cpuTxt = document.getElementById('tm-cpu-txt');
        const cpuBar = document.getElementById('tm-cpu-bar');
        const ramTxt = document.getElementById('tm-ram-txt');
        const ramBar = document.getElementById('tm-ram-bar');

        const updateMetrics = () => {
            if (!cpuTxt) {
                clearInterval(this.timerId);
                return;
            }

            // Cantidad de apps abiertas altera la base del consumo de RAM
            const appCount = window.OSKernel ? window.OSKernel.activeWindows.size : 0;
            
            // Fluctuaciones lógicas realistas
            const baseCpu = appCount * 8; 
            const cpuVal = Math.min(Math.floor(baseCpu + Math.random() * 15), 100);
            const ramVal = Math.min(Math.floor(20 + (appCount * 12) + Math.random() * 3), 100);

            cpuTxt.innerText = `${cpuVal}%`;
            cpuBar.style.width = `${cpuVal}%`;
            ramTxt.innerText = `${ramVal}%`;
            ramBar.style.width = `${ramVal}%`;

            // Auto-actualizar la lista de procesos por si se abrió otra app de fondo
            this.renderProcessList();
        };

        updateMetrics();
        this.timerId = setInterval(updateMetrics, 1500);
    },

    /**
     * Asigna el click a los botones de matar procesos
     */
    bindKillEvents() {
        const winEl = document.getElementById('win-taskmanager');
        if (!winEl) return;

        const buttons = winEl.querySelectorAll('.kill-btn');
        buttons.forEach(btn => {
            btn.onmouseover = () => { btn.style.background = '#ef4444'; btn.style.color = '#fff'; };
            btn.onmouseout = () => { btn.style.background = 'rgba(239, 68, 68, 0.1)'; btn.style.color = '#ef4444'; };
            
            btn.onclick = () => {
                const pid = btn.getAttribute('data-pid');
                if (window.OSKernel) {
                    window.OSKernel.closeWindow(pid); // Forzamos el cierre del proceso en el núcleo
                    this.renderProcessList(); // Refrescar lista de inmediato
                }
            };
        });
    },

    setupEvents() {
        this.renderProcessList();
    }
};

// Exponer la app globalmente
window.AppTaskManager = AppTaskManager;