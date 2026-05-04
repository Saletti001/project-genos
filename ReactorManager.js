// =========================================
// ReactorManager.js - FUSIONES Y MUTACIONES (V15.14 - FIX LIMPIEZA DE UI)
// =========================================

// ✨ PARCHE GLOBAL INTELIGENTE: Ejecutamos un radar que busca la calculadora hasta atraparla
let intentosParche = 0;
const intervalParche = setInterval(() => {
    if (typeof window.calcularCalidad === "function" && !window.calcularCalidadParcheada) {
        const calcOriginal = window.calcularCalidad; 
        
        window.calcularCalidad = function(stats, rareza, nivel) {
            let rLimpia = rareza || "Común";
            let sClon = { ...stats }; 

            if (typeof rLimpia === "string" && rLimpia.includes("+")) {
                rLimpia = rLimpia.replace("+", ""); 
                if (sClon.hp !== undefined) {
                    sClon.hp = Math.round(sClon.hp / 1.15);
                    sClon.atk = Math.round(sClon.atk / 1.15);
                    sClon.def = Math.round(sClon.def / 1.15);
                    sClon.spd = Math.round(sClon.spd / 1.15);
                    sClon.luk = Math.round(sClon.luk / 1.15);
                }
            }
            return calcOriginal(sClon, rLimpia, nivel);
        };
        window.calcularCalidadParcheada = true;
        clearInterval(intervalParche); 
    }
    
    intentosParche++;
    if (intentosParche > 100) clearInterval(intervalParche); 
}, 100);

document.addEventListener("DOMContentLoaded", () => {
    
    // ✨ ESTILOS
    const style = document.createElement('style');
    style.innerHTML = `
        #alchemy-screen:not(.hidden) {
            background-color: #4dd0e1 !important;
            background-image: repeating-linear-gradient(to bottom, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 6px) !important;
            height: 100vh !important;
            overflow-y: auto !important;
            padding: 20px !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
        }

        #alchemy-screen .reactor-panel-wrapper {
            background: #1a2a36 !important;
            border: none !important;
            border-radius: 16px !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4) !important;
            padding: 25px 20px !important;
            margin-bottom: auto !important;
        }

        #alchemy-screen .reactor-panel-wrapper > div {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
        }
        
        #alchemy-screen h2 {
            color: #4dd0e1 !important;
            text-shadow: none !important;
            text-transform: uppercase !important;
            letter-spacing: 2px !important;
            margin: 0 0 15px 0 !important;
            font-weight: bold !important;
            text-align: center !important;
            font-size: 16px !important;
            border-bottom: 1px solid rgba(255,255,255,0.05) !important;
            padding-bottom: 15px !important;
        }
        
        #reactor-description {
            color: #888 !important;
            font-size: 10px !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            font-weight: bold !important;
            margin-bottom: 20px !important;
            text-align: center !important;
            line-height: 1.4 !important;
        }

        /* ✨ FIX MAESTRO DE INTERFAZ: Menú desplegable estilo videojuego sci-fi */
        .custom-select-wrapper { position: relative; width: 100%; margin-bottom: 20px; user-select: none; }
        .custom-select-trigger { background: #0d1a24 !important; color: #4dd0e1 !important; border: 1px solid #111c24 !important; padding: 15px !important; border-radius: 8px !important; font-weight: bold !important; text-transform: uppercase !important; font-size: 11px !important; letter-spacing: 1px !important; cursor: pointer; text-align: center; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3); display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; }
        .custom-select-trigger:hover { border-color: #4dd0e1 !important; box-shadow: 0 0 10px rgba(77,208,225,0.2), inset 0 2px 5px rgba(0,0,0,0.3); }
        .custom-select-trigger::after { content: '▼'; font-size: 10px; color: #4dd0e1; transition: transform 0.2s; }
        .custom-select-trigger.open::after { transform: rotate(180deg); }
        
        .custom-select-options { position: absolute; top: 100%; left: 0; width: 100%; background: #0d1a24; border: 1px solid #4dd0e1; border-radius: 8px; margin-top: 5px; box-shadow: 0 10px 25px rgba(0,0,0,0.7); z-index: 999; display: none; overflow: hidden; }
        .custom-select-options.open { display: block; animation: fadeInSelect 0.2s ease-in-out; }
        @keyframes fadeInSelect { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        
        .custom-option { padding: 15px; color: #4dd0e1; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; text-align: center; cursor: pointer; transition: all 0.2s; border-bottom: 1px dashed rgba(77,208,225,0.2); }
        .custom-option:last-child { border-bottom: none; }
        .custom-option:hover { background: #4dd0e1; color: #1a2a36; }
        .custom-option.selected { background: rgba(77,208,225,0.2); color: #fff; }

        #alchemy-screen p:has(span#alchemy-common-count),
        #alchemy-screen p:has(span#reactor-cost-display) {
            display: flex !important;
            justify-content: space-between !important;
            color: #fff !important;
            font-size: 11px !important;
            border-bottom: 1px dashed rgba(255,255,255,0.1) !important;
            padding-bottom: 10px !important;
            margin-bottom: 20px !important;
            font-weight: normal !important;
        }

        #reactor-available-genos {
            background: #0d1a24 !important; 
            border: none !important;
            border-radius: 12px !important;
            padding: 15px !important;
            min-height: 70px;
            display: flex;
            gap: 10px;
            overflow-x: auto;
            -ms-overflow-style: none; 
            scrollbar-width: none;
            box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);
        }
        #reactor-available-genos::-webkit-scrollbar { display: none; }
        
        #reactor-available-genos-container > p, p.instruction-text {
            color: #64748b !important;
            font-size: 10px !important;
            margin-bottom: 8px !important;
            text-align: left !important;
            text-transform: none !important;
            font-weight: normal !important;
        }

        #btn-fuse-genos {
            border-radius: 10px !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            padding: 15px !important;
            transition: all 0.3s ease !important;
            border: none !important;
            color: #fff !important;
            width: 100%;
            margin-top: 20px !important;
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        const alchemyScreen = document.getElementById("alchemy-screen");
        const breedingScreen = document.getElementById("breeding-screen");

        if (alchemyScreen) {
            if (!alchemyScreen.querySelector('.reactor-panel-wrapper')) {
                const wrapper = document.createElement("div");
                wrapper.className = "reactor-panel-wrapper";
                
                Array.from(alchemyScreen.children).forEach(child => {
                    if (!child.classList.contains('btn-go-home') && child !== wrapper) {
                        if(child.tagName === 'DIV') {
                            child.style.border = "none";
                            child.style.boxShadow = "none";
                            child.style.background = "transparent";
                            child.style.padding = "0";
                        }
                        wrapper.appendChild(child);
                    }
                });
                alchemyScreen.insertBefore(wrapper, alchemyScreen.firstChild);
                
                const titleEl = wrapper.querySelector("h2");
                if (titleEl) titleEl.innerText = "REACTOR GENÉTICO";
            }

            if (breedingScreen) {
                const btnCrianza = breedingScreen.querySelector('.btn-go-home');
                const btnReactor = alchemyScreen.querySelector('.btn-go-home');
                
                if (btnCrianza && btnReactor) {
                    btnReactor.className = btnCrianza.className;
                    btnReactor.style.cssText = btnCrianza.style.cssText;
                    if (btnCrianza.innerHTML !== btnReactor.innerHTML) {
                        btnReactor.innerHTML = btnCrianza.innerHTML;
                    }
                }
            }
        }
    }, 50);

    const reactorRules = {
        "1": { 
            reqRarity: "Común", cost: 100, probCrit: 3, probNorm: 35, probStag: 35, 
            resCrit: { rarity: "Épico" },
            resNorm: { rarity: "Raro" },
            resStag: { rarity: "Común+" }
        },
        "2": { 
            reqRarity: "Raro", cost: 500, probCrit: 0.5, probNorm: 25, probStag: 35, 
            resCrit: { rarity: "Legendario" },
            resNorm: { rarity: "Épico" },
            resStag: { rarity: "Raro+" }
        },
        "3": { 
            reqRarity: "Épico", cost: 2500, probCrit: 0.1, probNorm: 5, probStag: 40, 
            resCrit: { rarity: "Mítico" },
            resNorm: { rarity: "Legendario" },
            resStag: { rarity: "Épico+" }
        }
    };

    const selectNivel = document.getElementById("reactor-level-select");
    window.genosEnReactor = []; 
    
    if (selectNivel) {
        selectNivel.style.display = "none";
        
        if (!document.getElementById("custom-reactor-select")) {
            const wrapper = document.createElement("div");
            wrapper.className = "custom-select-wrapper";
            wrapper.id = "custom-reactor-select";

            const trigger = document.createElement("div");
            trigger.className = "custom-select-trigger";
            trigger.innerText = selectNivel.options[selectNivel.selectedIndex].text;

            const optionsContainer = document.createElement("div");
            optionsContainer.className = "custom-select-options";

            Array.from(selectNivel.options).forEach((opt, index) => {
                const customOpt = document.createElement("div");
                customOpt.className = "custom-option" + (opt.selected ? " selected" : "");
                customOpt.innerText = opt.text;
                
                customOpt.addEventListener("click", () => {
                    selectNivel.selectedIndex = index;
                    trigger.innerText = opt.text;
                    trigger.classList.remove("open");
                    optionsContainer.classList.remove("open");
                    
                    Array.from(optionsContainer.children).forEach(c => c.classList.remove("selected"));
                    customOpt.classList.add("selected");
                    
                    selectNivel.dispatchEvent(new Event("change"));
                });
                optionsContainer.appendChild(customOpt);
            });

            trigger.addEventListener("click", (e) => {
                e.stopPropagation();
                trigger.classList.toggle("open");
                optionsContainer.classList.toggle("open");
            });

            document.addEventListener("click", (e) => {
                if (!wrapper.contains(e.target)) {
                    trigger.classList.remove("open");
                    optionsContainer.classList.remove("open");
                }
            });

            wrapper.appendChild(trigger);
            wrapper.appendChild(optionsContainer);
            selectNivel.parentNode.insertBefore(wrapper, selectNivel.nextSibling);
        }

        selectNivel.addEventListener("change", () => {
            window.genosEnReactor = []; 
            window.renderizarAlquimia();
        });
    }

    const possibleInstructionTexts = document.querySelectorAll("#alchemy-screen p");
    possibleInstructionTexts.forEach(p => {
        if(p.innerText.toLowerCase().includes("toca un geno")) p.classList.add("instruction-text");
    });

    window.renderizarAlquimia = function() {
        if(!selectNivel) return;

        const nivel = selectNivel.value;
        const reglas = reactorRules[nivel];
        
        const descEl = document.getElementById("reactor-description");
        // ✨ FIX: Texto de descripción limpio, sin repetir el costo
        if(descEl) descEl.innerText = `COMBINA 5 ESPECÍMENES (${reglas.reqRarity.toUpperCase()}S) PARA INICIAR LA SECUENCIA DE FUSIÓN.`;
        
        const reqNameEl = document.getElementById("reactor-req-name");
        if(reqNameEl) reqNameEl.innerText = reglas.reqRarity + "s";
        
        const costEl = document.getElementById("reactor-cost-display");
        if(costEl) costEl.innerText = reglas.cost + " ✨";

        const genosDisponibles = window.misGenos.filter(g => 
            (g.rarity === reglas.reqRarity || g.rarity === reglas.reqRarity + "+") && 
            !g.isEgg && 
            (!window.miMascota || window.miMascota.id !== g.id)
        );
        
        const countEl = document.getElementById("alchemy-common-count");
        if(countEl) countEl.innerText = genosDisponibles.length;
        
        const containerSlots = document.getElementById("reactor-slots-container");
        if(containerSlots) {
            containerSlots.innerHTML = "";
            containerSlots.style.display = "flex";
            containerSlots.style.justifyContent = "center";
            containerSlots.style.gap = "15px";
            containerSlots.style.margin = "0 0 25px 0";
            
            for(let i=0; i<5; i++) {
                const slot = document.createElement("div");
                slot.style = "width: 55px; height: 55px; border-radius: 12px; display: flex; justify-content: center; align-items: center; cursor: pointer; position: relative; transition: all 0.2s;";
                
                if (window.genosEnReactor[i]) {
                    const geno = window.genosEnReactor[i];
                    const pColor = geno.color || geno.base_color || "#ccc";
                    let svg = typeof window.generarSvgGeno === 'function' ? window.generarSvgGeno(geno) : '';
                    svg = svg.replace(/<svg[^>]*>/, '<svg width="100%" height="100%" viewBox="-20 0 200 160" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">');
                    
                    slot.innerHTML = `<div style="width: 45px; height: 45px; color: ${pColor}; display: flex; justify-content: center; align-items: center;">${svg}</div>`;
                    slot.style.border = "1px solid #8A2BE2"; 
                    slot.style.background = "#0d1a24";
                    slot.style.boxShadow = "inset 0 0 10px rgba(138, 43, 226, 0.2)";
                    
                    slot.addEventListener("click", () => {
                        window.genosEnReactor.splice(i, 1);
                        window.renderizarAlquimia();
                    });
                } else {
                    slot.style.border = "1px dashed #4dd0e1";
                    slot.style.background = "transparent";
                    slot.innerHTML = '<span style="color: #4dd0e1; font-size: 24px; font-weight: 300;">+</span>';
                }
                containerSlots.appendChild(slot);
            }
        }

        const containerDisponibles = document.getElementById("reactor-available-genos");
        if(containerDisponibles) {
            containerDisponibles.innerHTML = "";
            const genosLibres = genosDisponibles.filter(g => !window.genosEnReactor.find(enR => enR.id === g.id));
            
            if (genosLibres.length === 0) {
                containerDisponibles.innerHTML = '<span style="color: #64748b; font-size: 11px; margin: auto; font-style: italic;">No hay sujetos en la base de datos.</span>';
            } else {
                genosLibres.forEach(geno => {
                    const card = document.createElement("div");
                    
                    card.style = "min-width: 55px; height: 55px; background: transparent; border: none; display: flex; justify-content: center; align-items: center; cursor: pointer; flex-shrink: 0; transition: transform 0.1s; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.4));";
                    
                    const pColor = geno.color || geno.base_color || "#ccc";
                    let svg = typeof window.generarSvgGeno === 'function' ? window.generarSvgGeno(geno) : '';
                    svg = svg.replace(/<svg[^>]*>/, '<svg width="100%" height="100%" viewBox="-20 0 200 160" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">');
                    
                    card.innerHTML = `<div style="width: 55px; height: 55px; color: ${pColor}; display: flex; justify-content: center; align-items: center;">${svg}</div>`;
                    
                    card.addEventListener("mousedown", () => card.style.transform = "scale(0.9)");
                    card.addEventListener("mouseup", () => card.style.transform = "scale(1)");
                    
                    card.addEventListener("click", () => {
                        if (window.genosEnReactor.length < 5) {
                            window.genosEnReactor.push(geno);
                            window.renderizarAlquimia();
                        }
                    });
                    containerDisponibles.appendChild(card);
                });
            }
        }

        const btnFuse = document.getElementById("btn-fuse-genos");
        if(btnFuse) {
            const tieneEsencia = window.miInventario && window.miInventario.vitalEssence >= reglas.cost;
            const estanLos5 = window.genosEnReactor.length === 5;
            btnFuse.disabled = !(estanLos5 && tieneEsencia);
            
            if(!btnFuse.disabled) {
                btnFuse.innerText = "INICIAR FUSIÓN";
                btnFuse.style.background = "linear-gradient(90deg, #4dd0e1, #8A2BE2)";
                btnFuse.style.color = "#1a2a36";
                btnFuse.style.opacity = "1";
                btnFuse.style.cursor = "pointer";
                btnFuse.style.boxShadow = "0 4px 15px rgba(138, 43, 226, 0.4)";
            } else {
                btnFuse.innerText = "INSERTA 5 MUESTRAS";
                btnFuse.style.background = "#2a323d"; 
                btnFuse.style.color = "#888";
                btnFuse.style.opacity = "0.8";
                btnFuse.style.cursor = "not-allowed";
                btnFuse.style.boxShadow = "none";
            }
        }
    }

    const btnFuseGenos = document.getElementById("btn-fuse-genos");
    if(btnFuseGenos) {
        btnFuseGenos.addEventListener("click", () => {
            const nivel = selectNivel.value;
            const reglas = reactorRules[nivel];
            
            if (window.genosEnReactor.length === 5 && window.miInventario && window.miInventario.vitalEssence >= reglas.cost) {
                const btnFuse = document.getElementById("btn-fuse-genos");
                const containerSlots = document.getElementById("reactor-slots-container");
                
                if(typeof window.miInventario.addEssence === 'function') {
                    window.miInventario.addEssence(-reglas.cost);
                } else {
                    window.miInventario.vitalEssence -= reglas.cost;
                    if(typeof window.miInventario.updateUI === 'function') window.miInventario.updateUI();
                }
                
                const idsABorrar = window.genosEnReactor.map(g => g.id);
                window.misGenos = window.misGenos.filter(g => !idsABorrar.includes(g.id));
                
                btnFuse.disabled = true;
                btnFuse.innerText = "SINTETIZANDO ADN...";
                btnFuse.style.background = "#8A2BE2";
                btnFuse.style.color = "#fff";
                btnFuse.style.cursor = "wait";
                
                let toggle = false;
                const animacionReactor = setInterval(() => {
                    toggle = !toggle;
                    containerSlots.style.transform = toggle ? "scale(1.05)" : "scale(0.95)";
                    containerSlots.style.filter = toggle ? "drop-shadow(0 0 15px #8A2BE2) brightness(1.3)" : "none";
                }, 150);

                setTimeout(() => {
                    clearInterval(animacionReactor);
                    containerSlots.style.transform = "scale(1)";
                    containerSlots.style.filter = "none";
                    
                    const tirada = Math.random() * 100;
                    let mensaje = "";
                    
                    const limiteCritico = reglas.probCrit;
                    const limiteNormal = limiteCritico + reglas.probNorm;
                    const limiteEstancada = limiteNormal + reglas.probStag;

                    const inyectarNuevoMutante = (resultado) => {
                        const baseRarity = resultado.rarity.replace("+", "");
                        let statsBase = window.generarStatsPorRareza ? window.generarStatsPorRareza(baseRarity) : { hp: 50, atk: 15, def: 10, spd: 15, luk: 15 };
                        
                        if (resultado.rarity.includes("+")) {
                            const tablaStats = window.TABLA_IVS || window.ESCALA_RAREZAS; 
                            const limites = tablaStats[baseRarity] || tablaStats["Común"];
                            
                            let tMin = limites.hp[0] + limites.atk[0] + (limites.def ? limites.def[0] : 0) + limites.spd[0] + limites.luk[0];
                            let tMax = limites.hp[1] + limites.atk[1] + (limites.def ? limites.def[1] : 0) + limites.spd[1] + limites.luk[1];
                            let tObt = statsBase.hp + statsBase.atk + (statsBase.def || 0) + statsBase.spd + statsBase.luk;

                            let pct = Math.round(((tObt - tMin) / (tMax - tMin)) * 100);
                            if (pct > 100) pct = 100;
                            if (pct < 0) pct = 0;

                            let rangoOriginal = "D";
                            if (pct >= 90) rangoOriginal = "S";      
                            else if (pct >= 75) rangoOriginal = "A"; 
                            else if (pct >= 50) rangoOriginal = "B";
                            else if (pct >= 25) rangoOriginal = "C";

                            statsBase.hp = Math.floor(statsBase.hp * 1.15);
                            statsBase.atk = Math.floor(statsBase.atk * 1.15);
                            if (statsBase.def) statsBase.def = Math.floor(statsBase.def * 1.15);
                            statsBase.spd = Math.floor(statsBase.spd * 1.15);
                            statsBase.luk = Math.floor(statsBase.luk * 1.15);
                            
                            statsBase.rango = rangoOriginal;
                            statsBase.calidadPorcentaje = pct;
                        }

                        const formasMutantes = ["gota", "frijol", "estrella"]; 
                        const elementosMutantes = ["Cibernético", "Biomutante", "Sintético", "Radiactivo", "Viral", "Tóxico"];
                        
                        const formaElegida = formasMutantes[Math.floor(Math.random() * formasMutantes.length)];
                        const elementoElegido = elementosMutantes[Math.floor(Math.random() * elementosMutantes.length)];
                        
                        const generarColorVibrante = () => {
                            const h = Math.floor(Math.random() * 360); 
                            const s = Math.floor(Math.random() * 40) + 60; 
                            const l = Math.floor(Math.random() * 30) + 55; 
                            
                            const l_dec = l / 100;
                            const a = (s / 100) * Math.min(l_dec, 1 - l_dec);
                            const f = n => {
                                const k = (n + h / 30) % 12;
                                const color = l_dec - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                                return Math.round(255 * color).toString(16).padStart(2, '0');
                            };
                            return `#${f(0)}${f(8)}${f(4)}`;
                        };

                        const randomColorHex = generarColorVibrante();

                        const todosLosOjos = typeof dicOjos !== 'undefined' ? Object.keys(dicOjos) : [
                            "mutacion_asimetrica", "ojos_cosidos", "vacio_oscuro", 
                            "agujeros_negros", "mosca_mutante", "error_fatal", 
                            "parasito_cerebral", "glitch_digital", "tres_ojos", "derpy_bizco"
                        ];
                        const todasLasBocas = typeof dicBocas !== 'undefined' ? Object.keys(dicBocas) : [
                            "depredador_carnivora", "grunido_colmillos", "boca_cosida", 
                            "fauces_toxicas", "sanguijuela_alien", "sonrisa_derretida", 
                            "mandibula_zombi", "fauces_multiples", "labios_grapados", "cremallera_cerrada"
                        ];
                        
                        const ojoElegido = todosLosOjos[Math.floor(Math.random() * todosLosOjos.length)];
                        const bocaElegida = todasLasBocas[Math.floor(Math.random() * todasLasBocas.length)];

                        const nuevoId = typeof window.generarNuevoID === 'function' ? window.generarNuevoID() : Date.now();
                        const prefijos = ["Neo", "Bio", "Geno", "Cyto", "Viro", "Rad", "Syn", "Evo", "Nexo", "Mut"];
                        const sufijos = ["-X", "-Prime", "morph", "cyte", "tron", "plasm", "-7", "core", "gen", "-Z"];
                        const nombreAleatorio = prefijos[Math.floor(Math.random() * prefijos.length)] + sufijos[Math.floor(Math.random() * sufijos.length)];

                        const mutante = {
                            id: nuevoId,
                            name: nombreAleatorio, 
                            rarity: resultado.rarity,
                            element: elementoElegido,
                            base_color: randomColorHex, color: randomColorHex,
                            body_shape: formaElegida, 
                            eye_type: ojoElegido, 
                            mouth_type: bocaElegida,
                            wing_type: "ninguno", hat_type: "ninguno",
                            level: 1, xp: 0, xpNeeded: 100, breedCount: 0, generation: 0,
                            stats: statsBase,
                            hidden_genes: window.generarGenesV9 ? window.generarGenesV9(baseRarity) : {A:null, B:null, C:null},
                            scanned: false,
                            genes: {
                                cuerpo: { dom: formaElegida, rec: formaElegida },
                                ojos: { dom: ojoElegido, rec: ojoElegido },
                                boca: { dom: bocaElegida, rec: bocaElegida },
                                espalda: { dom: "ninguno", rec: "ninguno" },
                                cabeza: { dom: "ninguno", rec: "ninguno" },
                                afinidad: { dom: elementoElegido, rec: elementoElegido }
                            }
                        };
                        window.misGenos.push(mutante);
                    };

                    if (tirada < limiteCritico) {
                        inyectarNuevoMutante(reglas.resCrit);
                        mensaje = `¡ÉXITO CRÍTICO! 🌟\nEl Reactor ha creado una anomalía: [Geno ${reglas.resCrit.rarity}].`;
                    } else if (tirada < limiteNormal) { 
                        inyectarNuevoMutante(reglas.resNorm);
                        mensaje = `¡FUSIÓN ESTABLE! ✨\nHas obtenido un [Geno ${reglas.resNorm.rarity}].`;
                    } else if (tirada < limiteEstancada) { 
                        inyectarNuevoMutante(reglas.resStag);
                        mensaje = `MUTACIÓN ESTANCADA ⚠️\nLa inestabilidad destruyó a 4, pero lograste recuperar 1 [Geno ${reglas.resStag.rarity}]. ¡Sus genes han mutado!`;
                    } else {
                        const compensacion = reglas.cost * 1.5; 
                        if(typeof window.miInventario.addEssence === 'function') {
                            window.miInventario.addEssence(compensacion);
                        } else {
                            window.miInventario.vitalEssence += compensacion;
                            if(typeof window.miInventario.updateUI === 'function') window.miInventario.updateUI();
                        }
                        mensaje = `¡COLAPSO DEL REACTOR! 💥\nLos 5 Genos se desintegraron. Recuperas ${compensacion} ✨ de los restos irradiados.`;
                    }

                    setTimeout(() => {
                        alert(mensaje);
                        window.genosEnReactor = []; 
                        window.renderizarAlquimia();
                        
                        if (typeof window.guardarJuego === 'function') window.guardarJuego();
                        else if (typeof window.guardarProgreso === 'function') window.guardarProgreso();
                        
                    }, 100);
                }, 2500);
            }
        });
    }
});