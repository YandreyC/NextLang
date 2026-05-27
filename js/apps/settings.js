/**
 * WebOS Application: Centro de Control y Ajustes (Settings)
 * Permite personalizar el entorno y controlar el módulo de traducción.
 */

const AppSettings = {
    // Catálogo de temas espaciales/futuristas precargados
    themes: [
        { name: "Nebula Indigo", value: "radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(217, 70, 239, 0.15) 0%, transparent 50%), linear-gradient(160deg, #0f111a 0%, #07080d 100%)" },
        { name: "Cyber Neon", value: "radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.1) 0%, transparent 80%), linear-gradient(135deg, #050508 0%, #11051c 100%)" },
        { name: "Aurora Boreal", value: "radial-gradient(circle at 30% 20%, rgba(39, 201, 63, 0.12) 0%, transparent 60%), linear-gradient(180deg, #060c12 0%, #020406 100%)" },
        { name: "Solar Eclipse", value: "radial-gradient(circle at 70% 40%, rgba(255, 189, 46, 0.08) 0%, transparent 50%), linear-gradient(145deg, #120a06 0%, #050302 100%)" }
    ],

    /**
     * Abre el panel de configuración
     */
    open() {
        const appId = 'settings';
        const title = 'Configuración del Sistema';

        // Verificar el estado actual del traductor para marcar el interruptor de forma correcta
        const isTranslationEnabled = window.OSTranslator ? window.OSTranslator.enabled : true;

        let htmlContent = `
            <div class="settings-wrapper" style="display: flex; flex-direction: column; gap: 20px; height: 100%;">
                
                <div class="settings-section" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 14px;">
                    <h3 style="font-size: 14px; color: #a855f7; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span>🎨</span> Personalización del Entorno
                    </h3>
                    <p style="font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 12px;">Selecciona una firma visual para los degradados del escritorio:</p>
                    <div class="theme-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
        `;

        // Inyectar los botones de los temas del catálogo
        this.themes.forEach((theme, index) => {
            htmlContent += `
                <button class="theme-btn" data-index="${index}" style="
                    background: rgba(255,255,255,0.03); 
                    border: 1px solid rgba(255,255,255,0.08); 
                    color: #fff; padding: 10px; 
                    border-radius: 10px; 
                    cursor: pointer; 
                    font-size: 11px; 
                    font-weight: 500;
                    text-align: left;
                    transition: all 0.2s;
                ">${theme.name}</button>
            `;
        });

        htmlContent += `
                    </div>
                </div>

                <div class="settings-section" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 14px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 style="font-size: 14px; color: #6366f1; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                            <span>🌐</span> Traductor Inteligente (Hover)
                        </h3>
                        <p style="font-size: 11px; color: rgba(255,255,255,0.5);">Traducir palabras al pasar el puntero por encima.</p>
                    </div>
                    
                    <label class="switch-container" style="position: relative; display: inline-block; width: 46px; height: 24px; cursor: pointer;">
                        <input type="checkbox" id="translator-toggle" ${isTranslationEnabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                        <span class="slider" style="
                            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                            background-color: rgba(255,255,255,0.1);
                            border: 1px solid rgba(255,255,255,0.1);
                            border-radius: 24px;
                            transition: .3s;
                        "></span>
                    </label>
                </div>

                <div style="margin-top: auto; text-align: center; font-size: 10px; color: rgba(255,255,255,0.3); font-family: monospace;">
                    WebOS Core v2.0.26 · Status: Operational
                </div>
            </div>
        `;

        if (window.OSKernel) {
            window.OSKernel.createWindow(appId, title, htmlContent);
            
            // Forzar proporciones verticales limpias
            const winEl = document.getElementById(`win-${appId}`);
            if (winEl) {
                winEl.style.width = '360px';
                winEl.style.height = '360px';
            }

            this.setupEvents();
        }
    },

    /**
     * Vincula los controladores y escuchas de eventos de la aplicación
     */
    setupEvents() {
        const winEl = document.getElementById('win-settings');
        if (!winEl) return;

        // 1. Evento para los botones de cambio de tema
        const themeButtons = winEl.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            // Efectos de iluminación al pasar el mouse
            btn.onmouseover = () => btn.style.borderColor = 'rgba(168, 85, 247, 0.4)';
            btn.onmouseout = () => btn.style.borderColor = 'rgba(255,255,255,0.08)';
            
            btn.onclick = () => {
                const index = btn.getAttribute('data-index');
                const selectedTheme = this.themes[index];
                
                // Aplicar el nuevo gradiente al contenedor principal del escritorio
                const desktopEl = document.getElementById('os-container');
                if (desktopEl) {
                    desktopEl.style.background = selectedTheme.value;
                }
            };
        });

        // 2. Lógica del Interruptor del Traductor
        const toggle = winEl.querySelector('#translator-toggle');
        const slider = winEl.querySelector('.slider');
        
        // Estilo inicial del slider basado en el estado
        const updateSliderStyle = (isChecked) => {
            if (isChecked) {
                slider.style.backgroundColor = 'rgba(99, 102, 241, 0.3)';
                slider.style.borderColor = '#6366f1';
            } else {
                slider.style.backgroundColor = 'rgba(255,255,255,0.1)';
                slider.style.borderColor = 'rgba(255,255,255,0.1)';
            }
        };
        
        updateSliderStyle(toggle.checked);

        toggle.onchange = () => {
            updateSliderStyle(toggle.checked);
            
            // Modificar de forma directa la propiedad de activación del traductor global
            if (window.OSTranslator) {
                window.OSTranslator.enabled = toggle.checked;
                
                // Si se desactiva, ocultamos inmediatamente el tooltip por si quedó colgado
                if (!toggle.checked && window.OSTranslator.tooltip) {
                    window.OSTranslator.tooltip.style.display = 'none';
                }
            }
        };
    }
};

// Exponer la app globalmente
window.AppSettings = AppSettings;