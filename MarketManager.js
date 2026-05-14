// =========================================
// MarketManager.js - MERCADO NEGRO (WEB3) - REDISEÑADO
// =========================================

// Variables globales del mercado
window.mercadoNPC = window.mercadoNPC || [];
window.misVentas = window.misVentas || [];

// Función para generar Genos aleatorios en el mercado
function generarGenoNPC() {
    const rarities = ["Común", "Raro", "Épico"];
    const elements = ["🔥 Ígneo", "💧 Acuático", "🧪 Tóxico", "⚙️ Cibernético"];
    const r = rarities[Math.floor(Math.random() * rarities.length)];
    let price = r === "Común" ? (Math.random() * 2 + 1) : r === "Raro" ? (Math.random() * 5 + 5) : (Math.random() * 15 + 15);
    return {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: `Geno ${r} (NPC)`,
        rarity: r,
        element: elements[Math.floor(Math.random() * elements.length)],
        shape: Math.random() > 0.5 ? "gota" : "frijol",
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Color aleatorio
        pricePol: price.toFixed(1),
        level: Math.floor(Math.random() * 10) + 1,
        reward: 100
    };
}

// Inicializar el mercado con 4 Genos si está vacío
if (window.mercadoNPC.length === 0) {
    for(let i=0; i<4; i++) { window.mercadoNPC.push(generarGenoNPC()); }
}

window.iniciarMercado = function() {
    const contenedor = document.getElementById("market-screen");
    if (!contenedor) return;

    // Limpiar estilos previos en línea para evitar bloqueos
    contenedor.style.background = "";
    contenedor.style.backgroundColor = "";
    contenedor.style.backgroundImage = "";

    // Inyectar Estilos visuales del Mercado Web3
    const styleId = "market-styles-neon";
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            /* OVERRIDE DEFINITIVO FONDO MERCADO (Cian Unificado) */
            #market-screen {
                background-color: #4dd0e1 !important; 
                background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px) !important;
            }

            .market-scroll-area::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
            .market-scroll-area { -ms-overflow-style: none !important; scrollbar-width: none !important; }
            
            /* GRILLA ADAPTATIVA */
            .market-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                width: 100%;
            }

            /* PESTAÑAS NEÓN PÚRPURA */
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

            /* TARJETAS DE GENOS */
            .market-card-neon {
                background: linear-gradient(180deg, #2A1B3D 0%, #1A0B2E 100%);
                border: 1px solid #4A148C; border-radius: 12px; padding: 18px 12px;
                transition: all 0.3s ease; position: relative; overflow: hidden;
                display: flex; flex-direction: column; align-items: center; text-align: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05);
                width: 100%; box-sizing: border-box;
            }
            .market-card-neon::before {
                content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px;
                background: #D500F9; transition: 0.3s;
            }
            .market-card-neon:hover {
                transform: translateY(-4px); border-color: #D500F9;
                box-shadow: 0 10px 25px rgba(0,0,0,0.4), 0 0 15px rgba(213,0,249,0.4);
                background: linear-gradient(180deg, #3B205E 0%, #221040 100%);
            }
            .market-card-neon:hover::before { height: 6px; box-shadow: 0 0 15px #D500F9; }

            /* BOTONES DE COMPRA/VENTA */
            .market-btn-neon {
                width: 100%; padding: 10px; border: none; border-radius: 8px; margin-top: auto;
                font-weight: 900; color: #fff; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; font-size: 13px;
                background: linear-gradient(90deg, #6A1B9A, #D500F9);
                box-shadow: 0 4px 10px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.2);
                transition: filter 0.2s, transform 0.1s; text-shadow: 0 1px 2px rgba(0,0,0,0.8);
                box-sizing: border-box;
            }
            .market-btn-neon.green { background: linear-gradient(90deg, #2E7D32, #69F0AE); }
            .market-btn-neon.red { background: linear-gradient(90deg, #c62828, #ff5252); }
            .market-btn-neon:hover { filter: brightness(1.2) contrast(1.1); }
            .market-btn-neon:active { transform: scale(0.97); }
            
            /* LISTA DE TUS VENTAS ACTIVAS */
            .listed-item-row {
                display: flex; justify-content: space-between; align-items: center; 
                background: rgba(0,0,0,0.4); padding: 10px 15px; border-radius: 8px; 
                border: 1px solid #4A148C; margin-bottom: 8px; font-size: 12px; color: #fff;
            }
        `;
        document.head.appendChild(style);
    }

    // Inyectar HTML con la Estructura de Tarjeta Central (Idéntica a la Tienda)
    contenedor.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; padding-top: 15px; position: relative;">
            
            <div style="background: #111e28; border-radius: 16px; width: calc(100% - 30px); height: calc(100% - 100px); display: flex; flex-direction: column; box-shadow: 0 10px 25px rgba(0,0,0,0.5); overflow: hidden;">
                
                <div style="padding: 25px 15px 0 15px; flex-shrink: 0;">
                    <h2 class="screen-title" style="color: #D500F9; text-align: center; text-shadow: none; margin: 0 0 25px 0; font-weight: 900; letter-spacing: 2px;">MERCADO WEB3</h2>
                    
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
                        <p style="text-align: center; color: #b39ddb; font-size: 10px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Lista tus Genos en $POL</p>
                        <div id="market-my-listed" style="margin-bottom: 15px; width: 100%;"></div>
                        <div id="market-sell-grid" class="market-grid"></div>
                    </div>
                    
                </div>
            </div>
            
            <div class="fab-btn btn-go-home" onclick="navegarA('room-area')" style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); width: 70%; max-width: 300px; z-index: 100;">
                <div class="fab-content" style="font-size: 13px; cursor: pointer; padding: 12px 0; text-align: center;">VOLVER AL LABORATORIO</div>
            </div>
            
        </div>
    `;

    // Lógica de pestañas
    const tabBuy = document.getElementById("tab-market-buy");
    const tabSell = document.getElementById("tab-market-sell");
    const viewBuy = document.getElementById("market-buy-view");
    const viewSell = document.getElementById("market-sell-view");

    tabBuy.addEventListener("click", () => {
        tabBuy.classList.add("active");
        tabSell.classList.remove("active");
        viewBuy.classList.remove("hidden");
        viewSell.classList.add("hidden");
    });

    tabSell.addEventListener("click", () => {
        tabSell.classList.add("active");
        tabBuy.classList.remove("active");
        viewSell.classList.remove("hidden");
        viewBuy.classList.add("hidden");
    });

    renderizarMercado();
    renderizarMisVentas();
};

function renderizarMercado() {
    const grid = document.getElementById("market-buy-grid");
    if(!grid) return;
    grid.innerHTML = "";

    window.mercadoNPC.forEach(geno => {
        const card = document.createElement("div");
        card.className = "market-card-neon";
        
        let svgIcon = '🧬';
        if (typeof generarSvgGeno === 'function') {
            let tempSvg = generarSvgGeno({ body_shape: geno.shape, base_color: geno.color, color: geno.color });
            if (tempSvg) svgIcon = tempSvg.replace(/width="[^"]+"/, 'width="100%"').replace(/height="[^"]+"/, 'height="100%"');
        }

        card.innerHTML = `
            <div style="width: 55px; height: 55px; margin-bottom: 10px; filter: drop-shadow(0px 5px 8px rgba(0,0,0,0.6)); pointer-events: none;">
                ${svgIcon}
            </div>
            <h4 style="margin: 0 0 5px 0; font-size: 13px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none;">${geno.name}</h4>
            <p style="font-size: 11px; color: #cbd5e1; margin: 0 0 10px 0; pointer-events: none;">Nv. ${geno.level} | ${geno.rarity}</p>
            <div style="font-weight: 900; color: #D500F9; margin-bottom: 15px; font-size: 14px; text-shadow: 0 0 8px rgba(213,0,249,0.8);">🔷 ${geno.pricePol} POL</div>
            <button class="market-btn-neon">Comprar</button>
        `;
        
        const btnCompra = card.querySelector("button");
        btnCompra.addEventListener("click", () => {
            const precio = parseFloat(geno.pricePol);
            if (window.miWallet && window.miWallet.pol >= precio) {
                window.miWallet.pol -= precio;
                const polText = document.getElementById("pol-amount");
                if(polText) polText.innerText = `🔷 ${window.miWallet.pol.toFixed(1)} POL`;
                
                delete geno.pricePol;
                if(!window.misGenos) window.misGenos = [];
                window.misGenos.push(geno);
                
                window.mercadoNPC = window.mercadoNPC.filter(g => g.id !== geno.id);
                window.mercadoNPC.push(generarGenoNPC());
                
                alert(`✅ ¡Compra exitosa! Adquiriste a [${geno.name}] por ${precio} POL.`);
                renderizarMercado();
                
                if(window.guardarJuego) window.guardarJuego();
                else if(window.guardarProgreso) window.guardarProgreso();
            } else {
                alert("❌ No tienes suficiente $POL para comprar este Geno.");
            }
        });
        grid.appendChild(card);
    });
}

function renderizarMisVentas() {
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
            if (typeof generarSvgGeno === 'function') {
                let tempSvg = generarSvgGeno({ body_shape: geno.shape, base_color: geno.color, color: geno.color });
                if (tempSvg) svgIcon = tempSvg.replace(/width="[^"]+"/, 'width="100%"').replace(/height="[^"]+"/, 'height="100%"');
            }

            card.innerHTML = `
                <div style="width: 50px; height: 50px; margin-bottom: 10px; filter: drop-shadow(0px 5px 8px rgba(0,0,0,0.6)); pointer-events: none;">
                    ${svgIcon}
                </div>
                <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none;">${geno.name}</h4>
                <input type="number" id="price-${geno.id}" placeholder="POL" style="width: 80%; padding: 8px; margin-bottom: 12px; background: rgba(0,0,0,0.4); border: 1px solid #4A148C; border-radius: 6px; text-align: center; color: #fff; font-weight: bold; outline: none;" step="0.1" min="0.1">
                <button class="market-btn-neon green">Publicar</button>
            `;
            
            card.querySelector("button").addEventListener("click", () => {
                const inputPrecio = document.getElementById(`price-${geno.id}`).value;
                const precio = parseFloat(inputPrecio);
                
                if (isNaN(precio) || precio <= 0) {
                    alert("⚠️ Por favor, introduce un precio válido mayor a 0.");
                    return;
                }

                window.misGenos = window.misGenos.filter(g => g.id !== geno.id);
                geno.pricePol = precio.toFixed(1);
                window.misVentas.push(geno);
                
                alert(`✅ Has publicado a [${geno.name}] en el mercado por ${geno.pricePol} POL.`);
                renderizarMisVentas();
                
                if(window.guardarJuego) window.guardarJuego();
                else if(window.guardarProgreso) window.guardarProgreso();
            });
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
                <span style="font-weight: bold; font-size: 13px;">${geno.name}</span>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: #D500F9; font-weight: 900;">🔷 ${geno.pricePol}</span>
                    <button class="market-btn-neon red" style="padding: 5px 10px; width: auto; font-size: 10px; margin: 0;">Cancelar</button>
                </div>
            `;
            
            item.querySelector("button").addEventListener("click", () => {
                window.misVentas = window.misVentas.filter(g => g.id !== geno.id);
                delete geno.pricePol;
                window.misGenos.push(geno);
                renderizarMisVentas();
                
                if(window.guardarJuego) window.guardarJuego();
                else if(window.guardarProgreso) window.guardarProgreso();
            });
            listContainer.appendChild(item);
        });
    }
}

// SIMULACIÓN DE COMPRADORES (Evitamos múltiples intervalos)
if(!window.simuladorMercadoActivo) {
    window.simuladorMercadoActivo = true;
    setInterval(() => {
        if (window.misVentas && window.misVentas.length > 0) {
            // Un 30% de probabilidad de que un NPC compre algo cada 10 seg
            if (Math.random() < 0.3) {
                const index = Math.floor(Math.random() * window.misVentas.length);
                const genoVendido = window.misVentas[index];
                const ganancia = parseFloat(genoVendido.pricePol);

                window.misVentas.splice(index, 1);
                if (window.miWallet) {
                    window.miWallet.pol += ganancia;
                    const polText = document.getElementById("pol-amount");
                    if(polText) polText.innerText = `🔷 ${window.miWallet.pol.toFixed(1)} POL`;
                }

                alert(`💰 ¡VENTA EXITOSA!\nUn comprador anónimo adquirió tu [${genoVendido.name}].\nHas recibido +${ganancia} POL.`);
                
                // Refrescar UI si el usuario está dentro del mercado
                const grid = document.getElementById("market-sell-grid");
                if(grid) renderizarMisVentas();
                
                if(window.guardarJuego) window.guardarJuego();
                else if(window.guardarProgreso) window.guardarProgreso();
            }
        }
    }, 10000);
}