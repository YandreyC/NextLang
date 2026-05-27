/**
 * NextLang OS Module: Gestor de Usuarios y Autenticación
 */

const OSUsers = {
    // Base de datos de usuarios simulada (puedes cambiar las contraseñas aquí)
    database: {
        "admin": { name: "Administrador", avatar: "#6366f1", role: "Root User" },
        "yeison": { name: "Yeison Caicedo", avatar: "#d946ef", role: "Systems Engineer" },
        "laura": { name: "Laura", avatar: "#27c93f", role: "Guest User" }
    },
    currentUser: null,

    /**
     * Muestra la pantalla de inicio de sesión superpuesta
     */
    renderLoginScreen() {
        const container = document.getElementById('os-container');
        if (!container) return;

        // Crear el contenedor de la pantalla de bloqueo si no existe
        let loginEl = document.getElementById('os-login-screen');
        if (!loginEl) {
            loginEl = document.createElement('div');
            loginEl.id = 'os-login-screen';
            // Estilos de cristal esmerilado profundo para bloquear el escritorio trasero
            Object.assign(loginEl.style, {
                position: 'absolute',
                top: '0', left: '0', width: '100vw', height: '100vh',
                background: 'rgba(7, 8, 13, 0.8)',
                backdropFilter: 'blur(40px)',
                webkitBackdropFilter: 'blur(40px)',
                zIndex: '999999', // Por encima de todo, incluso del Dock
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.5s ease'
            });
            container.appendChild(loginEl);
        }

        loginEl.innerHTML = `
            <div class="login-card" style="
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 24px;
                box-shadow: 0 30px 60px rgba(0,0,0,0.4);
                width: 320px;
                text-align: center;
            ">
                <div id="login-avatar" style="width: 70px; height: 70px; background: linear-gradient(45deg, #6366f1, #a855f7); border-radius: 20px; margin: 0 auto 20px; transition: background 0.3s;"></div>
                <h2 style="color: #fff; font-size: 18px; margin-bottom: 5px; font-weight: 600;">NextLang OS</h2>
                <p id="login-msg" style="color: rgba(255,255,255,0.4); font-size: 11px; margin-bottom: 25px;">Enter your login credentials</p>
                
                <input type="text" id="login-username" placeholder="User" autocomplete="off" style="
                    width: 100%; padding: 12px 16px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px; color: #fff; font-size: 13px; margin-bottom: 12px; outline: none; transition: border 0.2s;
                ">
                
                <input type="password" id="login-password" placeholder="Password" style="
                    width: 100%; padding: 12px 16px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px; color: #fff; font-size: 13px; margin-bottom: 20px; outline: none; transition: border 0.2s;
                ">
                
                <button id="login-submit" style="
                    width: 100%; padding: 12px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                    border: none; border-radius: 12px; color: #fff; font-weight: 600; font-size: 13px; cursor: pointer;
                    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3); transition: all 0.2s;
                ">Sign In</button>
            </div>
        `;

        this.setupLoginEvents(loginEl);
    },

    /**
     * Captura las interacciones de la pantalla de Login
     */
    setupLoginEvents(loginEl) {
        const usernameInput = loginEl.querySelector('#login-username');
        const passwordInput = loginEl.querySelector('#login-password');
        const submitBtn = loginEl.querySelector('#login-submit');
        const avatarEl = loginEl.querySelector('#login-avatar');
        const msgEl = loginEl.querySelector('#login-msg');

        // Efecto dinámico: Cambiar color de avatar si el usuario existe mientras escribe
        usernameInput.oninput = () => {
            const userKey = usernameInput.value.trim().toLowerCase();
            if (this.database[userKey]) {
                avatarEl.style.background = this.database[userKey].avatar;
            } else {
                avatarEl.style.background = 'linear-gradient(45deg, #6366f1, #a855f7)';
            }
        };

        const handleLogin = () => {
            const userKey = usernameInput.value.trim().toLowerCase();
            const password = passwordInput.value;

            // Validación simple: Cualquier usuario de la BD con contraseña "123"
            if (this.database[userKey] && password === "123") {
                msgEl.style.color = '#27c93f';
                msgEl.innerText = "Acceso concedido. Cargando entorno...";
                submitBtn.style.background = '#27c93f';
                submitBtn.innerText = "✓";

                this.currentUser = this.database[userKey];

                // Aplicar cambios visuales al Panel de Control antes de entrar
                this.updateSystemIdentity();

                // Animación de salida fluida
                setTimeout(() => {
                    loginEl.style.opacity = '0';
                    loginEl.style.transform = 'scale(1.05)';
                    setTimeout(() => loginEl.remove(), 500);
                }, 1000);

            } else {
                // Animación de error sutil
                msgEl.style.color = '#ff5f56';
                msgEl.innerText = "Usuario o contraseña incorrectos.";
                usernameInput.style.borderColor = 'rgba(255, 95, 86, 0.4)';
                passwordInput.style.borderColor = 'rgba(255, 95, 86, 0.4)';
                setTimeout(() => {
                    msgEl.style.color = 'rgba(255,255,255,0.4)';
                    msgEl.innerText = "Introduce las credenciales de acceso";
                    usernameInput.style.borderColor = 'rgba(255,255,255,0.05)';
                    passwordInput.style.borderColor = 'rgba(255,255,255,0.05)';
                }, 2000);
            }
        };

        submitBtn.onclick = handleLogin;
        passwordInput.onkeydown = (e) => { if (e.key === 'Enter') handleLogin(); };
    },

    /**
     * Sincroniza la sesión activa con el menú de inicio de NextLang OS
     */
    updateSystemIdentity() {
        const sessionName = document.getElementById('session-username');
        const sessionRole = document.getElementById('session-user-role');
        const sessionAvatar = document.getElementById('session-avatar');

        if (this.currentUser) {
            if (sessionName) sessionName.innerText = this.currentUser.name;
            if (sessionRole) sessionRole.innerText = this.currentUser.role;
            if (sessionAvatar) sessionAvatar.style.background = this.currentUser.avatar;
        }
    }
};

window.OSUsers = OSUsers;