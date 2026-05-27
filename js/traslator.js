/**
 * NextLang OS Core Module: Traductor Inteligente (Hover & Tooltip)
 * Versión Corregida con Auto-Inicialización y Limpieza Estricta de Tokens
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
        "settings": "Configuración / Ajustes"
    },

    /**
     * Inicializa el módulo enlazando o creando el elemento del tooltip en el DOM
     */
    init() {
        // Intentamos buscar si ya existe en el HTML
        this.tooltip = document.getElementById('os-translator-tooltip');
        
        // Si no existe en el index.html, lo inyectamos dinámicamente en el body
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.id = 'os-translator-tooltip';
            document.body.appendChild(this.tooltip);
        }
        console.log("Módulo OSTranslator acoplado y listo.");
    },

    /**
     * Escanea un contenedor, procesa los nodos de texto y aísla las palabras traducibles
     */
    run(container) {
        if (!container) return;
        
        // Aseguramos que el tooltip esté listo antes de procesar eventos
        if (!this.tooltip) {
            this.init();
        }

        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const nodesToProcess = [];
        while (walker.nextNode()) {
            // Evitamos procesar texto que ya esté dentro de elementos de control o scripts
            if (walker.currentNode.parentNode.tagName !== 'SCRIPT' && 
                walker.currentNode.parentNode.tagName !== 'STYLE' &&
                !walker.currentNode.parentNode.classList.contains('translatable-word')) {
                nodesToProcess.push(walker.currentNode);
            }
        }

        nodesToProcess.forEach(node => {
            const text = node.nodeValue;
            // Separamos por palabras manteniendo los espacios y saltos de línea
            const parts = text.split(/(\s+)/);
            const fragment = document.createDocumentFragment();
            let hasChange = false;

            parts.forEach(part => {
                // Limpieza estricta: removemos cualquier signo de puntuación común
                const cleanWord = part.toLowerCase().trim().replace(/[^a-z]/g, "");

                if (cleanWord && this.dictionary[cleanWord]) {
                    const span = document.createElement('span');
                    span.className = 'translatable-word';
                    span.textContent = part;
                    
                    // Vinculamos los eventos del mouse directamente al nuevo elemento
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
    bindHoverEvents(element, cleanWord) {
        element.onmouseenter = (e) => {
            if (!this.enabled || !this.tooltip) return;

            const translation = this.dictionary[cleanWord];
            this.tooltip.innerHTML = `<strong style="color: #a855f7;">${cleanWord.toUpperCase()}</strong>: ${translation}`;
            this.tooltip.style.display = 'block';
        };

        element.onmousemove = (e) => {
            if (!this.enabled || !this.tooltip) return;

            // Posicionamiento fixed reactivo al viewport del navegador (Evita desfases de scrolls)
            this.tooltip.style.left = `${e.clientX + 15}px`;
            this.tooltip.style.top = `${e.clientY - 35}px`;
        };

        element.onmouseleave = () => {
            if (this.tooltip) {
                this.tooltip.style.display = 'none';
            }
        };
    }
};