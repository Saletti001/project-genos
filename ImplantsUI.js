// =========================================
// ImplantsUI.js - V22 (SISTEMA DE EQUIPO Y LIMPIEZA DE STATS)
// =========================================

window.ImplantsUI = {
    inyectarCSS: function() {
        if (document.getElementById("implants-styles")) return;
        const style = document.createElement("style");
        style.id = "implants-styles";
        style.innerHTML = `
            .implants-screen * { box-sizing: border-box !important; }
            .implants-screen::-webkit-scrollbar,
            #lab-inventory-list::-webkit-scrollbar { display: none !important; width: 0 !important; background: transparent !important; }
            #lab-inventory-list { -ms-overflow-style: none !important; scrollbar-width: none !important; }
            #implants-area.hidden { display: none !important; }

            .lab-container {
                display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 480px; margin: 0 auto; padding: 0 15px;
            }

            .geno-scanner {
                width: 100%; background: rgba(0, 0, 0, 0.4); border: 2px solid #00acc1; border-radius: 16px; padding: 15px;
                display: flex; flex-direction: column; align-items: center; box-shadow: 0 0 20px rgba(0, 172, 193, 0.2);
            }

            .preview-wrapper { position: relative; width: 100%; display: flex; justify-content: center; padding: 10px 0; }
            .scanner-line {
                position: absolute; width: 70%; height: 2px; background: rgba(77, 208, 225, 0.5); left: 15%;
                box-shadow: 0 0 15px #4dd0e1; animation: scanMove 3s infinite linear; z-index: 10; pointer-events: none; 
            }

            @keyframes scanMove { 0% { top: 5%; opacity: 0; } 50% { opacity: 1; } 90% { top: 95%; opacity: 0; } 100% { top: 95%; opacity: 0; } }

            #implants-geno-preview {
                width: 180px; height: 180px; filter: drop-shadow(0 0 10px rgba(77, 208, 225, 0.4)); z-index: 2;
                display: flex; justify-content: center; align-items: center;
            }

            .geno-lab-name { text-align: center; font-weight: bold; color: #fff; font-size: 16px; text-transform: uppercase; margin-top: 10px; }
            .geno-lab-name span { color: #4dd0e1; font-size: 12px; }

            .control-panel { width: 100%; display: flex; flex-direction: column; gap: 10px; }
            .lab-tabs { display: flex; gap: 8px; }

            .lab-tab {
                flex: 1; padding: 10px; background: #1a2a36; border: 1px solid #334; color: #80deea; cursor: pointer;
                text-align: center; font-weight: bold; border-radius: 8px; transition: 0.3s; text-transform: uppercase; font-size: 12px;
            }
            .lab-tab.active { background: #00acc1; color: white; box-shadow: 0 0 10px rgba(0, 172, 193, 0.4); }

            .slot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 12px; }

            .implant-slot { background: #0d161c; border: 1px dashed #4dd0e1; padding: 12px; border-radius: 8px; text-align: center; cursor: pointer; transition: 0.2s; }
            .implant-slot:hover { background: rgba(77, 208, 225, 0.1); border-style: solid; }
            .implant-slot.fixed-slot { border: 1px solid #00acc1; background: rgba(0, 172, 193, 0.15); cursor: default; }
            .implant-slot.fixed-slot:hover { border-style: solid; }
            .implant-slot label { display: block; font-size: 9px; color: #4dd0e1; margin-bottom: 3px; text-transform: uppercase; pointer-events: none; }
            .implant-slot .item-name { font-size: 11px; font-weight: bold; pointer-events: none; }

            #lab-inventory-selector {
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 380px;
                background: #1a2a36; border: 2px solid #00acc1; border-radius: 15px; padding: 20px; z-index: 10000; display: none; box-shadow: 0 0 100px rgba(0,0,0,0.9);
            }

            .implants-screen .nexo-btn-container {
                width: 100%; display: flex; justify-content: center; margin: 30px 0 20px;
            }
            .implants-screen .nexo-btn-container .fab-btn {
                position: relative !important; bottom: auto !important; left: auto !important; transform: none !important;
                width: 70% !important; max-width: 300px !important; margin: 0 auto !important;
            }
            .implants-screen .nexo-btn-container .fab-btn:hover {
                transform: scale(1.05) !important;
            }
            .implants-screen .nexo-btn-container .fab-btn:active {
                transform: scale(0.98) !important;
            }
        `;
        document.head.appendChild(style);
    },

    renderBase: function() {
        const screen = document.getElementById("implants-area");
        if (!screen) return;

        screen.classList.add("implants-screen");
        screen.style.backgroundColor = '#0d161c';
        screen.style.backgroundImage = 'radial-gradient(circle at center, #1a2a36 0%, #0d161c 100%)';

        if (screen.innerHTML.includes("LABORATORIO DE IMPLANTES")) return;

        screen.innerHTML = `
            <div style="width: 100%; height: 100%; overflow-y: auto; padding-bottom: 25px; padding-top: 15px; -ms-overflow-style: none; scrollbar-width: none;">
                
                <h2 class="screen-title" style="color: #4dd0e1; margin-bottom: 5px;">Laboratorio de Implantes</h2>
                <p style="text-align: center; color: #888; font-size: 12px; margin-bottom: 15px; padding: 0 15px;">Instala Módulos de Combate y Equipo Nexo.</p>
                
                <div class="lab-container">
                    <div class="geno-scanner">
                        <div class="preview-wrapper">
                            <div class="scanner-line"></div>
                            <div id="implants-geno-preview"></div>
                        </div>
                        <div id="implants-geno-stats" style="width:100%; margin-top:5px;"></div>
                    </div>

                    <div class="control-panel">
                        <div class="lab-tabs">
                            <div class="lab-tab active" onclick="ImplantsManager.setTab('combat')">ATAQUES</div>
                            <div class="lab-tab" onclick="ImplantsManager.setTab('cosmetic')">EQUIPO</div>
                        </div>

                        <div id="combat-slots" class="slot-grid">
                            <div class="implant-slot fixed-slot">
                                <label>Básico (Genético)</label>
                                <span class="item-name" id="slot-atk-1">CARGANDO...</span>
                            </div>
                            <div class="implant-slot" onclick="ImplantsManager.openSelector('atk_2')">
                                <label>Técnica (Daño)</label>
                                <span class="item-name" id="slot-atk-2">VACÍO</span>
                            </div>
                            <div class="implant-slot" onclick="ImplantsManager.openSelector('atk_3')">
                                <label>Soporte (Buff/Estado)</label>
                                <span class="item-name" id="slot-atk-3">VACÍO</span>
                            </div>
                            <div class="implant-slot" style="border-color: #555; cursor: not-allowed; opacity: 0.6;">
                                <label style="color:#555;">Definitivo</label>
                                <span class="item-name" id="slot-atk-4" style="color:#888;">🔒 Nv. 25+</span>
                            </div>
                        </div>

                        <div id="ifttt-panel" style="margin-top: 15px;"></div>

                        <div id="cosmetic-slots" class="slot-grid" style="display:none;">
                            <div class="implant-slot" onclick="ImplantsManager.openSelector('head')">
                                <label>Cabeza</label>
                                <span class="item-name" id="slot-head">VACÍO</span>
                            </div>
                            <div class="implant-slot" onclick="ImplantsManager.openSelector('back')">
                                <label>Espalda</label>
                                <span class="item-name" id="slot-back">VACÍO</span>
                            </div>
                            <div class="implant-slot" onclick="ImplantsManager.openSelector('skin')">
                                <label>Dron</label>
                                <span class="item-name" id="slot-skin">ESTÁNDAR</span>
                            </div>
                            <div class="implant-slot" onclick="ImplantsManager.openSelector('aura')">
                                <label>Aura</label>
                                <span class="item-name" id="slot-aura">VACÍO</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="nexo-btn-container">
                    <div class="fab-btn" onclick="ImplantsManager.closeLab()">
                        <div class="fab-content" style="font-size: 13px; cursor: pointer; padding: 12px 0;">VOLVER AL NEXO</div>
                    </div>
                </div>
            </div>

            <div id="lab-inventory-selector">
                <h3 id="selector-title" style="color:#4dd0e1; margin-top:0; font-size:16px; text-align:center;">ALMACÉN NEXO</h3>
                <div id="lab-inventory-list" style="max-height:300px; overflow-y:auto; margin-bottom:15px; border:1px solid #334; border-radius:8px; padding:10px;"></div>
                <button onclick="ImplantsManager.closeSelector()" class="btn-secondary" style="width:100%; padding:10px;">CERRAR</button>
            </div>
        `;
    }
};