// =========================================
// ReactorManager.js - FUSIONES Y MUTACIONES (V14.8 - FIX LÍNEAS FINAS DE FONDO)
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    
    // ✨ INYECCIÓN DE ESTILOS: Fondo corregido con líneas de 1px
    const style = document.createElement('style');
    style.innerHTML = `
        /* 1. Fondo Cian con líneas horizontales finas (1px) y separadas (6px total) */
        #alchemy-screen {
            background-color: #4dd0e1 !important;
            background-image: repeating-linear-gradient(to bottom, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 6px) !important;
            height: 100vh !important;
            overflow-y: auto !important;
            padding: 20px !important;
            box-sizing: border-box !important;
        }

        /* 2. Caja Negra Central */
        #alchemy-screen .reactor-panel-wrapper {
            background: #1a2a36 !important;
            border: none !important;
            border-radius: 16px !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4) !important;
            padding: 25px 20px !important;
            margin-bottom: 20px !important;
        }

        /* Limpieza de contenedores internos heredados */
        #alchemy-screen .reactor-panel-wrapper > div {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
        }
        
        /* 3. Título Principal */
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
        
        /* 4. Descripción */
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

        /* Selector de Nivel */
        select#reactor-level-select {
            background: #0d1a24 !important;
            color: #4dd0e1 !important;
            border: 1px solid #111c24 !important;
            padding: 12px !important;
            border-radius: 8px !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            font-size: 11px !important;
            letter-spacing: 1px !important;
            outline: none;
            cursor: pointer;
            width: 100%;
            margin-bottom: 20px;
            text-align: center;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);
        }
        
        select#reactor-level-select option {
            background: #0d1a24;
            color: #4dd0e1;
        }

        /* Textos de Costo y Disponibles */
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

        /* Caja de genos para cargar */
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

        /* Botón de Acción Principal (El de adentro) */
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
        
        /* Botón Volver al Laboratorio Sólido y Sin Bordes */
        #alchemy-screen .btn-go-home {
            background: #0f172a !important; 
            color: #4dd0e1 !important;
            border: none !important; 
            border-radius: 12px !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            box-shadow: 0 6px 15px rgba(0,0,0,0.3) !important;
            padding: 18px !important;
            width: 100% !important;
            letter-spacing: 1px !important;
            text-align: center !important;
            display: block !important;
            margin-top: 0 !important;
            cursor: pointer !important;
        }
    `;
    document.head.appendChild(style);

    // ✨ DOM SCRIPT: Empaquetamos todo en una caja negra (panel)
    setTimeout(() => {
        const alchemyScreen = document.getElementById("alchemy-screen");
        if (alchemyScreen && !alchemyScreen.querySelector('.reactor-panel-wrapper')) {
            
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
            if (titleEl) {
                titleEl.innerText = "REACTOR GENÉTICO";
            }
        }
    }, 50);

    const reactorRules = {
        "1": { 
            reqRarity: "Común", cost: 100, probCrit: 3, probNorm: 35, probStag: 35, 
            resCrit: { rarity: "Épico", name: "Mutante Primordial", color: "#8A2BE2", shape: "estrella", element: "Sintético" },
            resNorm: { rarity: "Raro", name: "Geno Evolucionado", color: "#4169E1", shape: "frijol", element: "Cibernético" },
            resStag: { rarity: "Común", name: "Superviviente", color: "#32CD32", shape: "gota", element: "Biomutante" }
        },
        "2": { 
            reqRarity: "Raro", cost: 500, probCrit: 0.5, probNorm: 25, probStag: 35, 
            resCrit: { rarity: "Legendario", name: "Anomalía Leyenda", color: "#FFD700", shape: "estrella", element: "Radiactivo" },
            resNorm: { rarity: "Épico", name: "Geno Superior", color: "#8A2BE2", shape: "estrella", element: "Sintético" },
            resStag: { rarity: "Raro", name: "Veterano Raro", color: "#4169E1", shape: "frijol", element: "Cibernético" }
        },
        "3": { 
            reqRarity: "Épico", cost: 2500, probCrit: 0.1, probNorm: 5, probStag: 40, 
            resCrit: { rarity: "Mítico", name: "Dios Primigenio", color: "#ff4d4d", shape: "estrella", element: "Viral" },
            resNorm: { rarity: "Legendario", name: "Mito Viviente", color: "#FFD700", shape: "estrella", element: "Radiactivo" },
            resStag: { rarity: "Épico", name: "Titán Épico", color: "#8A2BE2", shape: "estrella", element: "Sintético" }
        }
    };

    const selectNivel = document.getElementById("reactor-level-select");
    window.genosEnReactor = []; 
    
    if(selectNivel) {
        selectNivel.addEventListener("change", () => {
            window.genosEnReactor = []; 
            window.renderizarAlquimia();
        });
    }

    const possibleInstructionTexts = document.querySelectorAll("#alchemy-screen p");
    possibleInstructionTexts.forEach(p => {
        if(p.innerText.toLowerCase().includes("toca un geno")) {
            p.classList.add("instruction-text");
        }
    });

    window.renderizarAlquimia = function() {
        if(!selectNivel) return;
        const nivel = selectNivel.value;
        const reglas = reactorRules[nivel];
        
        const descEl = document.getElementById("reactor-description");
        if(descEl) {
            descEl.innerText = `COMBINA 5 ESPECÍMENES (${reglas.reqRarity.toUpperCase()}S) PARA INICIAR LA SECUENCIA DE FUSIÓN. COSTE: ${reglas.cost} ✨`;
        }
        
        const reqNameEl = document.getElementById("reactor-req-name");
        if(reqNameEl) reqNameEl.innerText = reglas.reqRarity + "s";
        
        const costEl = document.getElementById("reactor-cost-display");
        if(costEl) costEl.innerText = reglas.cost + " ✨";

        const genosDisponibles = window.misGenos.filter(g => g.rarity === reglas.reqRarity && !g.isEgg && (!window.miMascota || window.miMascota.id !== g.id));
        
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
                    card.style = "min-width: 50px; height: 50px; background: #0d1a24; border: 1px solid #384a5e; border-radius: 10px; display: flex; justify-content: center; align-items: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: transform 0.1s;";
                    
                    const pColor = geno.color || geno.base_color || "#ccc";
                    let svg = typeof window.generarSvgGeno === 'function' ? window.generarSvgGeno(geno) : '';
                    svg = svg.replace(/<svg[^>]*>/, '<svg width="100%" height="100%" viewBox="-20 0 200 160" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">');
                    
                    card.innerHTML = `<div style="width: 40px; height: 40px; color: ${pColor}; display: flex; justify-content: center; align-items: center;">${svg}</div>`;
                    
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
                        const statsBase = window.generarStatsPorRareza ? window.generarStatsPorRareza(resultado.rarity) : { hp: 50, atk: 15, def: 10, spd: 15, luk: 15 };
                        
                        const nuevoId = typeof window.generarNuevoID === 'function' ? window.generarNuevoID() : Date.now();
                        const prefijos = ["Neo", "Bio", "Geno", "Cyto", "Viro", "Rad", "Syn", "Evo", "Nexo", "Mut"];
                        const sufijos = ["-X", "-Prime", "morph", "cyte", "tron", "plasm", "-7", "core", "gen", "-Z"];
                        const nombreAleatorio = prefijos[Math.floor(Math.random() * prefijos.length)] + sufijos[Math.floor(Math.random() * sufijos.length)];
                        
                        const mutante = {
                            id: nuevoId,
                            name: resultado.name !== "Titán Épico" && resultado.name !== "Veterano Raro" ? resultado.name : nombreAleatorio,
                            rarity: resultado.rarity,
                            element: resultado.element,
                            base_color: resultado.color, color: resultado.color,
                            body_shape: resultado.shape, eye_type: "estandar", mouth_type: "feliz",
                            wing_type: "ninguno", hat_type: "ninguno",
                            level: 1, xp: 0, xpNeeded: 100, breedCount: 0, generation: 0,
                            stats: statsBase,
                            hidden_genes: window.generarGenesV9 ? window.generarGenesV9(resultado.rarity) : {A:null, B:null, C:null},
                            scanned: false,
                            genes: {
                                cuerpo: { dom: resultado.shape, rec: resultado.shape },
                                ojos: { dom: "estandar", rec: "estandar" },
                                boca: { dom: "feliz", rec: "feliz" },
                                espalda: { dom: "ninguno", rec: "ninguno" },
                                cabeza: { dom: "ninguno", rec: "ninguno" },
                                afinidad: { dom: resultado.element, rec: resultado.element }
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
                        mensaje = `MUTACIÓN ESTANCADA ⚠️\nLa inestabilidad destruyó a 4, pero lograste recuperar 1 [Geno ${reglas.resStag.rarity}].`;
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