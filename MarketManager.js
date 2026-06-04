// =========================================
// MarketManager.js - RED DE CRIADORES Y COMERCIO (WEB3 P2P)
// =========================================

window.misVentas = window.misVentas || [];

function obtenerNombreGeno(g) {
    return g.customName || g.nickname || g.apodo || g.name || "Desconocido";
}

// ✨ SINOPSIS LIMPIA: Dejamos que tu InventoryManager maneje su propia interfaz nativa
window.forzarActualizacionMochila = function() {
    if (window.miInventario && typeof window.miInventario.updateUI === 'function') {
        window.miInventario.updateUI();
        if(typeof window.miInventario.renderGrid === 'function') window.miInventario.renderGrid();
    }
    
    if (typeof window.WalletManager !== 'undefined') {
        window.WalletManager.actualizarBoton();
    }
};

window.vincularEventosBotonesBaul = function() {
    const btnDeposit = document.getElementById("vault-btn-deposit");
    const btnWithdraw = document.getElementById("vault-btn-withdraw");

    if (btnDeposit) {
        btnDeposit.onclick = () => {
            if (!window.comercioDesbloqueado) {
                alert("⚠️ Se requiere el 'Permiso de Comercio' (adquirible en el Bazar por 15 EV al llegar a Nv. 5 de Laboratorio) para realizar depósitos o retiros.");
                return;
            }
            if (!window.miWallet || !window.miWallet.address) {
                window.mostrarModalSaldoCero("deposit");
                return;
            }
            const cantidadStr = prompt("Ingrese la cantidad de $POL a depositar en su Wallet:", "10.0");
            if (cantidadStr === null) return;
            const cantidad = parseFloat(cantidadStr);
            if (isNaN(cantidad) || cantidad <= 0) {
                alert("⚠️ Cantidad inválida.");
                return;
            }
            // Simular depósito
            window.miWallet.pol = (window.miWallet.pol || 0.0) + cantidad;
            window.miWallet.history = window.miWallet.history || [];
            window.miWallet.history.unshift({
                tipo: 'Depósito',
                monto: cantidad,
                fecha: new Date().toLocaleTimeString()
            });
            alert(`✅ Depósito de ${cantidad.toFixed(1)} POL procesado exitosamente en la Red Nexo (Simulado).`);
            window.actualizarVistaBaul();
            if (window.WalletManager && window.WalletManager.actualizarBoton) window.WalletManager.actualizarBoton();
            if (window.guardarJuego) window.guardarJuego();
            else if (window.guardarProgreso) window.guardarProgreso();
        };
    }

    if (btnWithdraw) {
        btnWithdraw.onclick = () => {
            if (!window.comercioDesbloqueado) {
                alert("⚠️ Se requiere el 'Permiso de Comercio' (adquirible en el Bazar por 15 EV al llegar a Nv. 5 de Laboratorio) para realizar depósitos o retiros.");
                return;
            }
            if (!window.miWallet || !window.miWallet.address) {
                window.mostrarModalSaldoCero("withdraw");
                return;
            }
            const maxVal = window.miWallet.pol || 0.0;
            if (maxVal <= 0) {
                alert("⚠️ No tienes fondos suficientes en tu Wallet para retirar.");
                return;
            }
            const cantidadStr = prompt(`Ingrese la cantidad de $POL a retirar de su Wallet (Máx. ${maxVal.toFixed(1)} POL):`, maxVal.toFixed(1));
            if (cantidadStr === null) return;
            const cantidad = parseFloat(cantidadStr);
            if (isNaN(cantidad) || cantidad <= 0 || cantidad > maxVal) {
                alert("⚠️ Cantidad inválida o saldo insuficiente.");
                return;
            }
            // Simular retiro
            window.miWallet.pol -= cantidad;
            window.miWallet.history = window.miWallet.history || [];
            window.miWallet.history.unshift({
                tipo: 'Retiro',
                monto: cantidad,
                fecha: new Date().toLocaleTimeString()
            });
            alert(`✅ Retiro de ${cantidad.toFixed(1)} POL procesado exitosamente (Simulado).`);
            window.actualizarVistaBaul();
            if (window.WalletManager && window.WalletManager.actualizarBoton) window.WalletManager.actualizarBoton();
            if (window.guardarJuego) window.guardarJuego();
            else if (window.guardarProgreso) window.guardarProgreso();
        };
    }
};

window.actualizarVistaBaul = function() {
    const addressEl = document.getElementById("vault-wallet-address");
    const balanceEl = document.getElementById("vault-wallet-balance");
    const historyList = document.getElementById("vault-history-list");
    const actionsContainer = document.getElementById("vault-actions-container");
    
    if (!addressEl || !balanceEl) return;

    const isConnected = window.miWallet && window.miWallet.address;

    if (isConnected) {
        addressEl.innerText = window.miWallet.address;
        addressEl.style.color = "#00e5ff"; // Active neon cyan
        
        let polNum = window.miWallet.pol !== undefined ? window.miWallet.pol : 0.0;
        balanceEl.innerText = polNum.toFixed(1);
        
        // Renderizar botones normales de Depositar/Retirar
        if (actionsContainer) {
            actionsContainer.innerHTML = `
                <button id="vault-btn-deposit" class="market-btn-neon green" style="flex: 1; padding: 12px 5px; font-size: 11px; margin-top: 0;">Depositar</button>
                <button id="vault-btn-withdraw" class="market-btn-neon red" style="flex: 1; padding: 12px 5px; font-size: 11px; margin-top: 0;">Retirar</button>
            `;
            window.vincularEventosBotonesBaul();
        }
        
        // Render history
        if (historyList) {
            const txs = window.miWallet.history || [];
            if (txs.length === 0) {
                historyList.innerHTML = `<div style="color: #666; font-style: italic; text-align: center; padding: 10px;">Sin transacciones recientes.</div>`;
            } else {
                historyList.innerHTML = txs.map(tx => `
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 6px 0;">
                        <span style="color: ${tx.tipo === 'Depósito' ? '#69F0AE' : '#ff5252'}; font-weight: bold;">${tx.tipo}</span>
                        <span style="font-weight: bold; color: #fff;">${tx.monto.toFixed(1)} POL</span>
                        <span style="color: #888;">${tx.fecha}</span>
                    </div>
                `).join('');
            }
        }
    } else {
        addressEl.innerText = "No Vinculada (Inicialización requerida)";
        addressEl.style.color = "#ff007f"; // Zero warning color
        balanceEl.innerText = "0.0";
        
        // Renderizar un único botón de "Inicializar Wallet" idéntico al de Historial de Transacciones
        if (actionsContainer) {
            actionsContainer.innerHTML = `
                <button id="vault-btn-first-deposit" class="market-btn-neon" style="flex: 1; background: linear-gradient(90deg, #1e293b, #334155); border: 1px solid #475569; padding: 12px 5px; font-size: 11px; margin-top: 0; box-shadow: none;">
                    Inicializar Wallet
                </button>
            `;
            const btnFirstDeposit = document.getElementById("vault-btn-first-deposit");
            if (btnFirstDeposit) {
                btnFirstDeposit.onclick = () => {
                    if (!window.comercioDesbloqueado) {
                        alert("⚠️ Se requiere el 'Permiso de Comercio' (adquirible en el Bazar por 15 EV al llegar a Nv. 5 de Laboratorio) para realizar depósitos o retiros.");
                        return;
                    }
                    window.mostrarModalSaldoCero("deposit");
                };
            }
        }
        
        if (historyList) {
            historyList.innerHTML = `<div style="color: #ff007f; font-weight: bold; text-align: center; padding: 10px;">Billetera no sincronizada.</div>`;
        }
    }
};

window.iniciarMercado = function() {
    const contenedor = document.getElementById("market-screen");
    if (!contenedor) return;

    contenedor.style.background = "";
    contenedor.style.backgroundColor = "";
    contenedor.style.backgroundImage = "";

    const styleId = "market-styles-neon";
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            #market-screen { background-color: #4dd0e1 !important; background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px) !important; }
            .market-scroll-area::-webkit-scrollbar, .market-detail-scroll::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
            .market-scroll-area, .market-detail-scroll { -ms-overflow-style: none !important; scrollbar-width: none !important; }
            .hide-spinners { -moz-appearance: textfield !important; }
            .hide-spinners::-webkit-outer-spin-button, .hide-spinners::-webkit-inner-spin-button { -webkit-appearance: none !important; margin: 0 !important; }
            .market-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; }
            .market-tab-neon { flex: 1; padding: 12px 5px; font-weight: 900; cursor: pointer; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; background: rgba(26, 42, 54, 0.6); border: 1px solid #384a5e; color: #a0aec0; transition: all 0.3s ease; border-bottom: 2px solid #222; margin: 0 2px; border-radius: 8px 8px 0 0; }
            .market-tab-neon:hover { background: rgba(42, 59, 76, 0.9); color: #fff; }
            .market-tab-neon.active { color: #fff; background: rgba(30, 20, 50, 0.9); border: 1px solid #D500F9; border-bottom: 2px solid transparent; box-shadow: inset 0 15px 20px -15px #D500F9, 0 -5px 15px -10px #D500F9; }
            .market-card-neon { background: linear-gradient(180deg, #2A3B4C 0%, #1A2A36 100%); border: 1px solid #384a5e; border-radius: 12px; padding: 18px 12px; transition: all 0.3s ease; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05); width: 100%; box-sizing: border-box; cursor: pointer; }
            .market-card-neon::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: #D500F9; transition: 0.3s; }
            .market-card-neon:hover { transform: translateY(-4px); border-color: #D500F9; box-shadow: 0 10px 25px rgba(0,0,0,0.4), 0 0 15px rgba(213,0,249,0.4); background: linear-gradient(180deg, #32465A 0%, #203342 100%); }
            .market-card-neon:hover::before { height: 6px; box-shadow: 0 0 15px #D500F9; }
            .market-btn-neon { width: 100%; padding: 10px; border: none; border-radius: 8px; margin-top: auto; font-weight: 900; color: #fff; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; font-size: 13px; background: linear-gradient(90deg, #6A1B9A, #D500F9); box-shadow: 0 4px 10px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.2); transition: filter 0.2s, transform 0.1s; text-shadow: 0 1px 2px rgba(0,0,0,0.8); box-sizing: border-box; }
            .market-btn-neon.green { background: linear-gradient(90deg, #2E7D32, #69F0AE); }
            .market-btn-neon.red { background: linear-gradient(90deg, #c62828, #ff5252); }
            .market-btn-neon:hover { filter: brightness(1.2) contrast(1.1); }
            .market-btn-neon:active { transform: scale(0.97); }
            .listed-item-row { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); padding: 10px 15px; border-radius: 8px; border: 1px solid #4A148C; margin-bottom: 8px; font-size: 12px; color: #fff; cursor: pointer; transition: background 0.2s; }
            .listed-item-row:hover { background: rgba(138, 43, 226, 0.2); }
            #close-market-detail:hover svg { stroke: #ff8a80; transform: scale(1.1); }
            #close-market-detail svg { transition: all 0.2s; }
            
            /* Filtros optimizados sin duplicación de flechas */
            .mk-dropdown-wrapper { position: relative; flex: 1; user-select: none; }
            .mk-dropdown-btn { background: #0f0f1a !important; background-image: none !important; color: #4dd0e1; border: 1px solid #384a5e; border-radius: 6px; padding: 10px 12px; font-size: 10px; text-transform: uppercase; font-weight: bold; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
            .mk-dropdown-btn::after, .mk-dropdown-btn::before, .mk-dropdown-wrapper::after, .mk-dropdown-wrapper::before { content: none !important; display: none !important; background: none !important; background-image: none !important; }
            .mk-dropdown-btn:hover { border-color: #00d2ff; }
            .mk-dropdown-text { display: flex; align-items: center; gap: 6px; }
            .mk-dropdown-text::after, .mk-dropdown-text::before { content: none !important; display: none !important; }
            .mk-dropdown-list { position: absolute; display: none; top: 100%; left: 0; right: 0; background: #0f0f1a; border: 1px solid #00d2ff; border-radius: 6px; z-index: 999; margin-top: 4px; max-height: 250px; overflow-y: auto; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
            .mk-dropdown-list.open { display: block; }
            .mk-dropdown-opt { padding: 10px 12px; display: flex; align-items: center; gap: 8px; font-size: 10px; text-transform: uppercase; font-weight: bold; color: #cbd5e1; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid #1a2a36; }
            .mk-dropdown-opt::after, .mk-dropdown-opt::before { content: none !important; display: none !important; }
            .mk-dropdown-opt:hover { background: rgba(0, 210, 255, 0.15); color: #fff; }
            .mk-dropdown-opt svg { width: 14px; height: 14px; filter: drop-shadow(0 0 3px rgba(255,255,255,0.3)); }
        `;
        document.head.appendChild(style);
    }

    contenedor.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; padding-top: 15px; position: relative;">
            <div style="background: #111e28; border-radius: 16px; width: calc(100% - 30px); height: calc(100% - 100px); display: flex; flex-direction: column; box-shadow: 0 10px 25px rgba(0,0,0,0.5); overflow: hidden;">
                <div style="padding: 25px 15px 0 15px; flex-shrink: 0;">
                    <h2 class="screen-title" style="color: #D500F9; text-align: center; text-shadow: none; margin: 0 0 25px 0; font-weight: 900; letter-spacing: 2px;">MERCADO GLOBAL</h2>
                    <div style="display: flex; justify-content: center; margin-bottom: 15px; padding: 0; border-bottom: 1px solid #384a5e;">
                        <button id="tab-market-buy" class="market-tab-neon active">Comprar</button>
                        <button id="tab-market-sell" class="market-tab-neon">Mis Ventas</button>
                        <button id="tab-market-vault" class="market-tab-neon">Wallet</button>
                    </div>
                </div>
                <div class="market-scroll-area" style="flex: 1; overflow-y: auto; padding: 0 10px 20px 10px;">
                    
                    <div id="market-buy-view">
                        <div style="display: flex; gap: 8px; margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid #384a5e;">
                            
                            <div class="mk-dropdown-wrapper" id="filter-type-wrapper" data-value="all">
                                <div class="mk-dropdown-btn">
                                    <div class="mk-dropdown-text">TODO EL MERCADO</div> 
                                </div>
                                <div class="mk-dropdown-list">
                                    <div class="mk-dropdown-opt" data-value="all">TODO EL MERCADO</div>
                                    <div class="mk-dropdown-opt" data-value="genos">SOLO GENOS</div>
                                    <div class="mk-dropdown-opt" data-value="items">SOLO OBJETOS / EV</div>
                                </div>
                            </div>

                            <div class="mk-dropdown-wrapper" id="filter-element-wrapper" data-value="all">
                                <div class="mk-dropdown-btn">
                                    <div class="mk-dropdown-text">CUALQUIER ELEMENTO</div> 
                                </div>
                                <div class="mk-dropdown-list" id="filter-element-options">
                                    <div class="mk-dropdown-opt" data-value="all">CUALQUIER ELEMENTO</div>
                                </div>
                            </div>

                        </div>
                        
                        <div id="market-buy-grid" class="market-grid">
                            <div style="grid-column: span 2; text-align: center; padding: 30px;">
                                <div style="color: #00d2ff; font-size: 30px; margin-bottom: 15px; animation: spin 2s linear infinite;">🌐</div>
                                <div style="color: #aaa; font-size: 12px; line-height: 1.5;">Conectando a la Red Nexo...<br>Buscando listados de jugadores.</div>
                            </div>
                        </div>
                    </div>

                    <div id="market-sell-view" class="hidden">
                        <p style="text-align: center; color: #b39ddb; font-size: 10px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Lista tus Objetos y Genos</p>
                        <div id="market-my-listed" style="margin-bottom: 15px; width: 100%;"></div>
                        <div id="market-sell-grid" class="market-grid"></div>
                    </div>

                    <!-- Wallet View (Cyberpunk Web3 Simulation) -->
                    <div id="market-vault-view" class="hidden" style="display: flex; flex-direction: column; gap: 15px; color: #fff; padding: 10px;">
                        <!-- Información General de la Wallet -->
                        <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid #384a5e; border-radius: 12px; padding: 15px; text-align: center;">
                            <div style="font-size: 11px; color: #80deea; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 5px;">Dirección de Wallet</div>
                            <div id="vault-wallet-address" style="font-family: monospace; font-size: 11px; color: #ff007f; word-break: break-all; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; border: 1px solid rgba(255, 0, 127, 0.2);">
                                No Vinculada
                            </div>
                        </div>

                        <!-- Saldo de la Wallet -->
                        <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid #384a5e; border-radius: 12px; padding: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                            <div style="font-size: 11px; color: #80deea; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 5px;">Saldo en Wallet</div>
                            <div style="font-size: 28px; font-weight: 900; color: #00e5ff; text-shadow: 0 0 10px rgba(0, 229, 255, 0.4); display: flex; align-items: center; gap: 6px;">
                                <span id="vault-wallet-balance">0.0</span> <span style="font-size: 16px; color: #80deea;">POL</span>
                            </div>
                        </div>

                        <!-- Botones de Acción -->
                        <div id="vault-actions-container" style="display: flex; gap: 10px;">
                            <!-- Botones inyectados dinámicamente según la vinculación de la wallet -->
                        </div>
                        
                        <button id="vault-btn-history" class="market-btn-neon" style="background: linear-gradient(90deg, #1e293b, #334155); border: 1px solid #475569; padding: 12px 5px; font-size: 11px; margin-top: 0; box-shadow: none;">
                            Historial de Transacciones
                        </button>

                        <!-- Panel de Historial (ocultable / dinámico) -->
                        <div id="vault-history-panel" class="hidden" style="background: rgba(0,0,0,0.5); border: 1px solid #384a5e; border-radius: 8px; padding: 12px; max-height: 150px; overflow-y: auto;">
                            <div style="font-size: 10px; color: #80deea; text-transform: uppercase; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #384a5e; padding-bottom: 4px;">Historial</div>
                            <div id="vault-history-list" style="display: flex; flex-direction: column; gap: 6px; font-size: 10px; color: #ccc;">
                                <!-- Transacciones simuladas -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="fab-btn btn-go-home" onclick="navegarA('room-area')" style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); width: 70%; max-width: 300px; z-index: 100;">
                <div class="fab-content" style="font-size: 13px; cursor: pointer; padding: 12px 0; text-align: center;">VOLVER AL LABORATORIO</div>
            </div>

            <div id="market-detail-modal" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(11, 26, 46, 0.85); z-index: 9999; display: none; align-items: center; justify-content: center; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);">
                <div class="market-detail-scroll modal-content" style="max-height: 85vh; overflow-y: auto; width: 85%; max-width: 350px; background: #111e28; border-radius: 12px; padding: 20px; box-sizing: border-box; position: relative;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px;">
                        <h3 class="stats-title" style="margin: 0; color: #80deea; text-transform: uppercase; font-size: 16px; display: flex; align-items: center; gap: 10px;">
                            <span id="market-detail-name-text">--</span>
                        </h3>
                        <button id="close-market-detail" style="background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #ff4b4b; padding: 0;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div id="market-detail-dynamic-content"></div>
                    <div id="market-detail-action" style="margin-top: 20px; text-align: center;"></div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("market-detail-modal").style.display = "none";

    const elementOptionsContainer = document.getElementById("filter-element-options");
    const tusElementos = ["Tóxico", "Cibernético", "Biomutante", "Viral", "Radiactivo", "Sintético"];
    
    tusElementos.forEach(el => {
        const cleanName = el.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').trim();
        let iconSvg = "";
        if (typeof window.getIconoElemento === 'function') {
            iconSvg = window.getIconoElemento(cleanName).replace('margin-right: 6px;', 'margin-right: 0;');
        }
        const opt = document.createElement('div');
        opt.className = 'mk-dropdown-opt';
        opt.dataset.value = cleanName;
        opt.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;">${iconSvg}</div> ${cleanName}`;
        elementOptionsContainer.appendChild(opt);
    });

    document.querySelectorAll('.mk-dropdown-wrapper').forEach(wrapper => {
        const trigger = wrapper.querySelector('.mk-dropdown-btn');
        const options = wrapper.querySelector('.mk-dropdown-list');
        const triggerText = trigger.querySelector('.mk-dropdown-text'); 

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.mk-dropdown-list').forEach(opt => {
                if (opt !== options) opt.classList.remove('open');
            });
            options.classList.toggle('open');
        });

        options.querySelectorAll('.mk-dropdown-opt').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                triggerText.innerHTML = option.innerHTML; 
                wrapper.dataset.value = option.dataset.value;
                options.classList.remove('open');
                if (typeof window.cargarMercadoGlobal === 'function') window.cargarMercadoGlobal();
            });
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.mk-dropdown-list').forEach(opt => opt.classList.remove('open'));
    });

    const tabBuy = document.getElementById("tab-market-buy");
    const tabSell = document.getElementById("tab-market-sell");
    const tabVault = document.getElementById("tab-market-vault");
    const viewBuy = document.getElementById("market-buy-view");
    const viewSell = document.getElementById("market-sell-view");
    const viewVault = document.getElementById("market-vault-view");

    tabBuy.addEventListener("click", () => {
        tabBuy.classList.add("active"); tabSell.classList.remove("active"); tabVault.classList.remove("active");
        viewBuy.classList.remove("hidden"); viewSell.classList.add("hidden"); viewVault.classList.add("hidden");
        if (typeof window.cargarMercadoGlobal === 'function') window.cargarMercadoGlobal();
    });

    tabSell.addEventListener("click", () => {
        tabSell.classList.add("active"); tabBuy.classList.remove("active"); tabVault.classList.remove("active");
        viewSell.classList.remove("hidden"); viewBuy.classList.add("hidden"); viewVault.classList.add("hidden");
        window.renderizarMisVentas();
    });

    tabVault.addEventListener("click", () => {
        tabVault.classList.add("active"); tabBuy.classList.remove("active"); tabSell.classList.remove("active");
        viewVault.classList.remove("hidden"); viewBuy.classList.add("hidden"); viewSell.classList.add("hidden");
        window.actualizarVistaBaul();
    });

    // Configurar botones de Wallet
    window.actualizarVistaBaul();
    
    const btnHistory = document.getElementById("vault-btn-history");
    if (btnHistory) {
        btnHistory.onclick = () => {
            const panel = document.getElementById("vault-history-panel");
            if (panel) panel.classList.toggle("hidden");
        };
    }

    window.renderizarMisVentas();
    if (typeof window.cargarMercadoGlobal === 'function') window.cargarMercadoGlobal();
};

window.abrirDetalleItem = function(itemBase, tipoAccion = 'publicar') {
    if (tipoAccion === 'publicar' && !window.comercioDesbloqueado) {
        alert("⚠️ Se requiere el 'Permiso de Comercio' (adquirible en el Bazar por 15 EV al llegar a Nv. 5 de Laboratorio) para publicar objetos en venta.");
        return;
    }
    const modal = document.getElementById("market-detail-modal");
    const nameEl = document.getElementById("market-detail-name-text");
    const dynamicContent = document.getElementById("market-detail-dynamic-content");
    const actionContainer = document.getElementById("market-detail-action");

    nameEl.innerText = itemBase.name;

    dynamicContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px; font-size: 60px; filter: drop-shadow(0 0 15px rgba(0,210,255,0.4));">
            ${itemBase.icon || '🔋'}
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #333; color: #cbd5e1; font-size: 13px; line-height: 1.5; text-align: center; margin-bottom: 15px;">
            ${itemBase.description}
        </div>
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 5px;">
            <span style="background: #1e293b; padding: 5px 10px; border-radius: 5px; font-size: 11px; color: #ffcc00; font-weight: bold; border: 1px solid #333;">Tienes: ${itemBase.count || 1}</span>
        </div>
    `;

    if (tipoAccion === 'publicar') {
        actionContainer.innerHTML = `
            <div style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; border: 1px solid #384a5e; margin-bottom: 15px;">
                <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5;">Precio en $POL para vender <b>1x unidad</b> de este objeto.</div>
            </div>
            <input type="number" id="modal-input-price-item" class="hide-spinners" placeholder="Precio en POL" style="width: 100%; box-sizing: border-box; padding: 12px; margin-bottom: 15px; background: rgba(0,0,0,0.4); border: 1px solid #D500F9; border-radius: 8px; text-align: center; color: #fff; font-weight: bold; outline: none; font-size: 16px;" step="0.1" min="0.1">
            <button id="modal-btn-action-item" class="market-btn-neon green" style="width: 100%; font-size: 14px; padding: 12px;">Publicar 1x Unidad</button>
        `;

        document.getElementById("modal-btn-action-item").onclick = () => {
            if (!window.miUsuarioCloud) { alert("⚠️ Debes iniciar sesión (Vincular) para poder interactuar con la Red Nexo global."); return; }
            const precio = parseFloat(document.getElementById("modal-input-price-item").value);
            if (isNaN(precio) || precio <= 0) { alert("⚠️ Introduce un precio válido mayor a 0."); return; }

            itemBase.count -= 1;
            if (itemBase.count <= 0) {
                let invArray = window.miInventario.slots || window.miInventario.items || [];
                let index = invArray.indexOf(itemBase);
                // ✨ SE EXTRALIMITA CON EXTRACCIÓN REAL: Evita dejar un fantasma nulo
                if (index > -1) invArray.splice(index, 1);
            }

            const ventaObjeto = {
                saleId: "venta_" + Date.now(),
                isItem: true,
                pricePol: precio.toFixed(1),
                itemData: { ...itemBase, count: 1 } 
            };

            window.misVentas.push(ventaObjeto);
            if (typeof window.publicarVentaEnNube === 'function') window.publicarVentaEnNube(ventaObjeto);
            alert(`✅ Has publicado [1x ${itemBase.name}] en la red por ${ventaObjeto.pricePol} POL.`);
            modal.style.display = "none";
            
            window.forzarActualizacionMochila(); 
            window.renderizarMisVentas();
            if(window.guardarProgreso) window.guardarProgreso();
        };
    } else if (tipoAccion === 'listado') {
        actionContainer.innerHTML = `
            <div style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; border: 1px solid #384a5e; margin-bottom: 15px;">
                <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5; margin-bottom: 5px;">Objeto listado en la red global.</div>
                <div style="color: #4CAF50; font-size: 12px; font-weight: bold;">Esperando a un comprador...</div>
            </div>
            <button id="modal-btn-action-item" class="market-btn-neon" style="width: 100%; font-size: 14px; padding: 12px; background: #384a5e; box-shadow: none;">Cerrar Inspección</button>
        `;
        document.getElementById("modal-btn-action-item").onclick = () => { modal.style.display = "none"; };
    } else if (tipoAccion === 'listado_compra') {
        actionContainer.innerHTML = `
            <div style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; border: 1px solid #384a5e; margin-bottom: 15px;">
                <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5; margin-bottom: 5px;">Vendedor: ${itemBase.sellerId ? (itemBase.sellerId.substring(0,6) + "...") : "Desconocido"}</div>
                <div style="color: #D500F9; font-size: 16px; font-weight: bold; text-align: center;">🔷 ${itemBase.pricePol} POL</div>
            </div>
            <button id="modal-btn-action-buy-item" class="market-btn-neon green" style="width: 100%; font-size: 14px; padding: 12px;">Comprar Objeto</button>
        `;
        document.getElementById("modal-btn-action-buy-item").onclick = () => {
            const listingSimulado = {
                id: itemBase.saleId,
                sellerId: itemBase.sellerId,
                pricePol: itemBase.pricePol,
                isItem: true,
                itemData: itemBase
            };
            if (typeof window.comprarListado === 'function') window.comprarListado(listingSimulado);
        };
    }

    modal.style.display = "flex";

    const cerrarModal = (e) => {
        if(e.target === modal || e.target.closest('#close-market-detail')) {
            modal.style.display = "none"; modal.removeEventListener("click", cerrarModal);
        }
    };
    modal.addEventListener("click", cerrarModal);
};

window.abrirDetalleMercado = function(idGenoBuscar, tipoAccion) {
    if (tipoAccion === 'publicar' && !window.comercioDesbloqueado) {
        alert("⚠️ Se requiere el 'Permiso de Comercio' (adquirible en el Bazar por 15 EV al llegar a Nv. 5 de Laboratorio) para publicar Genos en venta.");
        return;
    }
    const modal = document.getElementById("market-detail-modal");
    let geno = null;
    if (typeof idGenoBuscar === "object" && idGenoBuscar !== null) {
        geno = idGenoBuscar;
    } else {
        if (window.miMascota && String(window.miMascota.id) === String(idGenoBuscar)) geno = window.miMascota;
        else if(window.misGenos) geno = window.misGenos.find(g => String(g.id) === String(idGenoBuscar));
        
        if(!geno && window.misVentas) {
            let listado = window.misVentas.find(v => !v.isItem && String(v.id || v.saleId) === String(idGenoBuscar));
            if (listado) geno = listado;
        }
    }
    if(!geno) return;

    const nameEl = document.getElementById("market-detail-name-text");
    const dynamicContent = document.getElementById("market-detail-dynamic-content");
    const actionContainer = document.getElementById("market-detail-action");

    nameEl.innerText = obtenerNombreGeno(geno);

    const elementoActual = (geno.genes && geno.genes.afinidad) ? geno.genes.afinidad.dom : (geno.element || "Normal");
    const nombreElementoLimpio = elementoActual.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').trim();
    let iconoElementoHTML = "";
    if(typeof window.getIconoElemento === 'function') iconoElementoHTML = window.getIconoElemento(elementoActual).replace('margin-right: 6px;', 'margin-right: 0;');
    
    let calidadFinal = geno.quality || geno.calidad || "C (46%)";
    let colorCalidad = calidadFinal.charAt(0) === "S" ? "#ffcc00" : calidadFinal.charAt(0) === "A" ? "#4dd0e1" : calidadFinal.charAt(0) === "B" ? "#4CAF50" : "#f0ad4e";

    const stTotal = geno.stats || { hp: 0, atk: 0, def: 0, spd: 0, luk: 0 };
    const stBase = geno.baseStats || stTotal;

    const buildStatRow = (icon, label, key) => {
        const baseVal = Math.floor(stBase[key] !== undefined ? stBase[key] : (stTotal[key] || 0));
        const totalVal = Math.floor(stTotal[key] || 0);
        const diff = totalVal - baseVal;
        let diffHtml = '';
        let totalHtml = '';
        if (diff > 0) {
            diffHtml = `<span style="color: #4CAF50; font-size: 11px; margin: 0 8px;">(+${diff})</span>`;
            totalHtml = `<span style="color: #ffcc00; font-weight: bold;">${totalVal}</span>`;
        }
        return `
            <div style="background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; border-left: 2px solid #333; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 8px; width: 70px;">
                    <span>${icon}</span>
                    <span style="color: #cbd5e1; font-size: 12px;">${label}:</span>
                </div>
                <div style="flex: 1; text-align: right; font-size: 14px;">
                    <span style="color: #fff; font-weight: bold;">${baseVal}</span>
                    ${diffHtml}
                    ${totalHtml}
                </div>
            </div>
        `;
    };

    let secretGeneHtml = "";
    if (geno.scanned) {
        const hg = geno.hidden_genes || { A: null, B: null, C: null };
        const buildSlot = (slotLabel, geneData, colorBox) => {
            if (!geneData) return `<div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; font-size: 11px; color: #555; border-left: 3px solid #333; display: flex; justify-content: space-between; align-items: center;"><span>${slotLabel}</span> <span style="font-size:10px; font-style:italic;">Vacío</span></div>`;
            return `
                <div style="background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 6px; font-size: 11px; color: #fff; border-left: 3px solid ${colorBox}; display: flex; flex-direction: column; gap: 4px; text-align: left; margin-bottom: 5px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: ${colorBox}; font-weight: bold; font-size: 10px; text-transform: uppercase;">${slotLabel}</span>
                        <span style="font-weight: bold;">${geneData.name}</span>
                    </div>
                </div>
            `;
        };
        let htmlEstructura = `
            <div style="margin-top: 15px; padding: 15px; background: rgba(138, 43, 226, 0.1); border: 1px dashed rgba(138, 43, 226, 0.5); border-radius: 8px; text-align: center;">
                <div style="font-size: 11px; color: #e0b0ff; text-transform: uppercase; margin-bottom: 10px; font-weight: bold; letter-spacing: 1px;">Estructura Genética</div>
                ${buildSlot("Gen A", hg.A, "#ffcc00")}
                ${buildSlot("Gen B", hg.B, "#80deea")}
                ${buildSlot("Gen C", hg.C, "#8A2BE2")}
        `;

        if (geno.scanned_full && geno.genes) {
            const buildDRSlotCompact = (label, geneObj) => {
                 if(!geneObj) return "";
                 return `
                    <div style="display: flex; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 6px 10px; border-radius: 6px; font-size: 10px; margin-top: 4px; border-left: 2px solid #D500F9;">
                        <span style="color: #ea80fc; font-weight: bold; width: 65px;">${label}</span>
                        <span style="flex: 1; text-align: left; color: #fff;"><span style="color:#4CAF50; font-weight:bold;">D:</span> ${geneObj.dom}</span>
                        <span style="flex: 1; text-align: left; color: #aaa;"><span style="color:#f44336; font-weight:bold;">R:</span> ${geneObj.rec}</span>
                    </div>
                 `;
            };

            htmlEstructura += `
                <div style="font-size: 12px; color: #D500F9; text-transform: uppercase; margin-top: 20px; margin-bottom: 2px; font-weight: bold; letter-spacing: 1px; text-align: center;">Genoma Base</div>
                <div style="font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin-bottom: 8px;">
                    <span style="color:#4CAF50; font-weight:bold;">D:</span> Dominante &nbsp;&nbsp;|&nbsp;&nbsp; <span style="color:#f44336; font-weight:bold;">R:</span> Recesivos
                </div>
                ${buildDRSlotCompact("FORMA", geno.genes.cuerpo)}
                ${buildDRSlotCompact("AFINIDAD", geno.genes.afinidad)}
                ${buildDRSlotCompact("OJOS", geno.genes.ojos)}
                ${buildDRSlotCompact("BOCA", geno.genes.boca)}
            `;
        }

        htmlEstructura += `</div>`;
        secretGeneHtml = htmlEstructura;
    } else {
        secretGeneHtml = `
            <div style="margin-top: 15px; padding: 15px; background: rgba(138, 43, 226, 0.1); border: 1px dashed rgba(138, 43, 226, 0.5); border-radius: 8px; text-align: center;">
                <div style="font-size: 11px; color: #e0b0ff; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; letter-spacing: 1px;">Estructura Genética</div>
                <div style="color: #aaa; font-size: 12px;">🔒 ADN Bloqueado</div>
            </div>
        `;
    }

    dynamicContent.innerHTML = `
        <div class="stats-level-badge" style="text-align: center; margin-bottom: 15px;">
            <span style="background: #4dd0e1; color: #000; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">Nv. ${geno.level || 1}</span>
        </div>
        <div style="text-align: center; margin-bottom: 8px;">
            <div style="font-size: 45px; margin-bottom: 8px; display: flex; justify-content: center; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8));">${iconoElementoHTML}</div>
            <div style="font-size: 12px; color: #00d2ff; font-family: monospace; letter-spacing: 1px; font-weight: bold; margin-bottom: 15px;">#${geno.id || "000000"}</div>
        </div>
        
        <div class="stat-info" style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
            <span>Rareza:</span> <span style="color: #fff; font-weight: bold;">${geno.rarity || "Común"}</span>
        </div>
        <div class="stat-info" style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
            <span>Elem:</span> <span style="color: #fff; font-weight: bold;">${nombreElementoLimpio}</span>
        </div>
        <div class="stat-info" style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1);">
            <span>Calidad (Pura):</span> 
            <span style="font-weight: 900; font-size: 14px; color: ${colorCalidad};">${calidadFinal}</span>
        </div>
        <hr class="stats-divider" style="border: none; border-top: 1px solid #333; margin: 15px 0;">
        
        <div style="font-size: 13px; color: #00d2ff; font-weight: bold; margin-bottom: 10px;">Atributos Activos</div>
        <div style="display: flex; flex-direction: column; gap: 0;">
            ${buildStatRow("<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#ff4b4b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'></path></svg>", "Vit", "hp")}
            ${buildStatRow("<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#ff8c00' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M14.5 17.5L3 6V3h3l11.5 11.5'></path><path d='M13 19l6-6'></path><path d='M16 16l4 4'></path><path d='M19 21l2-2'></path></svg>", "Fue", "atk")}
            ${buildStatRow("<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#3b82f6' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'></path></svg>", "Def", "def")}
            ${buildStatRow("<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#facc15' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'></polygon></svg>", "Agi", "spd")}
            ${buildStatRow("<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#10b981' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'></polygon></svg>", "Sue", "luk")}
        </div>
        ${secretGeneHtml}
    `;

    if (tipoAccion === 'publicar') {
        actionContainer.innerHTML = `
            <div style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; border: 1px solid #384a5e; margin-bottom: 15px;">
                <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5;">Precio en $POL para listar este espécimen.</div>
            </div>
            <input type="number" id="modal-input-price" class="hide-spinners" placeholder="Precio en POL" style="width: 100%; box-sizing: border-box; padding: 12px; margin-bottom: 15px; background: rgba(0,0,0,0.4); border: 1px solid #D500F9; border-radius: 8px; text-align: center; color: #fff; font-weight: bold; outline: none; font-size: 16px;" step="0.1" min="0.1">
            <button id="modal-btn-action" class="market-btn-neon green" style="width: 100%; font-size: 14px; padding: 12px;">Publicar en la Red</button>
        `;
        document.getElementById("modal-btn-action").onclick = () => {
            if (!window.miUsuarioCloud) { alert("⚠️ Debes iniciar sesión (Vincular) para poder interactuar con la Red Nexo global."); return; }
            const precio = parseFloat(document.getElementById("modal-input-price").value);
            if (isNaN(precio) || precio <= 0) { alert("⚠️ Introduce un precio válido mayor a 0."); return; }

            window.misGenos = window.misGenos.filter(g => g.id !== geno.id);
            geno.pricePol = precio.toFixed(1);
            geno.saleId = "venta_" + Date.now();
            window.misVentas.push(geno);
            if (typeof window.publicarVentaEnNube === 'function') window.publicarVentaEnNube(geno);
            
            alert(`✅ Has publicado a [${obtenerNombreGeno(geno)}] en la red por ${geno.pricePol} POL.`);
            modal.style.display = "none";
            window.renderizarMisVentas();
            if(window.guardarProgreso) window.guardarProgreso();
        };
    } else if (tipoAccion === 'listado') {
        actionContainer.innerHTML = `
            <div style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; border: 1px solid #384a5e; margin-bottom: 15px;">
                <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5; margin-bottom: 5px;">Espécimen listado en la red global.</div>
                <div style="color: #4CAF50; font-size: 12px; font-weight: bold;">Esperando a un comprador...</div>
            </div>
            <button id="modal-btn-action" class="market-btn-neon" style="width: 100%; font-size: 14px; padding: 12px; background: #384a5e; box-shadow: none;">Cerrar Inspección</button>
        `;
        document.getElementById("modal-btn-action").onclick = () => { modal.style.display = "none"; };
    }

    modal.style.display = "flex";

    const cerrarModal = (e) => {
        if(e.target === modal || e.target.closest('#close-market-detail')) {
            modal.style.display = "none"; modal.removeEventListener("click", cerrarModal);
        }
    };
    modal.addEventListener("click", cerrarModal);
};

window.renderizarMisVentas = async function() {
    const grid = document.getElementById("market-sell-grid");
    const listContainer = document.getElementById("market-sell-list") || document.getElementById("market-my-listed");
    if (!listContainer) return;

    // ----- Sincronización Fantasma -----
    if (window.supabaseClient && window.miUsuarioCloud && window.misVentas && window.misVentas.length > 0) {
        try {
            const { data: activeListings, error } = await window.supabaseClient
                .from('market_listings')
                .select('saleId, id')
                .eq('sellerId', window.miUsuarioCloud.id)
                .eq('status', 'active');
            
            if (!error && activeListings) {
                const activeSaleIds = new Set(activeListings.map(l => l.saleId || l.id));
                const originalLength = window.misVentas.length;
                
                // Conservar solo lo que sea realmente 'active' en la BD
                window.misVentas = window.misVentas.filter(v => activeSaleIds.has(v.saleId) || activeSaleIds.has(v.id));
                
                if (window.misVentas.length !== originalLength) {
                    console.log("👻 Fantasmas limpiados de Mis Ventas");
                    if (typeof window.guardarLocalSilencioso === 'function') window.guardarLocalSilencioso();
                }
            }
        } catch(e) {
            console.error("Error sincronizando fantasmas:", e);
        }
    }
    // -----------------------------------

    if(!grid || !listContainer) return;
    
    grid.innerHTML = "";
    let hayCosasParaVender = false;
    
    const genosVendibles = (window.misGenos || []).filter(g => !g.isEgg && (!window.miMascota || g.id !== window.miMascota.id));
    
    if (genosVendibles.length === 0 && window.miMascota) {
        const avisoGeno = document.createElement("div");
        avisoGeno.style.gridColumn = "span 2";
        avisoGeno.innerHTML = `<div style="text-align: center; color: #888; font-size: 11px; margin-bottom: 10px; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; border-left: 3px solid #ffcc00;">Tu Geno principal <b>(${obtenerNombreGeno(window.miMascota)})</b> está protegido y no se puede vender.</div>`;
        grid.appendChild(avisoGeno);
    }
    
    genosVendibles.forEach(geno => {
        hayCosasParaVender = true;
        let svgIcon = '🧬';
        if (typeof window.generarSvgGeno === 'function') {
            let tempSvg = window.generarSvgGeno({ ...geno, body_shape: geno.shape || geno.body_shape, base_color: geno.color || geno.base_color });
            if (tempSvg) svgIcon = tempSvg.replace(/width="[^"]+"/, 'width="100%"').replace(/height="[^"]+"/, 'height="100%"');
        }

        const card = document.createElement("div");
        card.className = "market-card-neon";
        card.innerHTML = `
            <div style="width: 55px; height: 55px; margin-bottom: 10px; filter: drop-shadow(0px 5px 8px rgba(0,0,0,0.6)); pointer-events: none;">${svgIcon}</div>
            <h4 style="margin: 0 0 5px 0; font-size: 13px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none;">${obtenerNombreGeno(geno)}</h4>
            <p style="font-size: 11px; color: #cbd5e1; margin: 0 0 10px 0; pointer-events: none;">Nv. ${geno.level || 1} | ${geno.rarity}</p>
            <button class="market-btn-neon green">Vender</button>
        `;
        
        card.addEventListener("click", () => { window.abrirDetalleMercado(geno.id, 'publicar'); });
        card.querySelector("button").addEventListener("click", (e) => { e.stopPropagation(); window.abrirDetalleMercado(geno.id, 'publicar'); });
        grid.appendChild(card);
    });

    let inventarioArray = [];
    if (window.miInventario) {
        if (Array.isArray(window.miInventario.slots)) inventarioArray = window.miInventario.slots;
        else if (Array.isArray(window.miInventario.items)) inventarioArray = window.miInventario.items;
    }

    const itemsVendibles = inventarioArray.filter(item => item !== null && typeof item === 'object' && item.valorMercado && item.count > 0);
    
    itemsVendibles.forEach(item => {
        hayCosasParaVender = true;
        const card = document.createElement("div");
        card.className = "market-card-neon";
        card.style.border = "1px solid #4dd0e1"; 
        card.innerHTML = `
            <div style="width: 50px; height: 50px; margin-bottom: 10px; filter: drop-shadow(0px 5px 8px rgba(0,210,255,0.4)); pointer-events: none;">${item.icon || '🔋'}</div>
            <h4 style="margin: 0 0 5px 0; font-size: 13px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none;">${item.name}</h4>
            <p style="font-size: 11px; color: #cbd5e1; margin: 0 0 10px 0; pointer-events: none;">En el Almacén: x${item.count}</p>
            <button class="market-btn-neon green" style="background: linear-gradient(90deg, #0097a7, #4dd0e1);">Vender</button>
        `;
        
        card.addEventListener("click", () => { window.abrirDetalleItem(item, 'publicar'); });
        card.querySelector("button").addEventListener("click", (e) => { e.stopPropagation(); window.abrirDetalleItem(item, 'publicar'); });
        grid.appendChild(card);
    });

    if (!hayCosasParaVender) {
        const msj = document.createElement("p");
        msj.style = "grid-column: span 2; text-align: center; color: #888; font-size: 12px; padding: 20px;";
        msj.innerText = "No tienes objetos valiosos en tu almacén para vender.";
        grid.appendChild(msj);
    }

    listContainer.innerHTML = "";
    if (window.misVentas.length > 0) {
        listContainer.innerHTML = '<h4 style="width: 100%; color: #D500F9; border-bottom: 1px solid #384a5e; padding-bottom: 8px; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase;">Tus Ventas Activas:</h4>';
        window.misVentas.forEach(venta => {
            
            const isItem = venta.isItem;
            const nombreMostrar = isItem ? venta.itemData.name : obtenerNombreGeno(venta);
            const iconoListado = isItem ? (venta.itemData.icon || "🔋") : "🧬";
            
            const row = document.createElement("div");
            row.className = "listed-item-row";
            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; pointer-events: none;">
                    <span style="font-size: 16px; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;">${iconoListado}</span>
                    <span style="font-weight: bold; font-size: 13px;">${nombreMostrar} ${isItem ? '(x1)' : ''}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: #D500F9; font-weight: 900; pointer-events: none;">🔷 ${venta.pricePol}</span>
                    <button class="market-btn-neon red btn-cancel-sale" style="padding: 5px 10px; width: auto; font-size: 10px; margin: 0; position: relative; z-index: 2;">Cancelar</button>
                </div>
            `;

            row.addEventListener("click", (e) => {
                if (e.target.closest('.btn-cancel-sale')) return; 
                if (isItem) window.abrirDetalleItem(venta.itemData, 'listado');
                else window.abrirDetalleMercado(venta.id || venta.saleId, 'listado');
            });
            
            row.querySelector(".btn-cancel-sale").addEventListener("click", (e) => {
                e.stopPropagation();
                
                if (isItem) {
                    let devolucionExitosa = false;
                    try {
                        if (window.miInventario && typeof window.miInventario.addItem === 'function') {
                            // Parche Legacy: Reconstruir itemData si se publicó antes de la migración
                            let datosItem = venta.itemData;
                            if (!datosItem) {
                                datosItem = {
                                    id: venta.itemId || venta.id || "legacy_item",
                                    name: venta.name || "Objeto Recuperado",
                                    icon: venta.icon || "📦",
                                    type: venta.type || "basic",
                                    count: 1
                                };
                            }
                            devolucionExitosa = window.miInventario.addItem(datosItem);
                        }
                    } catch(err) {}

                    if (!devolucionExitosa) {
                        alert("🎒 ¡Almacén lleno! No puedes cancelar esta venta hasta liberar un espacio.");
                        return;
                    }
                    window.forzarActualizacionMochila(); 
                } else {
                    delete venta.pricePol;
                    if(!window.misGenos) window.misGenos = [];
                    window.misGenos.push(venta);
                }

                window.misVentas = window.misVentas.filter(v => v !== venta);
                if (typeof window.cancelarVentaEnNube === 'function') window.cancelarVentaEnNube(venta.saleId || venta.id);
                window.renderizarMisVentas();
                if(window.guardarProgreso) window.guardarProgreso();
            });
            
            listContainer.appendChild(row);
        });
    }
};

window.cargarMercadoGlobal = async function() {
    const grid = document.getElementById("market-buy-grid");
    if (!grid) return;

    grid.innerHTML = `
        <div style="grid-column: span 2; text-align: center; padding: 30px;">
            <div style="color: #00d2ff; font-size: 30px; margin-bottom: 15px; animation: spin 2s linear infinite;">🌐</div>
            <div style="color: #aaa; font-size: 12px; line-height: 1.5;">Conectando a la Nube Nexo...<br>Sincronizando mercado global.</div>
        </div>
    `;

    try {
        if (!window.supabaseClient) {
            grid.innerHTML = `<div style="grid-column: span 2; text-align: center; color: #ff5252; padding: 20px; font-size: 12px;">Error: Cliente de Nube no inicializado.</div>`;
            return;
        }

        const { data: listings, error } = await window.supabaseClient
            .from('market_listings')
            .select('*')
            .eq('status', 'active');

        if (error) throw error;

        grid.innerHTML = "";

        if (!listings || listings.length === 0) {
            grid.innerHTML = `<div style="grid-column: span 2; text-align: center; padding: 30px; color: #888; font-size: 12px;">El mercado global está vacío en este momento.</div>`;
            return;
        }

        const filterType = document.getElementById("filter-type-wrapper")?.dataset.value || "all";
        const filterElement = document.getElementById("filter-element-wrapper")?.dataset.value || "all";

        let filteredListings = listings;

        if (filterType === "genos") {
            filteredListings = filteredListings.filter(l => !l.isItem);
        } else if (filterType === "items") {
            filteredListings = filteredListings.filter(l => l.isItem);
        }

        if (filterElement !== "all") {
            filteredListings = filteredListings.filter(l => {
                if (l.isItem) return false; 
                const data = l.itemData || {};
                const affinity = (data.genes && data.genes.afinidad) ? data.genes.afinidad.dom : (data.element || "Normal");
                return affinity.toLowerCase() === filterElement.toLowerCase();
            });
        }

        if (filteredListings.length === 0) {
            grid.innerHTML = `<div style="grid-column: span 2; text-align: center; padding: 30px; color: #888; font-size: 12px;">No hay resultados para estos filtros.</div>`;
            return;
        }

        filteredListings.forEach(listing => {
            const data = listing.itemData || {};
            const esObjeto = listing.isItem;
            
            let svgIcon = esObjeto ? (data.icon || '🔋') : '🧬';
            
            if (!esObjeto && typeof window.generarSvgGeno === 'function') {
                let tempSvg = window.generarSvgGeno({ ...data, body_shape: data.shape || data.body_shape, base_color: data.color || data.base_color });
                if (tempSvg) svgIcon = tempSvg.replace(/width="[^"]+"/, 'width="100%"').replace(/height="[^"]+"/, 'height="100%"');
            }

            const nombre = data.customName || data.nickname || data.name || "Desconocido";
            const subtitulo = esObjeto ? `x${data.count || 1} Unidades` : `Nv. ${data.level || 1} | ${data.rarity || 'Común'}`;

            const card = document.createElement("div");
            card.className = "market-card-neon";
            if (esObjeto) card.style.border = "1px solid #4dd0e1";

            card.innerHTML = `
                <div style="width: 55px; height: 55px; margin-bottom: 10px; filter: drop-shadow(0px 5px 8px rgba(0,0,0,0.6)); pointer-events: none;">${svgIcon}</div>
                <h4 style="margin: 0 0 5px 0; font-size: 13px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none;">${nombre}</h4>
                <p style="font-size: 11px; color: #cbd5e1; margin: 0 0 10px 0; pointer-events: none;">${subtitulo}</p>
                <div style="margin-top: auto; width: 100%; display: flex; flex-direction: column; gap: 5px;">
                    <span style="color: #D500F9; font-weight: 900; font-size: 12px;">🔷 ${listing.pricePol} POL</span>
                    <button class="market-btn-neon green">Comprar</button>
                </div>
            `;

            card.addEventListener("click", () => {
                if (esObjeto) {
                    window.abrirDetalleItem({ ...data, pricePol: listing.pricePol, sellerId: listing.sellerId, saleId: listing.id, listadoRemoto: true }, 'listado_compra');
                } else {
                    window.abrirDetalleMercadoRemoto(listing);
                }
            });

            card.querySelector("button").addEventListener("click", (e) => {
                e.stopPropagation();
                if (esObjeto) {
                    window.abrirDetalleItem({ ...data, pricePol: listing.pricePol, sellerId: listing.sellerId, saleId: listing.id, listadoRemoto: true }, 'listado_compra');
                } else {
                    window.abrirDetalleMercadoRemoto(listing);
                }
            });

            grid.appendChild(card);
        });

    } catch (err) {
        console.error("Error al cargar el mercado global:", err);
        grid.innerHTML = `<div style="grid-column: span 2; text-align: center; color: #ff5252; padding: 20px; font-size: 12px;">Error al conectar con la Red Nexo.</div>`;
    }
};

window.abrirDetalleMercadoRemoto = function(listing) {
    const data = listing.itemData || {};
    data.pricePol = listing.pricePol;
    data.sellerId = listing.sellerId;
    data.saleId = listing.saleId;
    
    // Inyectar estado en el modal pasándole el objeto directamente
    const modal = document.getElementById("market-detail-modal");
    const actionContainer = document.getElementById("market-detail-action");
    
    // Hacemos que actionContainer espere la compilación antes de sobreescribirlo
    window.abrirDetalleMercado(data, 'inspeccion');
    
    actionContainer.innerHTML = `
        <div style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; border: 1px solid #384a5e; margin-bottom: 15px;">
            <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5; margin-bottom: 5px;">Vendedor: ${data.sellerId ? (data.sellerId.substring(0,6) + "...") : "Desconocido"}</div>
            <div style="color: #D500F9; font-size: 16px; font-weight: bold; text-align: center;">🔷 ${data.pricePol} POL</div>
        </div>
        <button id="modal-btn-action-buy" class="market-btn-neon green" style="width: 100%; font-size: 14px; padding: 12px;">Comprar Espécimen</button>
    `;
    
    document.getElementById("modal-btn-action-buy").onclick = () => {
        if (typeof window.comprarListado === 'function') window.comprarListado(listing);
    };
};

// =========================================
// FUNCIONES DE ESCRITURA EN LA RED (NUBE)
// =========================================

window.publicarVentaEnNube = async function(ventaObj) {
    if (!window.supabaseClient || !window.miUsuarioCloud) {
        console.warn("Usuario no conectado. La venta solo será local.");
        return;
    }

    const payload = {
        saleId: ventaObj.saleId || ventaObj.id,
        itemId: ventaObj.isItem ? ventaObj.itemData.id || "item" : ventaObj.id,
        pricePol: parseFloat(ventaObj.pricePol),
        sellerId: window.miUsuarioCloud.id,
        status: 'active',
        itemData: ventaObj.isItem ? ventaObj.itemData : ventaObj,
        isItem: !!ventaObj.isItem
    };

    const { error } = await window.supabaseClient.from('market_listings').insert([payload]);
    if (error) console.error("Error publicando en Supabase:", error);
    else console.log("☁️ Venta registrada en la Red Nexo:", payload.saleId);
};

window.cancelarVentaEnNube = async function(saleId) {
    if (!window.supabaseClient || !window.miUsuarioCloud) return;

    const { error } = await window.supabaseClient
        .from('market_listings')
        .delete()
        .eq('saleId', saleId)
        .eq('sellerId', window.miUsuarioCloud.id);

    if (error) console.error("Error cancelando venta en Supabase:", error);
    else console.log("☁️ Venta retirada de la Red Nexo:", saleId);
};

// =========================================
// FUNCIONES DE COMPRA Y COBRO
// =========================================
window.comprarListado = async function(listing) {
    if (!window.comercioDesbloqueado) {
        alert("⚠️ Se requiere el 'Permiso de Comercio' (adquirible en el Bazar por 15 EV al llegar a Nv. 5 de Laboratorio) para realizar compras en el mercado.");
        return;
    }
    if (!window.miUsuarioCloud) {
        alert("⚠️ Debes iniciar sesión para comprar en la Red Nexo.");
        return;
    }
    if (listing.sellerId === window.miUsuarioCloud.id) {
        alert("⚠️ No puedes comprar tu propio artículo.");
        return;
    }
    const precio = parseFloat(listing.pricePol);
    if (!window.miWallet || !window.miWallet.address || window.miWallet.pol < precio) {
        window.mostrarModalSaldoCero("buy");
        return;
    }

    const btn = document.getElementById("modal-btn-action-buy") || document.getElementById("modal-btn-action-buy-item");
    if(btn) {
        btn.disabled = true;
        btn.innerText = "PROCESANDO PAGO...";
    }

    try {
        const payloadToUpdate = { status: 'sold' };
        // Si el usuario añadió la columna buyer_id o buyerId, podemos intentar pasarla, pero para estar 100% seguros de no romper el schema (ya que todo está en camelCase o JSON):
        // Guardaremos el comprador dentro del itemData para no requerir una columna nueva obligatoria.
        const updatedItemData = { ...(listing.itemData || {}), buyerId: window.miUsuarioCloud.id };
        payloadToUpdate.itemData = updatedItemData;

        const { data, error } = await window.supabaseClient
            .from('market_listings')
            .update(payloadToUpdate)
            .eq('id', listing.id || listing.saleId)
            .eq('status', 'active')
            .select();

        if (error) {
            console.error("Supabase Error:", error);
            alert(`⚠️ Error de base de datos: ${error.message || JSON.stringify(error)}\n\n(Verifica si tienes permisos RLS para hacer UPDATE o si la columna no existe).`);
            if(btn) { btn.disabled = false; btn.innerText = "Comprar"; }
            return;
        }

        if (!data || data.length === 0) {
            alert("⚠️ La compra falló (0 filas afectadas). El artículo pudo haber sido vendido o retirado, o no tienes permisos (RLS) para modificarlo.");
            if(btn) { btn.disabled = false; btn.innerText = "Comprar"; }
            return;
        }

        window.miWallet.pol -= precio;

        const dataObj = listing.itemData || {};
        
        if (listing.isItem) {
            const itemLimpio = { ...dataObj };
            delete itemLimpio.pricePol;
            delete itemLimpio.listadoRemoto;
            delete itemLimpio.sellerId;
            delete itemLimpio.saleId;
            if (window.miInventario && window.miInventario.addItem) {
                window.miInventario.addItem(itemLimpio, itemLimpio.count || 1);
            }
        } else {
            if (!window.misGenos) window.misGenos = [];
            window.misGenos.push(dataObj);
        }

        alert(`🎉 ¡Compra exitosa! Se ha añadido [${dataObj.name || "Geno"}] a tu cuenta.`);
        const modal = document.getElementById("market-detail-modal");
        if (modal) modal.style.display = "none";
        
        window.cargarMercadoGlobal();
        if (typeof window.WalletManager !== 'undefined') window.WalletManager.actualizarBoton();
        if (typeof window.forzarActualizacionMochila === 'function') window.forzarActualizacionMochila();
        if (typeof window.respaldarEnNube === 'function') window.respaldarEnNube();

    } catch (err) {
        console.error("Error en la compra:", err);
        alert("⚠️ Ocurrió un error al procesar el pago.");
        if(btn) { btn.disabled = false; btn.innerText = "Comprar"; }
    }
};

window.revisarVentasCompletadas = async function() {
    if (!window.miUsuarioCloud || !window.supabaseClient) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('market_listings')
            .select('*')
            .eq('sellerId', window.miUsuarioCloud.id)
            .eq('status', 'sold');

        if (error || !data || data.length === 0) return;

        let totalGanado = 0;
        let totalBoveda = 0;
        let nombresVendidos = [];

        for (const venta of data) {
            const precioTotal = parseFloat(venta.pricePol);
            const comision = parseFloat((precioTotal * 0.035).toFixed(2));
            const gananciaNeta = precioTotal - comision;

            totalGanado += gananciaNeta;
            totalBoveda += comision;
            nombresVendidos.push(venta.itemData?.name || "Objeto");

            // Borrar de la DB de Supabase
            await window.supabaseClient
                .from('market_listings')
                .delete()
                .eq('id', venta.id);
                
            // Limpiar listado local fantasma
            if (window.misVentas) {
                window.misVentas = window.misVentas.filter(v => (v.saleId || v.id) !== (venta.saleId || venta.id));
            }
        }

        if (totalGanado > 0) {
            if (!window.miWallet) window.miWallet = { pol: 0 };
            window.miWallet.pol += totalGanado;
            
            // Bóveda Global track (local al jugador por ahora)
            window.miWallet.bovedaAportada = (window.miWallet.bovedaAportada || 0) + totalBoveda;
            
            alert(`🎉 ¡Tus artículos se vendieron en el Mercado!\n\nHas vendido: ${nombresVendidos.join(', ')}.\nRecibes: ${totalGanado.toFixed(2)} POL netos.\n\n(Se aportó ${totalBoveda.toFixed(2)} POL de comisión a la Bóveda Global)`);
            
            if (typeof window.WalletManager !== 'undefined') window.WalletManager.actualizarBoton();
            if (typeof window.renderizarMisVentas === 'function') window.renderizarMisVentas();
            if (typeof window.respaldarEnNube === 'function') window.respaldarEnNube();
        }

    } catch (err) {
        console.error("Error revisando ventas completadas:", err);
    }
};

// =========================================
// MONITOREO AUTOMÁTICO DE VENTAS (REALTIME)
// =========================================
window.iniciarMonitoreoRealtime = function() {
    if (!window.supabaseClient || !window.miUsuarioCloud) return;

    if (window.marketRealtimeChannel) {
        window.supabaseClient.removeChannel(window.marketRealtimeChannel);
    }

    console.log("📡 Iniciando conexión Supabase Realtime para el mercado...");
    window.marketRealtimeChannel = window.supabaseClient
        .channel('custom-market-channel')
        .on(
            'postgres_changes',
            { 
                event: '*', 
                schema: 'public', 
                table: 'market_listings' 
            },
            (payload) => {
                console.log("⚡ Supabase Realtime Event:", payload);
                if (payload.eventType === 'UPDATE' && payload.new && payload.new.status === 'sold') {
                    if (payload.new.sellerId === window.miUsuarioCloud.id || payload.new.seller_id === window.miUsuarioCloud.id) {
                        if (typeof window.revisarVentasCompletadas === 'function') {
                            window.revisarVentasCompletadas();
                        }
                    }
                }
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log("✅ Conectado a Supabase Realtime exitosamente.");
            }
        });
};