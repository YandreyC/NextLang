/**
 * WebOS Application: Bloc de Notas (Notepad.exe)
 * Especializado para la funcionalidad de traducción al pasar el cursor.
 */

const AppNotepad = {
    // Contador para permitir abrir múltiples instancias del bloc de notas si se desea
    instanceCount: 0,

    /**
     * Abre una nueva ventana del Bloc de Notas
     */
    open() {
        this.instanceCount++;
        const appId = `notepad-${this.instanceCount}`;
        const title = `Notepad.exe - Documento ${this.instanceCount}`;

        // Texto de prueba en inglés estructurado de forma atractiva
        const defaultText = `
            <div class="notepad-container">
                <h2 style="margin-bottom: 10px; color: #a855f7;">System Welcome Log</h2>
                <p style="margin-bottom: 12px;">
                    Welcome to your new futuristic web operating system. This environment is built entirely 
                    with HTML, CSS, and JavaScript, featuring an elegant glassmorphism user interface.
                </p>
                <p style="margin-bottom: 12px;">
                    Our main feature is the instant translation module. If you move your cursor or hover 
                    over any English word inside this window, a smart tooltip will immediately show you 
                    the Spanish translation. Try it with words like <strong>system</strong>, <strong>welcome</strong>, 
                    <strong>file</strong>, or <strong>settings</strong>.
                </p>
                <p style="font-size: 12px; color: rgba(255,255,255,0.4); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                    Press the shutdown button in the start menu to close the environment safely.
                </p>
            </div>
        `;

        // Llamamos al kernel del sistema operativo para que renderice la ventana de cristal
        if (window.OSKernel) {
            window.OSKernel.createWindow(appId, title, defaultText);
            this.setupAppControls(appId);
        } else {
            console.error("OSKernel no encontrado. Asegúrate de cargar os-kernel.js primero.");
        }
    },

    /**
     * Configuración de interacciones específicas dentro del Bloc de Notas
     * @param {string} appId - ID de la instancia de la ventana
     */
    setupAppControls(appId) {
        const winElement = document.getElementById(`win-${appId}`);
        if (!winElement) return;

        // Aquí podrías añadir lógica extra para la app, como un botón de guardar,
        // escuchar atajos de teclado dentro de la ventana, etc.
        console.log(`Aplicación Bloc de Notas (${appId}) inicializada correctamente.`);
    }
};

// Exponer la aplicación globalmente para que main.js la pueda invocar
window.AppNotepad = AppNotepad;