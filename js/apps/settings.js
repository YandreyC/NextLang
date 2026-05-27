/**
 * WebOS Application: Centro de Control y Ajustes (Settings)
 * Permite personalizar el entorno, cambiar fondos, alternar modos y controlar el traductor.
 */

const AppSettings = {
    // Catálogo de temas espaciales/futuristas en degradado (Modo Oscuro Nativo)
    themes: [
        { name: "Nebula Indigo", value: "radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(217, 70, 239, 0.15) 0%, transparent 50%), linear-gradient(160deg, #0f111a 0%, #07080d 100%)" },
        { name: "Cyber Neon", value: "radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.1) 0%, transparent 80%), linear-gradient(135deg, #050508 0%, #11051c 100%)" },
        { name: "Aurora Boreal", value: "radial-gradient(circle at 30% 20%, rgba(39, 201, 63, 0.12) 0%, transparent 60%), linear-gradient(180deg, #060c12 0%, #020406 100%)" },
        { name: "Solar Eclipse", value: "radial-gradient(circle at 70% 40%, rgba(255, 189, 46, 0.08) 0%, transparent 50%), linear-gradient(145deg, #120a06 0%, #050302 100%)" }
    ],

    // Lista unificada: Enlaces externos de internet + tus 4 imágenes locales nativas
    wallpapers: [
        // Fondos con enlaces remotos (Unsplash)
        { name: "Cyberpunk City", url: "url('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop')" },
        { name: "Minimal Mountain", url: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop')" },
        { name: "Cosmic Stars", url: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop')" },
        { name: "Abstract Line", url: "url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop')" },
        
        // Tus fondos locales (Rutas relativas optimizadas desde la raíz)
        { name: "Local Wall. 1", url: "url('assets/wallpapers/wallpaper1.jpg')" },
        { name: "Local Wall. 2", url: "url('assets/wallpapers/wallpaper2.jpeg')" },
        { name: "Local Wall. 3", url: "url('assets/wallpapers/wallpaper3.png')" },
        { name: "Local Wall. 4", url: "url('assets/wallpapers/wallpaper4.png')" }
    ],

    /**
     * Abre el panel de configuración avanzado
     */
    open() {
        const appId = 'settings';
        const title = 'System Settings';

        // Verificar el estado actual del traductor para marcar el interruptor de forma correcta
        const isTranslationEnabled = window.OSTranslator ? window.OSTranslator.enabled : true;

        let htmlContent = `
            <div class="settings-wrapper" style="display: flex; flex-direction: column; gap: 16px; height: 100%; overflow-y: auto; padding-right: 4px;">
                
                <div class="settings-section" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 12px;">
                    <h3 style="font-size: 13px; color: #a855f7; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; margin-top:0;">
                        <span>🎨</span> Desktop Gradients
                    </h3>
                    <div class="theme-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
        `;

        // Inyectar los botones de los temas de degradados
        this.themes.forEach((theme, index) => {
            htmlContent += `
                <button class="theme-btn" data-index="${index}" style="
                    background: rgba(255,255,255,0.03); 
                    border: 1px solid rgba(255,255,255,0.08); 
                    color: #fff; padding: 8px 10px; 
                    border-radius: 8px; 
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

                <div class="settings-section" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 12px;">
                    <h3 style="font-size: 13px; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; margin-top:0;">
                        <span>🖼️</span> HD & Local Wallpapers
                    </h3>
                    <div class="wallpaper-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
        `;

        // Inyectar los 8 botones de imágenes totales del arreglo unificado
        this.wallpapers.forEach((wp, index) => {
            htmlContent += `
                <button class="wp-btn" data-index="${index}" style="
                    background: rgba(255,255,255,0.03); 
                    border: 1px solid rgba(255,255,255,0.08); 
                    color: #fff; padding: 8px 10px; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    font-size: 11px; 
                    font-weight: 500;
                    text-align: left;
                    transition: all 0.2s;
                ">${wp.name}</button>
            `;
        });

        htmlContent += `
                    </div>
                </div>

                <div class="settings-section" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 style="font-size: 13px; color: #6366f1; margin-bottom: 2px; display: flex; align-items: center; gap: 8px; margin-top:0;">
                            <span>🌐</span> Smart Translator (Hover)
                        </h3>
                        <p style="font-size: 11px; color: rgba(255,255,255,0.5); margin: 0;">Translate words when you hover over them.</p>
                    </div>
                    
                    <label class="switch-container" style="position: relative; display: inline-block; width: 46px; height: 24px; cursor: pointer;">
                        <input type="checkbox" id="translator-toggle" ${isTranslationEnabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                        <span class="slider-trans" style="
                            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                            background-color: rgba(255,255,255,0.1);
                            border: 1px solid rgba(255,255,255,0.1);
                            border-radius: 24px;
                            transition: .3s;
                        "></span>
                    </label>
                </div>

                <div style="margin-top: auto; text-align: center; font-size: 10px; color: rgba(255,255,255,0.3); font-family: monospace; padding-top: 8px;">
                    NextLang OS Core v2.1.0 · Status: Operational
                </div>
            </div>
        `;

        if (window.OSKernel) {
            window.OSKernel.createWindow(appId, title, htmlContent);
            
            // Ajuste leve de la ventana ya que ahora el contenedor consume menos espacio vertical
            const winEl = document.getElementById(`win-${appId}`);
            if (winEl) {
                winEl.style.width = '380px';
                winEl.style.height = '430px'; 
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

        const desktopEl = document.getElementById('os-container');

        // 1. Manejador para los botones de DEGRADADOS
        const themeButtons = winEl.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.onmouseover = () => btn.style.borderColor = 'rgba(168, 85, 247, 0.5)';
            btn.onmouseout = () => btn.style.borderColor = 'rgba(255,255,255,0.08)';
            
            btn.onclick = () => {
                if (desktopEl) {
                    desktopEl.style.backgroundImage = 'none';
                    const index = btn.getAttribute('data-index');
                    desktopEl.style.background = this.themes[index].value;
                }
            };
        });

        // 2. Manejador para los botones de IMÁGENES (Web + Locales)
        const wpButtons = winEl.querySelectorAll('.wp-btn');
        wpButtons.forEach(btn => {
            btn.onmouseover = () => btn.style.borderColor = 'rgba(56, 189, 248, 0.5)';
            btn.onmouseout = () => btn.style.borderColor = 'rgba(255,255,255,0.08)';
            
            btn.onclick = () => {
                if (desktopEl) {
                    const index = btn.getAttribute('data-index');
                    const wp = this.wallpapers[index];
                    
                    desktopEl.style.background = wp.url;
                    desktopEl.style.backgroundSize = 'cover';
                    desktopEl.style.backgroundPosition = 'center';
                    desktopEl.style.backgroundRepeat = 'no-repeat';
                }
            };
        });

        // 3. Lógica del Interruptor del Traductor Inteligente
        const transToggle = winEl.querySelector('#translator-toggle');
        const sliderTrans = winEl.querySelector('.slider-trans');
        
        const updateTransSliderStyle = (isChecked) => {
            if (isChecked) {
                sliderTrans.style.backgroundColor = 'rgba(99, 102, 241, 0.3)';
                sliderTrans.style.borderColor = '#6366f1';
            } else {
                sliderTrans.style.backgroundColor = 'rgba(255,255,255,0.1)';
                sliderTrans.style.borderColor = 'rgba(255,255,255,0.1)';
            }
        };
        
        updateTransSliderStyle(transToggle.checked);

        transToggle.onchange = () => {
            updateTransSliderStyle(transToggle.checked);
            
            if (window.OSTranslator) {
                window.OSTranslator.enabled = transToggle.checked;
                
                if (!transToggle.checked && window.OSTranslator.tooltip) {
                    window.OSTranslator.tooltip.style.display = 'none';
                }
            }
        };
    }
};

// Exponer la app globalmente
window.AppSettings = AppSettings;