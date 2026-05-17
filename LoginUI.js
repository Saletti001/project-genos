// =========================================
// LoginUI.js - INTERFAZ DE INICIO DE SESIÓN
// =========================================

window.LoginUI = {
    inyectar: function() {
        const html = `
            <div id="pantalla-login" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at center, rgba(11, 26, 46, 0.9) 0%, rgba(2, 6, 15, 1) 100%); z-index: 10000; display: flex; flex-direction: column; justify-content: center; align-items: center; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); overflow: hidden;">

                <style>
                    @keyframes moveGrid {
                        0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); }
                        100% { transform: perspective(500px) rotateX(60deg) translateY(40px) translateZ(-200px); }
                    }
                    @keyframes floatPanel {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-8px); }
                        100% { transform: translateY(0px); }
                    }
                    @keyframes pulseGlow {
                        0% { filter: drop-shadow(0 0 5px rgba(0,210,255,0.4)); box-shadow: inset 0 0 10px rgba(0,210,255,0.3); }
                        50% { filter: drop-shadow(0 0 15px rgba(0,210,255,0.8)); box-shadow: inset 0 0 20px rgba(0,210,255,0.6); }
                        100% { filter: drop-shadow(0 0 5px rgba(0,210,255,0.4)); box-shadow: inset 0 0 10px rgba(0,210,255,0.3); }
                    }
                </style>

                <div style="position: absolute; top: 0; left: -50%; width: 200%; height: 200%; background-image: linear-gradient(rgba(0, 210, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 210, 255, 0.1) 1px, transparent 1px); background-size: 40px 40px; transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px); animation: moveGrid 3s linear infinite; pointer-events: none;"></div>
                
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(180deg, rgba(2,6,15,1) 30%, transparent 100%); pointer-events: none;"></div>

                <div class="modal-content" style="position: relative; background: linear-gradient(180deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%); border: 2px solid #00d2ff; box-shadow: 0 0 30px rgba(0, 210, 255, 0.2), inset 0 0 20px rgba(0,210,255,0.1); width: 85%; max-width: 320px; border-radius: 15px; padding: 30px 20px 20px 20px; box-sizing: border-box; text-align: center; font-family: monospace, sans-serif; animation: floatPanel 4s ease-in-out infinite;">
                    
                    <div style="position: absolute; top: -35px; left: 50%; transform: translateX(-50%); width: 70px; height: 70px; background: #0f172a; border-radius: 50%; border: 2px solid #00d2ff; display: flex; justify-content: center; align-items: center; animation: pulseGlow 2s infinite;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2v20"></path>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    
                    <h3 style="margin: 15px 0 5px 0; color: #00d2ff; text-transform: uppercase; font-size: 20px; font-weight: 900; letter-spacing: 2px; text-shadow: 0 0 15px rgba(0, 210, 255, 0.8);">PROYECTO GENOS</h3>
                    <p style="font-size: 10px; margin-bottom: 25px; color: #80deea; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(0,210,255,0.3); padding-bottom: 10px;">Conexión a la Red Nexo</p>
                    
                    <div style="position: relative; margin-bottom: 15px;">
                        <svg style="position: absolute; left: 12px; top: 12px; opacity: 0.7;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4dd0e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <input type="email" id="login-email" placeholder="Correo Electrónico" style="width: 100%; padding: 12px 12px 12px 38px; border-radius: 8px; border: 1px solid rgba(77, 208, 225, 0.5); background: rgba(0,0,0,0.6); color: white; outline: none; font-family: monospace; box-sizing: border-box; font-size: 13px; transition: all 0.3s;" onfocus="this.style.borderColor='#00d2ff'; this.style.boxShadow='0 0 10px rgba(0,210,255,0.3)';" onblur="this.style.borderColor='rgba(77, 208, 225, 0.5)'; this.style.boxShadow='none';">
                    </div>

                    <div style="position: relative; margin-bottom: 25px;">
                        <svg style="position: absolute; left: 12px; top: 12px; opacity: 0.7;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4dd0e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <input type="password" id="login-pass" placeholder="Contraseña (mín. 6)" style="width: 100%; padding: 12px 12px 12px 38px; border-radius: 8px; border: 1px solid rgba(77, 208, 225, 0.5); background: rgba(0,0,0,0.6); color: white; outline: none; font-family: monospace; box-sizing: border-box; font-size: 13px; transition: all 0.3s;" onfocus="this.style.borderColor='#00d2ff'; this.style.boxShadow='0 0 10px rgba(0,210,255,0.3)';" onblur="this.style.borderColor='rgba(77, 208, 225, 0.5)'; this.style.boxShadow='none';">
                    </div>
                    
                    <button id="btn-iniciar" style="width: 100%; padding: 14px; margin-bottom: 12px; background: linear-gradient(90deg, #00d2ff, #8A2BE2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: monospace; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 4px 15px rgba(138, 43, 226, 0.4); transition: transform 0.1s;" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">Conectar</button>
                    
                    <button id="btn-registro" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); color: #00d2ff; border: 1px dashed #00d2ff; border-radius: 8px; cursor: pointer; font-family: monospace; font-size: 11px; transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px;" onmouseover="this.style.background='rgba(0, 210, 255, 0.1)'" onmouseout="this.style.background='rgba(0,0,0,0.3)'">Sintetizar Cuenta</button>
                    
                    <p id="login-msg" style="color: #ff4c4c; font-size: 11px; margin-top: 15px; min-height: 15px; text-transform: uppercase; font-weight: bold; text-shadow: 0 0 5px rgba(255, 76, 76, 0.5);"></p>
                </div>
            </div>
        `;
        const contenedor = document.createElement('div');
        contenedor.innerHTML = html;
        
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
            msg.style.textShadow = `0 0 5px ${color}`;
        }
    }
};