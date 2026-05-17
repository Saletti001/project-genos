// =========================================
// LoginUI.js - INTERFAZ DE INICIO DE SESIÓN
// =========================================

window.LoginUI = {
    inyectar: function() {
        const html = `
            <div id="pantalla-login" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(11, 26, 46, 0.85); z-index: 10000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);">
                <div class="modal-content" style="background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 2px solid #00d2ff; box-shadow: 0 10px 30px rgba(0, 210, 255, 0.3); width: 85%; max-width: 320px; border-radius: 12px; padding: 25px 20px; box-sizing: border-box; text-align: center; font-family: monospace, sans-serif;">
                    
                    <h3 style="margin: 0 0 5px 0; color: #00d2ff; text-transform: uppercase; font-size: 18px; font-weight: 900; letter-spacing: 2px; text-shadow: 0 0 10px rgba(0, 210, 255, 0.6);">PROYECTO GENOS</h3>
                    <p style="font-size: 11px; margin-bottom: 20px; color: #a0a0b0; text-transform: uppercase; letter-spacing: 1px;">Conexión a la Red Nexo</p>
                    
                    <input type="email" id="login-email" placeholder="Correo Electrónico" style="width: 100%; padding: 12px; margin-bottom: 12px; border-radius: 8px; border: 1px solid #4dd0e1; background: rgba(0,0,0,0.4); color: white; outline: none; font-family: monospace; box-sizing: border-box; font-size: 13px;">
                    <input type="password" id="login-pass" placeholder="Contraseña (min. 6)" style="width: 100%; padding: 12px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #4dd0e1; background: rgba(0,0,0,0.4); color: white; outline: none; font-family: monospace; box-sizing: border-box; font-size: 13px;">
                    
                    <button id="btn-iniciar" style="width: 100%; padding: 12px; margin-bottom: 12px; background: linear-gradient(90deg, #4dd0e1, #8A2BE2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: monospace; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Iniciar Sesión</button>
                    <button id="btn-registro" style="width: 100%; padding: 12px; background: transparent; color: #00d2ff; border: 1px solid #00d2ff; border-radius: 8px; cursor: pointer; font-family: monospace; font-size: 12px; transition: 0.3s; text-transform: uppercase; letter-spacing: 1px;">Crear Cuenta Nueva</button>
                    
                    <p id="login-msg" style="color: #ff4c4c; font-size: 11px; margin-top: 15px; min-height: 15px; text-transform: uppercase; font-weight: bold;"></p>
                </div>
            </div>
        `;
        const contenedor = document.createElement('div');
        contenedor.innerHTML = html;
        
        // EL CAMBIO MÁGICO: Lo inyectamos dentro del contenedor del juego, no en la pantalla completa
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(contenedor.firstElementChild);
        } else {
            document.body.appendChild(contenedor.firstElementChild);
        }
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