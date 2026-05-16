// =========================================
// MarketManager.js - RED DE CRIADORES (WEB3) - CLON EXACTO DE STATS
// =========================================

window.mercadoNPC = window.mercadoNPC || [];
window.misVentas = window.misVentas || [];

// Función para generar Genos aleatorios en el mercado
function generarGenoNPC() {
    const rarities = ["Común", "Raro", "Épico"];
    const elements = ["Ígneo", "Acuático", "Tóxico", "Cibernético", "Biomutante", "Viral", "Radiactivo", "Sintético"];
    const r = rarities[Math.floor(Math.random() * rarities.length)];
    let price = r === "Común" ? (Math.random() * 2 + 1) : r === "Raro" ? (Math.random() * 5 + 5) : (Math.random() * 15 + 15);
    let level = Math.floor(Math.random() * 10) + 1;
    
    // Generar Stats base
    let objBase = window.generarStatsPorRareza ? window.generarStatsPorRareza(r) : { hp: 50, atk: 15, def: 10, spd: 15, luk: 15 };
    let baseStats = JSON.parse(JSON.stringify(objBase));
    let totalStats = JSON.parse(JSON.stringify(objBase));
    
    // Simular escalado de stats por nivel directamente en totalStats (igual que tu motor)
    if (level > 1) {
        totalStats.hp += (level - 1) * 2;
        totalStats.atk += (level - 1);
        totalStats.def += (level - 1);
        totalStats.spd += (level - 1);
        totalStats.luk += (level - 1);
    }

    const colorRandom = `#${Math.floor(Math.random()*16777215).toString(16)}`;

    return {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: `Geno ${r} (NPC)`,
        rarity: r,
        element: elements[Math.floor(Math.random() * elements.length)],
        body_shape: Math.random() > 0.5 ? "gota" : "frijol",
        base_color: colorRandom,
        color: colorRandom,
        eye_type: "estandar",
        mouth_type: "estandar",
        pricePol: price.toFixed(1),
        level: level,
        reward: 100,
        stats: totalStats,
        baseStats: baseStats,
        quality: r === "Común" ? "C (46%)" : r === "Raro" ? "B (68%)" : "A (85%)",
        scanned: false,
        hidden_genes: { A: null, B: null, C: null }
    };
}

if (window.mercadoNPC.length === 0) {
    for(let i=0; i<4; i++) { window.mercadoNPC.push(generarGenoNPC()); }
}

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
            #market-screen {
                background-color: #4dd0e1 !important; 
                background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px) !important;
            }

            .market-scroll-area::-webkit-scrollbar, .market-detail-scroll::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
            .market-scroll-area, .market-detail-scroll { -ms-overflow-style: none !important; scrollbar-width: none !important; }
            
            .hide-spinners { -moz-appearance: textfield !important; }
            .hide-spinners::-webkit-outer-spin-button,
            .hide-spinners::-webkit-inner-spin-button {
                -webkit-appearance: none !important;
                margin: 0 !important;
            }

            .market-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; }

            .market-tab-neon {
                flex: 1; padding: 12px 5px; font-weight: 900; cursor: pointer; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
                background: rgba(26, 42, 54, 0.6); border: 1px solid #384a5e; color: #a0aec0; transition: all 0.3s ease;
                border-bottom: 2px solid #222; margin: 0 2px; border-radius: 8px 8px 0 0;
            }
            .market-tab-neon:hover { background: rgba(42, 59, 76, 0.9); color: #fff; }
            .market-tab-neon.active {
                color: #fff; background: rgba(30, 20, 50, 0.9);
                border: 1px solid #D500F9; border-bottom: 2px solid transparent;
                box-shadow: inset 0 15px 20px -15px #D500F9, 0 -5px 15px -10px #D500F9;
            }

            .market-card-neon {
                background: linear-gradient(180deg, #2A3B4C 0%, #1A2A36 100%);
                border: 1px solid #384a5e; border-radius: 12px; padding: 18px 12px;
                transition: all 0.3s ease; position: relative; overflow: hidden;
                display: flex; flex-direction: column; align-items: center; text-align: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05);
                width: 100%; box-sizing: border-box; cursor: pointer;
            }
            .market-card-neon::before {
                content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: #D500F9; transition: 0.3s;
            }
            .market-card-neon:hover {
                transform: translateY(-4px); border-color: #D500F9;
                box-shadow: 0 10px 25px rgba(0,0,0,0.4), 0 0 15px rgba(213,0,249,0.4);
                background: linear-gradient(180deg, #32465A 0%, #203342 100%);
            }
            .market-card-neon:hover::before { height: 6px; box-shadow: 0 0 15px #D500F9; }

            .market-btn-neon {
                width: 100%; padding: 10px; border: none; border-radius: 8px; margin-top: auto;
                font-weight: 900; color: #fff; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; font-size: 13px;
                background: linear-gradient(90deg, #6A1B9A, #D500F9);
                box-shadow: 0 4px 10px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.2);
                transition: filter 0.2s, transform 0.1s; text-shadow: 0 1px 2px rgba(0,0,0,0.8); box-sizing: border-box;
            }
            .market-btn-neon.green { background: linear-gradient(90deg, #2E7D32, #69F0AE); }
            .market-btn-neon.red { background: linear-gradient(90deg, #c62828, #ff5252); }
            .market-btn-neon:hover { filter: brightness(1.2) contrast(1.1); }
            .market-btn-neon:active { transform: scale(0.97); }
            
            .listed-item-row {
                display: flex; justify-content: space-between; align-items: center; 
                background: rgba(0,0,0,0.4); padding: 10px 15px; border-radius: 8px; 
                border: 1px solid #4A148C; margin-bottom: 8px; font-size: 12px; color: #fff;
                cursor: pointer; transition: background 0.2s;
            }
            .listed-item-row:hover {
                background: rgba(138, 43, 226, 0.2);
            }
        `;
        document.head.appendChild(style);
    }

    contenedor.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; padding-top: 15px; position: relative;">
            
            <div style="background: #111e28; border-radius: 16px; width: calc(100% - 30px); height: calc(100% - 100px); display: flex; flex-direction: column; box-shadow: 0 10px 25px rgba(0,0,0,0.5); overflow: hidden;">
                
                <div style="padding: 25px 15px 0 15px; flex-shrink: 0;">
                    <h2 class="screen-title" style="color: #D500F9; text-align: center; text-shadow: none; margin: 0 0 25px 0; font-weight: 900; letter-spacing: 2px;">RED DE CRIADORES</h2>
                    
                    <div style="display: flex; justify-content: center; margin-bottom: 15px; padding: 0; border-bottom: 1px solid #384a5e;">
                        <button id="tab-market-buy" class="market-tab-neon active">Comprar</button>
                        <button id="tab-market-sell" class="market-tab-neon">Mis Ventas</button>
                    </div>
                </div>
                
                <div class="market-scroll-area" style="flex: 1; overflow-y: auto; padding: 0 10px 20px 10px;">
                    <div id="market-buy-view">
                        <p style="text-align: center; color: #b39ddb; font-size: 10px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Adquiere Genos de otros criadores</p>
                        <div id="market-buy-grid" class="market-grid"></div>
                    </div>
                    
                    <div id="market-sell-view" class="hidden">
                        <p style="text-align: center; color: #b39ddb; font-size: 10px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Lista tus Genos en la red</p>
                        <div id="market-my-listed" style="margin-bottom: 15px; width: 100%;"></div>
                        <div id="market-sell-grid" class="market-grid"></div>
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
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="stats-level-badge" style="text-align: center; margin-bottom: 15px;">
                        <span id="market-detail-level-badge" style="background: #4dd0e1; color: #000; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;"></span>
                    </div>

                    <div id="market-detail-element-icon" style="text-align: center; margin-bottom: 8px;"></div>
                    <div id="market-detail-id-text" style="text-align: center; margin-bottom: 15px; font-weight: bold; color: #00d2ff; font-family: monospace; letter-spacing: 2px; font-size: 15px;"></div>
                    
                    <div class="stat-info" style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                        <span>Rareza:</span> <span id="market-detail-rarity" style="color: #fff; font-weight: bold;">--</span>
                    </div>
                    <div class="stat-info" style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                        <span>Elem:</span> <span id="market-detail-elem" style="color: #fff; font-weight: bold;">--</span>
                    </div>
                    
                    <div class="stat-info" style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1);">
                        <span>Calidad (Pura):</span> 
                        <span id="market-detail-quality" style="font-weight: 900; font-size: 14px; color: #ffcc00; text-shadow: 0 0 5px rgba(255,255,255,0.5);">--</span>
                    </div>

                    <hr class="stats-divider" style="border: none; border-top: 1px solid #333; margin: 15px 0;">
                    
                    <div class="stat-header" style="display: flex; justify-content: space-between; font-weight: bold; color: #4dd0e1; margin-bottom: 10px; font-size: 14px;">
                        <span>Atributos Activos</span>
                    </div>

                    <div id="market-detail-stats"></div>
                    <div id="market-detail-genes" style="margin-top: 15px;"></div>
                    <div id="market-detail-action" style="margin-top: 20px; text-align: center;"></div>
                </div>
            </div>
            
        </div>
    `;

    document.getElementById("market-detail-modal").style.display = "none";

    const tabBuy = document.getElementById("tab-market-buy");
    const tabSell = document.getElementById("tab-market-sell");
    const viewBuy = document.getElementById("market-buy-view");
    const viewSell = document.getElementById("market-sell-view");

    tabBuy.addEventListener("click", () => {
        tabBuy.classList.add("active"); tabSell.classList.remove("active");
        viewBuy.classList.remove("hidden"); viewSell.classList.add("hidden");
        window.renderizarMercado();
    });

    tabSell.addEventListener("click", () => {
        tabSell.classList.add("active"); tabBuy.classList.remove("active");
        viewSell.classList.remove("hidden"); viewBuy.classList.add("hidden");
        window.renderizarMisVentas();
    });

    window.renderizarMercado();
    window.renderizarMisVentas();
};

window.abrirDetalleMercado = function(idGenoBuscar, tipoAccion) {
    const modal = document.getElementById("market-detail-modal");
    
    // Buscar Geno siempre en tiempo real
    let geno = null;
    if(window.misGenos) geno = window.misGenos.find(g => g.id === idGenoBuscar);
    if(!geno && window.misVentas) geno = window.misVentas.find(g => g.id === idGenoBuscar);
    if(!geno && window.mercadoNPC) geno = window.mercadoNPC.find(g => g.id === idGenoBuscar);
    
    if(!geno) return; 

    // Referencias al DOM
    const nameEl = document.getElementById("market-detail-name-text");
    const lvlEl = document.getElementById("market-detail-level-badge");
    const iconContainer = document.getElementById("market-detail-element-icon");
    const idEl = document.getElementById("market-detail-id-text");
    const rarityEl = document.getElementById("market-detail-rarity");
    const elemEl = document.getElementById("market-detail-elem");
    const qualityEl = document.getElementById("market-detail-quality");
    const statsContainer = document.getElementById("market-detail-stats");
    const genesContainer = document.getElementById("market-detail-genes");
    const actionContainer = document.getElementById("market-detail-action");

    // Inyectar Nombre y Nivel usando la misma variable del RPGManager
    nameEl.innerText = geno.name || "Geno";
    lvlEl.innerText = `Nv. ${geno.level || 1}`;
    idEl.innerText = geno.id ? `#${geno.id}` : "#000000";

    // Inyectar Elemento e Icono SVG del elemento usando tu motor base
    const elementoActual = (geno.genes && geno.genes.afinidad) ? geno.genes.afinidad.dom : (geno.element || "Normal");
    const nombreElementoLimpio = elementoActual.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').trim();
    
    rarityEl.innerText = geno.rarity || "Común";
    elemEl.innerText = nombreElementoLimpio;

    let iconoElementoHTML = "";
    if(typeof window.getIconoElemento === 'function') {
        iconoElementoHTML = window.getIconoElemento(elementoActual).replace('margin-right: 6px;', 'margin-right: 0;');
    }
    iconContainer.innerHTML = `<div style="font-size: 45px; margin-bottom: 8px; display: flex; justify-content: center; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8));">${iconoElementoHTML}</div>`;

    // Inyectar Calidad
    let calidadFinal = geno.quality || geno.calidad;
    if (!calidadFinal) {
        calidadFinal = geno.rarity === "Común" ? "C (46%)" : geno.rarity === "Raro" ? "B (68%)" : geno.rarity === "Épico" ? "A (85%)" : "Estándar";
    }
    qualityEl.innerText = calidadFinal;

    // --- REPLICAMOS TU LÓGICA DE STATS EXACTA ---
    const stBase = geno.baseStats || geno.stats || { hp: 0, atk: 0, def: 0, spd: 0, luk: 0 };
    const stTotal = geno.stats || { hp: 0, atk: 0, def: 0, spd: 0, luk: 0 };

    const iconHp = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4b4b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
    const iconAtk = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff8c00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path><path d="M19 21l2-2"></path></svg>`;
    const iconDef = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
    const iconSpd = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
    const iconLuk = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

    const renderRow = (label, icon, base, total) => {
        const numBase = Math.floor(base) || 0;
        const numTotal = Math.floor(total) || 0;
        const diff = numTotal - numBase;
        
        // Exactamente tu lógica de RPGManager.js: Si diff > 0 dibuja, si no, lo deja vacío
        const addedStr = diff > 0 ? `(+${diff})` : '';
        const totalStr = diff > 0 ? `${numTotal}` : '';
        
        return `
        <div style="display: grid; grid-template-columns: 55px 25px 40px 30px 1fr; gap: 4px; align-items: center; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; margin-bottom: 5px; font-size: 13px;">
            <span style="text-align: left; display: flex; align-items: center; gap: 4px; color: #fff;">${icon} ${label}:</span>
            <span style="font-weight: bold; color: #fff; text-align: right;">${numBase}</span>
            <span style="color: #4CAF50; font-size: 11px; font-weight: bold; text-align: right;">${addedStr}</span>
            <span style="color: #ffcc00; font-weight: bold; font-size: 15px; text-align: right;">${totalStr}</span>
            <div></div>
        </div>`;
    };

    statsContainer.innerHTML = `
        ${renderRow('Vit', iconHp, stBase.hp, stTotal.hp)}
        ${renderRow('Fue', iconAtk, stBase.atk, stTotal.atk)}
        ${renderRow('Def', iconDef, stBase.def, stTotal.def)}
        ${renderRow('Agi', iconSpd, stBase.spd, stTotal.spd)}
        ${renderRow('Sue', iconLuk, stBase.luk, stTotal.luk)}
    `;

    // Estructura Genética
    let geneHtml = `
        <div style="font-size: 12px; color: #4dd0e1; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; letter-spacing: 1px; text-align: center;">Estructura Genética</div>
        <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; border: 1px dashed #555; text-align: center; color: #666; font-size: 12px;">
            🔒 ADN Bloqueado<br>
            <span style="font-size: 10px; color: #444; margin-top: 6px; display: inline-block;">Usa un escáner para revelar la secuencia.</span>
        </div>
    `;
        
    if (geno.scanned && geno.hidden_genes) {
        geneHtml = `
            <div style="font-size: 12px; color: #4dd0e1; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; letter-spacing: 1px; text-align: center;">Estructura Genética</div>
            <div style="background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 6px; font-size: 11px; color: #fff; border-left: 3px solid #ffcc00; display: flex; flex-direction: column; gap: 4px; margin-bottom: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #ffcc00; font-weight: bold; font-size: 10px; text-transform: uppercase;">Gen A (Cosmético)</span>
                    <span style="font-weight: bold;">${geno.hidden_genes.A ? geno.hidden_genes.A.name : 'Desconocido'}</span>
                </div>
            </div>
            <div style="background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 6px; font-size: 11px; color: #fff; border-left: 3px solid #80deea; display: flex; flex-direction: column; gap: 4px; margin-bottom: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #80deea; font-weight: bold; font-size: 10px; text-transform: uppercase;">Gen B (Funcional)</span>
                    <span style="font-weight: bold;">${geno.hidden_genes.B ? geno.hidden_genes.B.name : 'Desconocido'}</span>
                </div>
            </div>
        `;
    }

    genesContainer.innerHTML = geneHtml;

    if (tipoAccion === 'comprar') {
        actionContainer.innerHTML = `
            <div style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; border: 1px solid #384a5e; margin-bottom: 15px;">
                <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5; margin-bottom: 5px;">Espécimen listado en la red global.</div>
                <div style="color: #cbd5e1; font-size: 12px;">Recompensa estimada al liberar: <b>${geno.reward || 100} ✨</b></div>
            </div>
            <div style="font-size: 18px; font-weight: 900; letter-spacing: 1px; margin-bottom: 15px;">
                <span style="color: #D500F9; text-shadow: 0 0 8px rgba(213,0,249,0.8);">🔷 ${geno.pricePol} POL</span>
            </div>
            <button id="modal-btn-action" class="market-btn-neon" style="width: 100%; font-size: 14px; padding: 12px;">Confirmar Compra</button>
        `;
        document.getElementById("modal-btn-action").onclick = () => {
            window.procesarCompraMercado(geno);
            modal.style.display = "none";
        };
    } else if (tipoAccion === 'publicar') {
        actionContainer.innerHTML = `
            <div style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; border: 1px solid #384a5e; margin-bottom: 15px;">
                <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5;">Establece el precio en $POL para listar este espécimen. Los compradores analizarán sus atributos.</div>
            </div>
            <input type="number" id="modal-input-price" class="hide-spinners" placeholder="Precio en POL" style="width: 100%; box-sizing: border-box; padding: 12px; margin-bottom: 15px; background: rgba(0,0,0,0.4); border: 1px solid #D500F9; border-radius: 8px; text-align: center; color: #fff; font-weight: bold; outline: none; font-size: 16px;" step="0.1" min="0.1">
            <button id="modal-btn-action" class="market-btn-neon green" style="width: 100%; font-size: 14px; padding: 12px;">Publicar en la Red</button>
        `;
        document.getElementById("modal-btn-action").onclick = () => {
            const val = document.getElementById("modal-input-price").value;
            if(window.procesarVentaMercado(geno, val)) {
                modal.style.display = "none";
            }
        };
    } else if (tipoAccion === 'listado') {
        actionContainer.innerHTML = `
            <div style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; border: 1px solid #384a5e; margin-bottom: 15px;">
                <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5; margin-bottom: 5px;">Espécimen listado en la red global.</div>
                <div style="color: #4CAF50; font-size: 12px; font-weight: bold;">Esperando a un comprador...</div>
            </div>
            <div style="font-size: 18px; font-weight: 900; letter-spacing: 1px; margin-bottom: 15px;">
                <span style="color: #D500F9; text-shadow: 0 0 8px rgba(213,0,249,0.8);">🔷 ${geno.pricePol} POL</span>
            </div>
            <button id="modal-btn-action" class="market-btn-neon" style="width: 100%; font-size: 14px; padding: 12px; background: #384a5e; box-shadow: none;">Cerrar Inspección</button>
        `;
        document.getElementById("modal-btn-action").onclick = () => {
            modal.style.display = "none";
        };
    }

    modal.style.display = "flex";

    // Manejo correcto de la X usando .closest()
    const btnClose = document.getElementById("close-market-detail");
    const cerrarModal = (e) => {
        if(e.target === modal || e.target.closest('#close-market-detail')) {
            modal.style.display = "none";
            modal.removeEventListener("click", cerrarModal);
        }
    };
    modal.addEventListener("click", cerrarModal);
};

window.procesarCompraMercado = function(geno) {
    const precio = parseFloat(geno.pricePol);
    if (window.miWallet && window.miWallet.pol >= precio) {
        window.miWallet.pol -= precio;
        const polText = document.getElementById("pol-amount");
        if(polText) polText.innerText = `${window.miWallet.pol.toFixed(1)} POL`;
        
        delete geno.pricePol;
        if(!window.misGenos) window.misGenos = [];
        window.misGenos.push(geno);
        
        window.mercadoNPC = window.mercadoNPC.filter(g => g.id !== geno.id);
        window.mercadoNPC.push(generarGenoNPC());
        
        alert(`✅ ¡Compra exitosa! Adquiriste a [${geno.name}] por ${precio} POL.`);
        window.renderizarMercado();
        
        if(window.guardarJuego) window.guardarJuego();
        else if(window.guardarProgreso) window.guardarProgreso();
    } else {
        alert("❌ No tienes suficiente $POL para comprar este Geno.");
    }
};

window.procesarVentaMercado = function(geno, inputPrecio) {
    const precio = parseFloat(inputPrecio);
    if (isNaN(precio) || precio <= 0) {
        alert("⚠️ Por favor, introduce un precio válido mayor a 0.");
        return false;
    }

    window.misGenos = window.misGenos.filter(g => g.id !== geno.id);
    geno.pricePol = precio.toFixed(1);
    window.misVentas.push(geno);
    
    alert(`✅ Has publicado a [${geno.name}] en la red por ${geno.pricePol} POL.`);
    window.renderizarMisVentas();
    
    if(window.guardarJuego) window.guardarJuego();
    else if(window.guardarProgreso) window.guardarProgreso();
    
    return true;
};

window.renderizarMercado = function() {
    const grid = document.getElementById("market-buy-grid");
    if(!grid) return;
    grid.innerHTML = "";

    window.mercadoNPC.forEach(geno => {
        const card = document.createElement("div");
        card.className = "market-card-neon";
        
        let svgIcon = '🧬';
        if (typeof window.generarSvgGeno === 'function') {
            let propGeno = { ...geno };
            if (!propGeno.body_shape && propGeno.shape) propGeno.body_shape = propGeno.shape;
            if (!propGeno.base_color && propGeno.color) propGeno.base_color = propGeno.color;
            let tempSvg = window.generarSvgGeno(propGeno);
            if (tempSvg) svgIcon = tempSvg.replace(/width="[^"]+"/, 'width="100%"').replace(/height="[^"]+"/, 'height="100%"');
        }

        card.innerHTML = `
            <div style="width: 55px; height: 55px; margin-bottom: 10px; filter: drop-shadow(0px 5px 8px rgba(0,0,0,0.6)); pointer-events: none;">
                ${svgIcon}
            </div>
            <h4 style="margin: 0 0 5px 0; font-size: 13px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none;">${geno.name || "Geno"}</h4>
            <p style="font-size: 11px; color: #cbd5e1; margin: 0 0 10px 0; pointer-events: none;">Nv. ${geno.level || 1} | ${geno.rarity}</p>
            <div style="font-weight: 900; color: #D500F9; margin-bottom: 15px; font-size: 14px; text-shadow: 0 0 8px rgba(213,0,249,0.8); pointer-events: none;">🔷 ${geno.pricePol} POL</div>
            <button class="market-btn-neon">Inspeccionar</button>
        `;
        
        card.querySelector("button").addEventListener("click", (e) => {
            e.stopPropagation();
            window.abrirDetalleMercado(geno.id, 'comprar');
        });
        card.addEventListener("click", () => window.abrirDetalleMercado(geno.id, 'comprar'));
        
        grid.appendChild(card);
    });
};

window.renderizarMisVentas = function() {
    const grid = document.getElementById("market-sell-grid");
    const listContainer = document.getElementById("market-my-listed");
    if(!grid || !listContainer) return;
    
    grid.innerHTML = "";
    const genosVendibles = (window.misGenos || []).filter(g => !g.isEgg);
    
    if (genosVendibles.length === 0) {
        grid.innerHTML = '<p style="grid-column: span 2; text-align: center; color: #888; font-size: 12px; padding: 20px;">No tienes Genos en tu Santuario para vender.</p>';
    } else {
        genosVendibles.forEach(geno => {
            const card = document.createElement("div");
            card.className = "market-card-neon";
            
            let svgIcon = '🧬';
            if (typeof window.generarSvgGeno === 'function') {
                let propGeno = { ...geno };
                if (!propGeno.body_shape && propGeno.shape) propGeno.body_shape = propGeno.shape;
                if (!propGeno.base_color && propGeno.color) propGeno.base_color = propGeno.color;
                let tempSvg = window.generarSvgGeno(propGeno);
                if (tempSvg) svgIcon = tempSvg.replace(/width="[^"]+"/, 'width="100%"').replace(/height="[^"]+"/, 'height="100%"');
            }

            card.innerHTML = `
                <div style="width: 55px; height: 55px; margin-bottom: 10px; filter: drop-shadow(0px 5px 8px rgba(0,0,0,0.6)); pointer-events: none;">
                    ${svgIcon}
                </div>
                <h4 style="margin: 0 0 5px 0; font-size: 13px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none;">${geno.name || "Geno"}</h4>
                <p style="font-size: 11px; color: #cbd5e1; margin: 0 0 10px 0; pointer-events: none;">Nv. ${geno.level || 1} | ${geno.rarity}</p>
                <div style="font-weight: 900; color: #69F0AE; margin-bottom: 15px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; pointer-events: none;">Disponible</div>
                <button class="market-btn-neon green">Vender</button>
            `;
            
            card.querySelector("button").addEventListener("click", (e) => {
                e.stopPropagation();
                window.abrirDetalleMercado(geno.id, 'publicar');
            });
            card.addEventListener("click", () => window.abrirDetalleMercado(geno.id, 'publicar'));
            
            grid.appendChild(card);
        });
    }

    listContainer.innerHTML = "";
    if (window.misVentas.length > 0) {
        listContainer.innerHTML = '<h4 style="width: 100%; color: #D500F9; border-bottom: 1px solid #384a5e; padding-bottom: 8px; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase;">Tus Ventas Activas:</h4>';
        window.misVentas.forEach(geno => {
            const item = document.createElement("div");
            item.className = "listed-item-row";
            
            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; pointer-events: none;">
                    <span style="font-size: 14px;">🔍</span>
                    <span style="font-weight: bold; font-size: 13px;">${geno.name || "Geno"}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: #D500F9; font-weight: 900; pointer-events: none;">🔷 ${geno.pricePol}</span>
                    <button class="market-btn-neon red btn-cancel-sale" style="padding: 5px 10px; width: auto; font-size: 10px; margin: 0; position: relative; z-index: 2;">Cancelar</button>
                </div>
            `;
            
            item.addEventListener("click", (e) => {
                if(e.target.classList.contains('btn-cancel-sale')) return;
                window.abrirDetalleMercado(geno.id, 'listado');
            });
            
            item.querySelector(".btn-cancel-sale").addEventListener("click", (e) => {
                e.stopPropagation();
                window.misVentas = window.misVentas.filter(g => g.id !== geno.id);
                delete geno.pricePol;
                window.misGenos.push(geno);
                window.renderizarMisVentas();
                
                if(window.guardarJuego) window.guardarJuego();
                else if(window.guardarProgreso) window.guardarProgreso();
            });
            listContainer.appendChild(item);
        });
    }
};

if(!window.simuladorMercadoActivo) {
    window.simuladorMercadoActivo = true;
    setInterval(() => {
        if (window.misVentas && window.misVentas.length > 0) {
            if (Math.random() < 0.3) {
                const index = Math.floor(Math.random() * window.misVentas.length);
                const genoVendido = window.misVentas[index];
                const ganancia = parseFloat(genoVendido.pricePol);

                window.misVentas.splice(index, 1);
                if (window.miWallet) {
                    window.miWallet.pol += ganancia;
                    const polText = document.getElementById("pol-amount");
                    if(polText) polText.innerText = `${window.miWallet.pol.toFixed(1)} POL`;
                }

                alert(`💰 ¡VENTA EXITOSA!\nUn comprador anónimo adquirió tu [${genoVendido.name}].\nHas recibido +${ganancia} POL.`);
                
                const grid = document.getElementById("market-sell-grid");
                if(grid) window.renderizarMisVentas();
                
                if(window.guardarJuego) window.guardarJuego();
                else if(window.guardarProgreso) window.guardarProgreso();
            }
        }
    }, 10000);
}