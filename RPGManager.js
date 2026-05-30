// =========================================
// RPGManager.js - SISTEMA DE STATS Y PROGRESIÓN (INCLUYE DOBLE ESCÁNER D-R)
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    const overlayStats = document.getElementById("stats-modal-overlay");
    const panelStats = document.getElementById("geno-stats-panel");
    const badgePuntos = document.getElementById("stat-points-badge");
    const btnsAddStat = document.querySelectorAll(".btn-add-stat");

    window.verificarUmbralDespertar = function(g) {
        if (g.level >= 25 && window.tieneGenActivoV9 && window.tieneGenActivoV9(g, "umbral_despertar") && !g.umbralAplicado) {
            g.stats.hp += 5; g.stats.atk += 5; g.stats.def += 5; g.stats.spd += 5; g.stats.luk += 5;
            
            if(g.baseStats) {
                g.baseStats.hp += 5; g.baseStats.atk += 5; g.baseStats.def += 5; g.baseStats.spd += 5; g.baseStats.luk += 5;
            }
            
            g.umbralAplicado = true;
            if(window.Sonidos) window.Sonidos.play("heal");
            alert("✨ ¡Gen Activado: Umbral del Despertar!\nLas estadísticas base de tu Geno han aumentado +5 de forma permanente.");
        }
    };

    // ✨ NUEVO CONTROLADOR GLOBAL DE ESCÁNERES
    window.usarEscanerMascota = function(tipo) {
        const g = window.miMascota;
        if (!g || g.id === "temp") return;

        if (tipo === 'basico') {
            if (g.scanned && !g.scanned_full) { alert("Este Geno ya tiene sus slots básicos revelados. Necesitas un Escáner Completo."); return; }
            if (g.scanned_full) { alert("Este Geno ya ha sido escaneado por completo."); return; }
            
            // Acepta el nuevo "escaner_basico" o los viejos "dna_scanner" de versiones anteriores
            if (window.miInventario && (window.miInventario.consumeItem("escaner_basico", 1) || window.miInventario.consumeItem("dna_scanner", 1))) {
                if (!g.hidden_genes || !g.hidden_genes.hasOwnProperty('A')) g.hidden_genes = window.generarGenesV9(g.rarity);
                g.scanned = true;
                window.verificarUmbralDespertar(g);
                if(window.Sonidos) window.Sonidos.play("heal");
                window.actualizarPanelRPG();
                if(window.guardarProgreso) window.guardarProgreso();
            } else {
                alert("No tienes un Escáner Básico en tu inventario. ¡Consíguelo en Suministros!");
            }
            
        } else if (tipo === 'completo') {
            if (g.scanned_full) { alert("Este Geno ya tiene su genoma decodificado al 100%."); return; }
            
            if (window.miInventario && window.miInventario.consumeItem("escaner_completo", 1)) {
                if (!g.hidden_genes || !g.hidden_genes.hasOwnProperty('A')) g.hidden_genes = window.generarGenesV9(g.rarity);
                g.scanned = true;      // El completo también revela los slots básicos automáticamente
                g.scanned_full = true; // Y desbloquea el panel Dominante/Recesivo
                window.verificarUmbralDespertar(g);
                if(window.Sonidos) window.Sonidos.play("heal");
                window.actualizarPanelRPG();
                if(window.guardarProgreso) window.guardarProgreso();
            } else {
                alert("No tienes un Escáner Completo en tu inventario. ¡Consíguelo en Suministros!");
            }
        }
    };

    window.actualizarPanelRPG = function() {
        if(!window.miMascota || window.miMascota.id === "temp") return;
        const g = window.miMascota;

        if(!g.level) g.level = 1;
        if(g.xp === undefined) g.xp = 0;
        
        let baseXPNeeded = Math.floor(100 * Math.pow(1.2, g.level - 1));
        let tieneAceleracion = window.tieneGenActivoV9 && window.tieneGenActivoV9(g, "aceleracion_final");
        let maxLevel = (window.tieneGenActivoV9 && window.tieneGenActivoV9(g, "especialista_elite")) ? 55 : 50;
        if (tieneAceleracion && g.level >= (maxLevel - 10)) {
            g.xpNeeded = Math.floor(baseXPNeeded * 0.60);
        } else {
            g.xpNeeded = baseXPNeeded;
        }
        if(!g.stats) g.stats = { hp: 50, atk: 15, def: 10, spd: 15, luk: 15 };
        if(g.statPoints === undefined) g.statPoints = 0;

        if(!g.baseStats) {
            g.baseStats = {
                hp: g.stats.hp,
                atk: g.stats.atk,
                def: g.stats.def !== undefined ? g.stats.def : 0,
                spd: g.stats.spd,
                luk: g.stats.luk
            };
        }

        const nameEl = document.getElementById("geno-name");
        if(nameEl) nameEl.innerText = g.name || "Geno";
        
        const lvlEl = document.getElementById("geno-level");
        if(lvlEl) lvlEl.innerText = `Nv. ${g.level}`;

        const xpText = document.getElementById("geno-xp-text");
        if(xpText) xpText.innerText = `${Math.floor(g.xp)}/${g.xpNeeded}`;

        const xpFill = document.getElementById("geno-xp-fill");
        if(xpFill) {
            let pct = (g.xp / g.xpNeeded) * 100;
            if(pct > 100) pct = 100;
            xpFill.style.width = pct + "%";
        }

        const rarityEl = document.getElementById("geno-rarity");
        if(rarityEl) {
            rarityEl.innerText = g.rarity || "Común";
            if (g.id && String(g.id).length > 10 && typeof window.generarNuevoID === 'function') g.id = window.generarNuevoID();
            let serialRow = document.getElementById("row-serial-id");
            if (!serialRow) {
                serialRow = document.createElement("div");
                serialRow.id = "row-serial-id";
                serialRow.style = "text-align: center; margin-top: 15px; margin-bottom: 15px; font-weight: bold; color: #00d2ff; font-family: monospace; letter-spacing: 2px; font-size: 15px;";
                rarityEl.parentNode.parentNode.insertBefore(serialRow, rarityEl.parentNode);
            }
            
            const elementoActual = (g.genes && g.genes.afinidad) ? g.genes.afinidad.dom : (g.element || "Normal");
            // Obtenemos el icono y le quitamos el margen derecho para que quede perfectamente centrado
            let iconoElemento = window.getIconoElemento(elementoActual).replace('margin-right: 6px;', 'margin-right: 0;');
            
            // Inyectamos el icono gigante (45px) justo encima del ID
            serialRow.innerHTML = `
                <div style="font-size: 45px; margin-bottom: 8px; display: flex; justify-content: center; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8));">
                    ${iconoElemento}
                </div>
                <div>${g.id ? `#${g.id}` : "#000000"}</div>
            `;
        }

        const elementEl = document.getElementById("geno-element");
        if(elementEl) {
            const elementoActual = (g.genes && g.genes.afinidad) ? g.genes.afinidad.dom : (g.element || "Normal");
            const nombreElementoLimpio = elementoActual.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').trim();
            // Dejamos la lista de texto limpia, sin el icono minúsculo
            elementEl.innerHTML = `<span style="font-weight: bold; color: #fff;">${nombreElementoLimpio}</span>`;
        }

        const qualityBadge = document.getElementById("geno-quality-badge");
        if (qualityBadge) {
            let rango = "D"; let pct = 0; let color = "#aaa";
            if (g.stats.rango && g.stats.calidadPorcentaje !== undefined) {
                rango = g.stats.rango; pct = g.stats.calidadPorcentaje;
            } else {
                const limites = (window.TABLA_IVS && window.TABLA_IVS[g.rarity]) ? window.TABLA_IVS[g.rarity] : { hp: [35, 55], atk: [10, 22], def: [5, 15], spd: [8, 25], luk: [5, 15] }; 
                let tMin = limites.hp[0] + limites.atk[0] + limites.def[0] + limites.spd[0] + limites.luk[0];
                let tMax = limites.hp[1] + limites.atk[1] + limites.def[1] + limites.spd[1] + limites.luk[1];
                let bonoUmbral = g.umbralAplicado ? 25 : 0; 
                
                let tObt = (g.baseStats.hp + g.baseStats.atk + g.baseStats.def + g.baseStats.spd + g.baseStats.luk) - bonoUmbral;

                pct = Math.round(((tObt - tMin) / (tMax - tMin)) * 100);
                if (pct > 100) pct = 100; if (pct < 0) pct = 0;

                if (pct >= 95) rango = "S"; else if (pct >= 80) rango = "A"; else if (pct >= 50) rango = "B"; else if (pct >= 20) rango = "C"; else rango = "D";
            }

            if (rango === "S") color = "#ffcc00"; else if (rango === "A") color = "#4dd0e1"; else if (rango === "B") color = "#4CAF50"; else if (rango === "C") color = "#f0ad4e"; else color = "#d9534f"; 
            qualityBadge.innerText = `${rango} (${pct}%)`; qualityBadge.style.color = color;
            qualityBadge.style.textShadow = rango === "S" ? "0 0 10px rgba(255, 204, 0, 0.8)" : "none";
        }

        const drawStat = (statName) => {
            const baseEl = document.getElementById(`stat-${statName}-base`);
            const addedEl = document.getElementById(`stat-${statName}-added`);
            const totalEl = document.getElementById(`stat-${statName}-total`);
            
            if(baseEl && g.stats[statName] !== undefined) {
                if(g.baseStats && g.baseStats[statName] !== undefined) {
                    const baseVal = Math.floor(g.baseStats[statName]);
                    const totalVal = Math.floor(g.stats[statName]);
                    const diff = totalVal - baseVal;
                    
                    baseEl.innerText = baseVal; 
                    
                    if(diff > 0) {
                        if(addedEl) addedEl.innerText = `(+${diff})`;
                        if(totalEl) totalEl.innerText = `${totalVal}`;
                    } else {
                        if(addedEl) addedEl.innerText = '';
                        if(totalEl) totalEl.innerText = '';
                    }
                } else {
                    baseEl.innerText = Math.floor(g.stats[statName]);
                    if(addedEl) addedEl.innerText = '';
                    if(totalEl) totalEl.innerText = '';
                }
            }
        };

        drawStat('hp');
        drawStat('atk');
        drawStat('def');
        drawStat('spd');
        drawStat('luk');

        let structureContainer = document.getElementById("genetic-structure-container");
        
        if (!structureContainer) {
            let oldRecContainer = document.getElementById("geno-recessive");
            if (oldRecContainer) {
                structureContainer = oldRecContainer.parentNode;
                structureContainer.id = "genetic-structure-container";
            }
        }

        if(structureContainer) {
            structureContainer.style.display = "flex";
            structureContainer.style.flexDirection = "column";
            structureContainer.style.alignItems = "stretch";
            structureContainer.style.gap = "6px";
            structureContainer.style.marginTop = "15px";
            structureContainer.style.paddingTop = "15px";
            structureContainer.style.width = "100%";
            
            if (!g.scanned && !g.scanned_full) {
                structureContainer.innerHTML = `
                    <div style="font-size: 12px; color: #4dd0e1; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; letter-spacing: 1px; text-align: center;">Estructura Genética</div>
                    <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; border: 1px dashed #555; text-align: center; color: #666; font-size: 12px;">
                        <div style="display: flex; justify-content: center; align-items: center; gap: 6px; color: #f0ad4e; margin-bottom: 6px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <span style="font-size: 14px; font-weight: bold;">ADN Bloqueado</span>
                        </div>
                        <span style="font-size: 10px; color: #888; display: inline-block;">Usa un escáner para revelar la secuencia.</span>
                    </div>
                `;
            } else {
                const hg = g.hidden_genes || { A: null, B: null, C: null };
                
                const buildSlot = (slotLabel, geneData, colorBox) => {
                    if (!geneData) return `<div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; font-size: 11px; color: #555; border-left: 3px solid #333; display: flex; justify-content: space-between; align-items: center;"><span>${slotLabel}</span> <span style="font-size:10px; font-style:italic;">Vacío</span></div>`;
                    
                    return `
                        <div style="background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 6px; font-size: 11px; color: #fff; border-left: 3px solid ${colorBox}; display: flex; flex-direction: column; gap: 4px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: ${colorBox}; font-weight: bold; font-size: 10px; text-transform: uppercase;">${slotLabel}</span>
                                <span style="font-weight: bold;">${geneData.name}</span>
                            </div>
                            <div style="color: #aaa; font-size: 10px; line-height: 1.3;">${geneData.desc}</div>
                        </div>
                    `;
                };

                let htmlADN = `
                    <div style="font-size: 12px; color: #4dd0e1; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; letter-spacing: 1px; text-align: center;">Estructura Genética</div>
                    ${buildSlot("Gen A (Cosmético)", hg.A, "#ffcc00")}
                    ${buildSlot("Gen B (Funcional)", hg.B, "#80deea")}
                    ${buildSlot("Gen C (Funcional)", hg.C, "#8A2BE2")}
                `;

                // ✨ AQUÍ SE INYECTA LA TABLA DE DOMINANTE Y RECESIVO SI TIENE ESCANER COMPLETO
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

                    htmlADN += `
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
                
                structureContainer.innerHTML = htmlADN;
            }
        }

        // ✨ SISTEMA DINÁMICO DE BOTONES DE ESCÁNER
        const btnScannerUI = document.getElementById("btn-use-scanner");
        let scannerActionContainer = document.getElementById("scanner-action-container");

        // Si existe el botón viejo pero no nuestro contenedor, lo creamos y escondemos el viejo
        if (btnScannerUI && !scannerActionContainer) {
            scannerActionContainer = document.createElement("div");
            scannerActionContainer.id = "scanner-action-container";
            scannerActionContainer.style = "display: flex; gap: 10px; justify-content: center; margin-top: 15px; width: 100%;";
            btnScannerUI.parentNode.insertBefore(scannerActionContainer, btnScannerUI);
            btnScannerUI.style.display = "none";
        }

        if (scannerActionContainer) {
            scannerActionContainer.innerHTML = ""; // Limpiar botones
            
            if (!g.scanned && !g.scanned_full) {
                const btnBasico = document.createElement("button");
                btnBasico.innerHTML = "Escáner Básico";
                btnBasico.style = "flex: 1; padding: 10px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; color: white; background: linear-gradient(90deg, #005c8a, #00E5FF); box-shadow: 0 4px 10px rgba(0,229,255,0.3); font-size: 11px; text-transform: uppercase; transition: filter 0.2s;";
                btnBasico.onmouseover = () => btnBasico.style.filter = "brightness(1.2)";
                btnBasico.onmouseout = () => btnBasico.style.filter = "brightness(1)";
                btnBasico.onclick = () => window.usarEscanerMascota('basico');
                scannerActionContainer.appendChild(btnBasico);
            }

            if (!g.scanned_full) {
                const btnCompleto = document.createElement("button");
                btnCompleto.innerHTML = "Escáner Completo";
                btnCompleto.style = "flex: 1; padding: 10px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; color: white; background: linear-gradient(90deg, #7B1FA2, #D500F9); box-shadow: 0 4px 10px rgba(213,0,249,0.3); font-size: 11px; text-transform: uppercase; transition: filter 0.2s;";
                btnCompleto.onmouseover = () => btnCompleto.style.filter = "brightness(1.2)";
                btnCompleto.onmouseout = () => btnCompleto.style.filter = "brightness(1)";
                btnCompleto.onclick = () => window.usarEscanerMascota('completo');
                scannerActionContainer.appendChild(btnCompleto);
            }
        }

        const ptsBadge = document.getElementById("stat-points-badge");
        const addBtns = document.querySelectorAll(".btn-add-stat");
        if(g.statPoints > 0) {
            if(ptsBadge) { ptsBadge.innerText = `+${g.statPoints} Pts`; ptsBadge.classList.remove("hidden"); }
            addBtns.forEach(b => b.classList.remove("hidden"));
        } else {
            if(ptsBadge) ptsBadge.classList.add("hidden"); addBtns.forEach(b => b.classList.add("hidden"));
        }
        
        if (typeof window.guardarJuego === 'function') window.guardarJuego();
        if (window.NexoEnergyManager && typeof window.NexoEnergyManager.actualizarUI === 'function') {
            window.NexoEnergyManager.actualizarUI();
        }
    };

    window.ganarXP = function(cantidad) {
        let maxLevel = 50;
        if (window.tieneGenActivoV9 && window.tieneGenActivoV9(window.miMascota, "especialista_elite")) {
            maxLevel = 55;
        }
        if (!window.miMascota || window.miMascota.id === "temp" || window.miMascota.level >= maxLevel) return; 
        
        window.miMascota.xp += cantidad;
        
        if (window.miMascota.xp >= window.miMascota.xpNeeded) {
            window.miMascota.level++;
            window.miMascota.xp -= window.miMascota.xpNeeded;
            
            let baseXPNeeded = Math.floor(100 * Math.pow(1.2, window.miMascota.level - 1));
            let tieneAceleracion = window.tieneGenActivoV9 && window.tieneGenActivoV9(window.miMascota, "aceleracion_final");
            if (tieneAceleracion && window.miMascota.level >= (maxLevel - 10)) {
                window.miMascota.xpNeeded = Math.floor(baseXPNeeded * 0.60);
            } else {
                window.miMascota.xpNeeded = baseXPNeeded;
            }
            
            window.miMascota.statPoints += 3; 
            
            const contenedor = document.getElementById("geno-container");
            if(contenedor) {
                contenedor.classList.remove("geno-idle");
                contenedor.classList.add("happy-jump");
                setTimeout(() => { contenedor.classList.remove("happy-jump"); contenedor.classList.add("geno-idle"); }, 500);
            }
            let resonanciaMsg = "";
            if (window.miMascota.level % 10 === 0 && window.tieneGenActivoV9 && window.tieneGenActivoV9(window.miMascota, "resonancia_nivel")) {
                const keys = ["hp", "atk", "def", "spd", "luk"];
                let highestKey = keys[0];
                let highestVal = window.miMascota.stats[highestKey];
                for (let i = 1; i < keys.length; i++) {
                    if (window.miMascota.stats[keys[i]] > highestVal) {
                        highestVal = window.miMascota.stats[keys[i]];
                        highestKey = keys[i];
                    }
                }
                window.miMascota.stats[highestKey] += 1;
                if (window.miMascota.baseStats) {
                    window.miMascota.baseStats[highestKey] += 1;
                }
                const nameMap = { hp: "HP", atk: "Ataque (ATK)", def: "Defensa (DEF)", spd: "Velocidad (SPD)", luk: "Suerte (LUK)" };
                resonanciaMsg = `\n\n🧬 [Resonancia de Nivel] ¡Tu estadística líder (${nameMap[highestKey]}) aumentó +1 de forma permanente!`;
            }

            if(window.Sonidos) window.Sonidos.play("heal"); 
            alert(`¡Súper Evolución! 🌟\n${window.miMascota.name} ha alcanzado el Nivel ${window.miMascota.level}.\nTienes 3 Puntos de Atributo disponibles.${resonanciaMsg}`);

            window.verificarUmbralDespertar(window.miMascota);
        }
        window.actualizarPanelRPG();
    };

    document.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("btn-add-stat")) {
            const stat = e.target.getAttribute("data-stat");
            if (window.miMascota && window.miMascota.statPoints > 0) {
                if (stat === 'hp') window.miMascota.stats.hp += 5;
                if (stat === 'atk') window.miMascota.stats.atk += 1;
                if (stat === 'def') window.miMascota.stats.def += 1;
                if (stat === 'spd') window.miMascota.stats.spd += 1;
                if (stat === 'luk') window.miMascota.stats.luk += 1;
                window.miMascota.statPoints--;
                window.actualizarPanelRPG();
                if(window.guardarProgreso) window.guardarProgreso();
            }
        }
    });

    const btnStats = document.getElementById("btn-show-stats");
    const btnCloseStats = document.getElementById("close-stats-btn");
    const btnRename = document.getElementById("btn-rename-geno");

    const statsOverlay = document.getElementById("stats-modal-overlay");

    function blurFab() {
        const fab = document.getElementById("fab-menu");
        if(fab) { 
            fab.style.pointerEvents = "none"; 
            fab.style.opacity = "0"; 
            fab.style.transition = "transform 0.2s, opacity 0.2s";
        }
    }
    
    function unblurFab() {
        const fab = document.getElementById("fab-menu");
        if(fab) { 
            fab.style.pointerEvents = "auto"; 
            fab.style.opacity = "1"; 
            fab.style.transition = "transform 0.2s, opacity 0.2s";
        }
    }

    if (btnStats && statsOverlay) {
        btnStats.addEventListener("click", () => {
            statsOverlay.classList.remove("hidden");
            blurFab();
        });
    }

    if (btnCloseStats && statsOverlay) {
        btnCloseStats.addEventListener("click", () => {
            statsOverlay.classList.add("hidden");
            unblurFab();
        });
    }

    if (statsOverlay) {
        statsOverlay.addEventListener("click", (e) => {
            if (e.target === statsOverlay) {
                statsOverlay.classList.add("hidden");
                unblurFab();
            }
        });
    }

    if (!window.rpgNavHooked) {
        const originalNavegarA = window.navegarA;
        window.navegarA = function(id) {
            if (originalNavegarA) originalNavegarA(id);
            if (statsOverlay) statsOverlay.classList.add("hidden");
        };
        window.rpgNavHooked = true;
    }

    document.addEventListener("click", () => {
        setTimeout(() => {
            const mGenos = document.getElementById("geno-swap-modal");
            const mInv = document.getElementById("inventory-modal");
            const mId = document.getElementById("geno-id-card-modal");

            if (mId && !mId.classList.contains("hidden")) { blurFab(); return; }

            const algunModalAbierto = 
                (statsOverlay && !statsOverlay.classList.contains("hidden")) ||
                (mGenos && !mGenos.classList.contains("hidden")) ||
                (mInv && !mInv.classList.contains("hidden"));

            if (!algunModalAbierto) unblurFab();
        }, 50);
    });

    const btnGenos = document.getElementById("btn-show-genos");
    const btnInv = document.getElementById("backpack-icon");
    if(btnGenos) btnGenos.addEventListener("click", blurFab);
    if(btnInv) btnInv.addEventListener("click", blurFab);

    if (btnRename) {
        btnRename.addEventListener("click", () => {
            if (!window.miMascota) return;
            btnRename.style.transform = "scale(0.8)";
            setTimeout(() => btnRename.style.transform = "scale(1)", 150);

            const costoEsencia = 50;
            let mensaje = window.miMascota.renames === 0 ? "Bautizo Genético:\nEl primer cambio de nombre es GRATUITO.\n\n¿Cómo quieres llamar a tu Geno?" : `Cambio de Identidad:\nRenombrar cuesta ${costoEsencia} ✨.\n\nNuevo nombre:`;

            if (window.miMascota.renames > 0 && (!window.miInventario || window.miInventario.vitalEssence < costoEsencia)) {
                alert(`No tienes suficiente Esencia Vital. Cuesta ${costoEsencia} ✨.`); return;
            }

            const nuevoNombre = prompt(mensaje);
            if (nuevoNombre && nuevoNombre.trim().length > 0) {
                if (nuevoNombre.trim().length > 15) { alert("El nombre es demasiado largo."); return; }
                if (window.miMascota.renames > 0) window.miInventario.addEssence(-costoEsencia);
                window.miMascota.name = nuevoNombre.trim(); window.miMascota.renames++;
                window.actualizarPanelRPG();
                if(window.guardarProgreso) window.guardarProgreso();
                
                const contenedor = document.getElementById("geno-container");
                if(contenedor) {
                    contenedor.classList.remove("geno-idle"); contenedor.classList.add("happy-jump");
                    setTimeout(() => { contenedor.classList.remove("happy-jump"); contenedor.classList.add("geno-idle"); }, 500);
                }
            }
        });
    }

    window.actualizarPanelRPG();
});