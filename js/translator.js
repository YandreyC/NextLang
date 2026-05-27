/**
 * NextLang OS Core Module: Traductor Inteligente (Hover & Tooltip)
 * Versión Corregida con Compatibilidad para la API de Interconexión del Kernel v3.2
 */

const OSTranslator = {
    enabled: true, 
    tooltip: null,

    // Diccionario centralizado de traducción (Inglés -> Español)
    dictionary: {
        "welcome": "Bienvenido",
        "system": "Sistema",
        "futuristic": "Futurista",
        "operating": "Operativo",
        "environment": "Entorno / Ambiente",
        "built": "Construido",
        "entirely": "Completamente / En su totalidad",
        "elegant": "Elegante",
        "glassmorphism": "Glassmorphism (Efecto Vidrio)",
        "user": "Usuario",
        "interface": "Interfaz",
        "main": "Principal",
        "feature": "Característica / Función",
        "instant": "Instantánea",
        "translation": "Traducción",
        "module": "Módulo",
        "move": "Mover",
        "cursor": "Cursor / Puntero",
        "hover": "Pasar el ratón por encima",
        "word": "Palabra",
        "inside": "Dentro de",
        "window": "Ventana",
        "smart": "Inteligente",
        "immediately": "Inmediatamente",
        "show": "Mostrar",
        "file": "Archivo",
        "settings": "Configuración / Ajustes",
        "architecture": "Arquitectura",
        "persistence": "Persistencia",
        "active": "Activa / En ejecución",
        "documents": "Documentos",
        "pictures": "Imágenes / Fotos",

        // Nuevas entradas para hover en íconos / menú / dock
        "notepad": "Bloc de notas",
        "calculator": "Calculadora",
        "files": "Archivos",
        "file explorer": "Explorador de archivos",
        "explorer": "Explorador",
        "terminal": "Terminal",
        "command": "Comando",
        "prompt": "Indicador",
        "taskmanager": "Administrador de tareas",
        "system monitor": "Monitor del sistema",
        "monitor": "Monitor",
        "browser": "Navegador",
        "computer": "Computadora",
        "shutdown": "Apagar",
        "shut down": "Apagar",
        "computer shut down": "Apagar computadora",
        "settings menu": "Menú de configuración",
        "active apps": "Aplicaciones activas"
    },

    /**
     * Inicializa el módulo, el nodo flotante y sus estilos CSS esmerilados nativos
     */
    init() {
        this.tooltip = document.getElementById('os-translator-tooltip');
        
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.id = 'os-translator-tooltip';
            
            // Inyección de estilos de renderizado premium (Glassmorphism + Sombra Neon)
            Object.assign(this.tooltip.style, {
                position: 'fixed',
                display: 'none',
                background: 'rgba(15, 18, 36, 0.85)',
                backdropFilter: 'blur(12px)',
                webkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(168, 85, 247, 0.3)', // Borde sutil púrpura
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '11px',
                fontFamily: 'monospace',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 10px rgba(168, 85, 247, 0.15)',
                pointerEvents: 'none', // Evita que el tooltip parpadee al cruzarse con el cursor
                zIndex: '99999999' // Siempre por encima de cualquier ventana o dock
            });

            document.body.appendChild(this.tooltip);
        }

        // Inyectar regla global para resaltar las palabras traducibles con hover estético
        if (!document.getElementById('os-translator-styles')) {
            const style = document.createElement('style');
            style.id = 'os-translator-styles';
            style.innerHTML = `
                .translatable-word {
                    border-bottom: 1px dashed #a855f7;
                    cursor: help;
                    transition: color 0.2s ease;
                }
                .translatable-word:hover {
                    color: #c084fc !important;
                    background: rgba(168, 85, 247, 0.1);
                    border-radius: 3px;
                }
            `;
            document.head.appendChild(style);
        }

        console.log("OSTranslator module attached and ready.");
    },

    /**
     * FUNCIÓN CRITICA DE REPARACIÓN: Mapea la llamada del Kernel hacia el motor de renderizado
     * @param {HTMLElement} container - Nodo raíz de la ventana a escanear
     */
    translateContainerText(container) {
        this.run(container);
    },

    /**
     * Escanea un contenedor, procesa los nodos de texto y aísla las palabras traducibles
     */
    run(container) {
        if (!container) return;
        
        if (!this.tooltip) {
            this.init();
        }

        // Evita procesar nodos de UI donde no queremos “tokenizar” texto.
        const isInsideIgnored = (node) => {
            if (!node || !node.parentNode) return false;
            const ignored = node.parentElement && node.parentElement.closest;
            if (!ignored) return false;
            return !!node.parentElement.closest('.os-hover-translate-ignore');
        };

        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const nodesToProcess = [];
        while (walker.nextNode()) {
            const parent = walker.currentNode.parentNode;
            if (parent && 
                parent.tagName !== 'SCRIPT' && 
                parent.tagName !== 'STYLE' && 
                parent.tagName !== 'TEXTAREA' && // Evita alterar el flujo de edición del Notepad bruto
                !parent.classList.contains('translatable-word') &&
                !isInsideIgnored(walker.currentNode)) {
                nodesToProcess.push(walker.currentNode);
            }
        }

        nodesToProcess.forEach(node => {
            const text = node.nodeValue;
            const parts = text.split(/(\s+)/);
            const fragment = document.createDocumentFragment();
            let hasChange = false;

            parts.forEach(part => {
                const cleanWord = part.toLowerCase().trim().replace(/[^a-z]/g, "");

                if (cleanWord && this.dictionary[cleanWord]) {
                    const span = document.createElement('span');
                    span.className = 'translatable-word';
                    span.textContent = part;
                    
                    this.bindHoverEvents(span, cleanWord);
                    
                    fragment.appendChild(span);
                    hasChange = true;
                } else {
                    fragment.appendChild(document.createTextNode(part));
                }
            });

            if (hasChange && node.parentNode) {
                node.parentNode.replaceChild(fragment, node);
            }
        });
    },

    /**
     * Vincula los controladores de movimiento de mouse a cada palabra tokenizada
     */
    showTooltipForKey(cleanWord, clientX, clientY) {
        if (!this.enabled || !this.tooltip) return;

        const translation = this.dictionary[cleanWord] || this.dictionary[cleanWord.replace(/\s+/g, ' ')] || null;
        if (!translation) return;

        this.tooltip.innerHTML = `<span style="color: #c084fc; font-weight: bold;">${cleanWord.toUpperCase()}</span> ➔ <span style="color: #27c93f;">${translation}</span>`;
        this.tooltip.style.display = 'block';

        if (typeof clientX === 'number' && typeof clientY === 'number') {
            // Coordenadas flotantes relativas al puntero con desfase ergonómico
            this.tooltip.style.left = `${clientX + 12}px`;
            this.tooltip.style.top = `${clientY - 38}px`;
        }
    },

    // Une hover sobre un elemento que representa una palabra clave (útil para iconos/dock/menú)
    bindHoverToKey(element, cleanWordKey) {
        if (!element) return;
        const key = cleanWordKey;

        element.onmouseenter = (e) => {
            const cx = e && typeof e.clientX === 'number' ? e.clientX : 0;
            const cy = e && typeof e.clientY === 'number' ? e.clientY : 0;
            this.showTooltipForKey(key, cx, cy);
        };

        element.onmousemove = (e) => {
            if (!this.enabled || !this.tooltip || this.tooltip.style.display === 'none') return;
            this.tooltip.style.left = `${e.clientX + 12}px`;
            this.tooltip.style.top = `${e.clientY - 38}px`;
        };

        element.onmouseleave = () => {
            if (this.tooltip) this.tooltip.style.display = 'none';
        };
    },

    bindHoverEvents(element, cleanWord) {
        // Mantener compatibilidad con el flujo antiguo de “palabras tokenizadas”
        this.bindHoverToKey(element, cleanWord);
    }
};


// Auto-inicialización del módulo en el hilo de ejecución principal
OSTranslator.init();
window.OSTranslator = OSTranslator;