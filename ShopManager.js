// =========================================
// ShopManager.js - BAZAR, MATRIZ TÁCTICA Y PREMIUM (INCLUYE MODAL DE DETALLES)
// =========================================

window.ShopManager = {
    inicializado: false,
    
    // GALERÍA DE ARTE VECTORIAL (Medallas estilo Medabots - Colores sólidos)
    iconosSVG: {
        // --- 1. ELEMENTOS DE COMBATE (MTs) ---
        "Biomutante": `<svg viewBox="0 0 100 100" width="1em" height="1em"><path d="M15 20 L50 5 L85 20 L85 50 C85 75 65 90 50 95 C35 90 15 75 15 50 Z" fill="#121822" stroke="#69F0AE" stroke-width="6" stroke-linejoin="round"/><path d="M50 25 C65 35 65 50 50 65 C35 50 35 35 50 25 Z" fill="#69F0AE"/><path d="M50 65 L50 82" stroke="#69F0AE" stroke-width="6" stroke-linecap="round"/><path d="M50 52 C65 47 72 52 72 62 C65 65 55 60 50 52 Z" fill="#69F0AE"/><path d="M50 52 C35 47 28 52 28 62 C35 65 45 60 50 52 Z" fill="#69F0AE"/></svg>`,
        "Viral": `<svg viewBox="0 0 100 100" width="1em" height="1em"><polygon points="50,5 95,50 50,95 5,50" fill="#121822" stroke="#E040FB" stroke-width="6" stroke-linejoin="round"/><circle cx="50" cy="50" r="14" fill="#E040FB"/><circle cx="50" cy="50" r="5" fill="#121822"/><path d="M50 22 L50 36 M50 78 L50 64 M22 50 L36 50 M78 50 L64 50" stroke="#E040FB" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="22" r="4" fill="#E040FB"/><circle cx="50" cy="78" r="4" fill="#E040FB"/><circle cx="22" cy="50" r="4" fill="#E040FB"/><circle cx="78" cy="50" r="4" fill="#E040FB"/></svg>`,
        "Cibernético": `<svg viewBox="0 0 100 100" width="1em" height="1em"><polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" fill="#121822" stroke="#00E5FF" stroke-width="6" stroke-linejoin="round"/><rect x="35" y="35" width="30" height="30" fill="none" stroke="#00E5FF" stroke-width="6" rx="4"/><circle cx="50" cy="50" r="6" fill="#00E5FF"/><path d="M50 10 L50 35 M50 90 L50 65 M10 50 L35 50 M90 50 L65 50" stroke="#00E5FF" stroke-width="6"/></svg>`,
        "Radiactivo": `<svg viewBox="0 0 100 100" width="1em" height="1em"><circle cx="50" cy="50" r="42" fill="#121822" stroke="#FFB300" stroke-width="6"/><circle cx="50" cy="50" r="9" fill="#FFB300"/><path d="M50 35 A15 15 0 0 0 35 50 L12 50 A38 38 0 0 1 50 12 Z" fill="#FFB300"/><path d="M50 35 A15 15 0 0 1 65 50 L88 50 A38 38 0 0 0 50 12 Z" fill="#FFB300" transform="rotate(120 50 50)"/><path d="M50 35 A15 15 0 0 1 65 50 L88 50 A38 38 0 0 0 50 12 Z" fill="#FFB300" transform="rotate(240 50 50)"/></svg>`,
        "Tóxico": `<svg viewBox="0 0 100 100" width="1em" height="1em"><polygon points="12,18 88,18 50,90" fill="#121822" stroke="#C6FF00" stroke-width="6" stroke-linejoin="round"/><rect x="35" y="32" width="30" height="25" rx="10" fill="#C6FF00"/><rect x="42" y="47" width="16" height="20" rx="3" fill="#C6FF00"/><circle cx="43" cy="42" r="4" fill="#121822"/><circle cx="57" cy="42" r="4" fill="#121822"/><path d="M46 59 L46 67 M50 59 L50 67 M54 59 L54 67" stroke="#121822" stroke-width="2"/></svg>`,
        "Sintético": `<svg viewBox="0 0 100 100" width="1em" height="1em"><path d="M50 5 L90 28 L90 72 L50 95 L10 72 L10 28 Z" fill="#121822" stroke="#B388FF" stroke-width="6" stroke-linejoin="round"/><path d="M50 18 L75 32 L75 68 L50 82 L25 68 L25 32 Z" fill="#B388FF"/><path d="M50 18 L50 50 L25 32 M50 50 L75 68 M50 50 L50 82" stroke="#121822" stroke-width="5"/><circle cx="50" cy="50" r="10" fill="#EA80FC"/><circle cx="50" cy="50" r="4" fill="#121822"/></svg>`,
        
        // --- 2. HERRAMIENTAS Y BAZAR ---
        "escaner_basico": `<svg viewBox="0 0 100 100" width="1em" height="1em"><path d="M45 20 A25 25 0 1 1 20 45 A25 25 0 0 1 45 20" fill="none" stroke="#00E5FF" stroke-width="8"/><path d="M62 62 L90 90" stroke="#00E5FF" stroke-width="12" stroke-linecap="round"/><circle cx="45" cy="45" r="12" fill="#00B0FF" opacity="0.5"/><path d="M25 45 L65 45 M45 25 L45 65" stroke="#00E5FF" stroke-width="4" opacity="0.8"/></svg>`,
        "escaner_completo": `<svg viewBox="0 0 100 100" width="1em" height="1em"><path d="M25 20 Q50 50 75 80 M75 20 Q50 50 25 80" fill="none" stroke="#D500F9" stroke-width="8"/><line x1="33" y1="50" x2="67" y2="50" stroke="#D500F9" stroke-width="5"/><line x1="42" y1="30" x2="58" y2="70" stroke="#D500F9" stroke-width="5"/><line x1="58" y1="30" x2="42" y2="70" stroke="#D500F9" stroke-width="5"/><circle cx="25" cy="20" r="7" fill="#AA00FF"/><circle cx="75" cy="80" r="7" fill="#AA00FF"/><circle cx="75" cy="20" r="7" fill="#AA00FF"/><circle cx="25" cy="80" r="7" fill="#AA00FF"/></svg>`,
        "antidoto_uni": `<svg viewBox="0 0 100 100" width="1em" height="1em"><path d="M40 10 L60 10 L60 30 L85 80 A10 10 0 0 1 75 95 L25 95 A10 10 0 0 1 15 80 L40 30 Z" fill="none" stroke="#C6FF00" stroke-width="6"/><path d="M25 75 L75 75 L65 50 L35 50 Z" fill="#C6FF00"/><circle cx="45" cy="65" r="5" fill="#fff" opacity="0.9"/><circle cx="58" cy="58" r="3" fill="#fff" opacity="0.7"/></svg>`,
        
        // --- 3. EXPANSIÓN PREMIUM ---
        "exp_20": `<svg viewBox="0 0 100 100" width="1em" height="1em"><rect x="20" y="30" width="60" height="60" rx="10" fill="#8A2BE2"/><path d="M35 30 L35 15 A15 15 0 0 1 65 15 L65 30" fill="none" stroke="#8A2BE2" stroke-width="8"/><rect x="28" y="50" width="44" height="25" rx="5" fill="#5E35B1"/><circle cx="50" cy="62" r="5" fill="#D1C4E9"/><path d="M20 40 L80 40" stroke="#5E35B1" stroke-width="4"/></svg>`,
        "exp_30": `<svg viewBox="0 0 100 100" width="1em" height="1em"><rect x="15" y="25" width="70" height="65" rx="12" fill="#D500F9"/><path d="M30 25 L30 10 A20 20 0 0 1 70 10 L70 25" fill="none" stroke="#D500F9" stroke-width="10"/><rect x="22" y="45" width="56" height="30" rx="8" fill="#AA00FF"/><circle cx="38" cy="60" r="6" fill="#EA80FC"/><circle cx="62" cy="60" r="6" fill="#EA80FC"/><path d="M15 35 L85 35" stroke="#AA00FF" stroke-width="5"/></svg>`,
        "exp_40": `<svg viewBox="0 0 100 100" width="1em" height="1em"><rect x="10" y="20" width="80" height="70" rx="6" fill="#FFD700"/><rect x="18" y="28" width="64" height="54" rx="4" fill="#F57F17"/><circle cx="50" cy="55" r="16" fill="#FFF59D"/><circle cx="50" cy="55" r="6" fill="#F57F17"/><line x1="50" y1="39" x2="50" y2="45" stroke="#F57F17" stroke-width="4"/><line x1="30" y1="20" x2="30" y2="28" stroke="#F57F17" stroke-width="4"/><line x1="70" y1="20" x2="70" y2="28" stroke="#F57F17" stroke-width="4"/></svg>`
    },

    init: function() {
        if (!this.inicializado) {
            this.inyectarEstructura();
            this.inicializado = true;
        }
        this.renderBazar();
        this.cambiarPestana('bazar');
    },

    inyectarEstructura: function() {
        const contenedor = document.getElementById("shop-screen");
        if (!contenedor) return;

        // INYECCIÓN DE CSS: FONDOS IGUALADOS AL RESTO DE LA INTERFAZ (#1A2A36)
        const style = document.createElement('style');
        style.innerHTML = `
            .tienda-scroll-area::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
            .tienda-scroll-area { -ms-overflow-style: none !important; scrollbar-width: none !important; }
            
            /* Pestañas Neón */
            .shop-tab-neon {
                flex: 1; padding: 12px 5px; font-weight: 900; cursor: pointer; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
                background: rgba(26, 42, 54, 0.6); border: 1px solid #384a5e; color: #a0aec0; transition: all 0.3s ease;
                border-bottom: 2px solid #222; margin: 0 2px; border-radius: 8px 8px 0 0;
            }
            .shop-tab-neon:hover { background: rgba(42, 59, 76, 0.9); color: #fff; }
            .shop-tab-neon.active {
                color: #fff; background: rgba(34, 54, 73, 0.9);
                border: 1px solid var(--tab-color); border-bottom: 2px solid transparent;
                box-shadow: inset 0 15px 20px -15px var(--tab-color), 0 -5px 15px -10px var(--tab-color);
            }

            /* Tarjetas Neón */
            .shop-card-neon {
                background: linear-gradient(180deg, #2A3B4C 0%, #1A2A36 100%);
                border: 1px solid #384a5e; border-radius: 12px; padding: 18px 12px;
                transition: all 0.3s ease; position: relative; overflow: hidden;
                display: flex; flex-direction: column; align-items: center; text-align: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05);
                cursor: pointer; /* Indicar que toda la tarjeta es clickeable */
            }
            .shop-card-neon::before {
                content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px;
                background: var(--card-color); transition: 0.3s;
            }
            .shop-card-neon:hover {
                transform: translateY(-4px); border-color: var(--card-color);
                box-shadow: 0 10px 25px rgba(0,0,0,0.4), 0 0 15px var(--card-color-glow);
                background: linear-gradient(180deg, #32465A 0%, #203342 100%);
            }
            .shop-card-neon:hover::before { height: 6px; box-shadow: 0 0 15px var(--card-color); }
            
            /* Botones Neón */
            .shop-btn-neon {
                width: 100%; padding: 10px; border: none; border-radius: 8px; margin-top: auto;
                font-weight: 900; color: #fff; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; font-size: 13px;
                background: linear-gradient(90deg, var(--card-color-dark), var(--card-color));
                box-shadow: 0 4px 10px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.2);
                transition: filter 0.2s, transform 0.1s;
                text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            }
            .shop-btn-neon:hover { filter: brightness(1.2) contrast(1.1); }
            .shop-btn-neon:active { transform: scale(0.97); }
        `;
        document.head.appendChild(style);

        contenedor.innerHTML = `
            <div class="tienda-scroll-area" style="width: 100%; height: 100%; overflow-y: auto; padding-bottom: 20px; padding-top: 15px;">
                
                <h2 class="screen-title" style="color: #00d2ff; text-align: center; text-shadow: 0 0 15px rgba(0,210,255,0.4); margin-bottom: 20px; font-weight: 900; letter-spacing: 2px;">TERMINAL COMERCIAL</h2>
                
                <div style="display: flex; justify-content: center; margin-bottom: 20px; padding: 0 10px; border-bottom: 1px solid #384a5e;">
                    <button id="tab-shop-bazar" class="shop-tab-neon" style="--tab-color: #69F0AE;">Suministros</button>
                    <button id="tab-shop-dojo" class="shop-tab-neon" style="--tab-color: #00E5FF;">Matriz Táctica</button>
                    <button id="tab-shop-premium" class="shop-tab-neon" style="--tab-color: #E040FB;">Premium</button>
                </div>
                
                <div id="shop-bazar-view" class="shop-view">
                    <p style="text-align: center; color: #cbd5e1; font-size: 11px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Consumibles y herramientas de supervivencia</p>
                    <div id="shop-bazar-grid" class="sanctuary-grid"></div>
                </div>
                
                <div id="shop-dojo-view" class="shop-view hidden">
                    <p style="text-align: center; color: #cbd5e1; font-size: 11px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Módulos de Técnica. Límite: 1 en mochila.</p>
                    <div id="shop-dojo-grid" class="sanctuary-grid"></div>
                </div>
                
                <div id="shop-premium-view" class="shop-view hidden">
                    <p style="text-align: center; color: #cbd5e1; font-size: 11px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Mejoras de infraestructura permanentes</p>
                    <div id="shop-premium-grid" class="sanctuary-grid"></div>
                </div>
                
                <!-- ESPACIADOR FANTASMA -->
                <div style="height: 130px; width: 100%; flex-shrink: 0; display: block;"></div>
                
            </div>
            
            <div class="fab-btn btn-go-home" onclick="navegarA('room-area')" style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); width: 70%; max-width: 300px; z-index: 100;">
                <div class="fab-content" style="font-size: 13px; cursor: pointer; padding: 12px 0; text-align: center;">VOLVER AL LABORATORIO</div>
            </div>

            <!-- MODAL DE DETALLES DEL ÍTEM (OCULTO POR DEFECTO) -->
            <div id="shop-detail-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 20, 30, 0.90); z-index: 9999; display: none; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
                <div id="shop-detail-content" style="background: linear-gradient(180deg, #1A2A36 0%, #0F172A 100%); border: 2px solid #00d2ff; border-radius: 16px; padding: 30px 20px; width: 85%; max-width: 350px; position: relative; text-align: center;">
                    <button id="close-shop-detail" style="position: absolute; top: 10px; right: 15px; background: transparent; border: none; color: #aaa; font-size: 24px; font-weight: bold; cursor: pointer;">&times;</button>
                    <div id="shop-detail-icon" style="font-size: 5rem; margin-bottom: 15px; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.5));"></div>
                    <h3 id="shop-detail-name" style="color: #fff; margin: 0 0 10px 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;"></h3>
                    <div id="shop-detail-tags" style="display: flex; justify-content: center; gap: 6px; margin-bottom: 15px; flex-wrap: wrap;"></div>
                    <p id="shop-detail-desc" style="color: #cbd5e1; font-size: 13px; line-height: 1.5; margin-bottom: 20px; padding: 12px; background: rgba(0,0,0,0.4); border-radius: 8px;"></p>
                    <div id="shop-detail-price" style="font-size: 18px; font-weight: 900; letter-spacing: 1px;"></div>
                </div>
            </div>
        `;

        document.getElementById("tab-shop-bazar").addEventListener("click", () => this.cambiarPestana('bazar'));
        document.getElementById("tab-shop-dojo").addEventListener("click", () => this.cambiarPestana('dojo'));
        document.getElementById("tab-shop-premium").addEventListener("click", () => this.cambiarPestana('premium'));
    },

    cambiarPestana: function(pestana) {
        ['bazar', 'dojo', 'premium'].forEach(tab => {
            const btn = document.getElementById(`tab-shop-${tab}`);
            const view = document.getElementById(`shop-${tab}-view`);
            
            if (tab === pestana) {
                btn.classList.add('active');
                view.classList.remove("hidden");
                
                if(tab === 'bazar') this.renderBazar();
                if(tab === 'dojo') this.renderDojo();
                if(tab === 'premium') this.renderPremium();
            } else {
                btn.classList.remove('active');
                view.classList.add("hidden");
            }
        });
    },

    crearTarjeta: function(item, colorLuz, colorOscuro, tipoMoneda) {
        const div = document.createElement("div");
        div.className = "shop-card-neon";
        
        div.style.cssText = `--card-color: ${colorLuz}; --card-color-dark: ${colorOscuro}; --card-color-glow: ${colorLuz}60;`;
        
        let precioTag = tipoMoneda === "EV" 
            ? `<div style="font-weight: 900; color: ${colorLuz}; margin: 10px 0 15px 0; font-size: 15px; text-shadow: 0 0 8px ${colorLuz}80;">✨ ${item.price.toFixed(2)} EV</div>` 
            : `<div style="font-weight: 900; color: ${colorLuz}; margin: 10px 0 15px 0; font-size: 15px; text-shadow: 0 0 8px ${colorLuz}80;">🔷 ${item.price.toFixed(2)} POL</div>`;

        div.innerHTML = `
            <div style="font-size: 3.5rem; margin-bottom: 10px; filter: drop-shadow(0px 8px 10px rgba(0,0,0,0.8)); pointer-events: none;">${item.icon}</div>
            <h4 style="margin: 5px 0 8px 0; font-size: 14px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none;">${item.name}</h4>
            <p style="font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.4; height: 35px; overflow: hidden; pointer-events: none;">${item.desc}</p>
            ${precioTag}
            <button class="shop-btn-neon">Comprar</button>
        `;

        // ✨ AL HACER CLIC EN EL BOTÓN COMPRAR (Evita que se abra el modal)
        div.querySelector("button").addEventListener("click", (e) => {
            e.stopPropagation(); // Detiene el clic para que no active el evento de la tarjeta
            this.procesarCompra(item);
        });

        // ✨ AL HACER CLIC EN LA TARJETA (Abre el Modal de Detalles)
        div.addEventListener("click", () => {
            this.abrirDetalle(item, colorLuz);
        });

        return div;
    },

    // ✨ NUEVA FUNCIÓN: ABRIR MODAL DE DETALLES
    abrirDetalle: function(item, colorLuz) {
        const modal = document.getElementById("shop-detail-modal");
        const content = document.getElementById("shop-detail-content");
        const iconContainer = document.getElementById("shop-detail-icon");
        const nameEl = document.getElementById("shop-detail-name");
        const tagsContainer = document.getElementById("shop-detail-tags");
        const descEl = document.getElementById("shop-detail-desc");
        const priceEl = document.getElementById("shop-detail-price");

        if(!modal) return;

        // Estilizar colores basados en el ítem
        content.style.borderColor = colorLuz;
        content.style.boxShadow = `0 10px 30px rgba(0,0,0,0.8), inset 0 0 20px ${colorLuz}40`;
        nameEl.style.textShadow = `0 2px 5px ${colorLuz}80`;

        iconContainer.innerHTML = item.icon;
        nameEl.innerText = item.name;
        descEl.innerText = item.desc;

        // Crear Etiquetas (Tags) de información
        let tagsHTML = "";
        const createTag = (text, color) => `<span style="background: ${color}20; color: ${color}; border: 1px solid ${color}; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${text}</span>`;

        if (item.type === "MT") {
            tagsHTML += createTag("Módulo MT", "#a0aec0");
            tagsHTML += createTag(item.element, colorLuz);
            tagsHTML += createTag(item.subType, "#fff"); // Especial, Soporte, Definitivo
            if(item.power > 0) tagsHTML += createTag(`Potencia: ${item.power}`, "#ff6b6b");
        } else if (item.type === "expansion") {
            tagsHTML += createTag("Infraestructura", colorLuz);
            tagsHTML += createTag(`Espacio: +${item.value}`, "#fff");
        } else {
            tagsHTML += createTag(item.type === "consumable" ? "Consumible" : "Herramienta", colorLuz);
        }
        tagsContainer.innerHTML = tagsHTML;

        // Precio en el modal
        priceEl.innerHTML = item.currency === "EV" 
            ? `<span style="color: ${colorLuz}; text-shadow: 0 0 8px ${colorLuz}80;">✨ ${item.price.toFixed(2)} EV</span>` 
            : `<span style="color: ${colorLuz}; text-shadow: 0 0 8px ${colorLuz}80;">🔷 ${item.price.toFixed(2)} POL</span>`;

        // Mostrar Modal
        modal.style.display = "flex";

        // Lógica para cerrar
        const btnClose = document.getElementById("close-shop-detail");
        const closeModal = (e) => {
            if(e.target === modal || e.target === btnClose) {
                modal.style.display = "none";
                modal.removeEventListener("click", closeModal);
                btnClose.removeEventListener("click", closeModal);
            }
        };
        modal.addEventListener("click", closeModal);
        btnClose.addEventListener("click", closeModal);
    },

    procesarCompra: function(item) {
        if (item.currency === "EV") {
            if (window.miInventario.vitalEssence < item.price) {
                alert(`❌ No tienes suficiente Esencia Vital. Necesitas ${item.price.toFixed(2)} ✨`);
                return;
            }
            
            let itemParaInventario = { id: item.id, name: item.name, icon: item.icon, type: item.type, desc: item.desc, maxStack: window.miInventario.stackLimits[item.type] };
            
            if(item.type === "MT") {
                itemParaInventario.subType = item.subType;
                itemParaInventario.element = item.element;
                itemParaInventario.id_ataque = item.id_ataque;
                itemParaInventario.power = item.power;
            }

            let agregadoExitosamente = window.miInventario.addItem(itemParaInventario);
            
            if (agregadoExitosamente) {
                window.miInventario.vitalEssence -= item.price;
                window.miInventario.updateUI();
                alert(`✅ Has comprado: ${item.name}`);
                if(window.guardarJuego) window.guardarJuego();
            }

        } else if (item.currency === "POL") {
            if (!window.miWallet) window.miWallet = { pol: 0 };
            if (window.miWallet.pol < item.price) {
                alert(`❌ No tienes suficiente $POL. Necesitas ${item.price.toFixed(2)} 🔷`);
                return;
            }

            if (item.type === "expansion") {
                if (window.miInventario.maxSlots >= item.value) {
                    alert("⚠️ Ya tienes una mochila de este tamaño o superior.");
                    return;
                }
                
                window.miWallet.pol -= item.price;
                window.miInventario.maxSlots = item.value;
                document.getElementById("pol-amount").innerText = `🔷 ${window.miWallet.pol.toFixed(1)} POL`;
                window.miInventario.updateUI();
                
                alert(`🎒 ¡Mochila expandida permanentemente a ${item.value} ranuras!`);
                this.renderPremium(); 
                if(window.guardarJuego) window.guardarJuego();
            }
        }
    },

    renderBazar: function() {
        const grid = document.getElementById("shop-bazar-grid");
        grid.innerHTML = "";
        
        const items = [
            { id: "escaner_basico", name: "Escáner Básico", icon: this.iconosSVG["escaner_basico"], type: "basic", price: 0.15, currency: "EV", desc: "Revela slots activos del Geno." },
            { id: "escaner_completo", name: "Escáner Completo", icon: this.iconosSVG["escaner_completo"], type: "basic", price: 0.50, currency: "EV", desc: "Revela la genética exacta S-D." },
            { id: "antidoto_uni", name: "Antídoto Universal", icon: this.iconosSVG["antidoto_uni"], type: "consumable", price: 0.10, currency: "EV", desc: "Limpia cualquier estado alterado." }
        ];

        items.forEach(item => grid.appendChild(this.crearTarjeta(item, "#69F0AE", "#2E7D32", "EV")));
    },

    renderDojo: function() {
        const grid = document.getElementById("shop-dojo-grid");
        grid.innerHTML = "";

        if(!window.AttackCatalog) return;

        let dojoItems = [];
        for (const [elemento, ramas] of Object.entries(window.AttackCatalog.ataquesPorElemento)) {
            const icono = this.iconosSVG[elemento] || "💿";
            
            const agregarRama = (rama, subType, price) => {
                if(rama) {
                    rama.forEach(atk => {
                        dojoItems.push({ 
                            id: "mt_" + atk.id, name: "MT " + atk.nombre, icon: icono, type: "MT", subType: subType, element: elemento, 
                            id_ataque: atk.id, power: atk.potencia || 0, price: price, currency: "EV", desc: atk.descripcion 
                        });
                    });
                }
            };

            agregarRama(ramas.especiales, "Especial", 2.50);
            agregarRama(ramas.soportes, "Soporte", 2.00);
            agregarRama(ramas.definitivos, "Definitivo", 5.00);
        }

        const coloresMT = {
            "Biomutante": ["#69F0AE", "#2E7D32"],
            "Viral": ["#E040FB", "#7B1FA2"],
            "Cibernético": ["#00E5FF", "#00838F"],
            "Radiactivo": ["#FFB300", "#E65100"],
            "Tóxico": ["#C6FF00", "#558B2F"],
            "Sintético": ["#B388FF", "#512DA8"]
        };

        dojoItems.forEach(item => {
            const [colorLuz, colorOscuro] = coloresMT[item.element] || ["#00d2ff", "#005c8a"];
            grid.appendChild(this.crearTarjeta(item, colorLuz, colorOscuro, "EV"));
        });
    },

    renderPremium: function() {
        const grid = document.getElementById("shop-premium-grid");
        grid.innerHTML = "";

        const items = [
            { id: "exp_20", name: "Bolsillos Nv. 2", icon: this.iconosSVG["exp_20"], type: "expansion", value: 20, price: 2.00, currency: "POL", desc: "Expande el inventario a 20 ranuras." },
            { id: "exp_30", name: "Bolsillos Nv. 3", icon: this.iconosSVG["exp_30"], type: "expansion", value: 30, price: 5.00, currency: "POL", desc: "Expande el inventario a 30 ranuras." },
            { id: "exp_40", name: "Caja Fuerte Nv. 4", icon: this.iconosSVG["exp_40"], type: "expansion", value: 40, price: 10.00, currency: "POL", desc: "Expande el inventario a 40 ranuras." }
        ];

        items.forEach(item => {
            let tarjeta = this.crearTarjeta(item, "#E040FB", "#7B1FA2", "POL");
            if (window.miInventario && window.miInventario.maxSlots >= item.value) {
                let btn = tarjeta.querySelector("button");
                btn.innerText = "Adquirido";
                btn.style.background = "#384a5e";
                btn.style.boxShadow = "none";
                btn.style.color = "#888";
                btn.style.cursor = "not-allowed";
                tarjeta.style.opacity = "0.6";
            }
            grid.appendChild(tarjeta);
        });
    }
};