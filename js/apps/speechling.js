/**
 * NextLang OS App: Speechling Launcher Module
 * Lanza la plataforma oficial de Speechling de forma segura en una pestaña externa
 */
window.AppSpeechling = {
    open() {
        // URL directa a la plataforma de Speechling en español
        const url = 'https://speechling.com/es/'; 
        
        // Registro en la consola simulando el comportamiento de Kernel
        console.log("Kernel: Redirigiendo proceso 'speechling' a una pasarela externa segura...");

        // Abre Speechling directamente en una nueva pestaña del navegador
        window.open(url, '_blank');
    }
};