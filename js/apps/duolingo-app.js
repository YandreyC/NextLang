/**
 * NextLang OS App: Duolingo Launcher Module
 * Lanza la plataforma oficial de Duolingo de forma segura en una pestaña externa
 */
window.AppDuolingo = {
    open() {
        // URL directa a la sección de aprendizaje de Duolingo
        const url = 'https://www.duolingo.com/learn'; 
        
        // Registro en la consola simulando el comportamiento de Kernel
        console.log("Kernel: Redirigiendo proceso 'duolingo' a una pasarela externa segura...");

        // Abre Duolingo directamente en una nueva pestaña del navegador
        window.open(url, '_blank');
    }
};