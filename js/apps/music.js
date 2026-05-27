/**
 * NextLang OS App: YouTube Music Launcher Module
 * Lanza la plataforma oficial de YouTube Music de forma segura en una pestaña externa
 */
window.AppYouTubeMusic = {
    open() {
        // URL directa a YouTube Music
        const url = 'https://music.youtube.com/'; 
        
        // Registro en la consola simulando el comportamiento de Kernel
        console.log("Kernel: Redirigiendo proceso 'youtubemusic' a una pasarela externa segura...");

        // Abre la aplicación en una nueva pestaña
        window.open(url, '_blank');
    }
};