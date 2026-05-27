/**
 * WebOS Application: Calculadora Neumórfica/Glassmorphism
 */

const AppCalculator = {
    /**
     * Abre una instancia única de la calculadora
     */
    open() {
        const appId = 'calculator';
        const title = 'Calculator';

        // Estructura HTML de la calculadora con estilos en línea alineados al diseño futurista
        const htmlContent = `
            <div class="calc-wrapper" style="display: flex; flex-direction: column; height: 100%; justify-content: space-between; padding: 5px;">
                
                <div id="calc-screen" style="
                    background: rgba(0, 0, 0, 0.3); 
                    border: 1px solid rgba(255, 255, 255, 0.05); 
                    border-radius: 12px; 
                    padding: 15px; 
                    text-align: right; 
                    font-size: 24px; 
                    font-family: monospace; 
                    color: #a855f7; 
                    min-height: 55px; 
                    word-wrap: break-word; 
                    margin-bottom: 15px;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
                ">0</div>

                <div class="calc-buttons" style="
                    display: grid; 
                    grid-template-columns: repeat(4, 1fr); 
                    gap: 10px;
                ">
                    <button class="calc-btn op" style="${this.getBtnStyle('#ff5f56')}" onclick="AppCalculator.clear()">C</button>
                    <button class="calc-btn op" style="${this.getBtnStyle('#6366f1')}" onclick="AppCalculator.append('(')">(</button>
                    <button class="calc-btn op" style="${this.getBtnStyle('#6366f1')}" onclick="AppCalculator.append(')')">)</button>
                    <button class="calc-btn op" style="${this.getBtnStyle('#d946ef')}" onclick="AppCalculator.append('/')">/</button>

                    <button class="calc-btn" style="${this.getBtnStyle()}" onclick="AppCalculator.append('7')">7</button>
                    <button class="calc-btn" style="${this.getBtnStyle()}" onclick="AppCalculator.append('8')">8</button>
                    <button class="calc-btn" style="${this.getBtnStyle()}" onclick="AppCalculator.append('9')">9</button>
                    <button class="calc-btn op" style="${this.getBtnStyle('#d946ef')}" onclick="AppCalculator.append('*')">*</button>

                    <button class="calc-btn" style="${this.getBtnStyle()}" onclick="AppCalculator.append('4')">4</button>
                    <button class="calc-btn" style="${this.getBtnStyle()}" onclick="AppCalculator.append('5')">5</button>
                    <button class="calc-btn" style="${this.getBtnStyle()}" onclick="AppCalculator.append('6')">6</button>
                    <button class="calc-btn op" style="${this.getBtnStyle('#d946ef')}" onclick="AppCalculator.append('-')">-</button>

                    <button class="calc-btn" style="${this.getBtnStyle()}" onclick="AppCalculator.append('1')">1</button>
                    <button class="calc-btn" style="${this.getBtnStyle()}" onclick="AppCalculator.append('2')">2</button>
                    <button class="calc-btn" style="${this.getBtnStyle()}" onclick="AppCalculator.append('3')">3</button>
                    <button class="calc-btn op" style="${this.getBtnStyle('#d946ef')}" onclick="AppCalculator.append('+')">+</button>

                    <button class="calc-btn" style="${this.getBtnStyle()}" onclick="AppCalculator.append('0')">0</button>
                    <button class="calc-btn" style="${this.getBtnStyle()}" onclick="AppCalculator.append('.')">.</button>
                    <button class="calc-btn op" style="${this.getBtnStyle('#6366f1')}" onclick="AppCalculator.deleteLast()">⌫</button>
                    <button class="calc-btn op" style="${this.getBtnStyle('#27c93f')}" onclick="AppCalculator.evaluate()">=</button>
                </div>
            </div>
        `;

        if (window.OSKernel) {
            // Le pedimos al kernel que cree la ventana (forzamos dimensiones más estilizadas para calculadora)
            window.OSKernel.createWindow(appId, title, htmlContent);
            
            // Ajustamos el tamaño por defecto de la ventana desde el JS para que no quede muy estirada
            const winEl = document.getElementById(`win-${appId}`);
            if (winEl) {
                winEl.style.width = '320px';
                winEl.style.height = '430px';
            }
        }
    },

    /**
     * Generador de estilos CSS en línea dinámicos para los botones flotantes
     */
    getBtnStyle(color = 'rgba(255,255,255,0.05)') {
        const isSpecialColor = color.startsWith('#');
        return `
            background: ${isSpecialColor ? 'rgba(255,255,255,0.02)' : color};
            border: 1px solid ${isSpecialColor ? color + '44' : 'rgba(255,255,255,0.08)'};
            color: ${isSpecialColor ? color : 'rgba(255,255,255,0.8)'};
            padding: 15px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            text-shadow: ${isSpecialColor ? '0 0 8px ' + color + 'aa' : 'none'};
        `;
    },

    // ==========================================
    // LÓGICA DE PROCESAMIENTO MATEMÁTICO
    // ==========================================
    
    append(char) {
        const screen = document.getElementById('calc-screen');
        if (!screen) return;
        if (screen.innerText === '0' && !isNaN(char)) {
            screen.innerText = char;
        } else {
            screen.innerText += char;
        }
    },

    clear() {
        const screen = document.getElementById('calc-screen');
        if (screen) screen.innerText = '0';
    },

    deleteLast() {
        const screen = document.getElementById('calc-screen');
        if (!screen) return;
        if (screen.innerText.length > 1) {
            screen.innerText = screen.innerText.slice(0, -1);
        } else {
            screen.innerText = '0';
        }
    },

    evaluate() {
        const screen = document.getElementById('calc-screen');
        if (!screen) return;
        try {
            // Evaluamos la expresión matemática de la pantalla de forma segura con JavaScript nativo
            // Reemplazamos los caracteres de seguridad si los hubiera
            const result = eval(screen.innerText);
            screen.innerText = Number.isInteger(result) ? result : result.toFixed(4);
        } catch (error) {
            screen.innerText = 'Error';
            setTimeout(() => this.clear(), 1200);
        }
    }
};

// Exponer la app globalmente
window.AppCalculator = AppCalculator;