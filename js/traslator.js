/**
 * WebOS Core Module: Traductor Inteligente (Hover & Tooltip)
 * Escanea el texto, identifica palabras clave en inglés y renderiza el tooltip flotante.
 */

const OSTranslator = {
    enabled: true, // Controlado dinámicamente por la app Settings
    tooltip: null,

    // Diccionario básico de traducción técnica (Inglés -> Español)
    dictionary: {
        "welcome": "Bienvenido",
        "system": "Sistema",
        "futuristic": "Futurista",
        "operating": "Operativo",
        "environment": "Entorno / Ambiente",
        "built": "Construido",
        "entirely": "Completamente / En su totalidad",
        "elegant": "Elegante",
        "glassmorphism": "Glesmorfismo (Efecto Vidrio)",
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
        "show": "Mostrará / Exhibirá",
        "file": "Archivo",
        "settings": "Configuración / Ajustes",
        "press": "Presionar / Pulsar",
        "shutdown": "Apagar / Apagado",
        "button": "Botón",
        "start": "Inicio",
        "menu": "Menú",
        "close": "Cerrar",
        "safely": "De forma segura",
        "management": "Gestión / Administración",
        "virtual": "Virtual",
        "automatic": "Automática",
        "requirements": "Requisitos",
        "modern": "Moderno",
        "browser": "Navegador",
        "curiosity": "Curiosidad",
        "status": "Estado",
        "running": "En ejecución / Corriendo",
        "memory": "Memoria",
        "allocation": "Asignación / Reserva",
        "stable": "Estable",
        "nominal": "Nominal / Dentro de lo normal",
        "security": "Seguridad",
        "active": "Activo",
        "unauthorized": "No autorizado",
        "access": "Acceso",
        "detected": "Detectado"
    },

    /**
     * Inicializa el contenedor del Tooltip en el documento
     */
    init() {
        if (document.getElementById('os-tooltip')) return;

        // Crear el elemento HTML del tooltip global
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'os-tooltip';
        this.tooltip.className = 'os-translator-tooltip';
        document.body.appendChild(this.tooltip);
    },

    /**
     * Toma un contenedor HTML (como el cuerpo de una ventana), analiza su texto
     * y envuelve las palabras conocidas en un <span> interactivo.
     * @param {HTMLElement} containerEl - El elemento de la ventana a escanear
     */
    tokenizeContent(containerEl) {
        if (!containerEl) return;
        this.init(); // Asegurar que el tooltip exista

        // Usamos un TreeWalker para modificar solo los nodos de texto sin romper etiquetas HTML internas (como <strong> o <br>)
        const walker = document.createTreeWalker(containerEl, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];

        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        // Procesar cada nodo de texto encontrado
        textNodes.forEach(node => {
            const originalText = node.nodeValue;
            
            // Expresión regular para separar el texto por palabras manteniendo signos de puntuación
            const words = originalText.split(/(\b[a-zA-Z]+\b)/g);
            
            let hasChange = false;
            const fragment = document.createDocumentFragment();

            words.forEach(part => {
                const lowerWord = part.toLowerCase();
                
                // Si la palabra está en nuestro diccionario, la convertimos en un elemento interactivo
                if (this.dictionary[lowerWord]) {
                    const span = document.createElement('span');
                    span.className = 'palabra-traducible';
                    span.innerText = part;
                    
                    // Asignamos el evento hover directamente a este token
                    this.bindHoverEvents(span, lowerWord);
                    
                    fragment.appendChild(span);
                    hasChange = true;
                } else {
                    // Si no es una palabra traducible, se deja como texto plano
                    fragment.appendChild(document.createTextNode(part));
                }
            });

            // Si se encontraron palabras traducibles en este nodo, lo reemplazamos en el DOM
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
            this.tooltip.innerHTML = `<strong style="color: #a855f7;">${cleanWord}</strong>: ${translation}`;
            this.tooltip.style.display = 'block';
        };

        element.onmousemove = (e) => {
            if (!this.enabled || !this.tooltip) return;

            // Posiciona el tooltip ligeramente arriba y a la derecha del cursor del mouse
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

// Registrar el módulo globalmente
window.OSTranslator = OSTranslator;