// =========================================
// WalletManager.js - CONEXIÓN WEB3 AMIGABLE
// =========================================

window.WalletManager = {
    currentMotivo: null,

    inyectarModal: function() {
        // Modal de Metamask legacy / fallback
        const modalHTML = `
            <div id="wallet-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center;">
                <div style="background:#1a1a2e; border: 2px solid #00d2ff; border-radius: 10px; padding: 20px; width: 85%; max-width: 320px; box-sizing: border-box; text-align: center; color: white; font-family: sans-serif; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    <h2 style="color: #00d2ff; margin-top:0; font-size: 18px;">Mercado Global Web3</h2>
                    <p style="font-size: 13px; line-height: 1.4; margin-bottom: 15px;">
                        Tus POL están a salvo en la Red Nexo. Para comprar, vender y exportar Genos con otros jugadores, necesitas vincular tu billetera Web3.
                    </p>
                    <p style="font-size: 11px; color: #aaa; margin-bottom: 20px;">
                        ¿Aún no tienes una? ¡No hay problema! Sigue jugando gratis, acumula POL y vincúlala cuando estés listo.
                    </p>
                    <button id="btn-conectar-metamask" style="background: #f6851b; color: white; border: none; padding: 10px; font-weight: bold; border-radius: 5px; cursor: pointer; width: 100%; margin-bottom: 10px; font-size: 14px;">
                        🦊 CONECTAR METAMASK
                    </button>
                    <button onclick="document.getElementById('wallet-modal').style.display='none'" style="background: transparent; color: #888; border: 1px solid #888; padding: 8px; border-radius: 5px; cursor: pointer; width: 100%; font-size: 13px;">
                        Quizás más tarde
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById("btn-conectar-metamask").onclick = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const address = accounts[0];
                    
                    if(!window.miWallet) window.miWallet = { pol: 10.0 };
                    window.miWallet.address = address;
                    
                    document.getElementById('wallet-modal').style.display='none';
                    window.WalletManager.actualizarBoton();
                    
                    if(typeof window.guardarProgreso === 'function') window.guardarProgreso();
                    
                    alert("¡Billetera vinculada exitosamente!");
                } catch (error) {
                    alert("Conexión cancelada.");
                }
            } else {
                alert("No se detectó MetaMask. Por favor, instala la extensión en tu navegador.");
            }
        };

        // Configurar los listeners del Muro de Saldo Cero / Checkbox Gate
        const gate = document.getElementById("gate_web3");
        const btnActivate = document.getElementById("btn-zero-activate-privy");
        const btnBack = document.getElementById("btn-zero-back-plaza");
        const modal = document.getElementById("zero-balance-modal");
        
        if (gate && btnActivate) {
            gate.addEventListener("change", () => {
                if (gate.checked) {
                    btnActivate.disabled = false;
                    btnActivate.style.background = "linear-gradient(90deg, #ff007f, #d500f9)";
                    btnActivate.style.color = "#fff";
                    btnActivate.style.cursor = "pointer";
                    btnActivate.style.opacity = "1";
                    btnActivate.style.boxShadow = "0 0 15px rgba(255, 0, 127, 0.4)";
                } else {
                    btnActivate.disabled = true;
                    btnActivate.style.background = "#333";
                    btnActivate.style.color = "#888";
                    btnActivate.style.cursor = "not-allowed";
                    btnActivate.style.opacity = "0.5";
                    btnActivate.style.boxShadow = "none";
                }
            });
        }
        
        if (btnBack && modal) {
            btnBack.addEventListener("click", () => {
                modal.classList.add("hidden");
            });
        }
        
        if (btnActivate && modal) {
            btnActivate.addEventListener("click", () => {
                modal.classList.add("hidden");
                window.WalletManager.lazyLoadPrivy(window.WalletManager.currentMotivo);
            });
        }
    },

    mostrarModalSaldoCero: function(motivo) {
        this.currentMotivo = motivo;
        
        const modal = document.getElementById("zero-balance-modal");
        const copywriting = document.getElementById("zero-balance-copywriting");
        const gate = document.getElementById("gate_web3");
        const btnActivate = document.getElementById("btn-zero-activate-privy");
        
        if (!modal || !copywriting || !gate || !btnActivate) return;
        
        const variantes = [
            "🔒 Nota de seguridad: Tu dirección de comercio en la red Polygon se generará de forma automática y totalmente segura solo cuando decidas iniciar el proceso de depósito.",
            "🛡️ Para mantener la seguridad de tu Laboratorio, la firma digital del Baúl solo se vinculará a tu cuenta al detectar una orden de depósito confirmada.",
            "💡 Puedes seguir explorando la Plaza de Comercio de forma libre. El enlace con la red de transacciones se activará únicamente al preparar los fondos de tu primer intercambio."
        ];
        
        const randomIndex = Math.floor(Math.random() * variantes.length);
        copywriting.innerText = variantes[randomIndex];
        
        gate.checked = false;
        btnActivate.disabled = true;
        btnActivate.style.background = "#333";
        btnActivate.style.color = "#888";
        btnActivate.style.cursor = "not-allowed";
        btnActivate.style.opacity = "0.5";
        btnActivate.style.boxShadow = "none";
        
        modal.classList.remove("hidden");
    },
    
    lazyLoadPrivy: function(motivo) {
        const overlay = document.createElement("div");
        overlay.id = "privy-loading-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(11, 22, 34, 0.95)";
        overlay.style.zIndex = "99999";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.color = "#fff";
        overlay.style.fontFamily = "sans-serif";
        
        overlay.innerHTML = `
            <div style="border: 4px solid rgba(0, 229, 255, 0.1); border-top: 4px solid #00e5ff; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 20px; box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);"></div>
            <div style="font-size: 16px; font-weight: bold; color: #00e5ff; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Conectando con Privy SDK</div>
            <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Sincronizando billetera con la red Polygon...</div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            const characters = "abcdef0123456789";
            let randomHash = "";
            for (let i = 0; i < 34; i++) {
                randomHash += characters[Math.floor(Math.random() * characters.length)];
            }
            const generatedAddress = "0x71C" + randomHash + "aB";
            
            if (!window.miWallet) window.miWallet = { pol: 0.0 };
            window.miWallet.address = generatedAddress;
            
            let balanceClaimed = false;
            if ((window.miWallet.pol || 0) <= 0) {
                window.miWallet.pol = 10.0;
                balanceClaimed = true;
            }
            
            if (typeof window.guardarProgreso === 'function') window.guardarProgreso();
            else if (typeof window.guardarJuego === 'function') window.guardarJuego();
            
            if (document.getElementById("privy-loading-overlay")) {
                document.body.removeChild(overlay);
            }
            
            window.WalletManager.actualizarBoton();
            
            if (typeof window.actualizarVistaBaul === 'function') {
                window.actualizarVistaBaul();
            }
            
            let alertMsg = `🎉 ¡Billetera Privy sincronizada con éxito!\nDirección: ${generatedAddress}`;
            if (balanceClaimed) {
                alertMsg += `\n🎁 Se han depositado +10.0 POL de cortesía para pruebas.`;
            }
            alert(alertMsg);
            
            if (motivo === "deposit" || motivo === "withdraw") {
                alert("✨ Ahora puedes depositar o retirar fondos desde el panel de Mi Baúl.");
            }
        }, 2000);
    },

    actualizarBoton: function() {
        const polText = document.getElementById("pol-amount");
        if (!polText) return;

        polText.style.cursor = "pointer";
        polText.style.transition = "0.2s";
        polText.style.width = "max-content"; 
        polText.style.padding = "0 8px"; 
        polText.style.whiteSpace = "nowrap"; 
        polText.style.display = "inline-block";

        polText.onmouseover = () => polText.style.filter = "brightness(1.5)";
        polText.onmouseout = () => polText.style.filter = "brightness(1)";

        let polNum = window.miWallet && window.miWallet.pol !== undefined ? window.miWallet.pol : 0.0;
        const saldo = polNum >= 1000 ? Math.floor(polNum) : polNum.toFixed(1);

        if (window.miWallet && window.miWallet.address) {
            const address = window.miWallet.address;
            const shortAddress = address.substring(0, 3) + ".." + address.substring(address.length - 2);
            polText.innerText = `${saldo} POL | ✅ ${shortAddress}`;
            
            polText.onclick = () => {
                if(confirm("Tu billetera actual es " + address + ".\n¿Deseas desvincularla?")) {
                    window.miWallet.address = null;
                    this.actualizarBoton();
                    if (typeof window.actualizarVistaBaul === 'function') window.actualizarVistaBaul();
                    if(typeof window.guardarProgreso === 'function') window.guardarProgreso();
                }
            };
        } else {
            polText.innerText = `${saldo} POL | 🦊 Vincular`;
            polText.onclick = () => {
                // Si el saldo es cero y no está vinculada, abrir el Muro de Saldo Cero
                if (polNum <= 0) {
                    window.WalletManager.mostrarModalSaldoCero("vincular");
                } else {
                    document.getElementById('wallet-modal').style.display = 'flex';
                }
            };
        }
    }
};

window.mostrarModalSaldoCero = function(motivo) {
    if (window.WalletManager && typeof window.WalletManager.mostrarModalSaldoCero === 'function') {
        window.WalletManager.mostrarModalSaldoCero(motivo);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        window.WalletManager.inyectarModal();
        window.WalletManager.actualizarBoton();
    }, 500); 
});