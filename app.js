// =========================================
// app.js - CONTROLADOR PRINCIPAL Y NAVEGACIÓN (V14.17 - FIX DEFINITIVO ANIMACIÓN Y TAMAÑO NATIVO)
// Requiere cargar 'genes.js' previamente en el HTML.
// =========================================

window.misGenos = window.misGenos || []; 
window.maxGenoSlots = window.maxGenoSlots || 6; 

// =========================================
// HELPER: ICONOS DE ELEMENTOS GLOBALES
// =========================================
window.getIconoElemento = function(elementoStr) {
    if (!elementoStr) return "";
    
    // Limpiamos el string por si viene con emojis antiguos de versiones previas
    const nombreLimpio = elementoStr.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').trim();
    let svg = window.ShopManager && window.ShopManager.iconosSVG ? window.ShopManager.iconosSVG[nombreLimpio] : null;
    
    if (svg) {
        return svg.replace('<svg ', '<svg style="vertical-align: text-bottom; margin-right: 6px; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.6));" ');
    }
    
    return ""; 
};

// =========================================
// ✨ TABLA DE IVs V14.0 
// =========================================
window.TABLA_IVS = {
    "Común": { hp: [70, 110], atk: [10, 22], def: [5, 15], spd: [8, 25], luk: [5, 15] },
    "Raro": { hp: [100, 150], atk: [18, 35], def: [10, 22], spd: [15, 40], luk: [10, 25] },
    "Épico": { hp: [140, 200], atk: [28, 50], def: [18, 35], spd: [25, 55], luk: [20, 35] },
    "Legendario": { hp: [190, 260], atk: [40, 70], def: [25, 50], spd: [35, 80], luk: [30, 50] },
    "Mítico": { hp: [240, 320], atk: [60, 100], def: [40, 70], spd: [50, 110], luk: [45, 70] }
};

// ✨ FIX GACHA: CURVA DE CAMPANA
window.generarStatsPorRareza = function(rareza) {
    const limites = window.TABLA_IVS[rareza] || window.TABLA_IVS["Común"];
    
    // El promedio de 3 Math.random() crea una Campana de Gauss
    const bellCurveRandom = () => (Math.random() + Math.random() + Math.random()) / 3;
    
    const randStat = (min, max) => Math.floor(bellCurveRandom() * (max - min + 1)) + min;
    
    return {
        hp: randStat(limites.hp[0], limites.hp[1]),
        atk: randStat(limites.atk[0], limites.atk[1]),
        def: randStat(limites.def[0], limites.def[1]),
        spd: randStat(limites.spd[0], limites.spd[1]),
        luk: randStat(limites.luk[0], limites.luk[1])
    };
};

// ✨ PARCHE GLOBAL: ACTUALIZACIÓN DE LA CALCULADORA DE CALIDAD
window.calcularCalidad = function(stats, rareza, nivel) {
    const limites = window.TABLA_IVS[rareza || "Común"] || window.TABLA_IVS["Común"];
    
    const totalMin = limites.hp[0] + limites.atk[0] + limites.def[0] + limites.spd[0] + limites.luk[0];
    const totalMax = limites.hp[1] + limites.atk[1] + limites.def[1] + limites.spd[1] + limites.luk[1];
    
    const statsUsar = stats.baseStats ? stats.baseStats : stats;
    const currentTotal = (statsUsar.hp || 0) + (statsUsar.atk || 0) + (statsUsar.def || 0) + (statsUsar.spd || 0) + (statsUsar.luk || 0);
    
    let porcentaje = ((currentTotal - totalMin) / (totalMax - totalMin)) * 100;
    
    if (porcentaje > 100) porcentaje = 100;
    if (porcentaje < 0) porcentaje = 0;
    
    let rango = "D";
    if (porcentaje >= 90) rango = "S";
    else if (porcentaje >= 75) rango = "A";
    else if (porcentaje >= 50) rango = "B";
    else if (porcentaje >= 25) rango = "C";
    
    return {
        rango: rango,
        calidadPorcentaje: Math.floor(porcentaje)
    };
};

// =========================================
// GENERADOR MAESTRO V9.1
// =========================================
window.generarGenesV9 = function(rareza) {
    const slots = { A: null, B: null, C: null };
    
    let probA = 0.05, probB = 0.22, probC = 0.06;
    if (rareza === "Raro") { probA = 0.08; probB = 0.35; probC = 0.12; }
    if (rareza === "Épico") { probA = 0.12; probB = 0.52; probC = 0.22; }
    if (rareza === "Legendario") { probA = 0.17; probB = 0.68; probC = 0.35; }
    if (rareza === "Mítico") { probA = 0.24; probB = 0.82; probC = 0.52; }

    const randomFromCat = (catArray) => {
        if (!catArray || catArray.length === 0) return null;
        return catArray[Math.floor(Math.random() * catArray.length)];
    };
    const catsFuncionales = ["combate", "elemental", "crianza", "progresion", "reactor_santuario", "social"];

    if (Math.random() <= probA) {
        const suerte = Math.random();
        let idElegido = "";

        if (suerte <= 0.55) {
            const raros = ["brillo_bioluminiscente", "rastro_elemental", "eco_visual"];
            idElegido = raros[Math.floor(Math.random() * raros.length)];
        } else if (suerte <= 0.85) {
            const epicos = ["cromatico_latente", "forma_invertida", "sombra_genetica", "metamorfosis_estacional"];
            idElegido = epicos[Math.floor(Math.random() * epicos.length)];
        } else if (suerte <= 0.98) {
            const legendarios = ["aura_linaje", "emblema_fundador"];
            idElegido = legendarios[Math.floor(Math.random() * legendarios.length)];
        } else {
            idElegido = "patron_holografico";
        }

        if (window.BASE_DATOS_GENES_V9 && window.BASE_DATOS_GENES_V9.cosmetico) {
            slots.A = window.BASE_DATOS_GENES_V9.cosmetico.find(g => g.id === idElegido);
        }
    }

    let catB = null;
    if (Math.random() <= probB && window.BASE_DATOS_GENES_V9) {
        catB = catsFuncionales[Math.floor(Math.random() * catsFuncionales.length)];
        slots.B = randomFromCat(window.BASE_DATOS_GENES_V9[catB]);
    }

    if (Math.random() <= probC && window.BASE_DATOS_GENES_V9) {
        const catsDisponiblesC = catsFuncionales.filter(c => c !== catB);
        const catC = catsDisponiblesC[Math.floor(Math.random() * catsDisponiblesC.length)];
        slots.C = randomFromCat(window.BASE_DATOS_GENES_V9[catC]);
    }

    return slots;
};

window.tieneGenActivoV9 = function(geno, idGen) {
    if (!geno || !geno.scanned || !geno.hidden_genes) return false;
    const { A, B, C } = geno.hidden_genes;
    return (A && A.id === idGen) || (B && B.id === idGen) || (C && C.id === idGen);
};

window.getMaxCrias = function(geno) { return window.tieneGenActivoV9(geno, "fertilidad_pura") ? 9 : 7; };
window.getMultiplicadorXP = function(geno) { return window.tieneGenActivoV9(geno, "aprendiz_acelerado") ? 1.25 : 1.0; };
window.getMultiplicadorEsencia = function(geno) { return window.tieneGenActivoV9(geno, "esencia_concentrada") ? 2.0 : 1.0; };

window.migrarHPGenosExistentes = function() {
    let huboCambios = false;

    const repararMatematicaGeno = (geno) => {
        if (!geno || !geno.stats || typeof geno.stats.hp !== 'number') return;
        
        let modificado = false;
        let baseVieja = geno.stats.hp;
        let totalViejo = geno.maxHp || baseVieja;
        let extraViejo = totalViejo - baseVieja;
        
        if (extraViejo < 0) extraViejo = 0;

        let baseNueva = baseVieja;
        let extraNuevo = extraViejo;

        let limitesNuevos = window.TABLA_IVS[geno.rarity || "Común"];
        if (limitesNuevos && baseVieja < limitesNuevos.hp[0]) {
            baseNueva = baseVieja * 2;
            modificado = true;
        }

        if (extraViejo > 0 && !geno.puntos_extra_reparados) {
            extraNuevo = Math.round(extraViejo / 2);
            geno.puntos_extra_reparados = true;
            modificado = true;
        }

        if (modificado) {
            geno.stats.hp = baseNueva;
            geno.maxHp = baseNueva + extraNuevo;
            geno.hp = geno.maxHp; 
            huboCambios = true;
        }
    };

    if (window.misGenos && window.misGenos.length > 0) {
        window.misGenos.forEach(g => repararMatematicaGeno(g));
    }

    if (window.miMascota) {
        repararMatematicaGeno(window.miMascota);
    }

    if (huboCambios) {
        if (typeof window.guardarProgreso === 'function') window.guardarProgreso();
        setTimeout(() => {
            if (typeof window.actualizarPanelRPG === 'function') window.actualizarPanelRPG();
        }, 100);
    }
};

// =========================================
// EVENTOS DE INTERFAZ DOM Y UI
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    
    setTimeout(() => {
        if (window.misGenos && window.misGenos.length > 0) {
            let patched = false;
            window.misGenos.forEach(g => {
                if (g.stats && g.stats.def === undefined) {
                    const limites = window.TABLA_IVS[g.rarity] || window.TABLA_IVS["Común"];
                    g.stats.def = Math.floor(Math.random() * (limites.def[1] - limites.def[0] + 1)) + limites.def[0];
                    patched = true;
                }
            });
            if (window.miMascota && window.miMascota.stats && window.miMascota.stats.def === undefined) {
                const limites = window.TABLA_IVS[window.miMascota.rarity] || window.TABLA_IVS["Común"];
                window.miMascota.stats.def = Math.floor(Math.random() * (limites.def[1] - limites.def[0] + 1)) + limites.def[0];
                patched = true;
            }
            if (patched && typeof window.guardarProgreso === 'function') window.guardarProgreso();
        }
        
        window.migrarHPGenosExistentes();
        
    }, 500);

    setTimeout(() => {
        const noHayPartida = !localStorage.getItem("proyecto_genos_save_v1");
        if (noHayPartida) {
            const pedestal = document.getElementById("geno-container");
            if (pedestal) pedestal.innerHTML = "";
            iniciarSecuenciaBienvenida();
        }
    }, 100);

    const fabMenu = document.getElementById("fab-menu");
    const drawerMenu = document.getElementById("drawer-menu");
    const closeDrawer = document.getElementById("close-drawer");

    if(fabMenu) fabMenu.addEventListener("click", () => drawerMenu.classList.remove("hidden"));
    if(closeDrawer) closeDrawer.addEventListener("click", () => drawerMenu.classList.add("hidden"));

    window.navegarA = function(idPantalla) {
        document.querySelectorAll('.app-screen').forEach(s => s.classList.add("hidden"));
        
        const destino = document.getElementById(idPantalla);
        if(destino) destino.classList.remove("hidden");
        
        if(drawerMenu) drawerMenu.classList.add("hidden"); 
        
        const panelStats = document.getElementById("geno-stats-panel");
        if(panelStats) panelStats.classList.add("hidden");
        
        const screenRoom = document.getElementById("room-area");
        if(fabMenu) fabMenu.classList.toggle("hidden", destino !== screenRoom); 
    };

    document.querySelectorAll(".btn-go-home").forEach(btn => {
        btn.addEventListener("click", () => window.navegarA("room-area"));
    });

    const botonesNexo = {
        'btn-sanctuary': 'sanctuary-screen',
        'btn-alchemy': 'alchemy-screen',
        'btn-breeding': 'breeding-screen',
        'btn-arcade': 'arcade-menu',
        'btn-coliseum': 'coliseum-lobby-screen',
        'btn-market': 'market-screen'
    };

    for (const [btnId, pantallaId] of Object.entries(botonesNexo)) {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.onclick = () => {
                window.navegarA(pantallaId);
                if(btnId === 'btn-sanctuary' && window.renderizarSantuario) window.renderizarSantuario();
                if(btnId === 'btn-alchemy' && window.renderizarAlquimia) window.renderizarAlquimia();
                if(btnId === 'btn-breeding' && window.iniciarSelectorCrianza) window.iniciarSelectorCrianza();
                if(btnId === 'btn-market' && window.iniciarMercado) window.iniciarMercado();
                if(btnId === 'btn-coliseum' && window.iniciarLobbyColiseo) window.iniciarLobbyColiseo();
            };
        }
    }

    const btnFeed = document.getElementById("btn-feed");
    if(btnFeed) {
        btnFeed.addEventListener("click", () => {
            if (window.miInventario && window.miInventario.consumeItem("apple_01", 1)) {
                drawerMenu.classList.add("hidden");
                const contenedor = document.getElementById("geno-container");
                if(contenedor) {
                    contenedor.classList.add("happy-jump");
                    setTimeout(() => contenedor.classList.remove("happy-jump"), 500);
                }
                const multiplicador = typeof window.getMultiplicadorXP === 'function' ? window.getMultiplicadorXP(window.miMascota) : 1.0;
                if(window.ganarXP) window.ganarXP(Math.floor(25 * multiplicador));
            } else {
                alert("No tienes manzanas en tu mochila.");
            }
        });
    }

    const contenedorGenoMain = document.getElementById("geno-container");
    if (contenedorGenoMain) {
        contenedorGenoMain.addEventListener("click", (e) => {
            if (!window.miMascota || window.miMascota.id === "temp") return;
            if (window.Sonidos) window.Sonidos.play("click");
            contenedorGenoMain.classList.remove("geno-idle");
            contenedorGenoMain.classList.add("happy-jump");
            setTimeout(() => {
                contenedorGenoMain.classList.remove("happy-jump");
                contenedorGenoMain.classList.add("geno-idle");
            }, 300);

            // Cuidado Diario
            const hoy = new Date().toDateString();
            if (window.miMascota.ultimoCuidadoDiario !== hoy) {
                window.miMascota.ultimoCuidadoDiario = hoy;
                if (window.misGenos) {
                    const idx = window.misGenos.findIndex(g => String(g.id) === String(window.miMascota.id));
                    if (idx !== -1) {
                        window.misGenos[idx].ultimoCuidadoDiario = hoy;
                    }
                }
                if (window.ganarXP) {
                    window.ganarXP(10);
                }
                alert(`¡Has acariciado a ${window.miMascota.name || 'tu Geno'}! Cuidado diario activado: +10 XP y +20% de velocidad de recuperación de resistencia para hoy.`);
                if (window.NexoEnergyManager) {
                    window.NexoEnergyManager.actualizarUI();
                }
                if (window.guardarProgreso) window.guardarProgreso();
            }

            const heart = document.createElement("div");
            heart.className = "heart-particle";
            heart.innerText = "❤️";
            const rect = contenedorGenoMain.getBoundingClientRect();
            heart.style.left = `${e.clientX - rect.left}px`;
            heart.style.top = `${e.clientY - rect.top}px`;
            contenedorGenoMain.appendChild(heart);
            setTimeout(() => heart.remove(), 1000);
        });
    }

    // === GESTIÓN DEL BOTÓN DE MÚSICA (TEXTO ON UNIFICADO) ===
    const btnMusic = document.getElementById("btn-toggle-music");
    const musicIcon = document.getElementById("music-icon");
    const musicText = document.getElementById("music-text");

    if(btnMusic) {
        btnMusic.addEventListener("click", () => {
            if(window.Sonidos) {
                const estaSonando = window.Sonidos.toggleMusica();
                
                if(estaSonando) {
                    // === ESTADO: MÚSICA ACTIVADA (ON) ===
                    musicIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e0b0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
                    musicText.innerText = "Música: ON"; 
                    // Al dejar esto vacío, hereda automáticamente el mismo color gris/blanco que los demás botones
                    musicText.style.color = ""; 
                    btnMusic.style.background = "transparent"; 
                    btnMusic.style.borderLeft = "none"; 
                } else {
                    // === ESTADO: MÚSICA APAGADA (OFF) ===
                    musicIcon.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff4b4b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                            <line x1="20" y1="2" x2="4" y2="22"></line>
                        </svg>`;
                    musicText.innerText = "Música: OFF"; 
                    musicText.style.color = "#ff4b4b"; // Se mantiene en rojo
                    btnMusic.style.background = "transparent"; 
                    btnMusic.style.borderLeft = "none"; 
                }
            }
        });
    }

    setTimeout(() => {
        if(!window.miWallet) window.miWallet = { pol: 10.0 };
        const regaloDado = localStorage.getItem("regaloInicialDado");
        if (!regaloDado && window.miInventario) {
            window.miInventario.addItem({ id: "dna_scanner", name: "Escáner ADN", icon: "🧬", type: "consumible", maxStack: 20 }, 5);
            localStorage.setItem("regaloInicialDado", "true");
        }
    }, 500);
});

// =========================================
// VISOR DE GENOS MAESTRO (INVENTARIO)
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    if (!window.maxGenoSlots) window.maxGenoSlots = 6;
    const btnMisGenosMain = document.getElementById("btn-show-genos");
    const modalSwap = document.getElementById("geno-swap-modal");
    const btnCloseSwap = document.getElementById("close-swap-modal");
    const gridSwap = document.getElementById("geno-swap-grid");
    const pedestal = document.getElementById("geno-container");

    function renderizarInventarioGenos() {
        if (!gridSwap || !modalSwap) return;
        gridSwap.innerHTML = ""; 
        const todos = [];
        
        if (window.misGenos) {
            const idMascotaActual = window.miMascota ? String(window.miMascota.id) : null;
            const indexActivo = window.misGenos.findIndex(g => String(g.id) === idMascotaActual);
            if (indexActivo !== -1 && window.miMascota) {
                window.misGenos[indexActivo] = window.miMascota;
            }

            const mascota = window.misGenos.find(g => String(g.id) === idMascotaActual);
            if (mascota && !mascota.isEgg) todos.push(mascota);
            const otros = window.misGenos.filter(g => String(g.id) !== idMascotaActual);
            otros.forEach(g => { if (!g.isEgg) todos.push(g); });
        }

        const slotsOcupados = todos.length;
        const infoCard = document.createElement("div");
        infoCard.style = "grid-column: 1 / -1; text-align: center; margin-bottom: 5px; padding-bottom: 10px; border-bottom: 1px solid #333;";
        const colorTexto = slotsOcupados > window.maxGenoSlots ? "#ff6b6b" : "#4dd0e1";
        infoCard.innerHTML = `<span style="color: ${colorTexto}; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Capacidad: ${slotsOcupados} / ${window.maxGenoSlots}</span>`;
        gridSwap.appendChild(infoCard);

        todos.forEach(geno => {
            const card = document.createElement("div");
            card.style = "background: #1a2a36; border: 1px solid #4dd0e1; border-radius: 12px; padding: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.3);";
            
            if (window.miMascota && String(window.miMascota.id) === String(geno.id)) {
                card.style.border = "2px solid #ffcc00"; card.style.boxShadow = "0 0 15px rgba(255, 204, 0, 0.4)";
            } else {
                card.onmouseover = () => card.style.boxShadow = "0 0 15px rgba(77, 208, 225, 0.4)";
                card.onmouseout = () => card.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
            }

            const pColor = geno.color || geno.base_color || "#ccc";
            let svg = typeof generarSvgGeno === 'function' ? generarSvgGeno(geno) : '';
            // El viewBox artificial (-20 0 200 160) se queda SÓLO en la tarjeta pequeña para que cuadre en la grilla
            svg = svg.replace(/<svg[^>]*>/, '<svg width="100%" height="100%" viewBox="-20 0 200 160" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">');
            
            const resVal = Math.floor(geno.resistencia !== undefined ? geno.resistencia : 100);
            const resColor = resVal > 50 ? "#4CAF50" : (resVal > 20 ? "#ff9800" : "#ff3333");
            const esAgotado = resVal === 0;
            const labelDescansando = esAgotado ? ' <span style="color:#ff3333; font-size:10px;">(DESCANSANDO)</span>' : '';

            card.innerHTML = `
                <div style="width: 100px; height: 100px; color: ${pColor}; display: flex; justify-content: center; align-items: center;">${svg}</div>
                <span style="color: white; font-weight: bold; font-size: 12px; margin-top: 10px; text-align: center;">${geno.name || 'Sujeto'}${labelDescansando}</span>
                <div style="width: 80px; height: 4px; background: rgba(0, 0, 0, 0.4); border-radius: 2px; overflow: hidden; margin-top: 5px; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="width: ${resVal}%; height: 100%; background: ${resColor}; transition: width 0.3s;"></div>
                </div>
                <span style="color: #aaa; font-size: 9px; margin-top: 2px;">Res: ${resVal}/100</span>
            `;
            
            // ✨ FIX MAESTRO FINAL: Se elimina por completo el .replace() destructivo
            // Dejamos que el motor gráfico inyecte el SVG puro en el pedestal, tal y como lo hace el F5
            card.onclick = () => {
                if (resVal === 0) {
                    alert(`¡${geno.name || 'Este Geno'} está descansando! Su resistencia es 0. Espera a que recupere algo de resistencia antes de seleccionarlo.`);
                    return;
                }
                window.miMascota = geno;
                if (pedestal) {
                    const svgPedestal = typeof generarSvgGeno === 'function' ? generarSvgGeno(geno) : '';
                    pedestal.innerHTML = `<div class="geno-idle" style="position: absolute; top: 35%; left: 50%; transform: translate(-50%, -50%); display: flex; justify-content: center; align-items: center; color: ${pColor};">${svgPedestal}</div>`;
                }
                const nameEl = document.getElementById('geno-name');
                if (nameEl) nameEl.innerText = `${geno.name} #${geno.id}`;
                if(typeof window.actualizarPanelRPG === 'function') window.actualizarPanelRPG();
                modalSwap.classList.add("hidden");
                if (typeof window.guardarJuego === 'function') window.guardarJuego();
                else if (typeof window.guardarProgreso === 'function') window.guardarProgreso();
            };
            gridSwap.appendChild(card);
        });

        const slotsLibres = Math.max(0, window.maxGenoSlots - slotsOcupados);
        for (let i = 0; i < slotsLibres; i++) {
            const emptyCard = document.createElement("div");
            emptyCard.style = "background: rgba(26, 42, 54, 0.5); border: 1px dashed #4dd0e1; border-radius: 12px; padding: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.5;";
            emptyCard.innerHTML = `<div style="width: 100px; height: 100px; display: flex; justify-content: center; align-items: center; font-size: 32px; color: #4dd0e1;">🧬</div><span style="color: #4dd0e1; font-weight: bold; font-size: 12px; margin-top: 10px; text-align: center;">Vacío</span>`;
            gridSwap.appendChild(emptyCard);
        }

        const costoExpansion = parseFloat((0.5 + (window.maxGenoSlots - 6) * 0.1).toFixed(2));
        const siguienteSlot = window.maxGenoSlots + 1;
        const buyCard = document.createElement("div");
        buyCard.style = "background: rgba(138, 43, 226, 0.1); border: 1px solid #8A2BE2; border-radius: 12px; padding: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;";
        buyCard.onmouseover = () => buyCard.style.boxShadow = "0 0 15px rgba(138, 43, 226, 0.4)";
        buyCard.onmouseout = () => buyCard.style.boxShadow = "none";
        buyCard.innerHTML = `<div style="width: 100px; height: 100px; display: flex; justify-content: center; align-items: center; font-size: 32px; color: #e0b0ff;">➕</div><span style="color: white; font-weight: bold; font-size: 12px; margin-top: 5px; text-align: center;">Comprar Slot #${siguienteSlot}</span><span style="color: #e0b0ff; font-weight: bold; font-size: 11px; margin-top: 5px; text-align: center;">${costoExpansion} POL</span>`;

        buyCard.onclick = () => {
            if (window.miWallet && window.miWallet.pol >= costoExpansion) {
                window.miWallet.pol -= costoExpansion;
                window.maxGenoSlots += 1;
                if(typeof window.actualizarHUD === 'function') window.actualizarHUD();
                renderizarInventarioGenos(); 
                if (typeof window.guardarJuego === 'function') window.guardarJuego();
                else if (typeof window.guardarProgreso === 'function') window.guardarProgreso();
            } else {
                alert("No tienes suficiente $POL para expandir tu inventario. ¡Consigue más jugando o recargando!");
            }
        };
        gridSwap.appendChild(buyCard);
    }

    if (btnMisGenosMain) btnMisGenosMain.addEventListener("click", () => { renderizarInventarioGenos(); modalSwap.classList.remove("hidden"); });
    if (btnCloseSwap && modalSwap) btnCloseSwap.addEventListener("click", () => { modalSwap.classList.add("hidden"); });
});

window.generarNuevoID = function() {
    let count = parseInt(localStorage.getItem('genoGlobalCounter') || '0');
    count++;
    localStorage.setItem('genoGlobalCounter', count);
    return String(count).padStart(6, '0'); 
};

// =========================================
// SECUENCIA DE INICIO: EL BIO-NÚCLEO ALFA
// =========================================
function iniciarSecuenciaBienvenida() {
    const formasBase = ["gota", "frijol", "circulo", "cuadrado", "triangulo"];
    const coloresBase = ["#ff6b6b", "#4dd0e1", "#fdfd96", "#b19cd9", "#77DD77", "#ff9800", "#ffb347", "#a8e6cf"];
    const elementosBase = ["Biomutante", "Viral", "Cibernético", "Radiactivo", "Tóxico", "Sintético"];

    const obtenerClaveAleatoria = (dic) => {
        if (!dic || Object.keys(dic).length === 0) return "estandar";
        const keys = Object.keys(dic);
        return keys[Math.floor(Math.random() * keys.length)];
    };

    const shapeRandom = formasBase[Math.floor(Math.random() * formasBase.length)];
    const colorRandom = coloresBase[Math.floor(Math.random() * coloresBase.length)];
    const eyeRandom = obtenerClaveAleatoria(typeof dicOjos !== 'undefined' ? dicOjos : {});
    const mouthRandom = obtenerClaveAleatoria(typeof dicBocas !== 'undefined' ? dicBocas : {});
    const elementoRandom = elementosBase[Math.floor(Math.random() * elementosBase.length)];
    const recElementoRandom = elementosBase[Math.floor(Math.random() * elementosBase.length)];

    const prefijos = ["Neo", "Bio", "Geno", "Cyto", "Viro", "Rad", "Syn", "Evo", "Nexo", "Mut"];
    const sufijos = ["-X", "-Prime", "morph", "cyte", "tron", "plasm", "-7", "core", "gen", "-Z"];
    const nombreAleatorio = prefijos[Math.floor(Math.random() * prefijos.length)] + sufijos[Math.floor(Math.random() * sufijos.length)];

    const esGordo = Math.random() <= 0.001; 
    const rarezaInicial = esGordo ? "Legendario" : "Común";
    const statsV9 = window.generarStatsPorRareza(rarezaInicial);

    const miPrimerGeno = {
        id: window.generarNuevoID(),
        name: nombreAleatorio,
        rarity: rarezaInicial,
        element: elementoRandom, 
        body_shape: shapeRandom, 
        color: colorRandom,
        base_color: colorRandom, 
        eye_type: eyeRandom,
        mouth_type: mouthRandom,
        wing_type: "ninguno", 
        hat_type: "ninguno",
        level: 1,
        xp: 0,
        xpNeeded: 100,
        breedCount: 0,
        stats: statsV9, 
        hidden_genes: window.generarGenesV9(rarezaInicial), 
        scanned: false,
        genes: {
            cuerpo: { dom: shapeRandom, rec: formasBase[Math.floor(Math.random() * formasBase.length)] },
            ojos: { dom: eyeRandom, rec: obtenerClaveAleatoria(typeof dicOjos !== 'undefined' ? dicOjos : {}) },
            boca: { dom: mouthRandom, rec: obtenerClaveAleatoria(typeof dicBocas !== 'undefined' ? dicBocas : {}) },
            espalda: { dom: "ninguno", rec: "ninguno" },
            cabeza: { dom: "ninguno", rec: "ninguno" },
            afinidad: { dom: elementoRandom, rec: recElementoRandom } 
        }
    };

    const modalOverlay = document.createElement("div");
    modalOverlay.id = "dna-startup-modal";
    modalOverlay.style = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 20, 30, 0.98); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; color: white; font-family: sans-serif;";

    const svgBioNucleo = typeof generarSvgGeno === 'function' ? generarSvgGeno({ isEgg: true, color: miPrimerGeno.color, id: "genesis" }) : '🧬';

    modalOverlay.innerHTML = `
        <div id="dna-capsule" style="width: 180px; height: 180px; cursor: pointer; transition: 0.3s; user-select: none;">${svgBioNucleo}</div>
        <h2 id="dna-text" style="margin-top: 20px; font-weight: bold; color: #4dd0e1; text-align: center; text-transform: uppercase; letter-spacing: 2px;">¡Bio-Núcleo Encontrado!</h2>
        <p id="dna-subtext" style="color: #aaa; text-align: center; max-width: 300px; line-height: 1.5; margin-top: 10px; font-size: 14px;">Detectada secuencia de origen. Toca para sintetizar tu primer espécimen.</p>
        <div id="dna-result" style="display: none; flex-direction: column; align-items: center;">
            <div id="dna-svg-container" style="width: 200px; height: 200px; margin: 20px 0;"></div>
            <button id="btn-claim-geno" style="background: #4dd0e1; color: #1a2a36; border: none; padding: 15px 30px; font-size: 18px; font-weight: bold; border-radius: 12px; cursor: pointer; margin-top: 10px; box-shadow: 0 4px 15px rgba(77, 208, 225, 0.5); transition: 0.2s;">Integrar al Laboratorio</button>
        </div>
    `;

    const gameContainer = document.getElementById("game-container") || document.body;
    gameContainer.appendChild(modalOverlay);

    const capsule = document.getElementById("dna-capsule");
    const text = document.getElementById("dna-text");
    const subtext = document.getElementById("dna-subtext");
    const resultDiv = document.getElementById("dna-result");
    const svgContainer = document.getElementById("dna-svg-container");
    const btnClaim = document.getElementById("btn-claim-geno");

    capsule.onclick = () => {
        capsule.onclick = null; 
        capsule.style.animation = "propulsor 0.1s infinite alternate ease-in-out"; 
        text.innerText = "Sintetizando Bio-Núcleo...";
        subtext.innerText = "Secuenciando cadena de aminoácidos...";

        setTimeout(() => {
            capsule.style.display = "none";
            text.innerText = `¡${miPrimerGeno.name} Sintetizado!`;
            if(esGordo) subtext.innerHTML = "<span style='color: #ffcc00; font-weight:bold;'>¡EVENTO GORDO! Has obtenido un espécimen Legendario.</span>";
            else subtext.innerText = "Estable e integrado. Listo para la investigación.";

            let svg = typeof generarSvgGeno === 'function' ? generarSvgGeno(miPrimerGeno) : '';
            svg = svg.replace(/<svg[^>]*>/, '<svg width="100%" height="100%" viewBox="-20 0 200 160" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">');
            svgContainer.innerHTML = svg;
            resultDiv.style.display = "flex"; 
        }, 2500);
    };

    btnClaim.onclick = () => {
        window.miMascota = miPrimerGeno;
        if(!window.misGenos) window.misGenos = []; window.misGenos.push(miPrimerGeno);

        const pedestal = document.getElementById("geno-container");
        if (pedestal) {
            pedestal.style.display = "block";
            const svgPedestal = typeof generarSvgGeno === 'function' ? generarSvgGeno(miPrimerGeno) : '';
            
            // ✨ FIX MAESTRO FINAL
            pedestal.innerHTML = `<div class="geno-idle" style="position: absolute; top: 35%; left: 50%; transform: translate(-50%, -50%); display: flex; justify-content: center; align-items: center; color: ${miPrimerGeno.color};">${svgPedestal}</div>`;
        }
        
        const nameEl = document.getElementById('geno-name');
        if (nameEl) nameEl.innerText = `${miPrimerGeno.name} #${miPrimerGeno.id}`;

        modalOverlay.remove();
        if(typeof window.actualizarPanelRPG === 'function') window.actualizarPanelRPG();
        if(typeof window.guardarProgreso === 'function') window.guardarProgreso();
    };
}