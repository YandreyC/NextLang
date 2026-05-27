window.AppDuolingo = {
    open() {
        const id = 'duolingo';
        // URL de Duolingo
        const url = 'https://www.duolingo.com'; 
        
        const content = `
            <div class="native-app-container">
                <iframe src="${url}" 
                        id="iframe-duolingo"
                        style="width:100%; height:100%; border:none;">
                </iframe>
            </div>
        `;
        
        window.OSKernel.createWindow(id, 'Duolingo - Aprende Idiomas', content);
        
        // Estilo especial para cuando se abre
        const win = document.getElementById(`win-${id}`);
        win.style.width = '900px';
        win.style.height = '600px';
    }
};