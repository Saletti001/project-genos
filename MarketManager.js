// =========================================
// MarketManager.js - RED DE CRIADORES Y COMERCIO (WEB3 P2P)
// =========================================

window.misVentas = window.misVentas || [];

function obtenerNombreGeno(g) {
    return g.customName || g.nickname || g.apodo || g.name || "Desconocido";
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
            
            /* Estilos del Filtro */
            .market-filter-select { flex: 1; background: #0f0f1a; color: #4dd0e1; border: 1px solid #384a5e; border-radius: 6px; padding: 8px; outline: none; font-size: 11px; text-transform: uppercase; font-weight: bold; cursor: pointer; transition: border-color 0.2s; }
            .market-filter-select:hover { border-color: #00d2ff; }
            .market-filter-select:focus { border-color: #D500F9; box-shadow: 0 0 8px rgba(213,0,249,0.3); }
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
                    </div>
                </div>
                <div class="market-scroll-area" style="flex: 1; overflow-y: auto; padding: 0 10px 20px 10px;">
                    
                    <div id="market-buy-view">
                        <div style="display: flex; gap: 8px; margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid #384a5e;">
                            <select id="filter-type" class="market-filter-select">
                                <option value="all">Todo el Mercado</option>
                                <option value="genos">Solo Genos</option>
                                <option value="items">Solo Objetos / EV</option>
                            </select>
                            <select id="filter-element" class="market-filter-select">
                                <option value="all">Cualquier Elemento</option>
                                <option value="Igneo">🔥 Ígneo</option>
                                <option value="Acuatico">💧 Acuático</option>
                                <option value="Sintetico">⚙️ Sintético</option>
                            </select>
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

    const tabBuy = document.getElementById("tab-market-buy");
    const tabSell = document.getElementById("tab-market-sell");
    const viewBuy = document.getElementById("market-buy-view");
    const viewSell = document.getElementById("market-sell-view");

    tabBuy.addEventListener("click", () => {
        tabBuy.classList.add("active"); tabSell.classList.remove("active");
        viewBuy.classList.remove("hidden"); viewSell.classList.add("hidden");
    });

    tabSell.addEventListener("click", () => {
        tabSell.classList.add("active"); tabBuy.classList.remove("active");
        viewSell.classList.remove("hidden"); viewBuy.classList.add("hidden");
        window.renderizarMisVentas();
    });

    window.renderizarMisVentas();
};

// ==========================================
// FUNCIÓN PARA PUBLICAR OBJETOS (CÁPSULAS)
// ==========================================
window.abrirDetalleItem = function(itemBase) {
    const modal = document.getElementById("market-detail-modal");
    const nameEl = document.getElementById("market-detail-name-text");
    const dynamicContent = document.getElementById("market-detail-dynamic-content");
    const actionContainer = document.getElementById("market-detail-action");

    nameEl.innerText = itemBase.name;

    dynamicContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px; font-size: 60px; filter: drop-shadow(0 0 15px rgba(0,210,255,0.4));">
            ${itemBase.icon}
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #333; color: #cbd5e1; font-size: 13px; line-height: 1.5; text-align: center; margin-bottom: 15px;">
            ${itemBase.description}
        </div>
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 5px;">
            <span style="background: #1e293b; padding: 5px 10px; border-radius: 5px; font-size: 11px; color: #ffcc00; font-weight: bold; border: 1px solid #333;">Tienes: ${itemBase.count}</span>
        </div>
    `;

    actionContainer.innerHTML = `
        <div style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; border: 1px solid #384a5e; margin-bottom: 15px;">
            <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5;">Precio en $POL para vender <b>1x unidad</b> de este objeto.</div>
        </div>
        <input type="number" id="modal-input-price-item" class="hide-spinners" placeholder="Precio en POL" style="width: 100%; box-sizing: border-box; padding: 12px; margin-bottom: 15px; background: rgba(0,0,0,0.4); border: 1px solid #D500F9; border-radius: 8px; text-align: center; color: #fff; font-weight: bold; outline: none; font-size: 16px;" step="0.1" min="0.1">
        <button id="modal-btn-action-item" class="market-btn-neon green" style="width: 100%; font-size: 14px; padding: 12px;">Publicar 1x Unidad</button>
    `;

    document.getElementById("modal-btn-action-item").onclick = () => {
        const precio = parseFloat(document.getElementById("modal-input-price-item").value);
        if (isNaN(precio) || precio <= 0) { alert("⚠️ Introduce un precio válido mayor a 0."); return; }

        itemBase.count -= 1;
        
        // Si usamos el sistema de slots, vaciamos el slot correctamente
        if (itemBase.count <= 0) {
            let invArray = window.miInventario.slots || window.miInventario.items;
            let index = invArray.indexOf(itemBase);
            if (index > -1) invArray[index] = null; // Liberamos el slot!
        }

        const ventaObjeto = {
            saleId: "venta_" + Date.now(),
            isItem: true,
            pricePol: precio.toFixed(1),
            itemData: { ...itemBase, count: 1 } 
        };

        window.misVentas.push(ventaObjeto);
        
        alert(`✅ Has publicado [1x ${itemBase.name}] en la red por ${ventaObjeto.pricePol} POL.`);
        modal.style.display = "none";
        
        if (window.miInventario && typeof window.miInventario.updateUI === 'function') {
            window.miInventario.updateUI();
            window.miInventario.renderGrid();
        }
        window.renderizarMisVentas();
        if(window.guardarProgreso) window.guardarProgreso();
    };

    modal.style.display = "flex";

    const cerrarModal = (e) => {
        if(e.target === modal || e.target.closest('#close-market-detail')) {
            modal.style.display = "none"; modal.removeEventListener("click", cerrarModal);
        }
    };
    modal.addEventListener("click", cerrarModal);
};

// ==========================================
// FUNCIÓN PARA PUBLICAR GENOS 
// ==========================================
window.abrirDetalleMercado = function(idGenoBuscar, tipoAccion) {
    const modal = document.getElementById("market-detail-modal");
    let geno = null;
    if (window.miMascota && window.miMascota.id === idGenoBuscar) geno = window.miMascota;
    else if(window.misGenos) geno = window.misGenos.find(g => g.id === idGenoBuscar);
    
    if(!geno && window.misVentas) {
        let listado = window.misVentas.find(v => !v.isItem && v.id === idGenoBuscar);
        if (listado) geno = listado;
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

    dynamicContent.innerHTML = `
        <div class="stats-level-badge" style="text-align: center; margin-bottom: 15px;">
            <span style="background: #4dd0e1; color: #000; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">Nv. ${geno.level || 1}</span>
        </div>
        <div style="text-align: center; margin-bottom: 8px;">
            <div style="font-size: 45px; margin-bottom: 8px; display: flex; justify-content: center; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8));">${iconoElementoHTML}</div>
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
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; text-align: center; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 8px; border: 1px solid #333;">
            <div><div style="font-size: 10px; color: #ff4b4b;">❤️</div><div style="font-size: 12px; font-weight: bold; color: #fff;">${stTotal.hp}</div></div>
            <div><div style="font-size: 10px; color: #ff8c00;">⚔️</div><div style="font-size: 12px; font-weight: bold; color: #fff;">${stTotal.atk}</div></div>
            <div><div style="font-size: 10px; color: #3b82f6;">🛡️</div><div style="font-size: 12px; font-weight: bold; color: #fff;">${stTotal.def}</div></div>
            <div><div style="font-size: 10px; color: #facc15;">⚡</div><div style="font-size: 12px; font-weight: bold; color: #fff;">${stTotal.spd}</div></div>
            <div><div style="font-size: 10px; color: #10b981;">🍀</div><div style="font-size: 12px; font-weight: bold; color: #fff;">${stTotal.luk}</div></div>
        </div>
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
            const precio = parseFloat(document.getElementById("modal-input-price").value);
            if (isNaN(precio) || precio <= 0) { alert("⚠️ Introduce un precio válido mayor a 0."); return; }

            window.misGenos = window.misGenos.filter(g => g.id !== geno.id);
            geno.pricePol = precio.toFixed(1);
            geno.saleId = "venta_" + Date.now();
            window.misVentas.push(geno);
            
            alert(`✅ Has publicado a [${obtenerNombreGeno(geno)}] en la red por ${geno.pricePol} POL.`);
            modal.style.display = "none";
            window.renderizarMisVentas();
            if(window.guardarProgreso) window.guardarProgreso();
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

// ==========================================
// RENDERIZADO DEL INVENTARIO A LA VENTA
// ==========================================
window.renderizarMisVentas = function() {
    const grid = document.getElementById("market-sell-grid");
    const listContainer = document.getElementById("market-my-listed");
    if(!grid || !listContainer) return;
    
    grid.innerHTML = "";
    let hayCosasParaVender = false;
    
    // 1. Mostrar Genos (Ignoramos al Activo para protegerlo)
    const genosVendibles = (window.misGenos || []).filter(g => !g.isEgg && (!window.miMascota || g.id !== window.miMascota.id));
    
    // ✨ AVISO: Si no hay Genos para vender porque solo tiene el Activo, se lo explicamos al jugador
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
        card.querySelector("button").addEventListener("click", (e) => { e.stopPropagation(); window.abrirDetalleMercado(geno.id, 'publicar'); });
        grid.appendChild(card);
    });

    // 2. Mostrar OBJETOS de la mochila (✨ CORRECCIÓN DE BUGS NULOS APLICADA ✨)
    let inventarioArray = [];
    if (window.miInventario) {
        if (Array.isArray(window.miInventario.slots)) inventarioArray = window.miInventario.slots;
        else if (Array.isArray(window.miInventario.items)) inventarioArray = window.miInventario.items;
    }

    // Filtramos ignorando los slots nulos
    const itemsVendibles = inventarioArray.filter(item => item !== null && typeof item === 'object' && item.valorMercado);
    
    itemsVendibles.forEach(item => {
        hayCosasParaVender = true;
        const card = document.createElement("div");
        card.className = "market-card-neon";
        card.style.border = "1px solid #4dd0e1"; 
        card.innerHTML = `
            <div style="width: 50px; height: 50px; margin-bottom: 10px; filter: drop-shadow(0px 5px 8px rgba(0,210,255,0.4)); pointer-events: none;">${item.icon}</div>
            <h4 style="margin: 0 0 5px 0; font-size: 13px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none;">${item.name}</h4>
            <p style="font-size: 11px; color: #cbd5e1; margin: 0 0 10px 0; pointer-events: none;">En mochila: x${item.count}</p>
            <button class="market-btn-neon green" style="background: linear-gradient(90deg, #0097a7, #4dd0e1);">Vender</button>
        `;
        card.querySelector("button").addEventListener("click", (e) => { e.stopPropagation(); window.abrirDetalleItem(item); });
        grid.appendChild(card);
    });

    if (!hayCosasParaVender) {
        const msj = document.createElement("p");
        msj.style = "grid-column: span 2; text-align: center; color: #888; font-size: 12px; padding: 20px;";
        msj.innerText = "No tienes objetos valiosos en tu mochila para vender.";
        grid.appendChild(msj);
    }

    // 3. Renderizar listados activos
    listContainer.innerHTML = "";
    if (window.misVentas.length > 0) {
        listContainer.innerHTML = '<h4 style="width: 100%; color: #D500F9; border-bottom: 1px solid #384a5e; padding-bottom: 8px; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase;">Tus Ventas Activas:</h4>';
        window.misVentas.forEach(venta => {
            
            const isItem = venta.isItem;
            const nombreMostrar = isItem ? venta.itemData.name : obtenerNombreGeno(venta);
            const iconoListado = isItem ? "🔋" : "🧬";
            
            const row = document.createElement("div");
            row.className = "listed-item-row";
            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; pointer-events: none;">
                    <span style="font-size: 16px;">${iconoListado}</span>
                    <span style="font-weight: bold; font-size: 13px;">${nombreMostrar} ${isItem ? '(x1)' : ''}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: #D500F9; font-weight: 900; pointer-events: none;">🔷 ${venta.pricePol}</span>
                    <button class="market-btn-neon red btn-cancel-sale" style="padding: 5px 10px; width: auto; font-size: 10px; margin: 0; position: relative; z-index: 2;">Cancelar</button>
                </div>
            `;
            
            row.querySelector(".btn-cancel-sale").addEventListener("click", (e) => {
                e.stopPropagation();
                
                if (isItem) {
                    const exito = window.miInventario.addItem(venta.itemData);
                    if (!exito) {
                        alert("🎒 ¡Mochila llena! No puedes cancelar esta venta hasta liberar un espacio.");
                        return;
                    }
                    if (window.miInventario && typeof window.miInventario.updateUI === 'function') {
                        window.miInventario.updateUI();
                        window.miInventario.renderGrid();
                    }
                } else {
                    delete venta.pricePol;
                    window.misGenos.push(venta);
                }

                window.misVentas = window.misVentas.filter(v => v.saleId !== venta.saleId);
                window.renderizarMisVentas();
                if(window.guardarProgreso) window.guardarProgreso();
            });
            
            listContainer.appendChild(row);
        });
    }
};