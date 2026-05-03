// =========================================
// BreedingManager.js - UI DEL CENTRO DE CRIANZA Y BIO-NÚCLEOS (V9.6 - FIX LÍMITE DE CAPACIDAD)
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    
    const style = document.createElement('style');
    style.innerHTML = `
        #incubator-grid::-webkit-scrollbar { display: none; }
        #incubator-grid { -ms-overflow-style: none; scrollbar-width: none; overflow-x: auto; }
        
        /* ✨ FIX ABSOLUTO: Centrado perfecto al 100% sin padding destructivo */
        #geno-id-card-modal:not(.hidden) {
            position: absolute !important;
            top: 0 !important; 
            left: 0 !important; 
            width: 100% !important; 
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 9999 !important;
            background: transparent !important; /* Sin oscurecer el fondo */
            box-sizing: border-box !important;
        }
        
        #geno-id-card-modal > div {
            width: 90% !important; /* Deja un 5% de margen natural a cada lado */
            max-width: 400px !important; 
            max-height: 85vh !important;
            overflow-y: auto !important; 
            -ms-overflow-style: none; 
            scrollbar-width: none;
            box-sizing: border-box !important;
            margin: 0 !important; /* Evita que márgenes heredados lo desvíen */
            position: relative;
        }
        
        /* Oculta la barra de scroll para mantener el estilo limpio */
        #geno-id-card-modal > div::-webkit-scrollbar { display: none; }
        
        #breeding-selector h3, 
        #geno-id-card-modal h2, 
        #geno-id-card-modal h3 {
            color: #80deea !important;
            text-shadow: none !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            font-weight: bold !important;
            margin: 0 !important;
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        const titulos = document.querySelectorAll("h1, h2, h3, h4, div, span");
        titulos.forEach(t => {
            if (t.innerText) {
                const textoLimpio = t.innerText.trim().toUpperCase();
                if (textoLimpio === "INCUBADORA TÉRMICA") t.innerText = "CÁMARA DE BIO-NÚCLEOS";
                if (textoLimpio === "ANÁLISIS GENÉTICO") {
                    t.style.setProperty("color", "#80deea", "important");
                    t.style.setProperty("text-shadow", "none", "important");
                }
            }
        });

        const targetTitle = document.querySelector("#breeding-selector h3");
        if (targetTitle) {
            targetTitle.innerText = "BASE DE DATOS GENÉTICA";
        }
    }, 500);

    let padre1 = null;
    let padre2 = null;
    let seleccionandoPara = 1; 

    const slot1 = document.getElementById("slot-parent-1");
    const slot2 = document.getElementById("slot-parent-2");
    const btnBreeding = document.getElementById("btn-start-breeding");
    const selectorContainer = document.getElementById("breeding-selector");
    const listContainer = document.getElementById("breeding-list");
    const closeSelectorBtn = document.getElementById("close-breeding-selector");
    const idCardModal = document.getElementById("geno-id-card-modal");
    const closeIdCardBtn = document.getElementById("close-id-card");

    let reqDiv = document.getElementById("breeding-requirements");
    if (!reqDiv && btnBreeding) {
        reqDiv = document.createElement("div");
        reqDiv.id = "breeding-requirements";
        reqDiv.style = "text-align: center; margin-bottom: 10px; font-size: 12px; font-weight: bold; color: #aaa; letter-spacing: 1px;";
        btnBreeding.parentNode.insertBefore(reqDiv, btnBreeding);
    }

    if(closeSelectorBtn) closeSelectorBtn.addEventListener("click", () => selectorContainer?.classList.add("hidden"));
    if(closeIdCardBtn) closeIdCardBtn.addEventListener("click", () => {
        idCardModal?.classList.add("hidden");
        selectorContainer?.classList.remove("hidden");
    });

    function actualizarPolUI() {
        const polText = document.getElementById("pol-amount");
        if(polText && window.miWallet) polText.innerText = `🔷 ${window.miWallet.pol.toFixed(1)} POL`;
        const essenceText = document.getElementById("vital-essence-amount");
        if(essenceText && window.miInventario) essenceText.innerText = `✨ ${window.miInventario.vitalEssence || 0}`;
    }

    function normalizarGenos() {
        if(!window.misGenos) window.misGenos = [];
        window.misGenos.forEach(g => {
            if(!g.level) g.level = 1;
            if(g.breedCount === undefined) g.breedCount = 0;
            if(g.generation === undefined) g.generation = 0;
            if(!g.stats) g.stats = { hp: 50, atk: 15, spd: 15, luk: 15 };
        });
        if(window.miMascota && window.miMascota.breedCount === undefined) window.miMascota.breedCount = 0;
    }

    window.iniciarSelectorCrianza = function() {
        padre1 = null; padre2 = null;
        actualizarSlots();
        selectorContainer?.classList.add("hidden");
        window.renderizarIncubadora(); 
        actualizarPolUI();
    }

    function actualizarSlots() {
        normalizarGenos();

        [slot1, slot2].forEach((slot, index) => {
            if(!slot) return;
            const padre = index === 0 ? padre1 : padre2;
            if (padre) {
                const pColor = padre.color || padre.visual_genes?.base_color || padre.base_color || "#ccc";
                
                slot.innerHTML = typeof generarSvgGeno === 'function' ? generarSvgGeno(padre) : '<span>Geno</span>';
                
                const svg = slot.querySelector("svg");
                if(svg) { svg.style.width = "50px"; svg.style.height = "50px"; svg.style.color = pColor; }
                slot.style.border = "2px solid #4dd0e1"; slot.style.background = "#1a2a36"; slot.style.boxShadow = "0 0 10px rgba(77, 208, 225, 0.4)";
            } else {
                slot.innerHTML = '<span style="color: #4dd0e1; font-size: 28px;">+</span>';
                slot.style.border = "2px dashed #4dd0e1"; slot.style.background = "#0d1a24"; slot.style.boxShadow = "none";
            }
        });

        if(btnBreeding) {
            btnBreeding.disabled = !(padre1 && padre2);
            if(!btnBreeding.disabled) {
                if (reqDiv) reqDiv.innerHTML = `COSTE: ✨ 500 Esencia Vital`;
                btnBreeding.innerText = "SINTETIZAR BIO-NÚCLEO";
                btnBreeding.style.background = "linear-gradient(90deg, #4dd0e1, #8A2BE2)";
                btnBreeding.style.opacity = "1"; btnBreeding.style.cursor = "pointer";
            } else {
                if (reqDiv) reqDiv.innerHTML = "";
                btnBreeding.innerText = "INSERTA MUESTRAS";
                btnBreeding.style.background = "#333"; btnBreeding.style.opacity = "0.5"; btnBreeding.style.cursor = "not-allowed";
            }
        }
    }

    function mostrarTarjetaGeno(g) {
        if(!idCardModal) return;
        if(selectorContainer) selectorContainer.classList.add("hidden");

        const pColor = g.color || g.visual_genes?.base_color || g.base_color || "#ccc";

        const svgContainer = document.getElementById("id-card-svg");
        if(svgContainer) {
            svgContainer.innerHTML = typeof generarSvgGeno === 'function' ? generarSvgGeno(g) : '';
            const svg = svgContainer.querySelector("svg");
            if(svg) { svg.style.width = "90px"; svg.style.height = "90px"; svg.style.color = pColor; }
        }

        const nameNode = document.getElementById("id-card-name");
        if(nameNode) nameNode.innerText = g.name || `Sujeto`;
        
        if (g.id && String(g.id).length > 10 && typeof window.generarNuevoID === 'function') {
            g.id = window.generarNuevoID();
        }

        let oldIdEl = document.getElementById("id-card-serial");
        if (oldIdEl) oldIdEl.remove();
        let oldLvlEl = document.getElementById("id-card-level");
        if (oldLvlEl) oldLvlEl.style.display = "none";

        let lvlBadge = document.getElementById("id-card-lvl-badge");
        if (!lvlBadge) {
            lvlBadge = document.createElement("div");
            lvlBadge.id = "id-card-lvl-badge";
            lvlBadge.style = "color: #00d2ff; font-weight: bold; font-size: 16px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px; text-align: center; width: 100%;";
            nameNode.parentNode.insertBefore(lvlBadge, nameNode.nextSibling);
        }
        lvlBadge.innerText = `NV. ${g.level || 1}`;

        let containerElementoID = document.getElementById("id-card-emblema-container");
        if (!containerElementoID) {
            containerElementoID = document.createElement("div");
            containerElementoID.id = "id-card-emblema-container";
            containerElementoID.style = "display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 5px; margin-bottom: 10px;";
            lvlBadge.parentNode.insertBefore(containerElementoID, lvlBadge.nextSibling);
        }

        const elementoActual = (g.genes && g.genes.afinidad) ? g.genes.afinidad.dom : (g.element || "Normal");
        let iconoElemento = typeof window.getIconoElemento === 'function' ? window.getIconoElemento(elementoActual) : '';
        iconoElemento = iconoElemento.replace('margin-right: 6px;', 'margin-right: 0;'); 

        containerElementoID.innerHTML = `
            <div style="font-size: 55px; margin-bottom: 5px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8));">
                ${iconoElemento}
            </div>
            <div style="font-size: 10px; color: #888; font-family: monospace; letter-spacing: 1px;">ID: #${g.id}</div>
        `;

        document.getElementById("id-card-rarity").innerText = g.rarity || "Común";
        
        const nombreElementoLimpio = elementoActual.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').trim();
        document.getElementById("id-card-element").innerHTML = `<span style="font-weight: bold; color: #fff;">${nombreElementoLimpio}</span>`;
        
        const maxCrias = typeof window.getMaxCrias === 'function' ? window.getMaxCrias(g) : 7;
        const criasEl = document.getElementById("id-card-breeds");
        if(criasEl) criasEl.innerText = `${maxCrias - (g.breedCount || 0)} de ${maxCrias}`;

        if (!g.baseStats) {
            g.baseStats = {
                hp: g.stats?.hp || 50, atk: g.stats?.atk || 15, def: g.stats?.def || 10, spd: g.stats?.spd || 15, luk: g.stats?.luk || 15
            };
        }

        let hpEl = document.getElementById("id-card-hp");
        if(hpEl) {
            let statsContainer = hpEl.closest('div[style*="grid"]') || hpEl.parentElement.parentElement;
            if(statsContainer) {
                statsContainer.style.display = "flex";
                statsContainer.style.flexDirection = "column";
                statsContainer.style.gap = "0";
                statsContainer.style.gridTemplateColumns = "none";

                const buildStatRow = (icon, label, key) => {
                    const baseVal = Math.floor(g.baseStats[key] !== undefined ? g.baseStats[key] : (g.stats?.[key] || 0));
                    const totalVal = Math.floor(g.stats?.[key] || 0);
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

                statsContainer.innerHTML = `
                    ${buildStatRow("❤️", "Vit", "hp")}
                    ${buildStatRow("⚔️", "Fue", "atk")}
                    ${buildStatRow("🛡️", "Def", "def")}
                    ${buildStatRow("⚡", "Agi", "spd")}
                    ${buildStatRow("🍀", "Sue", "luk")}
                `;
            }
        }

        const qualityEl = document.getElementById("id-card-quality");
        if(qualityEl && window.calcularCalidad && window.obtenerColorRango) {
            const statsActualizadas = window.calcularCalidad(g.stats, g.rarity || "Común", g.level || 1);
            const color = window.obtenerColorRango(statsActualizadas.rango);

            qualityEl.innerText = `${statsActualizadas.rango} (${statsActualizadas.calidadPorcentaje}%)`;
            qualityEl.style.color = color;
            qualityEl.style.textShadow = statsActualizadas.rango === "S" ? "0 0 10px rgba(255, 204, 0, 0.8)" : "none";
        }

        const secretGeneContainer = document.getElementById("id-card-secret-gene");

        if (secretGeneContainer) {
            secretGeneContainer.style.display = "flex";
            secretGeneContainer.style.flexDirection = "column";
            secretGeneContainer.style.alignItems = "stretch";
            secretGeneContainer.style.gap = "6px";
            secretGeneContainer.style.marginTop = "15px";
            secretGeneContainer.style.padding = "15px";
            secretGeneContainer.style.border = "1px dashed rgba(138, 43, 226, 0.5)";
            secretGeneContainer.style.borderRadius = "8px";
            secretGeneContainer.style.background = "rgba(138, 43, 226, 0.1)";

            if (g.scanned) {
                const hg = g.hidden_genes || { A: null, B: null, C: null };
                const buildSlot = (slotLabel, geneData, colorBox) => {
                    if (!geneData) return `<div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; font-size: 11px; color: #555; border-left: 3px solid #333; display: flex; justify-content: space-between; align-items: center;"><span>${slotLabel}</span> <span style="font-size:10px; font-style:italic;">Vacío</span></div>`;
                    return `
                        <div style="background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 6px; font-size: 11px; color: #fff; border-left: 3px solid ${colorBox}; display: flex; flex-direction: column; gap: 4px; text-align: left;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: ${colorBox}; font-weight: bold; font-size: 10px; text-transform: uppercase;">${slotLabel}</span>
                                <span style="font-weight: bold;">${geneData.name}</span>
                            </div>
                            <div style="color: #aaa; font-size: 10px; line-height: 1.3;">${geneData.desc}</div>
                        </div>
                    `;
                };

                let htmlEstructura = `
                    <div style="font-size: 11px; color: #e0b0ff; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; letter-spacing: 1px; text-align: center;">Estructura Genética</div>
                    ${buildSlot("Gen A (Cosmético)", hg.A, "#ffcc00")}
                    ${buildSlot("Gen B (Funcional)", hg.B, "#80deea")}
                    ${buildSlot("Gen C (Funcional)", hg.C, "#8A2BE2")}
                `;

                if (g.scanned_full && g.genes) {
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
                        ${buildDRSlotCompact("FORMA", g.genes.cuerpo)}
                        ${buildDRSlotCompact("AFINIDAD", g.genes.afinidad)}
                        ${buildDRSlotCompact("OJOS", g.genes.ojos)}
                        ${buildDRSlotCompact("BOCA", g.genes.boca)}
                    `;
                }

                secretGeneContainer.innerHTML = htmlEstructura;

            } else {
                secretGeneContainer.innerHTML = `
                    <div style="font-size: 11px; color: #e0b0ff; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; letter-spacing: 1px; text-align: center;">Estructura Genética</div>
                    <div style="color: #aaa; font-size: 12px; margin-bottom: 10px; text-align: center;">🔒 ADN Bloqueado</div>
                    <button id="btn-id-scan" style="background: linear-gradient(90deg, #8A2BE2, #00d2ff); color: white; border: none; padding: 10px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer; text-transform: uppercase; width: 100%; box-shadow: 0 4px 10px rgba(138, 43, 226, 0.3);">Revelar Genes (🧬 Escáner)</button>
                `;
                
                const newBtn = document.getElementById("btn-id-scan");
                if (newBtn) {
                    newBtn.addEventListener("click", () => {
                        let tipoEscanerConsumido = null;
                        
                        if (window.miInventario && window.miInventario.consumeItem("escaner_completo", 1)) {
                            tipoEscanerConsumido = "completo";
                        } else if (window.miInventario && (window.miInventario.consumeItem("escaner_basico", 1) || window.miInventario.consumeItem("dna_scanner", 1))) {
                            tipoEscanerConsumido = "basico";
                        }

                        if (tipoEscanerConsumido) {
                            
                            if (!g.hidden_genes || !g.hidden_genes.hasOwnProperty('A')) {
                                g.hidden_genes = window.generarGenesV9(g.rarity);
                            }

                            g.scanned = true; 
                            if (tipoEscanerConsumido === "completo") {
                                g.scanned_full = true;
                            }
                            
                            if (window.miMascota && String(window.miMascota.id) === String(g.id)) {
                                if (typeof window.verificarUmbralDespertar === 'function') window.verificarUmbralDespertar(g);
                                if (typeof window.actualizarPanelRPG === 'function') window.actualizarPanelRPG();
                            }

                            if(window.guardarJuego) window.guardarJuego();
                            
                            newBtn.innerText = "ESCANEANDO..."; 
                            newBtn.style.background = "#fff"; 
                            newBtn.style.color = "#000";
                            setTimeout(() => mostrarTarjetaGeno(g), 800);
                        } else { 
                            alert("No tienes ningún escáner en tu mochila. Consíguelos en Suministros."); 
                        }
                    });
                }
            }
        }
        idCardModal.classList.remove("hidden");
    }

    function abrirSelector(numPadre) {
        seleccionandoPara = numPadre;
        if(selectorContainer) selectorContainer.classList.remove("hidden");
        if(listContainer) { listContainer.innerHTML = ""; listContainer.style.display = "flex"; listContainer.style.flexDirection = "column"; listContainer.style.gap = "12px"; }

        const todosMisGenos = [];
        
        if (window.misGenos) {
            const idMascotaActual = window.miMascota ? String(window.miMascota.id) : null;
            
            if (window.miMascota && window.miMascota.id && window.miMascota.id !== "temp" && !window.miMascota.isEgg) {
                todosMisGenos.push(window.miMascota);
            }
            
            const otros = window.misGenos.filter(g => String(g.id) !== idMascotaActual && !g.isEgg);
            todosMisGenos.push(...otros);
        }

        if (todosMisGenos.length === 0) {
            if(listContainer) listContainer.innerHTML = '<div style="font-size: 12px; color: #ef4444; width:100%; text-align:center; padding: 20px;">La base de datos está vacía.</div>';
            return;
        }

        todosMisGenos.forEach(geno => {
            const yaSeleccionado = (padre1 && String(padre1.id) === String(geno.id)) || (padre2 && String(padre2.id) === String(geno.id));
            
            const maxCrias = typeof window.getMaxCrias === 'function' ? window.getMaxCrias(geno) : 7;
            const cumpleRequisitos = ((geno.breedCount || 0) < maxCrias) && !yaSeleccionado;

            const btn = document.createElement("div");
            let styleStr = "padding: 12px; border-radius: 14px; display: flex; align-items: center; text-align: left; box-shadow: 0 4px 10px rgba(0,0,0,0.4); transition: 0.2s;";
            if(cumpleRequisitos) {
                styleStr += " border: 1px solid #4dd0e1; background: #1a2a36; cursor: pointer;";
                btn.onmouseover = () => btn.style.boxShadow = "0 0 20px rgba(77, 208, 225, 0.4)";
                btn.onmouseout = () => btn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.4)";
            } else { styleStr += " border: 1px solid #555; background: #0a1118; opacity: 0.6; cursor: not-allowed;"; }
            btn.style = styleStr;

            const pColor = geno.color || geno.visual_genes?.base_color || geno.base_color || "#ccc";
            const pShape = (geno.genes && geno.genes.cuerpo) ? geno.genes.cuerpo.dom : (geno.shape || geno.visual_genes?.body_shape || geno.body_shape || "gota");
            
            let svgContent = typeof generarSvgGeno === 'function' ? generarSvgGeno(geno) : '<span>Geno</span>';

            let statusText = `<span style="color: #00d2ff; font-weight: bold; font-size: 11px;">${maxCrias - (geno.breedCount||0)} secuencias disponibles</span>`;
            if(yaSeleccionado) statusText = `<span style="color: #f0ad4e; font-weight: bold; font-size: 11px;">⚠️ Ya está seleccionado</span>`;
            else if((geno.breedCount||0) >= maxCrias) statusText = `<span style="color: #d9534f; font-weight: bold; font-size: 11px;">🔒 Límite de síntesis</span>`;

            if (geno.id && String(geno.id).length > 10 && typeof window.generarNuevoID === 'function') {
                geno.id = window.generarNuevoID();
            }

            btn.innerHTML = `
                <div style="width: 75px; height: 75px; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.4); border-radius: 10px; border: 1px solid #333; flex-shrink: 0; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); color: ${pColor};">${svgContent}</div>
                <div style="display: flex; flex-direction: column; justify-content: center; flex-grow: 1; padding-left: 15px; overflow: hidden;">
                    <span style="color: #fff; font-weight: 900; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px;">${geno.name || 'Sujeto'} <span style="color: #00d2ff; font-size: 11px;">Nv.${geno.level || 1}</span></span>
                    
                    <div style="color: #aaa; font-size: 10px; margin-bottom: 6px; text-transform: uppercase; display: flex; flex-wrap: wrap; gap: 4px; align-items: center;">
                        <span>Base: ${pShape}</span>
                        <span style="color:#555;">|</span>
                        <span style="color: #888;">ID: #${geno.id}</span>
                    </div>

                    ${statusText}
                </div>
                <button class="btn-info-geno" style="background: rgba(77, 208, 225, 0.1); border: 1px solid #4dd0e1; color: #fff; width: 45px; height: 45px; border-radius: 8px; font-size: 22px; cursor: pointer; flex-shrink: 0; display: flex; justify-content: center; align-items: center; margin-left: 10px; transition: 0.2s; box-shadow: inset 0 0 5px rgba(77, 208, 225, 0.3);" title="Análisis Genético">🔬</button>
            `;

            const svg = btn.querySelector("svg"); if(svg) { svg.style.width = "65px"; svg.style.height = "65px"; } 

            const infoBtn = btn.querySelector('.btn-info-geno');
            if(infoBtn) { infoBtn.addEventListener("click", (e) => { e.stopPropagation(); mostrarTarjetaGeno(geno); }); }

            if(cumpleRequisitos) {
                btn.addEventListener("click", () => {
                    if(seleccionandoPara === 1) padre1 = geno;
                    if(seleccionandoPara === 2) padre2 = geno;
                    if(selectorContainer) selectorContainer.classList.add("hidden");
                    actualizarSlots();
                });
            }
            if(listContainer) listContainer.appendChild(btn);
        });
    }

    if(slot1) slot1.addEventListener("click", () => abrirSelector(1));
    if(slot2) slot2.addEventListener("click", () => abrirSelector(2));

    if(btnBreeding) {
        btnBreeding.addEventListener("click", () => {
            if(!padre1 || !padre2) return;
            
            if (window.miInventario) {
                const slotsCount = window.miInventario.slots ? window.miInventario.slots.length : 0;
                const maxSlots = window.miInventario.maxSlots || 10;
                const overflowMax = maxSlots + 2;
                
                if (slotsCount >= overflowMax) {
                    alert("🎒 ¡Almacén y Espacios de Emergencia LLENOS!\nNo tienes espacio para sintetizar. Libera espacio destruyendo ítems menos valiosos.");
                    return;
                } else if (slotsCount >= maxSlots) {
                    alert("⚠️ Advertencia: Tu Almacén principal está lleno.\nEl Bio-Núcleo se guardará en un espacio de emergencia temporal (24h).");
                }
            }
            
            let esenciaActual = (window.miInventario && typeof window.miInventario.vitalEssence !== 'undefined') ? window.miInventario.vitalEssence : 9999; 
            if (esenciaActual < 500) { alert("⚠️ No tienes suficiente Esencia Vital (✨ 500)."); return; }
            
            if(window.miInventario && typeof window.miInventario.addEssence === 'function') { window.miInventario.addEssence(-500); }
            actualizarPolUI();
            
            padre1.breedCount = (padre1.breedCount || 0) + 1; padre2.breedCount = (padre2.breedCount || 0) + 1;
            btnBreeding.disabled = true; btnBreeding.innerText = "SINTETIZANDO..."; btnBreeding.style.background = "#8A2BE2"; btnBreeding.style.cursor = "wait";
            if (reqDiv) reqDiv.innerHTML = "Creando Bio-Núcleo...";
            
            let toggle = false;
            const anim = setInterval(() => {
                toggle = !toggle;
                slot1.style.transform = toggle ? "scale(1.05)" : "scale(0.98)"; 
                slot2.style.transform = !toggle ? "scale(1.05)" : "scale(0.98)";
                slot1.style.borderColor = toggle ? "#8b5cf6" : "#4dd0e1"; 
                slot2.style.borderColor = !toggle ? "#8b5cf6" : "#4dd0e1";
            }, 400);

            setTimeout(() => {
                clearInterval(anim);
                slot1.style.transform = "scale(1)"; slot2.style.transform = "scale(1)";
                slot1.style.borderColor = "#4dd0e1"; slot2.style.borderColor = "#4dd0e1";

                const genHijo = Math.max(padre1.generation || 0, padre2.generation || 0) + 1;
                const p1Genes = padre1.genes || { cuerpo: {dom: padre1.body_shape||"gota", rec: padre1.body_shape||"gota"}, ojos: {dom: padre1.eye_type||"estandar", rec: padre1.eye_type||"estandar"}, boca: {dom: padre1.mouth_type||"feliz", rec: padre1.mouth_type||"feliz"}, espalda: {dom: padre1.wing_type||"ninguno", rec: padre1.wing_type||"ninguno"}, cabeza: {dom: padre1.hat_type||"ninguno", rec: padre1.hat_type||"ninguno"}, afinidad: {dom: padre1.element||"Normal", rec: padre1.element||"Normal"} };
                const p2Genes = padre2.genes || { cuerpo: {dom: padre2.body_shape||"gota", rec: padre2.body_shape||"gota"}, ojos: {dom: padre2.eye_type||"estandar", rec: padre2.eye_type||"estandar"}, boca: {dom: padre2.mouth_type||"feliz", rec: padre2.mouth_type||"feliz"}, espalda: {dom: padre2.wing_type||"ninguno", rec: padre2.wing_type||"ninguno"}, cabeza: {dom: padre2.hat_type||"ninguno", rec: padre2.hat_type||"ninguno"}, afinidad: {dom: padre2.element||"Normal", rec: padre2.element||"Normal"} };
                
                const genesHijo = {
                    cuerpo: window.cruzarRasgo(p1Genes.cuerpo, p2Genes.cuerpo, "gota"),
                    ojos: window.cruzarRasgo(p1Genes.ojos, p2Genes.ojos, "estandar"),
                    boca: window.cruzarRasgo(p1Genes.boca, p2Genes.boca, "feliz"),
                    espalda: window.cruzarRasgo(p1Genes.espalda, p2Genes.espalda, "ninguno"),
                    cabeza: window.cruzarRasgo(p1Genes.cabeza, p2Genes.cabeza, "ninguno"),
                    afinidad: window.cruzarRasgo(p1Genes.afinidad, p2Genes.afinidad, "Normal")
                };

                const varianza = (stat1, stat2) => {
                    const base = (stat1 + stat2) / 2;
                    const r = Math.random();
                    let multiplicador;
                    
                    if (r < 0.60) {
                        multiplicador = 0.85 + (Math.random() * 0.13);
                    } else if (r < 0.90) {
                        multiplicador = 0.98 + (Math.random() * 0.04);
                    } else {
                        multiplicador = 1.02 + (Math.random() * 0.08);
                    }
                    
                    return Math.floor(base * multiplicador);
                };

                const statsHijo = {
                    hp: typeof window.heredarStat === 'function' ? window.heredarStat(padre1.stats?.hp || 50, padre2.stats?.hp || 50) : varianza(padre1.stats?.hp || 50, padre2.stats?.hp || 50),
                    atk: typeof window.heredarStat === 'function' ? window.heredarStat(padre1.stats?.atk || 15, padre2.stats?.atk || 15) : varianza(padre1.stats?.atk || 15, padre2.stats?.atk || 15),
                    spd: typeof window.heredarStat === 'function' ? window.heredarStat(padre1.stats?.spd || 15, padre2.stats?.spd || 15) : varianza(padre1.stats?.spd || 15, padre2.stats?.spd || 15),
                    luk: typeof window.heredarStat === 'function' ? window.heredarStat(padre1.stats?.luk || 15, padre2.stats?.luk || 15) : varianza(padre1.stats?.luk || 15, padre2.stats?.luk || 15)
                };

                let totalStats = statsHijo.hp + statsHijo.atk + statsHijo.spd + statsHijo.luk;
                let rarezaHijo = "Común";
                
                if (window.TABLA_IVS) {
                    const reqMitico = (window.TABLA_IVS["Mítico"].hp[0] + window.TABLA_IVS["Mítico"].atk[0] + window.TABLA_IVS["Mítico"].spd[0] + window.TABLA_IVS["Mítico"].luk[0]) * 0.8;
                    const reqLegend = (window.TABLA_IVS["Legendario"].hp[0] + window.TABLA_IVS["Legendario"].atk[0] + window.TABLA_IVS["Legendario"].spd[0] + window.TABLA_IVS["Legendario"].luk[0]) * 0.8;
                    const reqEpico = (window.TABLA_IVS["Épico"].hp[0] + window.TABLA_IVS["Épico"].atk[0] + window.TABLA_IVS["Épico"].spd[0] + window.TABLA_IVS["Épico"].luk[0]) * 0.8;
                    const reqRaro = (window.TABLA_IVS["Raro"].hp[0] + window.TABLA_IVS["Raro"].atk[0] + window.TABLA_IVS["Raro"].spd[0] + window.TABLA_IVS["Raro"].luk[0]) * 0.8;
                    
                    if (totalStats >= reqMitico) rarezaHijo = "Mítico";
                    else if (totalStats >= reqLegend) rarezaHijo = "Legendario";
                    else if (totalStats >= reqEpico) rarezaHijo = "Épico";
                    else if (totalStats >= reqRaro) rarezaHijo = "Raro";
                }

                const tieneDominanciaP1 = window.tieneGenActivoV9 && window.tieneGenActivoV9(padre1, "dominancia_genetica");
                const tieneDominanciaP2 = window.tieneGenActivoV9 && window.tieneGenActivoV9(padre2, "dominancia_genetica");

                const intentarHeredarSlot = (slotKey) => {
                    let g1 = padre1.hidden_genes ? padre1.hidden_genes[slotKey] : null;
                    let g2 = padre2.hidden_genes ? padre2.hidden_genes[slotKey] : null;

                    let probP1 = tieneDominanciaP1 ? 0.70 : 0.30;
                    let probP2 = tieneDominanciaP2 ? 0.70 : 0.30;

                    if (g1 && g2 && g1.id === g2.id) {
                        if (Math.random() <= 0.75) return g1;
                    }
                    else if (g1 && g2) {
                        let rnd = Math.random();
                        let totalProb = probP1 + probP2; 
                        let chance1 = probP1 / totalProb;
                        
                        if (Math.random() <= Math.max(probP1, probP2)) {
                            return (rnd <= chance1) ? g1 : g2;
                        }
                    }
                    else if (g1) { if (Math.random() <= probP1) return g1; }
                    else if (g2) { if (Math.random() <= probP2) return g2; }

                    const genesMutacion = typeof window.generarGenesV9 === 'function' ? window.generarGenesV9(rarezaHijo) : {A:null, B:null, C:null};
                    return genesMutacion[slotKey];
                };

                const hiddenGenesHeredados = {
                    A: intentarHeredarSlot('A'),
                    B: intentarHeredarSlot('B'),
                    C: intentarHeredarSlot('C')
                };

                if (hiddenGenesHeredados.B && hiddenGenesHeredados.C && hiddenGenesHeredados.B.id === hiddenGenesHeredados.C.id) {
                    hiddenGenesHeredados.C = null; 
                }

                const colorHijo = Math.random() > 0.5 ? (padre1.color || padre1.base_color || "#77DD77") : (padre2.color || padre2.base_color || "#77DD77");

                const prefijos = ["Neo", "Bio", "Geno", "Cyto", "Viro", "Rad", "Syn", "Evo", "Nexo", "Mut"];
                const sufijos = ["-X", "-Prime", "morph", "cyte", "tron", "plasm", "-7", "core", "gen", "-Z"];
                const nombreHijo = prefijos[Math.floor(Math.random() * prefijos.length)] + sufijos[Math.floor(Math.random() * sufijos.length)];

                const hijo = {
                    id: typeof window.generarNuevoID === 'function' ? window.generarNuevoID() : Date.now(), 
                    name: nombreHijo, 
                    isEgg: true, 
                    incubating: false, 
                    hatchDuration: 120000, 
                    hatchTime: 0, 
                    generation: genHijo, breedCount: 0, level: 1, xp: 0, xpNeeded: 100,
                    rarity: rarezaHijo, 
                    genes: genesHijo, stats: statsHijo,
                    hidden_genes: hiddenGenesHeredados, 
                    scanned: false,
                    body_shape: genesHijo.cuerpo.dom, eye_type: genesHijo.ojos.dom, mouth_type: genesHijo.boca.dom,
                    wing_type: genesHijo.espalda.dom, hat_type: genesHijo.cabeza.dom, element: genesHijo.afinidad.dom,
                    base_color: colorHijo, color: colorHijo, reward: 100
                };

                if (typeof generarSvgGeno === 'function') hijo.svg = generarSvgGeno(hijo);
                if(!window.misGenos) window.misGenos = []; window.misGenos.push(hijo);

                const svgCapsula = typeof generarSvgGeno === 'function' ? generarSvgGeno({ isEgg: true, color: colorHijo }) : '🧬';

                const itemBioNucleo = {
                    id: "bionucleo_" + hijo.id,
                    name: "Bio-Núcleo #" + hijo.id,
                    icon: svgCapsula,
                    color: hijo.base_color, 
                    type: "bio_nucleo",
                    maxStack: 1,
                    desc: "Material genético en gestación."
                };
                
                if (window.miInventario) {
                    if(!window.miInventario.slots) window.miInventario.slots = [];
                    const maxSlots = window.miInventario.maxSlots || 10;
                    
                    if (window.miInventario.slots.length >= maxSlots) {
                        itemBioNucleo.isOverflow = true;
                        itemBioNucleo.expiresAt = Date.now() + (24 * 60 * 60 * 1000); 
                    }

                    if(typeof window.miInventario.addItem === 'function') window.miInventario.addItem(itemBioNucleo, 1);
                }
                
                window.iniciarSelectorCrianza(); 
                if (typeof window.guardarJuego === 'function') window.guardarJuego();
                else if (typeof window.guardarProgreso === 'function') window.guardarProgreso();
            }, 2000);
        });
    }

    window.renderizarIncubadora = function() {
        const grid = document.getElementById("incubator-grid");
        if(!grid) return;
        const huevos = (window.misGenos || []).filter(g => g.isEgg);
        grid.innerHTML = "";

        if(huevos.length === 0) { grid.innerHTML = '<div style="margin: auto; color: #64748b; font-size: 12px; font-style: italic;">La cámara está vacía. Sintetiza un Bio-Núcleo para comenzar.</div>'; return; }

        let countInc = 0;
        if (window.miInventario && window.miInventario.slots) {
             const inc = window.miInventario.slots.find(i => i.id === "incubator_01");
             countInc = inc ? (inc.cantidad || inc.count || 0) : 0;
        }

        huevos.forEach(huevo => {
            const card = document.createElement("div");
            card.style = "min-width: 95px; background: #1e293b; border: 1px solid #3b82f6; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); position: relative;";
            let actionHtml = '';
            let timerHtml = '';

            if (!huevo.incubating) {
                timerHtml = `<div id="timer-${huevo.id}" style="font-size: 12px; font-weight: bold; color: #aaa; margin-top: 8px; letter-spacing: 1px;">INACTIVO</div>`;
                if (countInc > 0) {
                    actionHtml = `<button id="btn-activate-${huevo.id}" style="margin-top: 8px; font-size: 10px; background: linear-gradient(135deg, #4dd0e1, #3b82f6); color: #0d1a24; border: none; border-radius: 6px; padding: 5px 10px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 8px rgba(77, 208, 225, 0.4); text-transform: uppercase;">ACTIVAR (Usa 1🔋)</button>`;
                } else {
                    actionHtml = `<button id="btn-buy-${huevo.id}" style="margin-top: 8px; font-size: 10px; background: linear-gradient(135deg, #ff9800, #ff5722); color: white; border: none; border-radius: 6px; padding: 5px 10px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 8px rgba(255, 152, 0, 0.4); text-transform: uppercase;">🛒 🔋 0.2 POL</button>`;
                }
            } else {
                const restante = huevo.hatchTime - Date.now();
                if (restante > 0) {
                    timerHtml = `<div id="timer-${huevo.id}" style="font-size: 12px; font-weight: bold; color: #ffbf00; margin-top: 8px; letter-spacing: 1px;">Calc...</div>`;
                    actionHtml = `<button id="btn-skip-${huevo.id}" style="margin-top: 8px; font-size: 10px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; border: none; border-radius: 6px; padding: 5px 10px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4); text-transform: uppercase;">⚡ 0.5 POL</button>`;
                } else {
                    timerHtml = `<div id="timer-${huevo.id}" style="font-size: 12px; font-weight: bold; color: #4dd0e1; margin-top: 8px; letter-spacing: 1px;">¡LISTO!</div>`;
                    actionHtml = `<button id="btn-claim-${huevo.id}" style="margin-top: 8px; font-size: 10px; background: linear-gradient(135deg, #77DD77, #3b82f6); color: #0d1a24; border: none; border-radius: 6px; padding: 5px 10px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 8px rgba(119, 221, 119, 0.4); text-transform: uppercase;">✨ RECLAMAR</button>`;
                }
            }

            card.innerHTML = `
                <div style="color: ${huevo.color || huevo.base_color || '#ccc'}; width: 45px; height: 45px; display: flex; justify-content: center; align-items: center; filter: ${!huevo.incubating ? 'grayscale(0.8) brightness(0.6)' : 'none'};">
                    ${typeof generarSvgGeno === 'function' ? generarSvgGeno(huevo) : '<span>ADN</span>'}
                </div>
                ${timerHtml}
                ${actionHtml}
            `;

            if (!huevo.incubating) {
                card.querySelector(`#btn-activate-${huevo.id}`)?.addEventListener("click", () => {
                    if(window.miInventario && typeof window.miInventario.consumeItem === 'function') { 
                        if(window.miInventario.consumeItem("incubator_01", 1)) {
                            huevo.incubating = true;
                            huevo.hatchTime = Date.now() + (huevo.hatchDuration || 120000);
                            window.renderizarIncubadora();
                            if (typeof window.guardarJuego === 'function') window.guardarJuego();
                            else if (typeof window.guardarProgreso === 'function') window.guardarProgreso();
                        }
                    } 
                });
                card.querySelector(`#btn-buy-${huevo.id}`)?.addEventListener("click", () => {
                    const costo = 0.2;
                    if (window.miWallet && window.miWallet.pol >= costo) {
                        window.miWallet.pol -= costo;
                        window.miInventario.addItem({ id: "incubator_01", name: "Incubadora Térmica", icon: "🔋", type: "consumible", maxStack: 20 }, 1);
                        actualizarPolUI(); window.renderizarIncubadora(); 
                    } else { alert("❌ No tienes suficiente POL."); }
                });
            } else {
                const restante = huevo.hatchTime - Date.now();
                if (restante > 0) {
                    card.querySelector(`#btn-skip-${huevo.id}`)?.addEventListener("click", () => {
                        // ✨ FIX CAPACIDAD: Verifica antes de gastar el POL y eclosionar
                        const genosActivos = (window.misGenos || []).filter(g => !g.isEgg).length;
                        const max = window.maxGenoSlots || 6;
                        if (genosActivos >= max) {
                            alert("⚠️ LÍMITE DE ALOJAMIENTO ALCANZADO\nNo tienes más espacio en 'Mis Genos'. Expande tu capacidad con ➕ POL antes de abrir este núcleo.");
                            return;
                        }

                        if(window.miWallet && window.miWallet.pol >= 0.5) {
                            window.miWallet.pol -= 0.5; actualizarPolUI();
                            huevo.isEgg = false; 
                            
                            if(window.miInventario && window.miInventario.slots) {
                                let idx = window.miInventario.slots.findIndex(i => i.id === "bionucleo_" + huevo.id);
                                if(idx !== -1) window.miInventario.removeItem(idx, 1);
                            }
                            alert(`⚡ ¡Geno nacido!`);
                            window.renderizarIncubadora(); if(window.actualizarPanelRPG) window.actualizarPanelRPG();
                            if (typeof window.guardarJuego === 'function') window.guardarJuego();
                            else if (typeof window.guardarProgreso === 'function') window.guardarProgreso();
                        } else { alert("No tienes suficiente POL."); }
                    });
                } else {
                    card.querySelector(`#btn-claim-${huevo.id}`)?.addEventListener("click", () => {
                        // ✨ FIX CAPACIDAD: Verifica antes de reclamar
                        const genosActivos = (window.misGenos || []).filter(g => !g.isEgg).length;
                        const max = window.maxGenoSlots || 6;
                        if (genosActivos >= max) {
                            alert("⚠️ LÍMITE DE ALOJAMIENTO ALCANZADO\nNo tienes más espacio en 'Mis Genos'. Expande tu capacidad con ➕ POL antes de reclamar este Geno.");
                            return;
                        }

                        huevo.isEgg = false;
                        
                        if(window.miInventario && window.miInventario.slots) {
                            let idx = window.miInventario.slots.findIndex(i => i.id === "bionucleo_" + huevo.id);
                            if(idx !== -1) window.miInventario.removeItem(idx, 1);
                        }
                        alert(`🧬 ¡Geno nacido!`);
                        window.renderizarIncubadora(); if(window.actualizarPanelRPG) window.actualizarPanelRPG();
                        if (typeof window.guardarJuego === 'function') window.guardarJuego();
                        else if (typeof window.guardarProgreso === 'function') window.guardarProgreso();
                    });
                }
            }
            grid.appendChild(card);
        });
    }

    setInterval(() => {
        const huevos = (window.misGenos || []).filter(g => g.isEgg && g.incubating);
        let requiereActualizacion = false;
        huevos.forEach(huevo => {
            const restante = huevo.hatchTime - Date.now();
            if (restante <= 0) {
                const label = document.getElementById(`timer-${huevo.id}`);
                if (label && label.innerText !== "¡LISTO!") requiereActualizacion = true;
            } else {
                const label = document.getElementById(`timer-${huevo.id}`);
                if(label) {
                    const min = Math.floor(restante / 60000); const sec = Math.floor((restante % 60000) / 1000);
                    label.innerText = `${min}:${sec < 10 ? "0" + sec : sec}`;
                }
            }
        });
        if(requiereActualizacion) window.renderizarIncubadora(); 
    }, 1000);
});