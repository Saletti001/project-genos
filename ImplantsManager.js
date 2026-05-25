// =========================================
// ImplantsManager.js - V22 (MOTOR DE EQUIPAR Y DESEQUIPAR REAL)
// =========================================

window.ImplantsManager = {
    currentTab: 'combat',
    targetSlot: null,

    init: function() {
        if(typeof ImplantsUI !== 'undefined') {
            ImplantsUI.inyectarCSS();
            ImplantsUI.renderBase();
        }
        this.refreshPreview();
        this.updateSlotLabels();
        const iftttPanel = document.getElementById('ifttt-panel');
        if(iftttPanel) iftttPanel.style.display = this.currentTab === 'combat' ? 'block' : 'none';
    },

    setTab: function(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.lab-tab').forEach(t => t.classList.remove('active'));
        if(typeof event !== 'undefined' && event.target) event.target.classList.add('active');

        const combatSlots = document.getElementById('combat-slots');
        const cosmeticSlots = document.getElementById('cosmetic-slots');
        const iftttPanel = document.getElementById('ifttt-panel');
        if(combatSlots) combatSlots.style.display = tab === 'combat' ? 'grid' : 'none';
        if(cosmeticSlots) cosmeticSlots.style.display = tab === 'cosmetic' ? 'grid' : 'none';
        if(iftttPanel) iftttPanel.style.display = tab === 'combat' ? 'block' : 'none';
    },

    refreshPreview: function() {
        const preview = document.getElementById("implants-geno-preview");
        const statsBox = document.getElementById("implants-geno-stats");
        if (!preview || !statsBox || !window.miMascota) return;

        preview.innerHTML = typeof generarSvgGeno === 'function' ? generarSvgGeno(window.miMascota) : '';
        let svgNode = preview.querySelector("svg");
        if (svgNode) {
            svgNode.setAttribute("width", "100%");
            svgNode.setAttribute("height", "100%");
            svgNode.setAttribute("viewBox", "-20 -10 200 180");
        }
        
        // FIX V22: Stats eliminados para diseño más limpio
        statsBox.innerHTML = `<div class="geno-lab-name">${window.miMascota.name || "Geno"} <span>(Nv. ${window.miMascota.level || 1})</span></div>`;
    },

    updateSlotLabels: function() {
        if (!window.miMascota) return;
        
        if (!window.miMascota.ataques) window.miMascota.ataques = { atk_1: null, atk_2: null, atk_3: null, atk_4: null };
        
        const ataquesBasicos = {
            "Biomutante": "PULSO VITAL", "Viral": "DESCARGA VIRAL", "Cibernético": "LÁSER DE PRECISIÓN",
            "Radiactivo": "PROYECTIL RADIACTIVO", "Tóxico": "COLMILLO VENENOSO", "Sintético": "RÁFAGA SINTÉTICA"
        };
        const el1 = document.getElementById(`slot-atk-1`);
        if (el1) el1.innerText = window.miMascota.element ? (ataquesBasicos[window.miMascota.element] || "GOLPE BÁSICO") : "GOLPE BÁSICO";

        for (let i = 2; i <= 3; i++) {
            const atk = window.miMascota.ataques[`atk_${i}`];
            let el = document.getElementById(`slot-atk-${i}`);
            if(el) el.innerText = atk ? atk.nombre.toUpperCase() : "VACÍO";
        }
        
        const def = window.miMascota.ataques.atk_4;
        const slot4 = document.getElementById(`slot-atk-4`);
        if (slot4 && window.miMascota.level >= 25) {
            slot4.innerText = def ? def.nombre.toUpperCase() : "VACÍO";
            
            // ✨ FIX V22.2: Forzar la iluminación visual del botón Definitivo
            let btnWrapper = slot4.parentElement;
            btnWrapper.style.opacity = "1";
            btnWrapper.style.cursor = "pointer";
            btnWrapper.style.borderColor = "#4dd0e1"; // Enciende el borde (Cyan)
            
            // Enciende los textos internos
            Array.from(btnWrapper.children).forEach(child => {
                if (child.id === 'slot-atk-4') {
                    child.style.color = "#ffffff"; // Nombre del ataque en Blanco
                } else {
                    child.style.color = "#4dd0e1"; // Título "DEFINITIVO" en Cyan
                }
            });

            btnWrapper.onclick = () => this.openSelector('atk_4');
        }

        const m = window.miMascota;
        const headEl = document.getElementById('slot-head');
        if(headEl) headEl.innerText = m.hat_type && m.hat_type !== "ninguno" ? m.hat_type.replace(/_/g, ' ').toUpperCase() : "VACÍO";
        
        const backEl = document.getElementById('slot-back');
        if(backEl) backEl.innerText = m.wing_type && m.wing_type !== "ninguno" ? m.wing_type.replace(/_/g, ' ').toUpperCase() : "VACÍO";
        
        const skinEl = document.getElementById('slot-skin');
        if(skinEl) skinEl.innerText = m.skin_type && m.skin_type !== "estandar" ? m.skin_type.replace(/_/g, ' ').toUpperCase() : "ESTÁNDAR";
        
        const auraEl = document.getElementById('slot-aura');
        if(auraEl) auraEl.innerText = m.aura_type && m.aura_type !== "ninguno" ? m.aura_type.replace(/_/g, ' ').toUpperCase() : "VACÍO";

        this.renderIftttRules();
    },

    // ✨ FIX V22: Busca qué hay equipado para devolverlo a la mochila
    getItemToUnequip: function(slot, isCosmetic) {
        if (!window.miMascota) return null;
        if (isCosmetic) {
            const propMap = { head: 'hat_type', back: 'wing_type', skin: 'skin_type', aura: 'aura_type' };
            const currentVal = window.miMascota[propMap[slot]];
            if (currentVal && currentVal !== 'ninguno' && currentVal !== 'estandar') {
                let item = window.miMascota.cosmeticos && window.miMascota.cosmeticos[slot];
                if (!item) {
                    // Si se equipó antes del update, lo reconstruimos para que no se pierda
                    item = { id: "cos_" + slot + "_" + Date.now(), name: currentVal.replace(/_/g, ' ').toUpperCase(), icon: "📦", type: "Cosmético", subType: slot, maxStack: 1, evCost: 0, id_cosmetico: currentVal };
                }
                return item;
            }
        } else {
            if (window.miMascota.ataques && window.miMascota.ataques[slot]) {
                const atk = window.miMascota.ataques[slot];
                let item = atk.itemData;
                if (!item) {
                    item = { id: atk.id + "_" + Date.now(), name: atk.nombre, icon: "💿", type: "MT", subType: slot === 'atk_4' ? "Definitivo" : (slot === 'atk_2' ? 'Técnica' : 'Soporte'), element: atk.element, maxStack: 1, id_ataque: atk.id, power: atk.power, evCost: 0 };
                }
                return item;
            }
        }
        return null;
    },

    // ✨ FIX V22: Desequipar un ítem de forma manual (Botón rojo)
    unequipCurrent: function(slot, isCosmetic) {
        if (!window.miInventario || !window.miMascota) return;

        const itemToReturn = this.getItemToUnequip(slot, isCosmetic);
        if (!itemToReturn) return;

        // Intentar añadir a la mochila
        const added = window.miInventario.addItem(itemToReturn);
        if (!added) return; // Si la mochila está llena, el addItem ya tiró el alert. Paramos aquí.

        // Si se añadió con éxito, limpiamos al Geno
        if (isCosmetic) {
            const propMap = { head: 'hat_type', back: 'wing_type', skin: 'skin_type', aura: 'aura_type' };
            window.miMascota[propMap[slot]] = (slot === 'skin' ? 'estandar' : 'ninguno');
            if (window.miMascota.cosmeticos) delete window.miMascota.cosmeticos[slot];
        } else {
            window.miMascota.ataques[slot] = null;
        }

        this.syncAndSave();
        this.closeSelector();
        this.updateSlotLabels();
        this.refreshPreview();
    },

    openSelector: function(slot) {
        this.targetSlot = slot;
        const selector = document.getElementById('lab-inventory-selector');
        const listContainer = document.getElementById('lab-inventory-list');
        if(!selector || !listContainer) return;
        
        selector.style.display = 'block';
        listContainer.innerHTML = "";
        
        const isCosmetic = ['head', 'back', 'skin', 'aura'].includes(slot);

        // ✨ FIX V22: Detectar si ya hay algo equipado para mostrar botón de "DESEQUIPAR"
        const itemEquipado = this.getItemToUnequip(slot, isCosmetic);
        if (itemEquipado && slot !== 'atk_1') {
            const unequipBtn = document.createElement("div");
            unequipBtn.style = "background: rgba(217, 83, 79, 0.2); padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #d9534f; cursor: pointer; text-align: center; color: #ff6b6b; font-weight: bold; font-size: 12px; transition: 0.2s;";
            unequipBtn.innerText = "❌ DESEQUIPAR ACTUAL";
            unequipBtn.onmouseover = () => unequipBtn.style.background = "rgba(217, 83, 79, 0.4)";
            unequipBtn.onmouseout = () => unequipBtn.style.background = "rgba(217, 83, 79, 0.2)";
            unequipBtn.onclick = () => this.unequipCurrent(slot, isCosmetic);
            listContainer.appendChild(unequipBtn);
        }

        let invArray = window.miInventario ? (window.miInventario.slots || window.miInventario.items || []) : [];
        const modulos = invArray
            .map((item, originalIndex) => ({ ...item, originalIndex }))
            .filter(item => {
                if (isCosmetic) {
                    return (item.type === "Cosmético" || item.type === "cosmetico") && item.subType === slot;
                } else {
                    return item.type === "MT" || item.type === "mt" || typeof item.id_ataque !== 'undefined';
                }
            });

        if (modulos.length === 0) {
            const emptyMsg = document.createElement("div");
            emptyMsg.style = "text-align:center; color:#888; padding:20px;";
            emptyMsg.innerText = `No tienes ${isCosmetic ? 'Equipo compatible' : 'Módulos de Combate (MT)'} en tu Almacén Nexo.`;
            listContainer.appendChild(emptyMsg);
            return;
        }

        modulos.forEach(item => {
            const compatible = isCosmetic ? true : this.checkCompatibility(item, slot);
            const costo = item.evCost || 0; 
            const tipoEtiqueta = item.subType || 'MOD';
            const colorTipo = isCosmetic ? '#fbcfe8' : (tipoEtiqueta === 'Soporte' ? '#77DD77' : (tipoEtiqueta === 'Definitivo' ? '#ff9800' : '#b19cd9'));
            
            const itemDiv = document.createElement("div");
            itemDiv.style = `background: rgba(255,255,255,0.05); padding: 10px; margin-bottom: 8px; border-radius: 6px; border: 1px solid ${compatible ? '#00acc1' : '#555'}; opacity: ${compatible ? '1' : '0.5'}; cursor: ${compatible ? 'pointer' : 'not-allowed'};`;

            itemDiv.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                    <strong style="color:#fff; font-size:12px;">${item.name || 'Desconocido'}</strong>
                    <span style="color:#ffd700; font-size:11px; font-weight:bold;">${costo > 0 ? costo + ' ✨ EV' : 'GRATIS'}</span>
                </div>
                <div style="display:flex; gap: 5px; margin-bottom: 6px;">
                    ${item.element ? `<span style="background:rgba(0,172,193,0.2); color:#80deea; padding:2px 6px; border-radius:4px; font-size:9px; text-transform:uppercase; border: 1px solid rgba(0,172,193,0.5);">${item.element}</span>` : ''}
                    <span style="background:rgba(255,255,255,0.1); color:${colorTipo}; padding:2px 6px; border-radius:4px; font-size:9px; text-transform:uppercase; border: 1px solid ${colorTipo};">${tipoEtiqueta}</span>
                </div>
                <div style="font-size:10px; color:#aaa;">${item.description || item.desc || ''}</div>
                ${!compatible ? '<div style="color:#ff6b6b; font-size:9px; margin-top:4px;">Incompatible con este Slot o Elemento</div>' : ''}
            `;

            if (compatible) itemDiv.onclick = () => this.installModule(item, item.originalIndex, isCosmetic);
            listContainer.appendChild(itemDiv);
        });
    },

    checkCompatibility: function(item, slot) {
        const geno = window.miMascota;
        if (!geno) return false;

        // Slot 1: El ataque básico es innato, no se puede cambiar por inventario
        if (slot === 'atk_1') return false;

        // Slot 4: Definitivos. Regla estricta: Solo del mismo elemento y Geno Nivel 25+
        if (slot === 'atk_4') {
            return (item.subType === "Definitivo" && item.element === geno.element && geno.level >= 25);
        }

        // Slot 3: Soportes / Tácticas. Regla estricta: 100% Universales (Ignoran el elemento)
        if (slot === 'atk_3') {
            return (item.subType === "Soporte" || item.tier === "Soporte");
        }

        // Slot 2: Especiales. 
        if (slot === 'atk_2') {
            // No podemos equipar ni Soportes ni Definitivos en el slot de Especiales
            if (item.subType === "Soporte" || item.tier === "Soporte" || item.subType === "Definitivo") return false;

            // Regla del GDD: Los ataques Especiales del elemento CONTRARIO directo están prohibidos.
            const contrarios = { 
                "Biomutante": "Viral", "Viral": "Cibernético", "Cibernético": "Radiactivo", 
                "Radiactivo": "Tóxico", "Tóxico": "Sintético", "Sintético": "Biomutante" 
            };
            
            // Si el MT es la debilidad de tu Geno, o tu Geno es la debilidad del MT, es incompatible
            if (contrarios[item.element] === geno.element || contrarios[geno.element] === item.element) {
                return false; 
            }

            // Si es de su mismo elemento o de un elemento adyacente, sí es compatible
            return true;
        }

        return false;
    },

    calculateCost: function(item) {
        let base = item.evCost || 100;
        const geno = window.miMascota;
        if (!geno) return base;
        const contrarios = { "Biomutante": "Viral", "Viral": "Cibernético", "Cibernético": "Radiactivo", "Radiactivo": "Tóxico", "Tóxico": "Sintético", "Sintético": "Biomutante" };
        if (item.element === geno.element) return Math.floor(base * 0.7); 
        if (contrarios[item.element] === geno.element) return Math.floor(base * 1.2); 
        return base;
    },

    // ✨ FIX V22.1: FUNCIÓN RESTAURADA - Instala la MT y devuelve la vieja a la mochila
    installModule: function(item, indexItem, isCosmetic) {
        if (!window.miInventario || !window.miMascota) return;

        // 1. Verificamos si ya hay algo en ese slot. Si hay, lo desequipamos y vuelve a la mochila.
        const itemActual = this.getItemToUnequip(this.targetSlot, isCosmetic);
        if (itemActual) {
            this.unequipCurrent(this.targetSlot, isCosmetic);
        }

        // 2. Buscamos la nueva MT en la mochila y la borramos de ahí (porque ahora estará en el Geno)
        let invArray = window.miInventario.slots || window.miInventario.items;
        const realIndex = invArray.findIndex(i => i.id === item.id);
        if (realIndex !== -1) {
            invArray.splice(realIndex, 1);
        }

        // 3. Equipamos el ítem en el Geno
        if (isCosmetic) {
            const propMap = { head: 'hat_type', back: 'wing_type', skin: 'skin_type', aura: 'aura_type' };
            window.miMascota[propMap[this.targetSlot]] = item.id_cosmetico || item.name.toLowerCase().replace(/\s+/g, '_');
            if (!window.miMascota.cosmeticos) window.miMascota.cosmeticos = {};
            window.miMascota.cosmeticos[this.targetSlot] = item;
        } else {
            if (!window.miMascota.ataques) window.miMascota.ataques = {};
            
            // Inyectamos la MT como un ataque activo
            window.miMascota.ataques[this.targetSlot] = {
                id: item.id_ataque || "atk_" + Math.floor(Math.random() * 10000),
                nombre: item.name,
                element: item.element,
                power: item.power || 0,
                itemData: item // Guardamos la ficha física para no perderla al desequipar
            };
        }

        // 4. Guardamos partida y refrescamos los paneles
        this.syncAndSave();
        this.closeSelector();
        this.updateSlotLabels();
        this.refreshPreview();
    },

    syncAndSave: function() {
        if (window.misGenos) {
            const index = window.misGenos.findIndex(g => String(g.id) === String(window.miMascota.id));
            if (index !== -1) window.misGenos[index] = window.miMascota;
        }
        if (typeof window.guardarProgreso === 'function') window.guardarProgreso();
    },

    closeSelector: function() {
        let sel = document.getElementById('lab-inventory-selector');
        if(sel) sel.style.display = 'none';
    },

    renderIftttRules: function() {
        const panel = document.getElementById("ifttt-panel");
        if (!panel || !window.miMascota) return;

        const m = window.miMascota;
        if (!m.iftttRules) {
            m.iftttRules = [];
        }

        const maxRules = 5;
        const currentRulesCount = m.iftttRules.length;

        const ataquesBasicos = {
            "Biomutante": "PULSO VITAL", "Viral": "DESCARGA VIRAL", "Cibernético": "LÁSER DE PRECISIÓN",
            "Radiactivo": "PROYECTIL RADIACTIVO", "Tóxico": "COLMILLO VENENOSO", "Sintético": "RÁFAGA SINTÉTICA"
        };
        const basName = m.element ? (ataquesBasicos[m.element] || "GOLPE BÁSICO") : "GOLPE BÁSICO";
        const espName = m.ataques?.atk_2?.nombre || "";
        const tacName = m.ataques?.atk_3?.nombre || "";
        const defName = (m.level >= 25 && m.ataques?.atk_4) ? m.ataques.atk_4.nombre : "";

        const hasEspecial = !!espName;
        const hasTactica = !!tacName;
        const hasDefinitivo = !!defName;

        let rulesListHtml = "";
        if (currentRulesCount === 0) {
            rulesListHtml = `
                <div style="text-align: center; color: #888; font-size: 11px; padding: 15px; border: 1px dashed #334; border-radius: 8px;">
                    No hay tácticas configuradas. El Geno atacará usando el comportamiento defensivo automático de reserva (priorizar Especiales y dejar el Básico para cuando todos estén en cooldown).
                </div>
            `;
        } else {
            m.iftttRules.forEach((rule, index) => {
                rulesListHtml += `
                <div class="ifttt-rule-row" style="display: flex; align-items: center; gap: 8px; background: rgba(13, 22, 28, 0.8); border: 1px solid #334; border-radius: 8px; padding: 8px; margin-bottom: 6px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
                    <span style="color: #00acc1; font-weight: bold; font-size: 12px; min-width: 20px; text-align: center;">#${index + 1}</span>
                    
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; align-items: center; gap: 4px; font-size: 11px;">
                            <span style="color: #ffd700; width: 65px; font-weight: bold;">SI:</span>
                            <select onchange="ImplantsManager.updateRule(${index}, 'condition', this.value)" style="background: #1a2a36; border: 1px solid #334; color: #fff; border-radius: 4px; padding: 3px 6px; flex: 1; font-size: 11px; font-family: inherit;">
                                <option value="always" ${rule.condition === 'always' ? 'selected' : ''}>Siempre</option>
                                <option value="hp_under_50" ${rule.condition === 'hp_under_50' ? 'selected' : ''}>Mi HP < 50%</option>
                                <option value="hp_under_30" ${rule.condition === 'hp_under_30' ? 'selected' : ''}>Mi HP < 30%</option>
                                <option value="turn_1" ${rule.condition === 'turn_1' ? 'selected' : ''}>En el Turno 1</option>
                                <option value="rival_infected" ${rule.condition === 'rival_infected' ? 'selected' : ''}>Rival Infectado</option>
                                <option value="rival_buffed_atk" ${rule.condition === 'rival_buffed_atk' ? 'selected' : ''}>Rival con Buff de Daño</option>
                                <option value="self_buffed_spd" ${rule.condition === 'self_buffed_spd' ? 'selected' : ''}>Tengo Buff de Velocidad</option>
                                <option value="rival_element_biomutante" ${rule.condition === 'rival_element_biomutante' ? 'selected' : ''}>Rival es Biomutante</option>
                                <option value="rival_element_viral" ${rule.condition === 'rival_element_viral' ? 'selected' : ''}>Rival es Viral</option>
                                <option value="rival_element_cibernetico" ${rule.condition === 'rival_element_cibernetico' ? 'selected' : ''}>Rival es Cibernético</option>
                                <option value="rival_element_radiactivo" ${rule.condition === 'rival_element_radiactivo' ? 'selected' : ''}>Rival es Radiactivo</option>
                                <option value="rival_element_toxico" ${rule.condition === 'rival_element_toxico' ? 'selected' : ''}>Rival es Tóxico</option>
                                <option value="rival_element_sintetico" ${rule.condition === 'rival_element_sintetico' ? 'selected' : ''}>Rival es Sintético</option>
                            </select>
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px; font-size: 11px;">
                            <span style="color: #4dd0e1; width: 65px; font-weight: bold;">ENTONCES:</span>
                            <select onchange="ImplantsManager.updateRule(${index}, 'action', this.value)" style="background: #1a2a36; border: 1px solid #334; color: #fff; border-radius: 4px; padding: 3px 6px; flex: 1; font-size: 11px; font-family: inherit;">
                                <option value="definitivo" ${rule.action === 'definitivo' ? 'selected' : ''} ${!hasDefinitivo ? 'disabled' : ''}>Usar Definitivo ${defName ? `[${defName}]` : '(Bloqueado)'}</option>
                                <option value="tactica" ${rule.action === 'tactica' ? 'selected' : ''} ${!hasTactica ? 'disabled' : ''}>Usar Soporte ${tacName ? `[${tacName}]` : '(Vacío)'}</option>
                                <option value="especial" ${rule.action === 'especial' ? 'selected' : ''} ${!hasEspecial ? 'disabled' : ''}>Usar Especial ${espName ? `[${espName}]` : '(Vacío)'}</option>
                                <option value="ataque" ${rule.action === 'ataque' ? 'selected' : ''}>Usar Básico [${basName}]</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <button onclick="ImplantsManager.moveRule(${index}, -1)" style="background: transparent; border: none; color: #4dd0e1; cursor: pointer; padding: 2px; font-size: 12px; line-height: 1; transition: transform 0.1s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">🔼</button>
                        <button onclick="ImplantsManager.moveRule(${index}, 1)" style="background: transparent; border: none; color: #4dd0e1; cursor: pointer; padding: 2px; font-size: 12px; line-height: 1; transition: transform 0.1s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">🔽</button>
                    </div>
                    
                    <button onclick="ImplantsManager.deleteRule(${index})" style="background: transparent; border: none; color: #ff6b6b; cursor: pointer; padding: 6px; font-size: 14px; font-weight: bold; margin-left: 2px; transition: transform 0.1s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">❌</button>
                </div>
                `;
            });
        }

        const isAddDisabled = currentRulesCount >= maxRules;

        panel.innerHTML = `
            <div class="ifttt-container" style="background: rgba(0, 0, 0, 0.4); border: 2px solid #00acc1; border-radius: 16px; padding: 15px; box-shadow: 0 0 20px rgba(0, 172, 193, 0.2); color: #fff; display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: #4dd0e1; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">🤖 Tácticas Defensivas (IFTTT)</h3>
                    <button id="btn-add-rule" onclick="ImplantsManager.addIftttRule()" style="background: ${isAddDisabled ? '#334' : '#00acc1'}; border: none; color: ${isAddDisabled ? '#888' : 'white'}; padding: 5px 10px; border-radius: 6px; font-size: 10px; cursor: ${isAddDisabled ? 'not-allowed' : 'pointer'}; font-weight: bold; transition: 0.2s;" ${isAddDisabled ? 'disabled' : ''}>+ AÑADIR</button>
                </div>
                <p style="font-size: 10px; color: #888; margin: 0; line-height: 1.3;">
                    Configura las reglas para cuando tu Geno combata automáticamente. Las reglas se evalúan de arriba a abajo. Si ninguna coincide o el ataque está en cooldown, se utilizará la prioridad de reserva (Definitivo > Soporte > Especial > Básico).
                </p>
                <div id="ifttt-rules-list" style="margin-top: 5px; display: flex; flex-direction: column; gap: 2px;">
                    ${rulesListHtml}
                </div>
            </div>
        `;
    },

    addIftttRule: function() {
        if (!window.miMascota) return;
        if (!window.miMascota.iftttRules) window.miMascota.iftttRules = [];
        if (window.miMascota.iftttRules.length >= 5) return;

        window.miMascota.iftttRules.push({ condition: 'always', action: 'ataque' });
        this.renderIftttRules();
        this.syncAndSave();
    },

    updateRule: function(index, field, value) {
        if (!window.miMascota || !window.miMascota.iftttRules) return;
        if (window.miMascota.iftttRules[index]) {
            window.miMascota.iftttRules[index][field] = value;
            this.syncAndSave();
        }
    },

    deleteRule: function(index) {
        if (!window.miMascota || !window.miMascota.iftttRules) return;
        window.miMascota.iftttRules.splice(index, 1);
        this.renderIftttRules();
        this.syncAndSave();
    },

    moveRule: function(index, direction) {
        if (!window.miMascota || !window.miMascota.iftttRules) return;
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= window.miMascota.iftttRules.length) return;

        const temp = window.miMascota.iftttRules[index];
        window.miMascota.iftttRules[index] = window.miMascota.iftttRules[targetIndex];
        window.miMascota.iftttRules[targetIndex] = temp;

        this.renderIftttRules();
        this.syncAndSave();
    },

    closeLab: function() {
        const impScreen = document.getElementById('implants-area');
        if(impScreen) impScreen.classList.add('hidden');
        
        if (window.miMascota && typeof generarSvgGeno === 'function') {
            window.miMascota.svg = generarSvgGeno(window.miMascota);
            const pedestal = document.getElementById("geno-container");
            if (pedestal) {
                pedestal.innerHTML = `<div class="geno-idle" style="color: ${window.miMascota.color}; top: 50%; left: 50%; display: flex; justify-content: center; align-items: center;">${window.miMascota.svg}</div>`;
            }
        }

        if (typeof window.navegarA === 'function') window.navegarA('room-area');
    }
};

if (!window.implantsNavHooked) {
    window.navegarA_Original_Implants = window.navegarA;
    window.navegarA = function(id) {
        if (typeof window.navegarA_Original_Implants === 'function') window.navegarA_Original_Implants(id);
        const impScreen = document.getElementById('implants-area');
        if (impScreen) {
            if (id === 'implants-area') {
                impScreen.classList.remove('hidden');
                if (typeof ImplantsManager !== 'undefined') ImplantsManager.init();
            } else {
                impScreen.classList.add('hidden');
            }
        }
    };
    window.implantsNavHooked = true;
}