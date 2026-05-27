/**
 * NextLang OS Application: NextBrowser v3.0 (Navegación Interactiva de Resultados)
 */

const AppBrowser = {
    instanceCount: 0,

    /**
     * Abre una instancia del Navegador
     */
    open() {
        this.instanceCount++;
        const appId = `browser-${this.instanceCount}`;
        const title = `NextBrowser v3.0 - Active Web Navigation`;

        // Contenedor principal con soporte para Grid Dinámico (Lista + Lector)
        const htmlContent = `
            <div class="browser-wrapper" style="display: flex; flex-direction: column; height: 100%; gap: 10px; color: #fff;">
                
                <div class="browser-navbar" style="
                    display: flex; gap: 8px; align-items: center; background: rgba(0,0,0,0.3); 
                    padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);
                ">
                    <span style="font-size: 14px;">🌐</span>
                    <input type="text" class="br-url-input" placeholder="Search for concepts, technologies, or logs online..." style="
                        flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: #fff;
                        padding: 6px 14px; border-radius: 20px; font-size: 12px; font-family: monospace; outline: none;
                    ">
                    <button class="br-go-btn" style="
                        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border: none; color: #fff;
                        padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: bold; cursor: pointer;
                    ">Search</button>
                </div>

                <div class="browser-layout" style="
                    flex: 1; display: grid; grid-template-columns: 1fr 0fr; gap: 0px; overflow: hidden; transition: all 0.4s ease;
                ">
                    
                    <div class="browser-viewport" style="
                        background: rgba(10, 11, 18, 0.5); border-radius: 12px; overflow-y: auto; 
                        border: 1px solid rgba(255,255,255,0.05); padding: 20px; transition: all 0.3s;
                    ">
                        <div class="browser-welcome-msg" style="text-align: center; margin-top: 60px; color: rgba(255,255,255,0.4);">
                            <h3 style="color: #fff; margin-bottom: 8px;">NextBrowser Engine</h3>
                            <p style="font-size: 12px;">Access external knowledge bases without network restrictions.</p>
                        </div>
                        <div class="browser-results-container"></div>
                    </div>

                    <div class="browser-reader" style="
                        background: rgba(20, 22, 35, 0.95); border-radius: 12px; overflow: hidden;
                        border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; opacity: 0; transition: opacity 0.3s;
                    ">
                        <div style="background: rgba(0,0,0,0.3); padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <span id="reader-title" style="font-size: 11px; font-family: monospace; color: #818cf8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">Leyendo artículo...</span>
                            <button id="close-reader-btn" style="background: rgba(255,95,86,0.2); border: 1px solid #ff5f56; color: #ff5f56; padding: 2px 10px; border-radius: 6px; font-size: 10px; cursor: pointer;">✕ Cerrar Vista</button>
                        </div>
                        <iframe id="reader-iframe" style="flex: 1; width: 100%; height: 100%; border: none; background: #fff;"></iframe>
                    </div>

                </div>
            </div>
        `;

        if (window.OSKernel) {
            window.OSKernel.createWindow(appId, title, htmlContent);
            
            // Expandimos el tamaño predeterminado de la ventana para acomodar la vista dividida cómodamente
            const winEl = document.getElementById(`win-${appId}`);
            if (winEl) {
                winEl.style.width = '820px';
                winEl.style.height = '500px';
            }

            this.setupEvents(appId);
        }
    },

    /**
     * Orquestación de eventos y llamadas asíncronas mutables
     */
    setupEvents(appId) {
        const winEl = document.getElementById(`win-${appId}`);
        if (!winEl) return;

        const urlInput = winEl.querySelector('.br-url-input');
        const goBtn = winEl.querySelector('.br-go-btn');
        const resultsContainer = winEl.querySelector('.browser-results-container');
        const welcomeMsg = winEl.querySelector('.browser-welcome-msg');
        
        // Elementos del Layout de lectura dividida
        const layout = winEl.querySelector('.browser-layout');
        const reader = winEl.querySelector('.browser-reader');
        const readerIframe = winEl.querySelector('#reader-iframe');
        const readerTitle = winEl.querySelector('#reader-title');
        const closeReaderBtn = winEl.querySelector('#close-reader-btn');

        // Función para contraer el panel de lectura y volver a pantalla completa
        const closeReader = () => {
            layout.style.gridTemplateColumns = "1fr 0fr";
            layout.style.gap = "0px";
            reader.style.opacity = "0";
            readerIframe.src = "about:blank";
        };

        closeReaderBtn.onclick = closeReader;

        // Ejecución de la consulta a la API REST pública
        const executeSearch = async () => {
            const query = urlInput.value.trim();
            if (query === "") return;

            closeReader(); // Resetear el visor si había una lectura previa activa
            if (welcomeMsg) welcomeMsg.style.display = 'none';
            resultsContainer.innerHTML = `<p style="color: #a855f7; font-family: monospace; font-size: 12px; text-align: center; margin-top: 40px;">⏳ Consultando nodos de la red para: "${query}"...</p>`;

            try {
                const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=6&srsearch=${encodeURIComponent(query)}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.query && data.query.search.length > 0) {
                    let htmlResults = `<h4 style="color: rgba(255,255,255,0.4); font-size: 10px; text-transform: uppercase; margin-bottom: 15px; font-family: monospace;">Resultados (Haz clic en un título para abrir):</h4>`;

                    data.query.search.forEach(result => {
                        // Generamos una URL limpia compatible con visores embebidos móviles libres de restricciones de frame
                        const targetArticleUrl = `https://en.m.wikipedia.org/wiki/${encodeURIComponent(result.title)}`;

                        htmlResults += `
                            <div class="web-result-card" data-url="${targetArticleUrl}" data-title="${result.title}" style="
                                background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
                                padding: 14px; border-radius: 10px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s;
                            ">
                                <h5 style="margin: 0 0 6px 0; font-size: 13px; color: #818cf8; text-decoration: underline;">${result.title}</h5>
                                <p class="traducible-content" style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.6); line-height: 1.4;">
                                    ${result.snippet}...
                                </p>
                            </div>
                        `;
                    });

                    resultsContainer.innerHTML = htmlResults;

                    // Escaneo nativo por tokens del Traductor sobre los Snippets inyectados
                    if (window.OSTranslator && typeof window.OSTranslator.tokenizeContent === 'function') {
                        window.OSTranslator.tokenizeContent(resultsContainer);
                    }

                    // Vincular el evento click de acceso a cada tarjeta
                    resultsContainer.querySelectorAll('.web-result-card').forEach(card => {
                        card.onmouseover = () => { card.style.background = 'rgba(255,255,255,0.04)'; card.style.borderColor = 'rgba(129, 140, 248, 0.3)'; };
                        card.onmouseout = () => { card.style.background = 'rgba(255,255,255,0.02)'; card.style.borderColor = 'rgba(255,255,255,0.05)'; };
                        
                        card.onclick = () => {
                            const articleUrl = card.getAttribute('data-url');
                            const articleTitle = card.getAttribute('data-title');

                            // Activación del Split Layout mediante CSS Grid dinámico
                            layout.style.gridTemplateColumns = "1.2fr 1fr";
                            layout.style.gap = "15px";
                            reader.style.opacity = "1";
                            
                            // Inyección de parámetros e inicialización del visor web
                            readerTitle.innerText = `Reading: ${articleTitle}`;
                            readerIframe.src = articleUrl;
                        };
                    });

                } else {
                    resultsContainer.innerHTML = `<p style="color: #ff5f56; font-size: 11px; text-align: center; margin-top: 40px;">❌ No se encontraron registros para la consulta.</p>`;
                }

            } catch (error) {
                console.error("Navigation Error:", error);
                resultsContainer.innerHTML = `<p style="color: #ff5f56; font-size: 11px; text-align: center; margin-top: 40px;">⚠️ Error de resolución o timeout en la consulta remota.</p>`;
            }
        };

        // Disparadores lógicos
        goBtn.onclick = executeSearch;
        urlInput.onkeydown = (e) => { if (e.key === 'Enter') executeSearch(); };
    }
};

window.AppBrowser = AppBrowser;