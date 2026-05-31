// =========================================
// app.js - CONTROLADOR PRINCIPAL Y NAVEGACIÓN (V14.17 - FIX DEFINITIVO ANIMACIÓN Y TAMAÑO NATIVO)
// Requiere cargar 'genes.js' previamente en el HTML.
// =========================================

window.misGenos = window.misGenos || []; 
window.maxGenoSlots = window.maxGenoSlots || 6; 

window.obtenerHashVisualGeno = function(geno) {
    if (!geno) return "";
    const dirtSpotsStr = geno.dirtSpots ? geno.dirtSpots.map(d => `${d.x},${d.y},${d.scrubbed}`).join("|") : "";
    const soapySpotsStr = geno.soapySpots ? geno.soapySpots.map(s => `${s.x},${s.y}`).join("|") : "";
    return [
        geno.id,
        geno.base_color,
        geno.color,
        geno.body_shape,
        geno.eye_type,
        geno.mouth_type,
        geno.hat_type,
        geno.wing_type,
        geno.skin_type,
        geno.aura_type,
        geno.higiene,
        dirtSpotsStr,
        soapySpotsStr
    ].join("_");
}; 

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

    window.currentSlide = "room-area";

    window.navegarA = function(idPantalla) {
        let actualTarget = idPantalla;
        let slidePos = null;

        if (idPantalla === "room-area") {
            actualTarget = "main-slider-screen";
            slidePos = "0%";
            window.currentSlide = "room-area";
        } else if (idPantalla === "bathroom-screen") {
            actualTarget = "main-slider-screen";
            slidePos = "-50%";
            window.currentSlide = "bathroom-screen";
        }

        document.querySelectorAll('.app-screen').forEach(s => s.classList.add("hidden"));
        
        const destino = document.getElementById(actualTarget);
        if(destino) destino.classList.remove("hidden");

        if (slidePos !== null) {
            const slider = document.getElementById("desktop-slider");
            if (slider) slider.style.transform = `translateX(${slidePos})`;
            
            if (window.currentSlide === "bathroom-screen") {
                if (typeof window.actualizarGenoBaño === 'function') {
                    window.actualizarGenoBaño();
                }
            } else {
                if (typeof window.actualizarSuciedadVisual === 'function') {
                    window.actualizarSuciedadVisual();
                }
            }
        }
        
        if(drawerMenu) drawerMenu.classList.add("hidden"); 
        
        const panelStats = document.getElementById("geno-stats-panel");
        if(panelStats) panelStats.classList.add("hidden");
        
        if(fabMenu) {
            fabMenu.classList.toggle("hidden", window.currentSlide !== "room-area" || actualTarget !== "main-slider-screen");
        }
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
                    contenedor.classList.add("eating");
                    setTimeout(() => contenedor.classList.remove("happy-jump"), 500);
                    setTimeout(() => contenedor.classList.remove("eating"), 1500);
                }
                const multiplicador = typeof window.getMultiplicadorXP === 'function' ? window.getMultiplicadorXP(window.miMascota) : 1.0;
                if(window.ganarXP) window.ganarXP(Math.floor(15 * multiplicador));
            } else {
                alert("No tienes manzanas en tu mochila.");
            }
        });
    }

    const contenedorGenoMain = document.getElementById("geno-container");
    if (contenedorGenoMain) {
        contenedorGenoMain.addEventListener("click", (e) => {
            if (!window.miMascota || window.miMascota.id === "temp") return;
            
            // Crear un pequeño corazón flotante en cada toque (usando SVG)
            const heart = document.createElement("div");
            heart.className = "heart-particle";
            heart.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ff007f" stroke="none" style="filter: drop-shadow(0 0 4px rgba(255, 0, 127, 0.6));"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
            const rect = contenedorGenoMain.getBoundingClientRect();
            heart.style.left = `${e.clientX - rect.left}px`;
            heart.style.top = `${e.clientY - rect.top}px`;
            contenedorGenoMain.appendChild(heart);
            setTimeout(() => heart.remove(), 1000);

            // Incrementar toques para acariciar (mínimo 5)
            window.cariciasCount = (window.cariciasCount || 0) + 1;
            if (window.cariciasCount < 5) {
                if (window.Sonidos) window.Sonidos.play("click");
                contenedorGenoMain.classList.remove("geno-idle");
                contenedorGenoMain.classList.add("wobble-light");
                setTimeout(() => {
                    contenedorGenoMain.classList.remove("wobble-light");
                    contenedorGenoMain.classList.add("geno-idle");
                }, 150);
                return;
            }
            window.cariciasCount = 0; // Resetear contador de caricias

            if (window.Sonidos) window.Sonidos.play("click");
            contenedorGenoMain.classList.remove("geno-idle");
            contenedorGenoMain.classList.add("happy-jump");
            setTimeout(() => {
                contenedorGenoMain.classList.remove("happy-jump");
                contenedorGenoMain.classList.add("geno-idle");
            }, 300);

            // Cuidado Diario e Incrementar Amistad por caricia (1 a 3, una vez al día)
            const hoy = new Date().toDateString();
            if (!window.miMascota.registroAmistadDiaria) window.miMascota.registroAmistadDiaria = {};
            
            let gananciaExplicita = 0;
            if (window.miMascota.registroAmistadDiaria.caricia !== hoy) {
                window.miMascota.registroAmistadDiaria.caricia = hoy;
                gananciaExplicita = Math.floor(Math.random() * 3) + 1;
                window.miMascota.amistad = Math.min(100, (window.miMascota.amistad || 0) + gananciaExplicita);
            }

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
                let msg = `¡Has acariciado a ${window.miMascota.name || 'tu Geno'}! Cuidado diario activado: +10 XP y +20% de velocidad de recuperación de resistencia para hoy.`;
                if (gananciaExplicita > 0) {
                    msg += ` ¡Amistad +${gananciaExplicita}!`;
                }
                alert(msg);
            } else if (gananciaExplicita > 0) {
                alert(`¡Amistad +${gananciaExplicita} con ${window.miMascota.name || 'tu Geno'}!`);
            }

            if (window.misGenos) {
                const idx = window.misGenos.findIndex(g => String(g.id) === String(window.miMascota.id));
                if (idx !== -1) {
                    window.misGenos[idx].amistad = window.miMascota.amistad;
                    window.misGenos[idx].registroAmistadDiaria = window.miMascota.registroAmistadDiaria;
                }
            }
            if (window.NexoEnergyManager) {
                window.NexoEnergyManager.actualizarUI();
            }
            if (window.guardarProgreso) window.guardarProgreso();
            else if (window.guardarJuego) window.guardarJuego();
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

        const rarityColors = {
            "Común": { border: "#ffffff", glow: "rgba(255, 255, 255, 0.4)", text: "#aaa" },
            "Raro": { border: "#4CAF50", glow: "rgba(76, 175, 80, 0.4)", text: "#4CAF50" },
            "Épico": { border: "#ab47bc", glow: "rgba(171, 71, 188, 0.5)", text: "#ab47bc" },
            "Legendario": { border: "#ff9100", glow: "rgba(255, 145, 0, 0.5)", text: "#ff9100" },
            "Mítico": { border: "#ff007f", glow: "rgba(255, 0, 127, 0.6)", text: "#ff007f" }
        };

        todos.forEach(geno => {
            const card = document.createElement("div");
            const rColor = rarityColors[geno.rarity || "Común"] || rarityColors["Común"];
            card.style.cssText = `background: #1a2a36; border: 1.5px solid ${rColor.border}; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.4), inset 0 0 8px ${rColor.glow}; position: relative; box-sizing: border-box; height: 165px; -webkit-tap-highlight-color: transparent; outline: none;`;
            
            if (window.miMascota && String(window.miMascota.id) === String(geno.id)) {
                card.classList.add("selected-card-glow");
                card.style.setProperty("--rarity-color", rColor.border);
                card.style.setProperty("--rarity-color-glow", rColor.glow);
            } else {
                card.onmouseover = () => {
                    card.style.transform = "translateY(-2px)";
                    card.style.boxShadow = `0 6px 15px rgba(0,0,0,0.5), inset 0 0 12px ${rColor.glow}`;
                };
                card.onmouseout = () => {
                    card.style.transform = "none";
                    card.style.boxShadow = `0 4px 10px rgba(0,0,0,0.4), inset 0 0 8px ${rColor.glow}`;
                };
            }

            const pColor = geno.color || geno.base_color || "#ccc";
            let svg = typeof generarSvgGeno === 'function' ? generarSvgGeno(geno) : '';
            // El viewBox artificial (-20 0 200 160) se queda SÓLO en la tarjeta pequeña para que cuadre en la grilla
            svg = svg.replace(/<svg[^>]*>/, '<svg width="100%" height="100%" viewBox="-20 0 200 160" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">');
            
            const resVal = Math.floor(geno.resistencia !== undefined ? geno.resistencia : 100);
            const resColor = resVal > 50 ? "#4CAF50" : (resVal > 20 ? "#ff9800" : "#ff3333");
            const esAgotado = resVal === 0;
            const labelDescansando = esAgotado ? ' <span style="color:#ff3333; font-size:9px;">(AGOTADO)</span>' : '';

            // Obtener datos de calidad
            let qualityRank = "D";
            let qualityPct = 0;
            let qualityColor = "#d9534f";
            if (window.calcularCalidad && geno.stats) {
                const qStats = window.calcularCalidad(geno.stats, geno.rarity || "Común", geno.level || 1);
                qualityRank = qStats.rango || "D";
                qualityPct = qStats.calidadPorcentaje || 0;
                if (window.obtenerColorRango) {
                    qualityColor = window.obtenerColorRango(qualityRank);
                }
            }

            // Obtener elemento con afinidad genética y normalizar acentos
            let elemRaw = (geno.genes && geno.genes.afinidad && geno.genes.afinidad.dom) ? geno.genes.afinidad.dom : (geno.element || "Biomutante");
            let elemName = elemRaw;
            if (elemRaw.toLowerCase() === "cibernetico") elemName = "Cibernético";
            else if (elemRaw.toLowerCase() === "toxico") elemName = "Tóxico";
            else if (elemRaw.toLowerCase() === "sintetico") elemName = "Sintético";
            else if (elemRaw.toLowerCase() === "radiactivo") elemName = "Radiactivo";
            else if (elemRaw.toLowerCase() === "biomutante") elemName = "Biomutante";
            else if (elemRaw.toLowerCase() === "viral") elemName = "Viral";

            if (!["Biomutante", "Viral", "Cibernético", "Radiactivo", "Tóxico", "Sintético"].includes(elemName)) {
                elemName = "Biomutante";
            }

            // Obtener icono del elemento
            const elementIcon = (window.ShopManager && window.ShopManager.iconosSVG && window.ShopManager.iconosSVG[elemName]) 
                ? window.ShopManager.iconosSVG[elemName].replace('width="1em"', 'width="100%"').replace('height="1em"', 'height="100%"') 
                : '🧬';

            card.innerHTML = `
                <!-- Fila Superior de Info -->
                <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 9px; font-family: monospace; flex-shrink: 0;">
                    <span style="background: rgba(255,255,255,0.08); border-radius: 4px; padding: 1px 4px; color: #fff; font-weight: bold;">Nv. ${geno.level || 1}</span>
                    <div style="display: flex; align-items: center; width: 14px; height: 14px;" title="${elemName}">
                        ${elementIcon}
                    </div>
                    <span style="color: ${qualityColor}; font-weight: bold; text-shadow: ${qualityRank === 'S' ? '0 0 5px ' + qualityColor : 'none'}">${qualityRank} (${qualityPct}%)</span>
                </div>

                <!-- Geno SVG -->
                <div style="width: 70px; height: 70px; color: ${pColor}; display: flex; justify-content: center; align-items: center; flex: 1;">${svg}</div>
                
                <!-- Nombre -->
                <span style="color: white; font-weight: bold; font-size: 11px; margin-top: 5px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; flex-shrink: 0;">${geno.name || 'Sujeto'}${labelDescansando}</span>
                
                <!-- Barra de Resistencia -->
                <div style="width: 80px; height: 4px; background: rgba(0, 0, 0, 0.4); border-radius: 2px; overflow: hidden; margin-top: 4px; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0;">
                    <div style="width: ${resVal}%; height: 100%; background: ${resColor}; transition: width 0.3s;"></div>
                </div>
                <span style="color: #aaa; font-size: 9px; margin-top: 2px; flex-shrink: 0;">Res: ${resVal}/100</span>
            `;
            
            // ✨ FIX MAESTRO FINAL: Se elimina por completo el .replace() destructivo
            // Dejamos que el motor gráfico inyecte el SVG puro en el pedestal, tal y como lo hace el F5
            card.onclick = () => {
                if (resVal === 0) {
                    alert(`¡${geno.name || 'Este Geno'} está descansando! Su resistencia es 0. Espera a que recupere algo de resistencia antes de seleccionarlo.`);
                    return;
                }
                window.miMascota = geno;
                if (typeof window.actualizarSuciedadVisual === 'function') {
                    window.actualizarSuciedadVisual();
                } else if (pedestal) {
                    const svgPedestal = typeof generarSvgGeno === 'function' ? generarSvgGeno(geno) : '';
                    pedestal.innerHTML = `<div class="geno-idle" style="position: absolute; top: 35%; left: 50%; transform: translate(-50%, -50%); display: flex; justify-content: center; align-items: center; color: ${pColor};">${svgPedestal}</div>`;
                }
                if (typeof window.actualizarGenoBaño === 'function') {
                    window.actualizarGenoBaño();
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
            emptyCard.style = "background: rgba(26, 42, 54, 0.5); border: 1px dashed #4dd0e1; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.5; height: 165px; box-sizing: border-box;";
            emptyCard.innerHTML = `<div style="width: 70px; height: 70px; display: flex; justify-content: center; align-items: center; font-size: 32px; color: #4dd0e1; flex: 1;">🧬</div><span style="color: #4dd0e1; font-weight: bold; font-size: 11px; margin-top: 5px; text-align: center; flex-shrink: 0;">Vacío</span>`;
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
                if (typeof window.WalletManager !== 'undefined') window.WalletManager.actualizarBoton();
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

// =========================================
// SISTEMA DE CUIDADO (TAMAGOTCHI) Y EV PASIVA
// =========================================
(function() {
    const style = document.createElement("style");
    style.innerHTML = `
        .dirt-spot {
            position: absolute;
            width: 22px;
            height: 22px;
            background: radial-gradient(circle, rgba(141,110,99,0.9) 0%, rgba(93,64,55,0.95) 70%);
            border-radius: 40% 60% 50% 50% / 50% 60% 40% 50%;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3), inset 0 2px 2px rgba(255,255,255,0.1);
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)) blur(0.5px);
            cursor: pointer;
            z-index: 100;
            transition: transform 0.2s ease, opacity 0.2s ease;
            animation: pulseDirt 3s infinite alternate ease-in-out;
        }
        .dirt-spot:hover {
            transform: scale(1.2);
        }
        @keyframes pulseDirt {
            0% { transform: scale(1) rotate(0deg); opacity: 0.85; }
            100% { transform: scale(1.08) rotate(15deg); opacity: 0.95; }
        }
        
        .floating-ev-coin {
            position: absolute;
            width: 38px;
            height: 38px;
            background: radial-gradient(circle, #ffd700 0%, #ff8f00 100%);
            border: 2.5px solid #fff;
            border-radius: 50%;
            box-shadow: 0 0 15px #ffd700, inset 0 2px 4px rgba(255,255,255,0.5);
            color: #fff;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 120;
            animation: floatCoin 2.5s infinite alternate ease-in-out, spinCoin 4s infinite linear;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
        .floating-ev-coin:hover {
            filter: brightness(1.2);
            box-shadow: 0 0 22px #ffd700;
        }
        @keyframes floatCoin {
            0% { transform: translateY(0); }
            100% { transform: translateY(-10px); }
        }
        @keyframes spinCoin {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(360deg); }
        }

        .clean-sparkle {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #00e5ff;
            border-radius: 50%;
            pointer-events: none;
            z-index: 110;
            animation: sparkleAnimation 0.5s forwards ease-out;
            box-shadow: 0 0 6px #00e5ff;
        }
        @keyframes sparkleAnimation {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    function crearChispasLimpieza(x, y, parent) {
        for (let i = 0; i < 8; i++) {
            const sparkle = document.createElement("div");
            sparkle.className = "clean-sparkle";
            const angle = Math.random() * Math.PI * 2;
            const dist = 15 + Math.random() * 30;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            sparkle.style.setProperty("--dx", `${dx}px`);
            sparkle.style.setProperty("--dy", `${dy}px`);
            sparkle.style.left = `${x}px`;
            sparkle.style.top = `${y}px`;
            parent.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 500);
        }
    }

    window.sincronizarDirtSpots = function(geno) {
        if (!geno || geno.id === "temp") return;
        const higiene = geno.higiene !== undefined ? geno.higiene : 100;
        let targetSpots = 0;
        if (higiene < 20) targetSpots = 4;
        else if (higiene < 40) targetSpots = 3;
        else if (higiene < 60) targetSpots = 2;
        else if (higiene < 80) targetSpots = 1;

        if (!geno.dirtSpots) geno.dirtSpots = [];

        // If we have more than target, truncate
        if (geno.dirtSpots.length > targetSpots) {
            geno.dirtSpots = geno.dirtSpots.slice(0, targetSpots);
        }
        
        // If we need more, generate them
        const needed = targetSpots - geno.dirtSpots.length;
        for (let i = 0; i < needed; i++) {
            const cx = Math.floor(50 + Math.random() * 60);
            const cy = Math.floor(55 + Math.random() * 65);
            const r = Math.floor(8 + Math.random() * 6);
            geno.dirtSpots.push({ x: cx, y: cy, r: r, scrubbed: 0 });
        }
    };

    window.actualizarSuciedadVisual = function() {
        const pedestal = document.getElementById("geno-container");
        if (!pedestal || !window.miMascota || window.miMascota.id === "temp") return;

        window.sincronizarDirtSpots(window.miMascota);

        const currentHash = window.obtenerHashVisualGeno(window.miMascota);
        const targetDiv = pedestal.querySelector(".geno-idle");
        
        if (targetDiv) {
            if (targetDiv.dataset.visualHash !== currentHash) {
                if (typeof generarSvgGeno === 'function') {
                    const nuevoSvg = generarSvgGeno(window.miMascota);
                    window.miMascota.svg = nuevoSvg;
                    targetDiv.innerHTML = nuevoSvg;
                    targetDiv.dataset.visualHash = currentHash;
                }
            }
        } else {
            if (typeof generarSvgGeno === 'function') {
                const nuevoSvg = generarSvgGeno(window.miMascota);
                window.miMascota.svg = nuevoSvg;
                pedestal.innerHTML = `<div class="geno-idle" style="color: ${window.miMascota.color}; top: 50%; left: 50%; display: flex; justify-content: center; align-items: center;" data-visual-hash="${currentHash}">${nuevoSvg}</div>`;
            }
        }
    };

    window.actualizarMonedaEvFlotante = function() {
        const pedestal = document.getElementById("geno-container");
        if (!pedestal || !window.miMascota || window.miMascota.id === "temp") {
            const existingCoin = document.getElementById("floating-ev-coin");
            if (existingCoin) existingCoin.remove();
            return;
        }

        const evAcumulada = window.miMascota.evAcumulada !== undefined ? window.miMascota.evAcumulada : 0;
        
        let coin = document.getElementById("floating-ev-coin");

        if (evAcumulada >= 0.10) {
            if (!coin) {
                coin = document.createElement("div");
                coin.id = "floating-ev-coin";
                coin.className = "floating-ev-coin";
                coin.innerText = "✨";
                
                coin.style.top = "20%";
                coin.style.right = "10%";

                coin.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const evARecolectar = window.miMascota.evAcumulada || 0;
                    
                    if (window.miInventario) {
                        window.miInventario.addEssence(evARecolectar);
                        window.miInventario.updateUI();
                        window.miInventario.renderGrid();
                    }
                    
                    alert(`✨ ¡Has cosechado ${evARecolectar.toFixed(2)} EV de tu Geno!`);

                    window.miMascota.evAcumulada = 0;
                    if (window.misGenos) {
                        const idx = window.misGenos.findIndex(g => String(g.id) === String(window.miMascota.id));
                        if (idx !== -1) {
                            window.misGenos[idx].evAcumulada = 0;
                        }
                    }

                    coin.style.animation = "none";
                    coin.style.transition = "all 0.5s ease-in";
                    coin.style.transform = "translateY(-50px) scale(0)";
                    coin.style.opacity = "0";
                    
                    setTimeout(() => {
                        if (coin) coin.remove();
                        if (window.NexoEnergyManager) {
                            window.NexoEnergyManager.actualizarUI();
                        }
                    }, 500);

                    if (window.Sonidos) window.Sonidos.play("click");
                    if (window.guardarProgreso) window.guardarProgreso();
                    else if (window.guardarJuego) window.guardarJuego();
                });

                pedestal.appendChild(coin);
            }
        } else {
            if (coin) {
                coin.remove();
            }
        }
    };

    // ========================================================
    // CENTRO DE CUIDADO: ACTUALIZACIÓN DE UI
    // ========================================================
    window.actualizarGenoBaño = function() {
        const container = document.getElementById("geno-container-bathroom");

        if (!window.miMascota || window.miMascota.id === "temp") return;

        window.sincronizarDirtSpots(window.miMascota);

        const currentHash = window.obtenerHashVisualGeno(window.miMascota);

        if (container) {
            const targetIdle = container.querySelector(".geno-idle");
            if (targetIdle) {
                if (targetIdle.dataset.visualHash !== currentHash) {
                    if (typeof generarSvgGeno === 'function') {
                        const nuevoSvg = generarSvgGeno(window.miMascota);
                        window.miMascota.svg = nuevoSvg;
                        targetIdle.innerHTML = nuevoSvg;
                        targetIdle.dataset.visualHash = currentHash;
                    }
                }
            } else {
                if (typeof generarSvgGeno === 'function') {
                    const nuevoSvg = generarSvgGeno(window.miMascota);
                    window.miMascota.svg = nuevoSvg;
                    container.innerHTML = `
                        <div class="geno-float-wrapper" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; justify-content: center; align-items: center; width: 140px; height: 140px; z-index: 10;">
                            <div class="geno-idle" style="color: ${window.miMascota.color}; top: 50%; left: 50%; display: flex; justify-content: center; align-items: center;" data-visual-hash="${currentHash}">
                                ${nuevoSvg}
                            </div>
                            <div id="geno-resting-aura-bathroom" class="geno-resting-aura" style="display:none; position:absolute; bottom: 0; left:50%; transform:translateX(-50%); width:130px; height:140px; z-index:5; pointer-events:none; overflow:visible;"></div>
                        </div>
                    `;
                }
            }
        }

        // Actualizar barras de estado del Centro de Cuidado
        const higiene = Math.floor(window.miMascota.higiene !== undefined ? window.miMascota.higiene : 100);
        const hambre = Math.floor(window.miMascota.hambre !== undefined ? window.miMascota.hambre : 100);
        const resistencia = Math.floor(window.miMascota.resistencia !== undefined ? window.miMascota.resistencia : 100);
        const diversion = Math.floor(window.miMascota.diversion !== undefined ? window.miMascota.diversion : 100);

        const hygieneText = document.getElementById("bath-hygiene-text");
        const hygieneFill = document.getElementById("bath-hygiene-fill");
        if (hygieneText) hygieneText.innerText = `${higiene}%`;
        if (hygieneFill) hygieneFill.style.width = `${higiene}%`;

        const hungerText = document.getElementById("bath-hunger-text");
        const hungerFill = document.getElementById("bath-hunger-fill");
        if (hungerText) hungerText.innerText = `${hambre}%`;
        if (hungerFill) hungerFill.style.width = `${hambre}%`;

        const resText = document.getElementById("bath-resistance-text");
        const resFill = document.getElementById("bath-resistance-fill");
        if (resText) resText.innerText = `${resistencia}%`;
        if (resFill) resFill.style.width = `${resistencia}%`;

        const funText = document.getElementById("bath-fun-text");
        const funFill = document.getElementById("bath-fun-fill");
        if (funText) funText.innerText = `${diversion}%`;
        if (funFill) funFill.style.width = `${diversion}%`;

        // Actualizar estado del botón Descansar y animación de descanso
        window.actualizarBotonDescansar();
        if (typeof window.actualizarAnimacionDescanso === 'function') window.actualizarAnimacionDescanso();

        // Forzar actualización inmediata del panel de felicidad y demás HUD/stats
        if (window.NexoEnergyManager && typeof window.NexoEnergyManager.actualizarUI === 'function') {
            window.NexoEnergyManager.actualizarUI();
        }
    };


    // Función para actualizar el estado visual del botón Descansar (3 estados)
    window.actualizarBotonDescansar = function() {
        const btn   = document.getElementById("btn-care-rest");
        const label = document.getElementById("btn-care-rest-label");
        if (!btn || !label) return;

        const geno = window.miMascota;
        if (!geno || geno.id === "temp") {
            btn.disabled = true;
            label.innerText = "Descansar";
            return;
        }

        const ahora = typeof window.obtenerTiempoSeguro === 'function' ? window.obtenerTiempoSeguro() : Date.now();

        // ESTADO 1: descansando activamente (botón verde, muestra tiempo restante, click = cancelar)
        if (geno.descansandoDesde) {
            const msTranscurrido  = ahora - geno.descansandoDesde;
            const msRestante      = Math.max(0, (4 * 60 * 60 * 1000) - msTranscurrido);
            const h = Math.floor(msRestante / 3600000);
            const m = Math.floor((msRestante % 3600000) / 60000);
            btn.disabled = false;
            btn.style.background    = "rgba(76,175,80,0.35)";
            btn.style.borderColor   = "#4CAF50";
            btn.style.color         = "#a5d6a7";
            btn.style.opacity       = "1";
            label.innerText = msRestante > 0 ? `✓ ${h > 0 ? h + 'h ' : ''}${m}m` : "✓ Completo";
            return;
        }

        // ESTADO 2: cooldown por cancelación (2 horas)
        const msDescansoCancelado = geno.descansoCancelado || 0;
        const msRestanteCooldown  = Math.max(0, (2 * 60 * 60 * 1000) - (ahora - msDescansoCancelado));
        if (msRestanteCooldown > 0) {
            const h = Math.floor(msRestanteCooldown / 3600000);
            const m = Math.ceil((msRestanteCooldown % 3600000) / 60000);
            btn.disabled = true;
            btn.style.background  = "";
            btn.style.borderColor = "";
            btn.style.color       = "";
            btn.style.opacity     = "0.45";
            label.innerText = h > 0 ? `${h}h ${m}m` : `${m}m`;
            return;
        }

        // ESTADO 3: disponible
        const resistencia = Math.floor(geno.resistencia !== undefined ? geno.resistencia : 100);
        if (resistencia >= 100) {
            btn.disabled = true;
            btn.style.background  = "";
            btn.style.borderColor = "";
            btn.style.color       = "";
            btn.style.opacity     = "0.45";
            label.innerText = "Descansar";
            return;
        }

        btn.disabled = false;
        btn.style.background  = "";
        btn.style.borderColor = "";
        btn.style.color       = "";
        btn.style.opacity     = "1";
        label.innerText = "Descansar";
    };

    // Función para generar los hijos del aura de descanso (líneas + rayos)
    function _generarLineasDescanso(container) {
        container.innerHTML = ""; // Limpiar si ya tenía hijos
        const cols   = [8, 22, 38, 55, 70, 85];
        const heights = [45, 60, 40, 55, 50, 42];
        const durs   = [1.8, 2.1, 1.6, 2.3, 1.9, 2.0];
        const dels   = [0, 0.35, 0.7, 0.15, 0.55, 0.9];

        cols.forEach((left, i) => {
            // Línea verde
            const line = document.createElement("div");
            line.className = "rest-line";
            line.style.cssText = `left:${left}%; height:${heights[i]}px; animation-duration:${durs[i]}s; animation-delay:${dels[i]}s;`;
            container.appendChild(line);

            // Rayo SVG cada dos columnas
            if (i % 2 === 0) {
                const bolt = document.createElement("div");
                bolt.className = "rest-bolt";
                bolt.style.cssText = `left:${left + 4}%; animation-duration:${durs[i] + 0.5}s; animation-delay:${dels[i] + 0.25}s;`;
                bolt.innerHTML = `<svg width="12" height="18" viewBox="0 0 24 24" fill="#81c784" stroke="#4CAF50" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
                container.appendChild(bolt);
            }
        });
    }

    // Función global para mostrar/ocultar la animación de descanso en ambas pantallas
    window.actualizarAnimacionDescanso = function() {
        const isResting = !!(window.miMascota && window.miMascota.descansandoDesde);

        // — Pantalla principal (pedestal) —
        const mainAura = document.getElementById("geno-resting-aura-main");
        if (mainAura) {
            if (isResting && mainAura.children.length === 0) {
                _generarLineasDescanso(mainAura);
            }
            mainAura.style.display = isResting ? "block" : "none";
        }

        // — Centro de Cuidado (baño) —
        const bathAura = document.getElementById("geno-resting-aura-bathroom");
        if (bathAura) {
            if (isResting && bathAura.children.length === 0) {
                _generarLineasDescanso(bathAura);
            }
            bathAura.style.display = isResting ? "block" : "none";
        }
    };

    // Registrar eventos para el manual de cuidado y el cuarto de baño
    document.addEventListener("DOMContentLoaded", () => {

        const needsInfoModal = document.getElementById("needs-info-modal");
        const closeBtn = document.getElementById("close-needs-info");
        const confirmBtn = document.getElementById("btn-close-needs-info-confirm");

        // Abrir el manual de cuidado al presionar cualquiera de los estados en la cuadrícula del modal de stats
        const clickableNeedCards = document.querySelectorAll(".need-card-clickable");
        clickableNeedCards.forEach(card => {
            card.addEventListener("click", () => {
                if (needsInfoModal) {
                    needsInfoModal.classList.remove("hidden");
                    if (window.Sonidos) window.Sonidos.play("click");
                }
            });
        });

        // Abrir el manual de cuidado al presionar las barras del Centro de Cuidado
        const bathNeedClickables = document.querySelectorAll(".bath-need-clickable");
        bathNeedClickables.forEach(item => {
            item.addEventListener("click", () => {
                if (needsInfoModal) {
                    needsInfoModal.classList.remove("hidden");
                    if (window.Sonidos) window.Sonidos.play("click");
                }
            });
        });

        // Clic en el botón "i" al lado del título
        const btnBathroomInfo = document.getElementById("btn-bathroom-info");
        if (btnBathroomInfo) {
            btnBathroomInfo.addEventListener("click", () => {
                if (needsInfoModal) {
                    needsInfoModal.classList.remove("hidden");
                    if (window.Sonidos) window.Sonidos.play("click");
                }
            });
        }

        // --- GESTIÓN DEL MODAL DE INFORMACIÓN DE FELICIDAD ---
        const happinessInfoModal = document.getElementById("happiness-info-modal");
        const closeHappyBtn = document.getElementById("close-happiness-info");
        const confirmHappyBtn = document.getElementById("btn-close-happiness-info-confirm");
        const happinessTrigger = document.getElementById("bath-happiness-trigger");

        if (happinessTrigger && happinessInfoModal) {
            happinessTrigger.addEventListener("click", () => {
                happinessInfoModal.classList.remove("hidden");
                if (window.Sonidos) window.Sonidos.play("click");
            });
        }

        if (happinessInfoModal) {
            const cerrarHappyModal = (e) => {
                if (e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                }
                happinessInfoModal.classList.add("hidden");
                if (window.Sonidos) window.Sonidos.play("click");
            };
            if (closeHappyBtn) closeHappyBtn.addEventListener("click", cerrarHappyModal);
            if (confirmHappyBtn) confirmHappyBtn.addEventListener("click", cerrarHappyModal);
        }

        if (needsInfoModal) {
            const cerrarModal = (e) => {
                if (e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                }
                needsInfoModal.classList.add("hidden");
                if (window.Sonidos) window.Sonidos.play("click");
            };
            if (closeBtn) closeBtn.addEventListener("click", cerrarModal);
            if (confirmBtn) confirmBtn.addEventListener("click", cerrarModal);
        }

        // --- SISTEMA DE ARRASTRE DE HERRAMIENTAS Y FROTADO EN EL BAÑO ---
        const bathScreen = document.getElementById("bathroom-screen");
        const soapBtn = document.getElementById("btn-tool-soap");
        const showerBtn = document.getElementById("btn-tool-shower");
        const bathContainer = document.getElementById("geno-container-bathroom");

        // Crear dinámicamente el seguidor del cursor si no existe
        let follower = document.getElementById("tool-cursor-follower");
        if (!follower) {
            follower = document.createElement("div");
            follower.id = "tool-cursor-follower";
            follower.style.display = "none";
            document.body.appendChild(follower);
        }

        window.activeTool = null;

        const startDrag = (toolType, svgHtml, e) => {
            e.preventDefault();
            window.activeTool = toolType;
            follower.innerHTML = svgHtml;
            follower.style.display = "block";
            follower.style.position = "fixed";
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            follower.style.left = `${clientX}px`;
            follower.style.top = `${clientY}px`;
        };

        if (soapBtn && showerBtn) {
            soapBtn.addEventListener("mousedown", (e) => {
                const svg = soapBtn.querySelector("svg").outerHTML;
                startDrag("soap", svg, e);
            });
            soapBtn.addEventListener("touchstart", (e) => {
                const svg = soapBtn.querySelector("svg").outerHTML;
                startDrag("soap", svg, e);
            }, { passive: false });

            showerBtn.addEventListener("mousedown", (e) => {
                const svg = showerBtn.querySelector("svg").outerHTML;
                startDrag("shower", svg, e);
            });
            showerBtn.addEventListener("touchstart", (e) => {
                const svg = showerBtn.querySelector("svg").outerHTML;
                startDrag("shower", svg, e);
            }, { passive: false });
        }

        const handleMove = (e) => {
            if (!window.activeTool) return;
            e.preventDefault();

            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            follower.style.left = `${clientX}px`;
            follower.style.top = `${clientY}px`;

            if (!bathScreen || !bathContainer || !window.miMascota || window.miMascota.id === "temp") return;

            const rectBath = bathScreen.getBoundingClientRect();
            const rectContainer = bathContainer.getBoundingClientRect();

            // Verificar si el cursor está sobre la cápsula/Geno para aplicar efectos
            const isOverGeno = (
                clientX >= rectContainer.left &&
                clientX <= rectContainer.right &&
                clientY >= rectContainer.top &&
                clientY <= rectContainer.bottom
            );

            // Coordenadas relativas en la viewbox del SVG (-20 a 180, 0 a 160)
            const relX = ((clientX - rectContainer.left) / rectContainer.width) * 200 - 20;
            const relY = ((clientY - rectContainer.top) / rectContainer.height) * 160;

            if (window.activeTool === "soap") {
                // Spawn bubbles
                if (Math.random() < 0.4) {
                    const bubble = document.createElement("div");
                    bubble.className = "soap-bubble";
                    bubble.style.left = `${clientX - rectBath.left}px`;
                    bubble.style.top = `${clientY - rectBath.top}px`;
                    bubble.style.setProperty("--dx", `${-30 + Math.random() * 60}px`);
                    bubble.style.setProperty("--dy", `${-60 - Math.random() * 60}px`);
                    bathScreen.appendChild(bubble);
                    setTimeout(() => bubble.remove(), 800);
                }

                if (isOverGeno) {
                    // Resetear el tiempo de lavado de ducha al aplicar jabón
                    window.tiempoLavadoDucha = 0;
                    window.notificacionBanoMostrada = false;

                    if (!window.miMascota.soapySpots) window.miMascota.soapySpots = [];
                    
                    // Solo agregar espuma dentro de la bounding box del cuerpo
                    if (relX >= 30 && relX <= 130 && relY >= 35 && relY <= 135) {
                        const tooClose = window.miMascota.soapySpots.some(s => {
                            const dx = s.x - relX;
                            const dy = s.y - relY;
                            return Math.sqrt(dx * dx + dy * dy) < 15;
                        });

                        if (!tooClose && window.miMascota.soapySpots.length < 18) {
                            window.miMascota.soapySpots.push({ x: relX, y: relY, r: 10 + Math.random() * 6 });
                            
                            // Enjabonar manchas cercanas
                            if (window.miMascota.dirtSpots) {
                                window.miMascota.dirtSpots.forEach(ds => {
                                    const dx = ds.x - relX;
                                    const dy = ds.y - relY;
                                    if (Math.sqrt(dx * dx + dy * dy) < 25) {
                                        ds.scrubbed = Math.min(100, (ds.scrubbed || 0) + 20);
                                    }
                                });
                            }
                            window.actualizarGenoBaño();
                        }
                    }
                }
            } else if (window.activeTool === "shower") {
                // Spawn water streams
                if (Math.random() < 0.6) {
                    const water = document.createElement("div");
                    water.className = "water-stream";
                    water.style.left = `${clientX - rectBath.left}px`;
                    water.style.top = `${clientY - rectBath.top}px`;
                    water.style.setProperty("--dx", `${-15 + Math.random() * 30}px`);
                    water.style.setProperty("--dy", `${120 + Math.random() * 60}px`);
                    bathScreen.appendChild(water);
                    setTimeout(() => water.remove(), 600);
                }

                if (isOverGeno) {
                    let cleanedAny = false;

                    // Acumular tiempo de lavado de ducha activo sobre el Geno
                    const ahora = Date.now();
                    if (!window.ultimoRegistroDucha) {
                        window.ultimoRegistroDucha = ahora;
                    } else {
                        const diff = ahora - window.ultimoRegistroDucha;
                        if (diff > 0 && diff < 500) {
                            window.tiempoLavadoDucha = (window.tiempoLavadoDucha || 0) + diff;
                        }
                        window.ultimoRegistroDucha = ahora;
                    }

                    // Enjuagar espuma cercana
                    if (window.miMascota.soapySpots) {
                        const oldLength = window.miMascota.soapySpots.length;
                        window.miMascota.soapySpots = window.miMascota.soapySpots.filter(s => {
                            const dx = s.x - relX;
                            const dy = s.y - relY;
                            return Math.sqrt(dx * dx + dy * dy) > 28;
                        });
                        if (window.miMascota.soapySpots.length !== oldLength) cleanedAny = true;
                    }

                    // Enjuagar manchas enjabonadas cercanas
                    if (window.miMascota.dirtSpots && window.miMascota.dirtSpots.length > 0) {
                        const originalLength = window.miMascota.dirtSpots.length;
                        
                        window.miMascota.dirtSpots = window.miMascota.dirtSpots.filter(ds => {
                            const dx = ds.x - relX;
                            const dy = ds.y - relY;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            
                            // Si está cerca del chorro de agua y tiene suficiente jabón (scrubbed >= 60)
                            if (dist < 28 && (ds.scrubbed || 0) >= 60) {
                                return false; // Eliminar mancha
                            }
                            return true;
                        });

                        const cleanedCount = originalLength - window.miMascota.dirtSpots.length;
                        if (cleanedCount > 0) {
                            cleanedAny = true;
                            // Incrementar higiene (capado al 99% hasta terminar el enjuague de 8s)
                            window.miMascota.higiene = Math.min(99, (window.miMascota.higiene || 0) + (cleanedCount * 25));
                            
                            if (window.misGenos) {
                                const idx = window.misGenos.findIndex(g => String(g.id) === String(window.miMascota.id));
                                if (idx !== -1) {
                                    window.misGenos[idx].higiene = window.miMascota.higiene;
                                    window.misGenos[idx].dirtSpots = window.miMascota.dirtSpots;
                                }
                            }
                        }
                    }

                    // Actualizar el título de la herramienta en tiempo real
                    const labelTools = document.querySelector("#care-clean-tools span");
                    if (window.miMascota.dirtSpots && window.miMascota.dirtSpots.length === 0) {
                        if ((window.tiempoLavadoDucha || 0) < 8000) {
                            if (labelTools) {
                                const segsRestantes = Math.max(0, Math.ceil((8000 - window.tiempoLavadoDucha) / 1000));
                                labelTools.innerText = `🧼 ¡Casi listo! Enjuaga por ${segsRestantes}s más...`;
                            }
                        } else if (!window.notificacionBanoMostrada) {
                            window.notificacionBanoMostrada = true;
                            if (labelTools) labelTools.innerText = "Selecciona herramienta y arrastra sobre el Geno";

                            window.miMascota.higiene = 100;
                            if (window.misGenos) {
                                const idx = window.misGenos.findIndex(g => String(g.id) === String(window.miMascota.id));
                                if (idx !== -1) window.misGenos[idx].higiene = 100;
                            }

                            const hoy = new Date().toDateString();
                            if (!window.miMascota.registroAmistadDiaria) window.miMascota.registroAmistadDiaria = {};
                            
                            let gananciaExplicita = 0;
                            if (window.miMascota.registroAmistadDiaria.limpieza !== hoy) {
                                window.miMascota.registroAmistadDiaria.limpieza = hoy;
                                gananciaExplicita = Math.floor(Math.random() * 3) + 1;
                                window.miMascota.amistad = Math.min(100, (window.miMascota.amistad || 0) + gananciaExplicita);
                                if (window.misGenos) {
                                    const idx = window.misGenos.findIndex(g => String(g.id) === String(window.miMascota.id));
                                    if (idx !== -1) {
                                        window.misGenos[idx].amistad = window.miMascota.amistad;
                                        window.misGenos[idx].registroAmistadDiaria = window.miMascota.registroAmistadDiaria;
                                    }
                                }
                                alert(`🧼 ¡Has bañado por completo a ${window.miMascota.name}! Higiene al 100% y ¡Amistad +${gananciaExplicita}!`);
                            } else {
                                alert(`🧼 ¡Has bañado por completo a ${window.miMascota.name}! Higiene al 100%. (Amistad por limpieza ya obtenida hoy)`);
                            }

                            if (window.Sonidos) window.Sonidos.play("click");
                            const targetWrapper = bathContainer ? bathContainer.querySelector(".geno-float-wrapper") : null;
                            if (targetWrapper) {
                                 targetWrapper.classList.add("happy-jump");
                                 setTimeout(() => targetWrapper.classList.remove("happy-jump"), 500);
                            }

                            if (window.guardarProgreso) window.guardarProgreso();
                            cleanedAny = true;
                        }
                    } else {
                        if (labelTools) labelTools.innerText = "Rociando agua sobre el Geno...";
                    }

                    if (cleanedAny) {
                        window.actualizarGenoBaño();
                    }
                } else {
                    window.ultimoRegistroDucha = null;
                    const labelTools = document.querySelector("#care-clean-tools span");
                    if (labelTools && window.activeTool === "shower") {
                        labelTools.innerText = "Selecciona herramienta y arrastra sobre el Geno";
                    }
                }
            }
        };

        const stopDrag = () => {
            if (!window.activeTool) return;
            window.activeTool = null;
            follower.style.display = "none";
            window.ultimoRegistroDucha = null;
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("touchmove", handleMove, { passive: false });
        window.addEventListener("mouseup", stopDrag);
        window.addEventListener("touchend", stopDrag);

        // ========================================================
        // CENTRO DE CUIDADO: BOTONES DE ACCIÓN
        // ========================================================

        // --- Botón LIMPIAR: Toggle sub-panel de herramientas ---
        const btnCareClean = document.getElementById("btn-care-clean");
        const careCleanTools = document.getElementById("care-clean-tools");
        if (btnCareClean && careCleanTools) {
            btnCareClean.addEventListener("click", () => {
                careCleanTools.classList.toggle("hidden");
                if (window.Sonidos) window.Sonidos.play("click");
                // Resetear tiempos de lavado al abrir el panel
                if (!careCleanTools.classList.contains("hidden")) {
                    window.tiempoLavadoDucha = 0;
                    window.notificacionBanoMostrada = false;
                    const labelTools = document.querySelector("#care-clean-tools span");
                    if (labelTools) labelTools.innerText = "Selecciona herramienta y arrastra sobre el Geno";
                }
            });
        }

        // --- Botón ALIMENTAR: Consumir manzana del inventario ---
        const btnCareFeed = document.getElementById("btn-care-feed");
        if (btnCareFeed) {
            btnCareFeed.addEventListener("click", () => {
                if (!window.miMascota || window.miMascota.id === "temp") {
                    alert("No tienes un Geno activo.");
                    return;
                }
                if (window.miInventario && window.miInventario.consumeItem("apple_01", 1)) {
                    // Aplicar efecto de alimentación
                    window.miMascota.hambre = Math.min(100, (window.miMascota.hambre || 0) + 20);
                    // Sincronizar en misGenos
                    if (window.misGenos) {
                        const idx = window.misGenos.findIndex(g => String(g.id) === String(window.miMascota.id));
                        if (idx !== -1) window.misGenos[idx].hambre = window.miMascota.hambre;
                    }
                    // Animación happy-jump
                    const bathContainer = document.getElementById("geno-container-bathroom");
                    if (bathContainer) {
                        const targetWrapper = bathContainer.querySelector(".geno-float-wrapper");
                        const targetGeno = bathContainer.querySelector(".geno-idle");
                        if (targetWrapper && targetGeno) {
                            targetWrapper.classList.add("happy-jump");
                            targetGeno.classList.add("eating");
                            setTimeout(() => targetWrapper.classList.remove("happy-jump"), 500);
                            setTimeout(() => targetGeno.classList.remove("eating"), 1500);
                        }
                    }
                    // XP
                    const multiplicador = typeof window.getMultiplicadorXP === 'function' ? window.getMultiplicadorXP(window.miMascota) : 1.0;
                    if (window.ganarXP) window.ganarXP(Math.floor(15 * multiplicador));
                    if (window.Sonidos) window.Sonidos.play("click");
                    
                    // Actualizar barra y texto de hambre directamente en el DOM para evitar re-renderizar todo el SVG
                    const hambre = Math.floor(window.miMascota.hambre !== undefined ? window.miMascota.hambre : 100);
                    const hungerText = document.getElementById("bath-hunger-text");
                    const hungerFill = document.getElementById("bath-hunger-fill");
                    if (hungerText) hungerText.innerText = `${hambre}%`;
                    if (hungerFill) hungerFill.style.width = `${hambre}%`;

                    if (window.guardarLocalSilencioso) window.guardarLocalSilencioso();
                } else {
                    alert("No tienes manzanas en tu inventario. Compra en el Bazar.");
                }
            });
        }

        // --- Botón DESCANSAR: toggle ON/OFF — inicia recuperación progresiva de 4 horas ---
        const btnCareRest = document.getElementById("btn-care-rest");
        if (btnCareRest) {
            btnCareRest.addEventListener("click", () => {
                if (!window.miMascota || window.miMascota.id === "temp") {
                    alert("No tienes un Geno activo.");
                    return;
                }

                const geno  = window.miMascota;
                const ahora = typeof window.obtenerTiempoSeguro === 'function' ? window.obtenerTiempoSeguro() : Date.now();

                // ---- CANCELAR descanso activo ----
                if (geno.descansandoDesde) {
                    geno.descansandoDesde  = null;
                    geno.descansoCancelado = ahora;
                    // Sincronizar en misGenos
                    if (window.misGenos) {
                        const idx = window.misGenos.findIndex(g => String(g.id) === String(geno.id));
                        if (idx !== -1) {
                            window.misGenos[idx].descansandoDesde  = null;
                            window.misGenos[idx].descansoCancelado = ahora;
                        }
                    }
                    if (window.Sonidos) window.Sonidos.play("click");
                    window.actualizarBotonDescansar();
                    window.actualizarAnimacionDescanso();
                    if (window.guardarLocalSilencioso) window.guardarLocalSilencioso();
                    return;
                }

                // ---- Verificar cooldown de cancelación (2 horas) ----
                const msDescansoCancelado = geno.descansoCancelado || 0;
                const msRestanteCooldown  = Math.max(0, (2 * 60 * 60 * 1000) - (ahora - msDescansoCancelado));
                if (msRestanteCooldown > 0) {
                    const h = Math.floor(msRestanteCooldown / 3600000);
                    const m = Math.ceil((msRestanteCooldown % 3600000) / 60000);
                    alert(`Tu Geno necesita reposo. Cooldown restante: ${h > 0 ? h + 'h ' : ''}${m}m.`);
                    return;
                }
                // ---- Verificar si la resistencia ya está al 100% ----
                const resistencia = Math.floor(geno.resistencia !== undefined ? geno.resistencia : 100);
                if (resistencia >= 100) {
                    alert("La resistencia de tu Geno ya está al 100%. No necesita descansar.");
                    return;
                }

                // ---- ACTIVAR descanso ----
                geno.descansandoDesde  = ahora;
                geno.descansoCancelado = null;
                // Sincronizar en misGenos
                if (window.misGenos) {
                    const idx = window.misGenos.findIndex(g => String(g.id) === String(geno.id));
                    if (idx !== -1) {
                        window.misGenos[idx].descansandoDesde  = ahora;
                        window.misGenos[idx].descansoCancelado = null;
                    }
                }



                if (window.Sonidos) window.Sonidos.play("click");
                window.actualizarBotonDescansar();
                window.actualizarAnimacionDescanso();
                if (window.guardarProgreso) window.guardarProgreso();
            });
        }

        // Actualizar timer del botón Descansar cada 30 segundos
        setInterval(() => {
            if (typeof window.actualizarBotonDescansar === 'function') window.actualizarBotonDescansar();
        }, 30000);

        // --- GESTOS DE DESLIZAMIENTO HASTA EL BAÑO ---
        let swipeStartX = 0;
        let swipeStartY = 0;

        const mainSliderScreen = document.getElementById("main-slider-screen");
        if (mainSliderScreen) {
            const detectStart = (clientX, clientY, target) => {
                if (window.activeTool) return;
                // Ignorar el gesto si toca controles, pedestales, botones, etc.
                if (
                    target.closest("button") ||
                    target.closest(".drawer-item") ||
                    target.closest(".fab-btn") ||
                    target.closest("#geno-container") ||
                    target.closest("#geno-container-bathroom") ||
                    target.closest(".need-card-clickable") ||
                    target.closest(".tool-btn") ||
                    target.closest(".care-action-btn") ||
                    target.closest("#care-clean-tools")
                ) {
                    return;
                }
                swipeStartX = clientX;
                swipeStartY = clientY;
            };

            const detectEnd = (clientX, clientY) => {
                if (window.activeTool) return;
                const diffX = clientX - swipeStartX;
                const diffY = clientY - swipeStartY;

                // Solo cuenta si el movimiento es eminentemente horizontal y lo bastante largo
                if (Math.abs(diffX) > 80 && Math.abs(diffY) < 50) {
                    if (diffX < 0 && window.currentSlide === "room-area") {
                        // Desliza a la izquierda -> Entrar al baño
                        window.navegarA("bathroom-screen");
                    } else if (diffX > 0 && window.currentSlide === "bathroom-screen") {
                        // Desliza a la derecha -> Volver al laboratorio
                        window.navegarA("room-area");
                    }
                }
            };

            mainSliderScreen.addEventListener("touchstart", (e) => {
                const touch = e.touches[0];
                detectStart(touch.clientX, touch.clientY, e.target);
            }, { passive: true });

            mainSliderScreen.addEventListener("touchend", (e) => {
                const touch = e.changedTouches[0];
                detectEnd(touch.clientX, touch.clientY);
            }, { passive: true });

            mainSliderScreen.addEventListener("mousedown", (e) => {
                detectStart(e.clientX, e.clientY, e.target);
            });

            mainSliderScreen.addEventListener("mouseup", (e) => {
                detectEnd(e.clientX, e.clientY);
            });

            // Deslizar con flechas del teclado en PC
            document.addEventListener("keydown", (e) => {
                if (mainSliderScreen.classList.contains("hidden")) return;
                
                // Evitar deslizamientos si el usuario está escribiendo en algún campo de entrada
                if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
                
                // No deslizar si hay algún modal abierto
                const statsModal = document.getElementById("stats-modal-overlay");
                const coliseumHelp = document.getElementById("coliseum-help-modal");
                const needsInfo = document.getElementById("needs-info-modal");
                const energyInfo = document.getElementById("hud-energy-info-modal");
                const drawerMenu = document.getElementById("drawer-menu");

                const isModalOpen = (statsModal && !statsModal.classList.contains("hidden")) ||
                                    (coliseumHelp && !coliseumHelp.classList.contains("hidden")) ||
                                    (needsInfo && !needsInfo.classList.contains("hidden")) ||
                                    (energyInfo && !energyInfo.classList.contains("hidden")) ||
                                    (drawerMenu && !drawerMenu.classList.contains("hidden"));

                if (isModalOpen) return;

                if (e.key === "ArrowRight" && window.currentSlide === "room-area") {
                    window.navegarA("bathroom-screen");
                } else if (e.key === "ArrowLeft" && window.currentSlide === "bathroom-screen") {
                    window.navegarA("room-area");
                }
            });
        }
    });
})();