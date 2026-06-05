// =========================================
// SanctuaryManager.js - LÓGICA DEL SANTUARIO V10.3 (NEÓN PERFECTO Y HUECO INFERIOR)
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    const maxDailyReleases = 3;

    // --- ESTILOS INYECTADOS PARA EL SANTUARIO ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* 🚫 Pantalla principal con posición relativa para anclar el botón flotante */
        #sanctuary-screen:not(.hidden) {
            background-color: #4dd0e1 !important;
            background-image: repeating-linear-gradient(to bottom, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 6px) !important;
            height: 100dvh !important; 
            max-height: 100dvh !important;
            overflow: hidden !important; 
            padding: 20px 20px 0px 20px !important; /* 👈 Sin padding abajo, el botón usará ese espacio */
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            position: relative !important; /* 👈 VITAL para el botón absolute */
        }

        /* ✨ FIX MAESTRO: El panel deja un hueco de 90px exactos para el botón flotante */
        #sanctuary-screen .sanctuary-panel-wrapper {
            background: #1a2a36 !important;
            border: none !important;
            border-radius: 16px !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4) !important;
            padding: 25px 20px 0 20px !important; 
            margin-bottom: 90px !important; /* 👈 HUECO INFERIOR PARA QUE EL BOTÓN NO SE MONTE */
            display: flex !important;
            flex-direction: column !important;
            flex: 1 1 0 !important; 
            min-height: 0 !important; 
            overflow: hidden !important; 
        }

        #sanctuary-screen h2.screen-title,
        #sanctuary-screen p.sanctuary-desc,
        .sanctuary-limit-hud {
            flex-shrink: 0 !important;
        }

        #sanctuary-screen h2.screen-title {
            color: #4CAF50 !important;
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

        #sanctuary-screen p.sanctuary-desc {
            color: #888 !important;
            font-size: 10px !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            font-weight: bold !important;
            margin-bottom: 20px !important;
            text-align: center !important;
            line-height: 1.4 !important;
        }

        .sanctuary-limit-hud {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(0,0,0,0.25);
            padding: 12px 15px;
            border-radius: 8px;
            border: 1px solid rgba(76, 175, 80, 0.15);
            margin-bottom: 20px;
        }

        .sanctuary-grid-modern {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
            grid-auto-rows: max-content !important; 
            align-content: start !important; 
            gap: 15px !important;
            width: 100% !important;
            flex: 1 1 0 !important; 
            min-height: 0 !important; 
            overflow-y: auto !important; 
            padding-bottom: 25px !important; 
            
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
        }

        .sanctuary-grid-modern::-webkit-scrollbar {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    // --- REESTRUCTURACIÓN DEL HTML AL CARGAR ---
    setTimeout(() => {
        const sanctuaryScreen = document.getElementById("sanctuary-screen");
        
        if (sanctuaryScreen) {
            if (!sanctuaryScreen.querySelector('.sanctuary-panel-wrapper')) {
                const wrapper = document.createElement("div");
                wrapper.className = "sanctuary-panel-wrapper";
                
                Array.from(sanctuaryScreen.children).forEach(child => {
                    // Ignoramos el botón de volver para que flote libremente abajo
                    if (!child.classList.contains('btn-go-home') && child !== wrapper) {
                        if (child.tagName === 'P') {
                            child.className = "sanctuary-desc";
                            
                            // CORRECCIÓN: Envolvemos el SVG en un span "inline-block" para que no rompa el texto
                            child.innerHTML = `Libera Genos en la naturaleza para obtener <span style="display: inline-block; width: 1.4em; height: 1.4em; vertical-align: middle; margin: 0 2px; transform: translateY(-2px);">${window.iconoEV || '✨'}</span> EV.`;
                            
                            // Limpiamos los estilos flex anteriores que rompían el párrafo
                            child.style.display = "block";
                            child.style.justifyContent = "";
                            child.style.alignItems = "";
                            child.style.gap = "";
                        }
                        if (child.tagName === 'DIV' && child.innerText.includes('Límite diario')) {
                            child.style.display = 'none'; 
                        }
                        wrapper.appendChild(child);
                    }
                });

                sanctuaryScreen.insertBefore(wrapper, sanctuaryScreen.firstChild);
                
                const gridEl = document.getElementById("sanctuary-grid");
                if(gridEl) gridEl.className = "sanctuary-grid-modern"; 
                
                const limitHud = document.createElement('div');
                limitHud.className = "sanctuary-limit-hud";
                limitHud.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 5px; font-size: 12px; color: #fff;">
                        <span style="color: #94a3b8; font-weight: normal; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Estado:</span>
                        <strong style="color: #4CAF50; font-size: 12px; letter-spacing: 1px;">SANTUARIO ACTIVO</strong>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px; font-size: 12px; color: #fff;">
                        <span style="color: #94a3b8; font-weight: normal; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Liberaciones:</span>
                        <strong id="hud-daily-release-count" style="color: #fff; display: flex; align-items: center; gap: 4px; font-size: 14px; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 12px;">0/3</strong>
                    </div>
                `;
                wrapper.insertBefore(limitHud, gridEl);
            }
        }
    }, 50);

    // --- MANEJO DE LÍMITE DIARIO EN LOCALSTORAGE ---
    function getDailyData() {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('sanctuary_date');
        let count = parseInt(localStorage.getItem('sanctuary_count') || '0');

        if (savedDate !== today) {
            count = 0;
            localStorage.setItem('sanctuary_date', today);
            localStorage.setItem('sanctuary_count', count);
        }
        return count;
    }

    function incrementDailyData() {
        const count = getDailyData() + 1;
        localStorage.setItem('sanctuary_count', count);
        return count;
    }

    function calcularRecompensa(geno) {
        let base = 100;
        switch(geno.rarity) {
            case "Común": base = 100; break;
            case "Raro": base = 300; break;
            case "Épico": base = 1000; break;
            case "Legendario": base = 5000; break;
            case "Mítico": base = 15000; break;
            default: base = 100;
        }
        
        const multiplicador = typeof window.getMultiplicadorEsencia === 'function' ? window.getMultiplicadorEsencia(geno) : 1.0;
        return Math.floor(base * multiplicador);
    }

    const obtenerCalidadVisual = (g) => {
        if (g.stats && g.stats.calidadPorcentaje !== undefined) {
            return { rango: g.stats.rango, pct: g.stats.calidadPorcentaje };
        }
        const baseRarity = (g.rarity || "Común").replace("+", "");
        const tabla = window.TABLA_IVS || window.ESCALA_RAREZAS;
        const lim = tabla[baseRarity] || tabla["Común"];
        const s = g.baseStats || g.stats;
        const tMin = lim.hp[0] + lim.atk[0] + (lim.def?lim.def[0]:0) + lim.spd[0] + lim.luk[0];
        const tMax = lim.hp[1] + lim.atk[1] + (lim.def?lim.def[1]:0) + lim.spd[1] + lim.luk[1];
        const tObt = s.hp + s.atk + (s.def||0) + s.spd + s.luk - (g.umbralAplicado ? 25 : 0);
        
        let p = Math.round(((tObt - tMin) / (tMax - tMin)) * 100);
        if (p > 100) p = 100; if (p < 0) p = 0;
        
        let r = "D";
        if (p >= 90) r = "S"; else if (p >= 75) r = "A"; else if (p >= 50) r = "B"; else if (p >= 25) r = "C";
        return { rango: r, pct: p };
    };

    // --- RENDERIZADO DEL SANTUARIO ---
    window.renderizarSantuario = function() {
        const grid = document.getElementById("sanctuary-grid");
        if (!grid) return;
        
        const dailyReleases = getDailyData();
        
        const countDisplay = document.getElementById("hud-daily-release-count");
        if (countDisplay) {
            countDisplay.innerText = `${dailyReleases}/${maxDailyReleases}`;
            if(dailyReleases >= maxDailyReleases) {
                countDisplay.style.color = "#d9534f";
                countDisplay.style.background = "rgba(217, 83, 79, 0.2)";
            } else {
                countDisplay.style.color = "#fff";
                countDisplay.style.background = "rgba(255,255,255,0.1)";
            }
        }
        
        grid.innerHTML = "";

        const idMascota = window.miMascota ? String(window.miMascota.id) : null;
        const genosDisponibles = (window.misGenos || []).filter(g => !g.isEgg && String(g.id) !== idMascota);

        if (genosDisponibles.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px; font-size: 13px; font-style: italic; background: rgba(0,0,0,0.2); border-radius: 8px;">No tienes Genos disponibles en la Base de Datos.<br>(No puedes liberar huevos ni a tu mascota principal).</div>`;
            return;
        }

        genosDisponibles.forEach(geno => {
            const ageMs = Date.now() - (geno.birthDate || 0);
            const cooldownMs = 48 * 60 * 60 * 1000;
            const isCoolingDown = ageMs < cooldownMs;

            const reward = calcularRecompensa(geno);
            const pColor = geno.color || geno.base_color || "#ccc";
            let svg = typeof generarSvgGeno === 'function' ? generarSvgGeno(geno) : '🧬';
            
            const { rango, pct } = obtenerCalidadVisual(geno);
            let colorRango = rango === "S" ? "#ffcc00" : rango === "A" ? "#00d2ff" : rango === "B" ? "#4CAF50" : rango === "C" ? "#f0ad4e" : "#d9534f";

            const card = document.createElement("div");
            card.style = "background: rgba(0,0,0,0.3); border: 1px solid rgba(76, 175, 80, 0.2); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; position: relative; overflow: hidden; padding: 12px 10px; box-sizing: border-box; min-height: 220px;";
            
            let overlayHtml = '';
            let btnHtml = '';

            if (isCoolingDown) {
                const horasRestantes = Math.ceil((cooldownMs - ageMs) / (1000 * 60 * 60));
                overlayHtml = `
                    <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; flex-direction: column; z-index: 10; backdrop-filter: blur(2px);">
                        <span style="font-size: 24px; filter: drop-shadow(0 0 5px #ff9800); margin-bottom: 5px;">⏳</span>
                        <span style="color: #ff9800; font-size: 10px; font-weight: bold; text-align: center; text-transform: uppercase; letter-spacing: 1px;">En Reposo<br>${horasRestantes}h</span>
                    </div>`;
                btnHtml = `<button disabled style="margin-top: auto; width: 100%; padding: 12px; border-radius: 8px; border: none; background: #2a323d; color: #888; font-weight: bold; cursor: not-allowed; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">BLOQUEADO</button>`;
            } else if (dailyReleases >= maxDailyReleases) {
                btnHtml = `<button disabled style="margin-top: auto; width: 100%; padding: 12px; border-radius: 8px; border: none; background: #2a323d; color: #888; font-weight: bold; cursor: not-allowed; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">LÍMITE ALCANZADO</button>`;
            } else {
                btnHtml = `<button class="btn-liberar-geno" data-id="${geno.id}" style="margin-top: auto; width: 100%; padding: 12px; border-radius: 8px; background: transparent; border: 1px solid #4CAF50; color: #4CAF50; font-weight: 900; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; text-align: center;">LIBERAR</button>`;
            }

            const extraBadge = (typeof window.getMultiplicadorEsencia === 'function' && window.getMultiplicadorEsencia(geno) > 1) 
                ? `<div style="font-size: 8px; background: linear-gradient(90deg, #8A2BE2, #ffcc00); color: #000; padding: 2px 6px; border-radius: 4px; position: absolute; top: 8px; right: 8px; font-weight: 900; z-index: 5; text-transform: uppercase; letter-spacing: 0.5px;">X2 Esencia</div>` 
                : '';

            card.innerHTML = `
                ${overlayHtml}
                ${extraBadge}
                
                <div style="width: 100%; text-align: left; padding-left: 2px; line-height: 1.1; margin-bottom: 10px;">
                    <div style="font-size: 9px; font-weight: bold; color: #888; margin-bottom: 2px;">Nv.${geno.level || 1}</div>
                    <div style="font-size: 10px; font-weight: 900; color: ${colorRango}; letter-spacing: 0.5px;">${rango} <span style="font-size: 8px;">${pct}%</span></div>
                </div>

                <div style="width: 60px; height: 60px; display: flex; justify-content: center; align-items: center; color: ${pColor}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); margin-bottom: 10px;">
                    ${svg}
                </div>
                
                <div style="font-size: 11px; color: #fff; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; margin-bottom: 2px;">${geno.name || 'Geno'}</div>
                <div style="font-size: 9px; color: #888; text-transform: uppercase; margin-bottom: 10px;">${(geno.rarity || 'Común').replace('+', '')}</div>
                
                <div style="background: rgba(0,0,0,0.5); border-radius: 6px; padding: 6px; width: 100%; box-sizing: border-box; text-align: center; border: 1px solid rgba(255,204,0,0.1); margin-bottom: 10px;">
                    <span style="color: #ffcc00; font-weight: bold; font-size: 13px; text-shadow: 0 0 5px rgba(255,204,0,0.5);">+${reward} ${window.iconoEV || '✨'}</span>
                </div>
                ${btnHtml}
            `;

            const svgEl = card.querySelector("svg");
            if (svgEl) { 
                svgEl.style.width = "100%"; 
                svgEl.style.height = "100%"; 
            }

            if (!isCoolingDown && dailyReleases < maxDailyReleases) {
                const btn = card.querySelector(".btn-liberar-geno");
                if (btn) {
                    btn.addEventListener("click", () => {
                        if (confirm(`⚠️ ALERTA DEL SANTUARIO\n\nEstás a punto de liberar a ${geno.name} en la naturaleza.\nEsta acción es PERMANENTE y el Geno se perderá para siempre.\n\n¿Estás seguro de proceder a cambio de ✨ ${reward} Esencia Vital?`)) {
                            
                            window.misGenos = window.misGenos.filter(g => String(g.id) !== String(geno.id));
                            
                            if (window.miInventario && typeof window.miInventario.addEssence === 'function') {
                                window.miInventario.addEssence(reward);
                                if (typeof window.registrarLogEconomia === "function") {
                                    window.registrarLogEconomia('reward', reward, 'sanctuary');
                                }
                            }
                            
                            incrementDailyData();
                            
                            alert(`🕊️ ${geno.name} ha sido liberado con éxito.\nLa Red Nexo te recompensa con ✨ ${reward} Esencia Vital.`);
                            
                            window.renderizarSantuario();
                            
                            if (typeof window.guardarProgreso === 'function') window.guardarProgreso();
                        }
                    });
                    
                    btn.onmouseover = () => { 
                        btn.style.background = "linear-gradient(90deg, #4CAF50, #45a049)"; 
                        btn.style.color = "#fff"; 
                        btn.style.border = "1px solid transparent";
                        btn.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.4)"; 
                    };
                    btn.onmouseout = () => { 
                        btn.style.background = "transparent"; 
                        btn.style.color = "#4CAF50"; 
                        btn.style.border = "1px solid #4CAF50";
                        btn.style.boxShadow = "none"; 
                    };
                }
            }
            grid.appendChild(card);
        });
    };
});