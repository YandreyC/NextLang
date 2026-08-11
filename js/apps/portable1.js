/**
 * NextLang OS Core Module: Portable App Connector (portable1.js)
 * Gestiona el puente de comunicación HTTP hacia el host anfitrión
 */

const OSPortableConnector = {
    bridgeUrl: 'http://localhost:3000/launch',

    /**
     * Envía la orden de ejecución al servidor puente nativo
     * @param {string} appName - Nombre clave de la aplicación registrada
     */
    async launchNativeApp(appName) {
        console.log(`[Portable1] Solicitando al anfitrión abrir la app nativa: ${appName}`);
        
        try {
            const response = await fetch(this.bridgeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ app: appName })
            });

            const result = await response.json();

            if (result.success) {
                console.log(`[Portable1] Anfitrión respondió: ${result.message}`);
                return true;
            } else {
                console.error(`[Portable1] Error devuelto por el anfitrión: ${result.error}`);
                alert(`No se pudo abrir en el host: ${result.error}`);
                return false;
            }
        } catch (error) {
            console.error(`[Portable1] Error crítico de red en el puente local:`, error);
            alert("Error de conexión: Asegúrate de que el servidor puente (server.js) se esté ejecutando en tu computador anfitrión en el puerto 3000.");
            return false;
        }
    }
};

// Exportar globalmente al entorno del sistema
window.OSPortableConnector = OSPortableConnector;