// =========================================
// LoginUI.js - INTERFAZ DE INICIO DE SESIÓN
// =========================================

window.LoginUI = {
    inyectar: function() {
        const html = `
            <div id="pantalla-login" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(10, 10, 20, 0.95); z-index: 10000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; font-family: monospace, sans-serif; backdrop-filter: blur(5px);">
                <div style="background: #1a1a2e; padding: 40px; border-radius: 12px; border: 2px solid #00d2ff; box-shadow: 0 0 30px rgba(0,210,255,0.2); text-align: center; width: 320px;">
                    <h1 style="margin-top: 0; color: #00d2ff; text-shadow: 0 0 10px #00d2ff; font-size: 28px;">PROYECTO GENOS</h1>
                    <p style="font-size: 14px; margin-bottom: 25px; color: #a0a0b0;">Conecta con la Red Central</p>
                    
                    <input type="email" id="login-email" placeholder="Correo Electrónico" style="width: 90%; padding: 12px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #4CAF50; background: #0f0f1a; color: white; outline: none; font-family: monospace;">
                    <input type="password" id="login-pass" placeholder="Contraseña (mínimo 6)" style="width: 90%; padding: 12px; margin-bottom: 25px; border-radius: 6px; border: 1px solid #4CAF50; background: #0f0f1a; color: white; outline: none; font-family: monospace;">
                    
                    <button id="btn-iniciar" style="width: 100%; padding: 12px; margin-bottom: 15px; background: linear-gradient(90deg, #4CAF50, #8bc34a); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: monospace; font-size: 16px; text-transform: uppercase;">Iniciar Sesión</button>
                    <button id="btn-registro" style="width: 100%; padding: 12px; background: transparent; color: #00d2ff; border: 1px solid #00d2ff; border-radius: 6px; cursor: pointer; font-family: monospace; font-size: 14px; transition: 0.3s;">Crear Cuenta Nueva</button>
                    
                    <p id="login-msg" style="color: #ff4c4c; font-size: 13px; margin-top: 20px; min-height: 15px;"></p>
                </div>
            </div>
        `;
        const contenedor = document.createElement('div');
        contenedor.innerHTML = html;
        document.body.appendChild(contenedor.firstElementChild);
    },
    
    ocultar: function() {
        const pantalla = document.getElementById("pantalla-login");
        if(pantalla) pantalla.style.display = "none";
    },

    mostrarMensaje: function(texto, color = "#ff4c4c") {
        const msg = document.getElementById("login-msg");
        if(msg) {
            msg.style.color = color;
            msg.innerText = texto;
        }
    }
};