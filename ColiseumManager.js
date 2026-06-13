window.ColiseumManager = {
    seleccionarModo: function(modo) {
        if (!window.miMascota || window.miMascota.id === "temp") {
            alert("No tienes un Geno activo para combatir.");
            window.navegarA("room-area");
            return;
        }

        window.ColiseumLogic.modoCombate = modo;
        
        if (modo === 'clon') {
            const selectEl = document.getElementById('lobby-clone-element-select');
            window.ColiseumLogic.clonElementoOverride = selectEl ? selectEl.value : 'mismo';
        }
        
        if (modo === 'desafio') {
            const selectEl = document.getElementById('lobby-npc-select');
            window.ColiseumLogic.npcDesafio = selectEl ? selectEl.value : 'cyborg';
            const selectLvl = document.getElementById('lobby-npc-level-select');
            window.ColiseumLogic.npcNivelOverride = selectLvl ? parseInt(selectLvl.value) : 25;
        }

        window.navegarA('coliseum-screen');
        window.iniciarColiseo();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    ColiseumUI.inyectarCSS();

    // === SISTEMA DE AYUDA Y TUTORIAL DEL COLISEO ===
    window.ColiseumManager.ayudaBajoNivelMostrada = false;

    window.ColiseumManager.mostrarAyuda = function(destacarBajoNivel = false) {
        const modal = document.getElementById("coliseum-help-modal");
        if (!modal) return;
        
        modal.classList.remove("hidden");
        
        const lowLevelSec = document.getElementById("help-low-level-section");
        if (lowLevelSec) {
            if (destacarBajoNivel) {
                lowLevelSec.style.animation = "lowLevelPulse 1.5s infinite alternate";
                lowLevelSec.style.borderColor = "#69f0ae";
                lowLevelSec.style.boxShadow = "0 0 15px rgba(105, 240, 174, 0.4)";
            } else {
                lowLevelSec.style.animation = "none";
                lowLevelSec.style.borderColor = "rgba(105, 240, 174, 0.4)";
                lowLevelSec.style.boxShadow = "none";
            }
        }
    };

    window.ColiseumManager.ocultarAyuda = function() {
        const modal = document.getElementById("coliseum-help-modal");
        if (modal) modal.classList.add("hidden");
    };

    window.iniciarLobbyColiseo = function() {
        if (!window.miMascota || window.miMascota.id === "temp") {
            return;
        }
        
        const esBajoNivel = (window.miMascota.level || 1) < 5;
        if (esBajoNivel && !window.ColiseumManager.ayudaBajoNivelMostrada) {
            window.ColiseumManager.mostrarAyuda(true);
            window.ColiseumManager.ayudaBajoNivelMostrada = true;
        }

        if (typeof window.ColiseumManager.actualizarLobbyUI === 'function') {
            window.ColiseumManager.actualizarLobbyUI();
        }
    };

    // Configurar manejadores de eventos para el modal
    const btnHelp = document.getElementById("btn-coliseum-help");
    if (btnHelp) btnHelp.onclick = () => window.ColiseumManager.mostrarAyuda(false);

    const btnCloseHelp1 = document.getElementById("close-coliseum-help");
    if (btnCloseHelp1) btnCloseHelp1.onclick = () => window.ColiseumManager.ocultarAyuda();

    const btnCloseHelp2 = document.getElementById("btn-close-help-confirm");
    if (btnCloseHelp2) btnCloseHelp2.onclick = () => window.ColiseumManager.ocultarAyuda();

    function initColiseumCustomSelects() {
        const selects = [
            { id: 'lobby-clone-element-select', theme: 'cyan-theme' },
            { id: 'lobby-npc-select', theme: 'purple-theme' },
            { id: 'lobby-npc-level-select', theme: 'purple-theme' }
        ];

        selects.forEach(({ id, theme }) => {
            const selectEl = document.getElementById(id);
            if (!selectEl) return;

            // Evitar duplicaciones
            if (selectEl.nextSibling && selectEl.nextSibling.classList && selectEl.nextSibling.classList.contains('coliseum-select-wrapper')) {
                return;
            }

            const wrapper = document.createElement('div');
            wrapper.className = `coliseum-select-wrapper ${theme}`;

            const trigger = document.createElement('div');
            trigger.className = 'coliseum-select-trigger';

            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'coliseum-select-options';

            Array.from(selectEl.options).forEach((opt, index) => {
                const customOpt = document.createElement('div');
                customOpt.className = 'coliseum-option' + (opt.selected ? ' selected' : '');
                customOpt.innerText = opt.text;

                customOpt.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectEl.selectedIndex = index;
                    trigger.innerText = opt.text;
                    
                    Array.from(optionsContainer.children).forEach(c => c.classList.remove('selected'));
                    customOpt.classList.add('selected');

                    trigger.classList.remove('open');
                    optionsContainer.classList.remove('open');
                    wrapper.classList.remove('active-select');
                    
                    const card = wrapper.closest('.lobby-card');
                    if (card) card.classList.remove('active-card');

                    selectEl.dispatchEvent(new Event('change'));
                });

                optionsContainer.appendChild(customOpt);
            });

            const selectedOpt = selectEl.options[selectEl.selectedIndex];
            trigger.innerText = selectedOpt ? selectedOpt.text : '';

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Cerrar todos los demás selectores del coliseo
                document.querySelectorAll('.coliseum-select-trigger').forEach(otherTrigger => {
                    if (otherTrigger !== trigger) {
                        otherTrigger.classList.remove('open');
                        const otherContainer = otherTrigger.nextElementSibling;
                        if (otherContainer) otherContainer.classList.remove('open');
                        const otherWrapper = otherTrigger.parentNode;
                        if (otherWrapper) {
                            otherWrapper.classList.remove('active-select');
                            const otherCard = otherWrapper.closest('.lobby-card');
                            if (otherCard) otherCard.classList.remove('active-card');
                        }
                    }
                });

                const isOpen = trigger.classList.toggle('open');
                optionsContainer.classList.toggle('open');
                const card = wrapper.closest('.lobby-card');
                if (isOpen) {
                    wrapper.classList.add('active-select');
                    if (card) card.classList.add('active-card');
                } else {
                    wrapper.classList.remove('active-select');
                    if (card) card.classList.remove('active-card');
                }
            });

            wrapper.appendChild(trigger);
            wrapper.appendChild(optionsContainer);
            selectEl.parentNode.insertBefore(wrapper, selectEl.nextSibling);
            selectEl.style.setProperty('display', 'none', 'important');
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            document.querySelectorAll('.coliseum-select-trigger').forEach(trigger => {
                const wrapper = trigger.parentNode;
                if (wrapper && !wrapper.contains(e.target)) {
                    trigger.classList.remove('open');
                    const options = trigger.nextElementSibling;
                    if (options) options.classList.remove('open');
                    wrapper.classList.remove('active-select');
                    const card = wrapper.closest('.lobby-card');
                    if (card) card.classList.remove('active-card');
                }
            });
        });
    }
    window.ColiseumManager.initColiseumCustomSelects = initColiseumCustomSelects;
    initColiseumCustomSelects();

    window.iniciarColiseo = function() {
        if (!window.miMascota || window.miMascota.id === "temp") {
            alert("No tienes un Geno activo para combatir.");
            window.navegarA("room-area");
            return;
        }
        ColiseumUI.configurarDOM();
        
        const titleEl = document.querySelector(".coliseum-title-inside") || document.querySelector("#coliseum-screen .screen-title");
        if (titleEl) titleEl.classList.remove("hidden");
    
        ColiseumUI.limpiarLog();
        ColiseumUI.agregarLog(`<span style="color:#aaa;">> Conectando con los servidores del Coliseo...</span><br><span style="color:#4dd0e1">> Arena lista. Esperando combatientes.</span>`);

        let btnStart = document.getElementById("btn-start-battle");
        if (btnStart) btnStart.onclick = iniciarPelea;

        let btnAtk1 = document.getElementById("btn-atk-1");
        if (btnAtk1) btnAtk1.onclick = () => procesarRonda("ataque");
        let btnAtk2 = document.getElementById("btn-atk-2");
        if (btnAtk2) btnAtk2.onclick = () => procesarRonda("especial");
        let btnAtk3 = document.getElementById("btn-atk-3");
        if (btnAtk3) btnAtk3.onclick = () => procesarRonda("tactica");
        let btnAtk4 = document.getElementById("btn-atk-4");
        if (btnAtk4) btnAtk4.onclick = () => procesarRonda("definitivo");

        let btnSwapA = document.getElementById("btn-swap-a");
        if (btnSwapA) btnSwapA.onclick = () => {
            if (!btnSwapA.disabled) {
                procesarRonda("swap_a");
            }
        };
        let btnSwapB = document.getElementById("btn-swap-b");
        if (btnSwapB) btnSwapB.onclick = () => {
            if (!btnSwapB.disabled) {
                procesarRonda("swap_b");
            }
        };

        let btnLeave = document.getElementById("btn-leave-battle");
        if (btnLeave) {
            btnLeave.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                window.ColiseumManager.detenerTemporizadorTurno();
                
                if (window.ColiseumLogic.modoCombate === 'torre') {
                    const evAPagar = window.towerSessionEvAccumulated || 0;
                    if (evAPagar > 0) {
                        if (!window.miInventario) window.miInventario = { vitalEssence: 0, items: [] };
                        window.miInventario.vitalEssence = (window.miInventario.vitalEssence || 0) + evAPagar;
                        alert(`✨ ¡Te has retirado de la Torre! Recibes el 100% de la esencia acumulada en esta tanda: +${evAPagar} EV.`);
                        if (window.miInventario && typeof window.miInventario.updateUI === 'function') {
                            window.miInventario.updateUI();
                        }
                    }
                    window.towerSessionActive = false;
                    window.towerSessionEvAccumulated = 0;
                    
                    window.navegarA('coliseum-lobby-screen');
                    if (window.guardarProgreso) window.guardarProgreso();
                } else if (window.ColiseumLogic.modoCombate === 'pvp') {
                    // Abandono voluntario en PvP cuenta como derrota
                    window.ColiseumManager.detenerTemporizadorTurno();
                    window.arenaBattlesPlayed++;
                    window.arenaLosses++;
                    
                    let activeLeague = window.ColiseumManager.obtenerLigaPorGeno(window.miMascota);
                    let prField = window.ColiseumManager.obtenerPrFieldPorLiga(activeLeague);
                    if (prField) {
                        window[prField] = Math.max(0, (window[prField] || 0) - 15);
                    }
                    
                    if (window.arenaBattlesPlayed >= 5) {
                        window.ColiseumManager.liquidarPaseArena();
                    } else {
                        window.navegarA('coliseum-lobby-screen');
                        if (window.guardarProgreso) window.guardarProgreso();
                    }
                } else {
                    window.navegarA('coliseum-lobby-screen');
                }
            };
        }
    };

    function iniciarPelea() {
        const esTorreActiva = (ColiseumLogic.modoCombate === 'torre' && window.towerSessionActive);
        
        if (!esTorreActiva) {
            if (window.nexoEnergy < 10) {
                alert("No tienes suficiente Energía Nexo. Se requieren 10 de Energía Nexo para combatir (Tienes: " + Math.floor(window.nexoEnergy || 0) + ").");
                return;
            }
            if (ColiseumLogic.modoCombate === '3v3') {
                const teamGenos = (ColiseumLogic.playerTeamIds || []).map(id => window.misGenos.find(g => String(g.id) === String(id))).filter(Boolean);
                if (teamGenos.length < 3) {
                    alert("No tienes un equipo de 3 Genos configurado correctamente.");
                    return;
                }
                const sinResistencia = teamGenos.some(g => (g.resistencia !== undefined ? g.resistencia : 100) < 20);
                if (sinResistencia) {
                    alert("Al menos uno de tus Genos seleccionados no tiene suficiente Resistencia. Se requieren 20 de Resistencia para combatir.");
                    return;
                }
                const enHuelga = teamGenos.some(g => window.isGenoNeglected && window.isGenoNeglected(g));
                if (enHuelga) {
                    alert("⚠️ Al menos uno de tus Genos seleccionados está en huelga (necesidades básicas por debajo del 20%) y se niega a combatir. ¡Cuídalo en el Laboratorio!");
                    return;
                }
            } else {
                const activeGenoRes = window.miMascota ? (window.miMascota.resistencia !== undefined ? window.miMascota.resistencia : 100) : 100;
                if (activeGenoRes < 20) {
                    alert("Tu Geno activo no tiene suficiente Resistencia. Se requieren 20 de Resistencia para combatir (Tiene: " + Math.floor(activeGenoRes) + ").");
                    return;
                }
                if (window.isGenoNeglected && window.isGenoNeglected(window.miMascota)) {
                    alert("⚠️ Tu Geno activo está en huelga (necesidades básicas por debajo del 20%) y se niega a combatir. ¡Cuídalo en el Laboratorio!");
                    return;
                }
            }
        }

        let oldChoice = document.getElementById("boss-choice-container");
        if (oldChoice) oldChoice.remove();

        if (ColiseumLogic.modoCombate === 'estandar') {
            const rollBoss = Math.random() < 0.15;
            if (rollBoss) {
                let btnStart = document.getElementById("btn-start-battle");
                let btnLeave = document.getElementById("btn-leave-battle");
                if (btnStart) btnStart.style.setProperty("display", "none", "important");
                if (btnLeave) btnLeave.style.setProperty("display", "none", "important");

                ColiseumUI.limpiarLog();
                ColiseumUI.agregarLog(`<span style="color:#d500f9; font-weight:bold; font-size:14px; text-shadow: 0 0 10px rgba(213,0,249,0.5);">⚠️ DETECTADA SEÑAL DE JEFE DE LIGA</span>`);
                ColiseumUI.agregarLog(`<span style="color:#ce93d8;">> Un poderoso Jefe de Liga está rondando la arena. ¿Deseas desafiarlo por recompensas de experiencia adicionales (+15% XP) o prefieres buscar un rival estándar?</span>`);

                let choiceContainer = document.createElement("div");
                choiceContainer.id = "boss-choice-container";
                choiceContainer.className = "boss-choice-wrapper";
                choiceContainer.innerHTML = `
                    <button id="btn-challenge-boss" class="boss-btn-challenge">⚔️ Desafiar al Jefe de Liga</button>
                    <button id="btn-skip-boss" class="boss-btn-standard">Buscar Rival Estándar</button>
                `;
                
                let battleArea = document.getElementById("battle-area");
                if (battleArea) {
                    battleArea.appendChild(choiceContainer);
                } else {
                    document.getElementById("coliseum-screen").appendChild(choiceContainer);
                }

                document.getElementById("btn-challenge-boss").onclick = () => {
                    choiceContainer.remove();
                    iniciarPeleaConfirmada(true);
                };

                document.getElementById("btn-skip-boss").onclick = () => {
                    choiceContainer.remove();
                    iniciarPeleaConfirmada(false);
                };
                return;
            }
        }
        
        iniciarPeleaConfirmada(false);
    }

    function iniciarPeleaConfirmada(quiereJefe) {
        const esTorreActiva = (ColiseumLogic.modoCombate === 'torre' && window.towerSessionActive);
        
        if (!esTorreActiva) {
            if (window.nexoEnergy < 10) {
                alert("No tienes suficiente Energía Nexo para combatir.");
                return;
            }
            if (ColiseumLogic.modoCombate === '3v3') {
                const teamGenos = (ColiseumLogic.playerTeamIds || []).map(id => window.misGenos.find(g => String(g.id) === String(id))).filter(Boolean);
                if (teamGenos.length < 3) {
                    alert("No tienes un equipo de 3 Genos configurado correctamente.");
                    return;
                }
                const sinResistencia = teamGenos.some(g => (g.resistencia !== undefined ? g.resistencia : 100) < 20);
                if (sinResistencia) {
                    alert("Al menos uno de tus Genos seleccionados no tiene suficiente Resistencia.");
                    return;
                }
                const enHuelga = teamGenos.some(g => window.isGenoNeglected && window.isGenoNeglected(g));
                if (enHuelga) {
                    alert("⚠️ Al menos uno de tus Genos seleccionados está en huelga (necesidades básicas por debajo del 20%) y se niega a combatir. ¡Cuídalo en el Laboratorio!");
                    return;
                }
            } else {
                const activeGenoRes = window.miMascota ? (window.miMascota.resistencia !== undefined ? window.miMascota.resistencia : 100) : 100;
                if (activeGenoRes < 20) {
                    alert("Tu Geno activo no tiene suficiente Resistencia.");
                    return;
                }
                if (window.isGenoNeglected && window.isGenoNeglected(window.miMascota)) {
                    alert("⚠️ Tu Geno activo está en huelga (necesidades básicas por debajo del 20%) y se niega a combatir. ¡Cuídalo en el Laboratorio!");
                    return;
                }
            }

            if (window.NexoEnergyManager) {
                window.NexoEnergyManager.descontarEnergia(10);
                if (ColiseumLogic.modoCombate === '3v3') {
                    const teamGenos = (ColiseumLogic.playerTeamIds || []).map(id => window.misGenos.find(g => String(g.id) === String(id))).filter(Boolean);
                    teamGenos.forEach(geno => {
                        window.NexoEnergyManager.descontarResistenciaGeno(geno, 20);
                    });
                } else {
                    window.NexoEnergyManager.descontarResistenciaGeno(window.miMascota, 20);
                }
            }

            if (ColiseumLogic.modoCombate === 'torre') {
                window.towerSessionActive = true;
                window.towerSessionEvAccumulated = 0;
            }
        }

        let btnStart = document.getElementById("btn-start-battle");
        let btnLeave = document.getElementById("btn-leave-battle");
        let controls = document.getElementById("battle-controls");
        
        if(btnStart) btnStart.style.setProperty("display", "none", "important");
        if(controls) controls.style.setProperty("display", "grid", "important");
        
        if (ColiseumLogic.modoCombate === 'torre') {
            if(btnLeave) {
                btnLeave.style.setProperty("display", "block", "important");
                const textEl = btnLeave.querySelector(".fab-content");
                if (textEl) textEl.innerText = "RETIRARSE";
            }
        } else {
            if(btnLeave) btnLeave.style.setProperty("display", "none", "important");
        }
        
        const titleEl = document.querySelector(".coliseum-title-inside") || document.querySelector("#coliseum-screen .screen-title");
        if (titleEl) titleEl.classList.add("hidden");
        
        ColiseumUI.limpiarLog();
        ColiseumUI.agregarLog(`<span style="color:#4dd0e1">> INICIALIZANDO SECUENCIA DE COMBATE...</span>`);
        ColiseumUI.agregarLog(`<br><span style="color:#ffcc00; font-weight:bold;">--- BATTLE START ---</span>`);

        ColiseumLogic.esperandoSwapForzado = false;
        ColiseumLogic.prepararJugador(window.miMascota);
        ColiseumLogic.generarRivalProcedural(window.miMascota.level || 1, quiereJefe);
        
        const p = ColiseumLogic.player;
        const e = ColiseumLogic.enemy;

        const notificationBanner = document.getElementById("coliseum-battle-notification");
        if (notificationBanner) {
            notificationBanner.classList.add("hidden");
        }

        if (ColiseumLogic.trainingSupportActive) {
            ColiseumUI.agregarLog(`<span style="color:#69f0ae; font-weight:bold;">🛡️ MODO ENTRENAMIENTO: Tu Geno es menor a nivel 5. Parámetros del oponente ajustados (-15% estadísticas base, nivel equilibrado).</span>`);
        }

        let calidadEnemigo = "C";
        if (e.adn && e.adn.stats && e.adn.stats.pureza) {
            let pureza = e.adn.stats.pureza;
            if (pureza >= 90) calidadEnemigo = "S"; else if (pureza >= 80) calidadEnemigo = "A";
            else if (pureza >= 60) calidadEnemigo = "B"; else if (pureza >= 40) calidadEnemigo = "C"; else calidadEnemigo = "D";
        } else {
            const prob = Math.random();
            if (e.rareza === "Legendario" || e.rareza === "Épico") calidadEnemigo = prob > 0.5 ? "S" : "A";
            else if (e.rareza === "Raro") calidadEnemigo = prob > 0.5 ? "A" : "B";
            else calidadEnemigo = prob > 0.7 ? "B" : (prob > 0.3 ? "C" : "D");
        }

        if (e.esJefeDeLiga) {
            ColiseumUI.agregarLog(`<span style="color:#d500f9; font-weight:bold; font-size:13px; text-shadow: 0 0 5px rgba(213,0,249,0.4);">⚔️ DETECTADO: ${ColiseumLogic.cName(e)} (Jefe de Liga)</span>`);
        }
        ColiseumUI.agregarLog(`<span style="color:#b19cd9;">> 🧬 Escáner detecta Genética de ${ColiseumLogic.cName(e)}: Calidad [${calidadEnemigo}].</span>`);
        const ventajas = { "Biomutante": "Sintético", "Sintético": "Tóxico", "Tóxico": "Radiactivo", "Radiactivo": "Cibernético", "Cibernético": "Viral", "Viral": "Biomutante" };
        if (ventajas[p.element] === e.element) {
            ColiseumUI.agregarLog(`<span style="color:#4CAF50; font-weight:bold;">> ⚔️ Matchup: ¡VENTAJA! Tus ataques ${p.element} harán +35% de Daño a ${ColiseumLogic.cName(e)}, y los suyos te harán -25%.</span>`);
        } else if (ventajas[e.element] === p.element) {
            ColiseumUI.agregarLog(`<span style="color:#ff5722; font-weight:bold;">> ⚠️ Matchup: ¡PELIGRO! Los ataques ${e.element} de ${ColiseumLogic.cName(e)} te harán +35% de Daño, y los tuyos harán -25%.</span>`);
        } else {
            ColiseumUI.agregarLog(`<span style="color:#80deea;">> ⚖️ Matchup: Neutral (${p.element} vs ${e.element}). Terreno equilibrado entre ${ColiseumLogic.cName(p)} y ${ColiseumLogic.cName(e)}.</span>`);
        }
        ColiseumUI.agregarLog(`<br>`);

        ColiseumUI.actualizarGraficos(ColiseumLogic.player, ColiseumLogic.enemy);
        ColiseumUI.actualizarHP(ColiseumLogic.player, ColiseumLogic.enemy);
        
        if (typeof ColiseumUI.actualizarEstados === 'function') {
            ColiseumUI.actualizarEstados(ColiseumLogic.player, ColiseumLogic.enemy);
        }
        
        actualizarBotones();
    }

    function procesarRonda(accionJugador) {
        if (typeof window.ColiseumManager.detenerTemporizadorTurno === 'function') {
            window.ColiseumManager.detenerTemporizadorTurno();
        }
        // Restablecer el contador de timeouts consecutivos si el jugador realiza una acción manual
        if (!window.ColiseumLogic.playerAutopilot) {
            window.ColiseumLogic.playerTimeouts = 0;
        }
        if (ColiseumLogic.modoCombate === '3v3' && ColiseumLogic.esperandoSwapForzado) {
            if (accionJugador === "swap_a" || accionJugador === "swap_b") {
                const activeIdx = ColiseumLogic.playerActiveIndex;
                let targetIndex = activeIdx;
                if (accionJugador === "swap_a") {
                    targetIndex = activeIdx === 0 ? 1 : (activeIdx === 1 ? 0 : 0);
                } else if (accionJugador === "swap_b") {
                    targetIndex = activeIdx === 0 ? 2 : (activeIdx === 1 ? 2 : 1);
                }
                
                if (ColiseumLogic.playerTeam[targetIndex] && ColiseumLogic.playerTeam[targetIndex].hp > 0) {
                    ColiseumLogic.esperandoSwapForzado = false;
                    ColiseumLogic.swapGeno(true, targetIndex);
                    
                    const p = ColiseumLogic.player;
                    const e = ColiseumLogic.enemy;
                    
                    ColiseumUI.agregarLog(`> 🔄 <span style="color:#00e5ff; font-weight:bold;">¡Entra ${ColiseumLogic.cName(p)} al combate!</span>`);
                    
                    ColiseumUI.animarSoporte(true, { nombre: "RELEVO" });
                    ColiseumUI.actualizarGraficos(p, e);
                    ColiseumUI.actualizarHP(p, e);
                    if (typeof ColiseumUI.actualizarEstados === 'function') {
                        ColiseumUI.actualizarEstados(p, e);
                    }
                    
                    actualizarBotones();
                }
            }
            return;
        }

        if (accionJugador === "swap_a" || accionJugador === "swap_b") {
            if (ColiseumLogic.player.estados.includes("Enredado")) {
                ColiseumUI.agregarLog(`> ❌ <span style="color:#ff3333; font-weight:bold;">¡No puedes retirar a tu Geno porque está Enredado!</span>`);
                actualizarBotones();
                return;
            }

            ColiseumUI.agregarLog(`<br><span style="color:#4dd0e1; font-weight:bold; letter-spacing: 1px;">[ --- TURNO ${ColiseumLogic.turno} --- ]</span>`);
            bloquearBotones(true);
            
            const activeIdx = ColiseumLogic.playerActiveIndex;
            let targetIndex = activeIdx;
            if (accionJugador === "swap_a") {
                targetIndex = activeIdx === 0 ? 1 : (activeIdx === 1 ? 0 : 0);
            } else if (accionJugador === "swap_b") {
                targetIndex = activeIdx === 0 ? 2 : (activeIdx === 1 ? 2 : 1);
            }
            
            const oldName = ColiseumLogic.player.nombre;
            ColiseumLogic.swapGeno(true, targetIndex);
            const p = ColiseumLogic.player;
            const e = ColiseumLogic.enemy;
            
            ColiseumUI.agregarLog(`> 🔄 <span style="color:#a855f7; font-weight:bold;">${oldName} se retira del combate y entra ${ColiseumLogic.cName(p)}!</span>`);
            
            ColiseumUI.animarSoporte(true, { nombre: "RELEVO" });
            ColiseumUI.actualizarGraficos(p, e);
            ColiseumUI.actualizarHP(p, e);
            if (typeof ColiseumUI.actualizarEstados === 'function') {
                ColiseumUI.actualizarEstados(p, e);
            }
            
            // Turno del enemigo
            let accionEnemigo = ColiseumLogic.resolverAccionIFTTT(e, p);
            
            setTimeout(() => {
                let tiempoEnemy = ejecutarAccionYAnimar(e, p, accionEnemigo);
                setTimeout(() => {
                    finalizarRonda();
                }, tiempoEnemy + 400);
            }, 1000);
            return;
        }

        ColiseumUI.agregarLog(`<br><span style="color:#4dd0e1; font-weight:bold; letter-spacing: 1px;">[ --- TURNO ${ColiseumLogic.turno} --- ]</span>`);
        bloquearBotones(true);

        const p = ColiseumLogic.player;
        const e = ColiseumLogic.enemy;

        // ✨ IA ESTRATÉGICA BASADA EN REGLAS IFTTT O PRIORIDAD DE RESERVA (FALLBACK)
        let accionEnemigo = ColiseumLogic.resolverAccionIFTTT(e, p);

        let playerGoesFirst = p.spd >= e.spd;
        if (p.spd === e.spd) playerGoesFirst = Math.random() > 0.5;

        let ejecutor1 = playerGoesFirst ? p : e;
        let ejecutor2 = playerGoesFirst ? e : p;
        let accion1 = playerGoesFirst ? accionJugador : accionEnemigo;
        let accion2 = playerGoesFirst ? accionEnemigo : accionJugador;

        let tiempo1 = ejecutarAccionYAnimar(ejecutor1, ejecutor2, accion1);
        
        if (ejecutor2.hp > 0) {
            setTimeout(() => {
                ColiseumUI.agregarLog(`<span style="color:#555;">&nbsp;&nbsp;♦ ♦ ♦</span>`); 
                let tiempo2 = ejecutarAccionYAnimar(ejecutor2, ejecutor1, accion2);
                
                setTimeout(() => { finalizarRonda(); }, tiempo2 + 400); 
            }, tiempo1 + 400); 
        } else {
            setTimeout(() => { finalizarRonda(); }, tiempo1 + 400);
        }
    }

    function ejecutarAccionYAnimar(atacante, defensor, accionElegida) {
        if (atacante.hp <= 0 || defensor.hp <= 0) return 0;
        
        // ✨ FIX V10.4: SISTEMA DE CONTROL DE MASAS (Parálisis y Congelación)
        // Bloquean el turno ANTES de ejecutar el ataque
        if (atacante.estados.includes("Congelación") || atacante.estados.includes("Congelacion")) {
            ColiseumUI.agregarLog(`> ❄️ <span style="color:#80deea; font-weight:bold;">¡${ColiseumLogic.cName(atacante)} está completamente congelado y no puede moverse!</span>`);
            ColiseumUI.mostrarTextoFlotante(atacante.isPlayer, "¡CONGELADO!", "text-block");
            ColiseumUI.animarDano(atacante.isPlayer, null, "ataque"); // Hace un pequeño temblor
            return 1000; // Tarda 1 segundo la animación y salta el turno
        }

        if (atacante.estados.includes("Parálisis") || atacante.estados.includes("Paralisis")) {
            // 35% de probabilidad de que la parálisis le impida moverse ese turno
            if (Math.random() <= 0.35) { 
                ColiseumUI.agregarLog(`> ⚡ <span style="color:#ffcc00; font-weight:bold;">¡${ColiseumLogic.cName(atacante)} está paralizado! ¡Su cuerpo no responde!</span>`);
                ColiseumUI.mostrarTextoFlotante(atacante.isPlayer, "¡PARALIZADO!", "text-crit");
                ColiseumUI.animarDano(atacante.isPlayer, null, "ataque"); // Tiembla de la electricidad
                if(window.Sonidos) window.Sonidos.play("hit");
                return 1000;
            }
        }

        let hpVisualAtacante = atacante.hp;
        let hpVisualDefensor = defensor.hp;

        const ataqueUsado = atacante.ataquesEquipados[accionElegida];
        const resultado = ColiseumLogic.ejecutarAtaqueCompleto(atacante, defensor, accionElegida);
        
        resultado.logs.forEach(log => ColiseumUI.agregarLog(log));
        let hayGolpesDirectos = resultado.anims.detalleGolpes && resultado.anims.detalleGolpes.length > 0;
        
        let delayGolpes = 750; 
        let tiempoAnimacion = 800; 

        if (hayGolpesDirectos) {
            tiempoAnimacion = resultado.anims.detalleGolpes.length * delayGolpes;
            resultado.anims.detalleGolpes.forEach((golpe, idx) => {
                setTimeout(() => {
                    if (resultado.anims.atacanteGrita || golpe.dmg > 0) {
                         ColiseumUI.animarAtaque(atacante.isPlayer, ataqueUsado, accionElegida);
                    }
                    
                    if (golpe.dmg > 0) {
                        ColiseumUI.animarDano(!atacante.isPlayer, ataqueUsado, accionElegida);
                        if (golpe.critico) ColiseumUI.mostrarTextoFlotante(!atacante.isPlayer, "CRÍTICO!", "text-crit");
                        ColiseumUI.mostrarTextoFlotante(!atacante.isPlayer, `-${golpe.dmg}`, "text-dmg");
                        if(window.Sonidos) window.Sonidos.play("hit");

                        hpVisualDefensor = Math.max(0, hpVisualDefensor - golpe.dmg);
                        
                        if (atacante.genesId.includes("vampirismo_genetico")) {
                            let robo = Math.max(1, Math.floor(golpe.dmg * 0.15));
                            hpVisualAtacante = Math.min(atacante.maxHp, hpVisualAtacante + robo);
                        }
                     } else if (golpe.bloqueado) {
                        ColiseumUI.animarSoporte(!atacante.isPlayer, {escudo: true});
                        ColiseumUI.mostrarTextoFlotante(!atacante.isPlayer, "BLOCKED!", "text-block");
                    } else if (golpe.evadido) {
                        ColiseumUI.mostrarTextoFlotante(!atacante.isPlayer, "EVADED!", "text-evade");
                    }

                    let pFalso = atacante.isPlayer ? { ...atacante, hp: hpVisualAtacante } : { ...defensor, hp: hpVisualDefensor };
                    let eFalso = atacante.isPlayer ? { ...defensor, hp: hpVisualDefensor } : { ...atacante, hp: hpVisualAtacante };
                    
                    ColiseumUI.actualizarHP(pFalso, eFalso);

                    if (typeof ColiseumUI.actualizarEstados === 'function') {
                        ColiseumUI.actualizarEstados(ColiseumLogic.player, ColiseumLogic.enemy);
                    }
                }, idx * delayGolpes); 
            });
        } else if (ataqueUsado) {
            ColiseumUI.animarSoporte(atacante.isPlayer, ataqueUsado);
            
            if (ataqueUsado.aplicaEstado || ataqueUsado.debuffAtk || ataqueUsado.debuffSpd || ataqueUsado.nombre === "Campo Radioactivo") {
                setTimeout(() => {
                    ColiseumUI.animarDano(!atacante.isPlayer, ataqueUsado, accionElegida);
                }, 300);
                tiempoAnimacion = 1000; 
            }

            ColiseumUI.actualizarHP(ColiseumLogic.player, ColiseumLogic.enemy);
            if (typeof ColiseumUI.actualizarEstados === 'function') {
                ColiseumUI.actualizarEstados(ColiseumLogic.player, ColiseumLogic.enemy);
            }
        }
        
        setTimeout(() => {
            if (resultado.anims.curacionAtacante > 0) {
                ColiseumUI.animarCuracion(atacante.isPlayer);
                ColiseumUI.mostrarTextoFlotante(atacante.isPlayer, `+${resultado.anims.curacionAtacante}`, "text-heal");
            }
            ColiseumUI.actualizarHP(ColiseumLogic.player, ColiseumLogic.enemy);
        }, tiempoAnimacion + 100);

        return tiempoAnimacion; 
    }

    function finalizarRonda() {
        let p = ColiseumLogic.player;
        let e = ColiseumLogic.enemy;

        let hpVisualP = p.hp;
        let hpVisualE = e.hp;

        let resP = ColiseumLogic.procesarEfectosFinTurno(p);
        let resE = ColiseumLogic.procesarEfectosFinTurno(e);
        let huboEfectos = resP.logs.length > 0 || resE.logs.length > 0;

        let delayDmg = 0;

        if (huboEfectos) {
            ColiseumUI.agregarLog(`<span style="color:#777; font-style:italic;">[Efectos y Condiciones]</span>`);
            resP.logs.forEach(l => ColiseumUI.agregarLog(l));
            resE.logs.forEach(l => ColiseumUI.agregarLog(l));

            let healP = resP.anims.heal > 0;
            let healE = resE.anims.heal > 0;
            let dmgP = resP.anims.dmg > 0;
            let dmgE = resE.anims.dmg > 0;

            if (healP || healE) {
                delayDmg = 800; 
                setTimeout(() => {
                    if (healP) {
                        ColiseumUI.animarCuracion(true);
                        ColiseumUI.mostrarTextoFlotante(true, `+${resP.anims.heal}`, "text-heal");
                        hpVisualP = Math.min(p.maxHp, hpVisualP + resP.anims.heal);
                    }
                    if (healE) {
                        ColiseumUI.animarCuracion(false);
                        ColiseumUI.mostrarTextoFlotante(false, `+${resE.anims.heal}`, "text-heal");
                        hpVisualE = Math.min(e.maxHp, hpVisualE + resE.anims.heal);
                    }
                    
                    let pFalso = { ...p, hp: hpVisualP };
                    let eFalso = { ...e, hp: hpVisualE };
                    ColiseumUI.actualizarHP(pFalso, eFalso);
                }, 100);
            }

            if (dmgP || dmgE) {
                setTimeout(() => {
                    if (dmgP) {
                        ColiseumUI.animarDano(true);
                        ColiseumUI.mostrarTextoFlotante(true, `-${resP.anims.dmg}`, "text-dmg");
                        hpVisualP = Math.max(0, hpVisualP - resP.anims.dmg);
                    }
                    if (dmgE) {
                        ColiseumUI.animarDano(false);
                        ColiseumUI.mostrarTextoFlotante(false, `-${resE.anims.dmg}`, "text-dmg");
                        hpVisualE = Math.max(0, hpVisualE - resE.anims.dmg);
                    }

                    let pFalso = { ...p, hp: hpVisualP };
                    let eFalso = { ...e, hp: hpVisualE };
                    ColiseumUI.actualizarHP(pFalso, eFalso);
                }, 100 + delayDmg);
            }
        }

        if (p.cooldowns.especial > 0) p.cooldowns.especial--;
        if (p.cooldowns.tactica > 0) p.cooldowns.tactica--;
        if (p.cooldowns.definitivo > 0) p.cooldowns.definitivo--;

        if (e.cooldowns.especial > 0) e.cooldowns.especial--;
        if (e.cooldowns.tactica > 0) e.cooldowns.tactica--;
        if (e.cooldowns.definitivo > 0) e.cooldowns.definitivo--;

        let tiempoTotalEfectos = huboEfectos ? (100 + delayDmg + 800) : 400;

        setTimeout(() => {
            let pCaido = p.hp <= 0;
            let eCaido = e.hp <= 0;

            if (ColiseumLogic.modoCombate === '3v3') {
                let huboRelevoForzado = false;

                if (eCaido) {
                    let nextEnemyIdx = -1;
                    for (let i = 1; i <= 2; i++) {
                        let candidate = (ColiseumLogic.enemyActiveIndex + i) % 3;
                        if (ColiseumLogic.enemyTeam[candidate] && ColiseumLogic.enemyTeam[candidate].hp > 0) {
                            nextEnemyIdx = candidate;
                            break;
                        }
                    }
                    if (nextEnemyIdx !== -1) {
                        ColiseumLogic.swapGeno(false, nextEnemyIdx);
                        ColiseumUI.agregarLog(`> 💥 <span style="color:#ffcc00; font-weight:bold;">¡${e.nombre} ha sido derrotado!</span>`);
                        ColiseumUI.agregarLog(`> 🔄 <span style="color:#ff6b6b; font-weight:bold;">¡El rival envía a ${ColiseumLogic.cName(ColiseumLogic.enemy)} al combate!</span>`);
                        e = ColiseumLogic.enemy;
                        eCaido = false;
                        huboRelevoForzado = true;
                    }
                }

                if (pCaido) {
                    const tieneReservas = ColiseumLogic.playerTeam && ColiseumLogic.playerTeam.some(g => g.hp > 0);
                    const enemigoTieneGenosVivos = e.hp > 0 || (ColiseumLogic.enemyTeam && ColiseumLogic.enemyTeam.some(g => g.hp > 0));
                    
                    if (tieneReservas && enemigoTieneGenosVivos) {
                        ColiseumLogic.esperandoSwapForzado = true;
                        ColiseumUI.agregarLog(`> 💀 <span style="color:#ff3333; font-weight:bold;">¡${p.nombre} ha caído! Selecciona a tu próximo Geno usando los botones de relevo.</span>`);
                        pCaido = false;
                    }
                }

                if (huboRelevoForzado) {
                    ColiseumUI.actualizarGraficos(p, e);
                }
            }

            ColiseumUI.actualizarHP(p, e);
            
            if (typeof ColiseumUI.actualizarEstados === 'function') {
                ColiseumUI.actualizarEstados(p, e);
            }
            
            ColiseumLogic.turno++;
            
            if (pCaido || eCaido) terminarCombate();
            else actualizarBotones();
        }, tiempoTotalEfectos);
    }

    function terminarCombate() {
        bloquearBotones(true);
        window.ColiseumManager.detenerTemporizadorTurno();
        ColiseumUI.agregarLog(`<br><span style="color:#ffcc00; font-size: 16px; font-weight: bold;">--- FIN DEL COMBATE ---</span>`);
        const playerGano = ColiseumLogic.modoCombate === '3v3' ? ColiseumLogic.playerTeam.some(g => g.hp > 0) : (ColiseumLogic.player.hp > 0);
        
        // Registrar uso y recompensas pasivas del fantasma en Supabase
        if (ColiseumLogic.modoCombate === 'pvp' && ColiseumLogic.enemy && ColiseumLogic.enemy.ownerId) {
            const ghostOwnerId = ColiseumLogic.enemy.ownerId;
            const ghostGano = !playerGano;
            window.supabaseClient
                .rpc('registrar_batalla_fantasma', {
                    p_ghost_owner_id: ghostOwnerId,
                    p_ghost_gano: ghostGano
                })
                .then(({ data, error }) => {
                    if (error) {
                        console.error("[GHOST REGISTRATION ERROR]", error);
                    } else {
                        console.log("[GHOST REGISTRATION SUCCESS]", data);
                    }
                });
        }
        
        if (playerGano) {
            ColiseumUI.agregarLog(`<span style="color:#4CAF50">🏆 ¡VICTORIA!</span>`, "#ffd54f");
            
            if (ColiseumLogic.modoCombate === 'torre') {
                const floor = window.currentTowerFloor || 1;
                let isFirstTimeUnlock = (floor > window.maxFloor);
                let evReward = 0;
                let rewardMsg = "";
                
                if (isFirstTimeUnlock) {
                    if (floor >= 1 && floor <= 9) {
                        evReward = 100;
                    } else if (floor === 10) {
                        evReward = 400;
                        if (window.miInventario) {
                            const itemObj = { id: "plano_cosmetico_raro", name: "Plano Cosmético Raro", count: 1, type: "cosmetic_plan" };
                            if (!window.miInventario.items) window.miInventario.items = [];
                            if (typeof window.miInventario.addItem === "function") {
                                window.miInventario.addItem(itemObj);
                            } else {
                                window.miInventario.items.push(itemObj);
                            }
                            rewardMsg += `¡Y encontraste un Plano Cosmético Raro garantizado! `;
                        }
                    } else if (floor >= 11 && floor <= 19) {
                        evReward = 200;
                    } else if (floor === 20) {
                        evReward = 800;
                        if (window.miInventario) {
                            const itemObj = { id: "plano_cosmetico_raro", name: "Plano Cosmético Raro", count: 1, type: "cosmetic_plan" };
                            if (!window.miInventario.items) window.miInventario.items = [];
                            if (typeof window.miInventario.addItem === "function") {
                                window.miInventario.addItem(itemObj);
                            } else {
                                window.miInventario.items.push(itemObj);
                            }
                            rewardMsg += `¡Y encontraste un Plano Cosmético Raro garantizado! `;
                        }
                    } else if (floor >= 21 && floor <= 25) {
                        evReward = 300;
                    } else if (floor >= 26 && floor <= 29) {
                        evReward = 500;
                    } else if (floor === 30) {
                        evReward = 900;
                        if (window.miInventario) {
                            const itemObj = { id: "plano_cosmetico_raro", name: "Plano Cosmético Raro", count: 1, type: "cosmetic_plan" };
                            if (!window.miInventario.items) window.miInventario.items = [];
                            if (typeof window.miInventario.addItem === "function") {
                                window.miInventario.addItem(itemObj);
                            } else {
                                window.miInventario.items.push(itemObj);
                            }
                            rewardMsg += `¡Y encontraste un Plano Cosmético Raro garantizado y Checkpoint 3! `;
                        }
                    } else {
                        evReward = 500;
                    }
                } else {
                    evReward = 0;
                    rewardMsg = "Piso repetido. ";
                }
                
                window.towerSessionEvAccumulated = (window.towerSessionEvAccumulated || 0) + evReward;
                window.maxFloor = Math.max(window.maxFloor, floor);
                
                ColiseumUI.agregarLog(`<span style="color:#69f0ae; font-weight:bold;">🗼 PISO ${floor} SUPERADO.</span>`);
                if (evReward > 0) {
                    ColiseumUI.agregarLog(`<span style="color:#69f0ae; font-weight:bold;">¡Recompensa acumulada: +${evReward} EV! ${rewardMsg}</span>`);
                } else {
                    ColiseumUI.agregarLog(`<span style="color:#aaa;">Piso repetido. 0 EV adicional.</span>`);
                }
                ColiseumUI.agregarLog(`<span style="color:#ffd700; font-weight:bold;">Esencia Acumulada en esta tanda: ${window.towerSessionEvAccumulated} EV</span>`);
                
                window.currentTowerFloor = floor + 1;
                if (window.guardarProgreso) window.guardarProgreso();
            } else if (ColiseumLogic.modoCombate === 'pvp') {
                window.arenaBattlesPlayed++;
                window.arenaWins++;
                ColiseumUI.agregarLog(`<span style="color:#00e5ff; font-weight:bold;">⚔️ Combate PvP registrado. ¡Victoria! (${window.arenaBattlesPlayed}/5)</span>`);
                
                let activeLeague = window.ColiseumManager.obtenerLigaPorGeno(window.miMascota);
                let prField = window.ColiseumManager.obtenerPrFieldPorLiga(activeLeague);
                if (prField) {
                    let gain = 20;
                    if (window.ColiseumManager.isLiveMatch) {
                        gain = Math.round(gain * 1.15);
                        ColiseumUI.agregarLog(`<span style="color:#ffd700; font-weight:bold;">🔥 ¡Bono de Combate en Vivo! +15% Puntos de Rango (+${gain} PR).</span>`);
                    } else {
                        ColiseumUI.agregarLog(`<span style="color:#69f0ae;">+20 Puntos de Rango (${prField.toUpperCase()}).</span>`);
                    }
                    window[prField] = (window[prField] || 0) + gain;
                }

                // Registrar combate individual en Supabase
                const isRealtime = window.ColiseumManager.isLiveMatch || false;
                window.supabaseClient
                    .from('combates_coliseo')
                    .insert([{
                        jugador_id: window.miUsuarioCloud.id,
                        liga: activeLeague,
                        es_realtime: isRealtime,
                        es_victoria: true
                    }])
                    .then(({ error }) => {
                        if (error) console.error("[STATS LOG ERROR] Fallo al registrar victoria:", error);
                    });
                
                if (window.arenaBattlesPlayed >= 5) {
                    window.ColiseumManager.liquidarPaseArena();
                    return;
                }
            }

            let winXp = 25;
            if (window.GameEconomyConfig && window.GameEconomyConfig.gameplay_rewards && window.GameEconomyConfig.gameplay_rewards.coliseum && window.GameEconomyConfig.gameplay_rewards.coliseum.win_xp !== undefined) {
                winXp = window.GameEconomyConfig.gameplay_rewards.coliseum.win_xp;
            }
            if (typeof window.ganarXPLaboratorio === 'function') {
                window.ganarXPLaboratorio(winXp, "Victoria en el Coliseo");
            }
            ColiseumUI.agregarLog(`<span style="color:#69f0ae; font-weight:bold;">🧪 ¡+${winXp} XP de Laboratorio!</span>`);
            let xpGanada = 50 + (ColiseumLogic.player.adn.level * 10);
            
            const esJefe = ColiseumLogic.enemy && ColiseumLogic.enemy.esJefeDeLiga;
            if (esJefe) {
                const bonusXp = Math.round(xpGanada * 0.15);
                xpGanada += bonusXp;
                ColiseumUI.agregarLog(`<span style="color:#ffd700; font-weight:bold; text-shadow: 0 0 8px rgba(255,215,0,0.5);">🌟 ¡Bono de Jefe de Liga! Derrotaste al Jefe y obtuviste un +15% de XP adicional (+${bonusXp} XP).</span>`);
            }

            if (ColiseumLogic.modoCombate === '3v3') {
                xpGanada *= 3;
                ColiseumUI.agregarLog(`<span style="color:#aaa">Ganaste ${xpGanada} XP para cada miembro de tu equipo.</span>`);
                
                if (!window.miInventario) window.miInventario = { vitalEssence: 0, items: [] };
                window.miInventario.vitalEssence = (window.miInventario.vitalEssence || 0) + 450;
                ColiseumUI.agregarLog(`<span style="color:#69f0ae; font-weight:bold;">✨ ¡Recompensa de Combate 3v3: +450 EV!</span>`);
                
                const teamGenos = (ColiseumLogic.playerTeamIds || []).map(id => window.misGenos.find(g => String(g.id) === String(id))).filter(Boolean);
                teamGenos.forEach(geno => {
                    let maxLevel = 50;
                    if (window.tieneGenActivoV9 && window.tieneGenActivoV9(geno, "especialista_elite")) {
                        maxLevel = 55;
                    }
                    if (geno.level >= maxLevel) return;
                    
                    geno.xp = (geno.xp || 0) + xpGanada;
                    
                    let levelUps = 0;
                    while (geno.xp >= (geno.xpNeeded || 100)) {
                        geno.level = (geno.level || 1) + 1;
                        geno.xp -= (geno.xpNeeded || 100);
                        
                        let baseXPNeeded = Math.floor(100 * Math.pow(1.2, geno.level - 1));
                        let tieneAceleracion = window.tieneGenActivoV9 && window.tieneGenActivoV9(geno, "aceleracion_final");
                        if (tieneAceleracion && geno.level >= (maxLevel - 10)) {
                            geno.xpNeeded = Math.floor(baseXPNeeded * 0.60);
                        } else {
                            geno.xpNeeded = baseXPNeeded;
                        }
                        
                        geno.statPoints = (geno.statPoints || 0) + 3;
                        levelUps++;
                        
                        let resonanciaMsg = "";
                        if (geno.level % 10 === 0 && window.tieneGenActivoV9 && window.tieneGenActivoV9(geno, "resonancia_nivel")) {
                            const keys = ["hp", "atk", "def", "spd", "luk"];
                            let highestKey = keys[0];
                            let highestVal = geno.stats[highestKey];
                            for (let i = 1; i < keys.length; i++) {
                                if (geno.stats[keys[i]] > highestVal) {
                                    highestVal = geno.stats[keys[i]];
                                    highestKey = keys[i];
                                }
                            }
                            geno.stats[highestKey] += 1;
                            if (geno.baseStats) {
                                geno.baseStats[highestKey] += 1;
                            }
                        }
                        
                        if (window.verificarUmbralDespertar) {
                            window.verificarUmbralDespertar(geno);
                        }
                    }
                    
                    if (levelUps > 0) {
                        if (window.Sonidos) window.Sonidos.play("heal");
                        alert(`¡Súper Evolución! 🌟\n${geno.alias || geno.name} ha alcanzado el Nivel ${geno.level}.\nTienes ${levelUps * 3} Puntos de Atributo disponibles.`);
                    }
                });
                
                const hoy = new Date().toDateString();
                teamGenos.forEach(geno => {
                    if (geno.diversion === undefined) geno.diversion = 100;
                    if (geno.amistad === undefined) geno.amistad = 0;
                    geno.diversion = Math.min(100, geno.diversion + 15);
                    
                    if (!geno.registroAmistadDiaria) geno.registroAmistadDiaria = {};
                    if (geno.registroAmistadDiaria.combate !== hoy) {
                        geno.registroAmistadDiaria.combate = hoy;
                        const gananciaExplicita = Math.floor(Math.random() * 3) + 1;
                        geno.amistad = Math.min(100, geno.amistad + gananciaExplicita);
                        ColiseumUI.agregarLog(`<span style="color:#ec407a">💖 ¡${geno.alias || geno.name} se siente más unido a ti! Amistad +${gananciaExplicita}.</span>`);
                    } else {
                        ColiseumUI.agregarLog(`<span style="color:#aaa">💖 Victoria de ${geno.alias || geno.name}. (Amistad por combate ya obtenida hoy).</span>`);
                    }
                });
                
                if (window.miMascota) {
                    const matched = teamGenos.find(g => String(g.id) === String(window.miMascota.id));
                    if (matched) {
                        window.miMascota = matched;
                    }
                }
                
                if (window.actualizarPanelRPG) window.actualizarPanelRPG();
                if (window.NexoEnergyManager) window.NexoEnergyManager.actualizarUI();
                if (window.guardarJuego) window.guardarJuego();
                else if (window.guardarProgreso) window.guardarProgreso();
            } else {
                ColiseumUI.agregarLog(`<span style="color:#aaa">Ganaste ${xpGanada} XP.</span>`);
                if (window.ganarXP) window.ganarXP(xpGanada);
                
                if (ColiseumLogic.modoCombate === 'estandar') {
                    if (!window.miInventario) window.miInventario = { vitalEssence: 0, items: [] };
                    window.miInventario.vitalEssence = (window.miInventario.vitalEssence || 0) + 300;
                    ColiseumUI.agregarLog(`<span style="color:#69f0ae; font-weight:bold;">✨ ¡Recompensa de Combate 1v1: +300 EV!</span>`);
                }

                if (window.miMascota) {
                    if (window.miMascota.diversion === undefined) window.miMascota.diversion = 100;
                    if (window.miMascota.amistad === undefined) window.miMascota.amistad = 0;
                    window.miMascota.diversion = Math.min(100, window.miMascota.diversion + 15);
                    
                    const hoy = new Date().toDateString();
                    if (!window.miMascota.registroAmistadDiaria) window.miMascota.registroAmistadDiaria = {};
                    let gananciaExplicita = 0;
                    if (window.miMascota.registroAmistadDiaria.combate !== hoy) {
                        window.miMascota.registroAmistadDiaria.combate = hoy;
                        gananciaExplicita = Math.floor(Math.random() * 3) + 1;
                        window.miMascota.amistad = Math.min(100, window.miMascota.amistad + gananciaExplicita);
                    }

                    if (window.misGenos) {
                        const idx = window.misGenos.findIndex(g => String(g.id) === String(window.miMascota.id));
                        if (idx !== -1) {
                            window.misGenos[idx].diversion = window.miMascota.diversion;
                            window.misGenos[idx].amistad = window.miMascota.amistad;
                            window.misGenos[idx].registroAmistadDiaria = window.miMascota.registroAmistadDiaria;
                        }
                    }
                    
                    if (gananciaExplicita > 0) {
                        ColiseumUI.agregarLog(`<span style="color:#ec407a">💖 ¡Tu Geno se siente más unido a ti! Amistad +${gananciaExplicita}.</span>`);
                    } else {
                        ColiseumUI.agregarLog(`<span style="color:#aaa">💖 Victoria del Geno. (Amistad por combate ya obtenida hoy).</span>`);
                    }

                    if (window.NexoEnergyManager) {
                        window.NexoEnergyManager.actualizarUI();
                    }
                    if (window.guardarJuego) window.guardarJuego();
                    else if (window.guardarProgreso) window.guardarProgreso();
                }
            }
        } else {
            ColiseumUI.agregarLog(`<span style="color:#f44336">💀 DERROTA. Tu equipo debe descansar.</span>`);
            
            if (ColiseumLogic.modoCombate === 'torre') {
                const floor = window.currentTowerFloor || 1;
                const checkpoint = Math.floor((floor - 1) / 10) * 10 + 1;
                window.currentTowerFloor = checkpoint;
                
                const evAPagar = window.towerSessionEvAccumulated || 0;
                if (evAPagar > 0) {
                    if (!window.miInventario) window.miInventario = { vitalEssence: 0, items: [] };
                    window.miInventario.vitalEssence = (window.miInventario.vitalEssence || 0) + evAPagar;
                    ColiseumUI.agregarLog(`<span style="color:#69f0ae; font-weight:bold;">✨ ¡Derrota! Recibes el 100% de la esencia acumulada en la tanda: +${evAPagar} EV.</span>`);
                }
                window.towerSessionActive = false;
                window.towerSessionEvAccumulated = 0;
                
                ColiseumUI.agregarLog(`<span style="color:#f44336; font-weight:bold;">💀 HAS CAÍDO EN EL PISO ${floor}. Deberás reanudar desde el checkpoint: Piso ${checkpoint}. Tanda finalizada.</span>`);
                if (window.guardarProgreso) window.guardarProgreso();
            } else if (ColiseumLogic.modoCombate === 'estandar') {
                if (!window.miInventario) window.miInventario = { vitalEssence: 0, items: [] };
                window.miInventario.vitalEssence = (window.miInventario.vitalEssence || 0) + 50;
                ColiseumUI.agregarLog(`<span style="color:#ff8a80; font-weight:bold;">✨ ¡Consolación 1v1: +50 EV!</span>`);
            } else if (ColiseumLogic.modoCombate === '3v3') {
                if (!window.miInventario) window.miInventario = { vitalEssence: 0, items: [] };
                window.miInventario.vitalEssence = (window.miInventario.vitalEssence || 0) + 75;
                ColiseumUI.agregarLog(`<span style="color:#ff8a80; font-weight:bold;">✨ ¡Consolación 3v3: +75 EV!</span>`);
            }
            } else if (ColiseumLogic.modoCombate === 'pvp') {
                window.arenaBattlesPlayed++;
                window.arenaLosses++;
                ColiseumUI.agregarLog(`<span style="color:#ff5722; font-weight:bold;">⚔️ Combate PvP registrado. Derrota. (${window.arenaBattlesPlayed}/5)</span>`);
                
                let activeLeague = window.ColiseumManager.obtenerLigaPorGeno(window.miMascota);
                let prField = window.ColiseumManager.obtenerPrFieldPorLiga(activeLeague);
                if (prField) {
                    window[prField] = Math.max(0, (window[prField] || 0) - 15);
                    ColiseumUI.agregarLog(`<span style="color:#ff8a80;">-15 Puntos de Rango (${prField.toUpperCase()}).</span>`);
                }

                // Registrar combate individual en Supabase
                const isRealtime = window.ColiseumManager.isLiveMatch || false;
                window.supabaseClient
                    .from('combates_coliseo')
                    .insert([{
                        jugador_id: window.miUsuarioCloud.id,
                        liga: activeLeague,
                        es_realtime: isRealtime,
                        es_victoria: false
                    }])
                    .then(({ error }) => {
                        if (error) console.error("[STATS LOG ERROR] Fallo al registrar derrota:", error);
                    });
                
                if (window.arenaBattlesPlayed >= 5) {
                    window.ColiseumManager.liquidarPaseArena();
                    return;
                }
            }

            let loseXp = 5;
            if (window.GameEconomyConfig && window.GameEconomyConfig.gameplay_rewards && window.GameEconomyConfig.gameplay_rewards.coliseum && window.GameEconomyConfig.gameplay_rewards.coliseum.lose_xp !== undefined) {
                loseXp = window.GameEconomyConfig.gameplay_rewards.coliseum.lose_xp;
            }
            if (typeof window.ganarXPLaboratorio === 'function') {
                window.ganarXPLaboratorio(loseXp, "Derrota en el Coliseo");
            }
            ColiseumUI.agregarLog(`<span style="color:#ff8a80; font-weight:bold;">🧪 +${loseXp} XP de Laboratorio.</span>`);
        }
        
        if (window.miInventario && typeof window.miInventario.updateUI === 'function') {
            window.miInventario.updateUI();
        }

        setTimeout(() => {
            let controls = document.getElementById("battle-controls");
            let btnStart = document.getElementById("btn-start-battle");
            let btnLeave = document.getElementById("btn-leave-battle"); 
            
            if(controls) controls.style.setProperty("display", "none", "important");
            if(btnStart) { 
                btnStart.style.setProperty("display", "block", "important"); 
                if (ColiseumLogic.modoCombate === 'torre') {
                    btnStart.innerText = `Iniciar Piso ${window.currentTowerFloor}`;
                } else {
                    btnStart.innerText = "Buscar otro rival"; 
                }
            }
            if(btnLeave) btnLeave.style.setProperty("display", "", "important"); 
            
            const titleEl = document.querySelector(".coliseum-title-inside") || document.querySelector("#coliseum-screen .screen-title");
            if (titleEl) titleEl.classList.remove("hidden");
        }, 1000);
    }

    function actualizarBotones() {
        if (typeof ColiseumUI.actualizarBotonesAtaque === 'function') {
            const activeGeno = (ColiseumLogic.modoCombate === '3v3' && ColiseumLogic.player) ? ColiseumLogic.player.adn : window.miMascota;
            ColiseumUI.actualizarBotonesAtaque(activeGeno);
        }
        
        if (ColiseumLogic.modoCombate === '3v3' && ColiseumLogic.esperandoSwapForzado) {
            // Deshabilitar ataques
            ["btn-atk-1", "btn-atk-2", "btn-atk-3", "btn-atk-4"].forEach(id => {
                let btn = document.getElementById(id);
                if (btn) btn.disabled = true;
            });
            // Habilitar swaps sólo para Genos vivos
            const team = ColiseumLogic.playerTeam;
            const activeIdx = ColiseumLogic.playerActiveIndex;
            let idxA = activeIdx === 0 ? 1 : (activeIdx === 1 ? 0 : 0);
            let idxB = activeIdx === 0 ? 2 : (activeIdx === 1 ? 2 : 1);
            let btnSwapA = document.getElementById("btn-swap-a");
            let btnSwapB = document.getElementById("btn-swap-b");
            if (btnSwapA && team[idxA]) btnSwapA.disabled = (team[idxA].hp <= 0);
            if (btnSwapB && team[idxB]) btnSwapB.disabled = (team[idxB].hp <= 0);
            return;
        }

        bloquearBotones(false);
        if (typeof window.ColiseumManager.iniciarTemporizadorTurno === 'function') {
            window.ColiseumManager.iniciarTemporizadorTurno();
        }
        const p = ColiseumLogic.player;
        const equipados = p.ataquesEquipados;

        const btn2 = document.getElementById("btn-atk-2");
        if (btn2 && equipados.especial && p.cooldowns.especial > 0) {
            btn2.disabled = true;
            btn2.innerText = `ESPERA (${p.cooldowns.especial})`;
        }
        
        const btn3 = document.getElementById("btn-atk-3");
        if (btn3 && equipados.tactica && p.cooldowns.tactica > 0) {
            btn3.disabled = true;
            btn3.innerText = `ESPERA (${p.cooldowns.tactica})`;
        }

        const btn4 = document.getElementById("btn-atk-4");
        if (btn4 && equipados.definitivo && p.cooldowns.definitivo > 0 && !btn4.innerText.includes("NV. 25")) {
            btn4.disabled = true;
            btn4.innerText = `ESPERA (${p.cooldowns.definitivo})`;
        }
    }

    function bloquearBotones(bloquear) {
        ["btn-atk-1", "btn-atk-2", "btn-atk-3", "btn-atk-4", "btn-swap-a", "btn-swap-b"].forEach(id => {
            let btn = document.getElementById(id);
            if(btn && btn.innerText !== "VACÍO" && !btn.innerText.includes("NV. 25")) {
                btn.disabled = bloquear;
            }
        });
    }

    // === SISTEMA DE SELECCIÓN DE EQUIPO 3v3 ===
    let teamSelection = [null, null, null];
    let activeSlotIndex = 0;

    window.ColiseumManager.abrirSeleccion3v3 = function() {
        if (!window.misGenos || window.misGenos.length < 3) {
            alert("⚠️ Se requieren al menos 3 Genos en tu colección para combatir en la modalidad 3v3. ¡Consigue más Genos en el Mercado o Centro de Crianza!");
            return;
        }

        const modal = document.getElementById("coliseum-team-modal");
        if (!modal) return;
        
        modal.classList.remove("hidden");
        activeSlotIndex = 0;

        // Intentar cargar selección previa
        try {
            const prevIds = JSON.parse(localStorage.getItem("coliseum_3v3_team") || "[]");
            if (Array.isArray(prevIds) && prevIds.length === 3) {
                const loadedTeam = prevIds.map(id => window.misGenos.find(g => String(g.id) === String(id))).filter(Boolean);
                if (loadedTeam.length === 3) {
                    teamSelection = loadedTeam;
                } else {
                    teamSelection = [null, null, null];
                }
            } else {
                teamSelection = [null, null, null];
            }
        } catch(e) {
            teamSelection = [null, null, null];
        }

        actualizarVisualizacionSlots();
        renderizarListaSeleccionable();
    };

    function actualizarVisualizacionSlots() {
        for (let i = 0; i < 3; i++) {
            const slotEl = document.getElementById(`team-slot-${i}`);
            if (!slotEl) continue;

            // Highlight de slot activo
            if (i === activeSlotIndex) {
                slotEl.style.border = "2px solid #00e5ff";
                slotEl.style.background = "rgba(13, 22, 30, 0.7)";
                slotEl.style.boxShadow = "0 0 10px rgba(0, 229, 255, 0.3)";
            } else {
                slotEl.style.border = "2px solid rgba(255, 255, 255, 0.1)";
                slotEl.style.background = "rgba(13, 22, 30, 0.4)";
                slotEl.style.boxShadow = "none";
            }

            const previewSvg = slotEl.querySelector(".slot-preview-svg");
            const previewName = slotEl.querySelector(".slot-preview-name");
            const geno = teamSelection[i];

            if (geno) {
                if (previewSvg) previewSvg.innerHTML = ColiseumUI.inyectarSvgSeguro(geno);
                if (previewName) previewName.innerText = geno.alias || geno.name || "Tu Geno";
            } else {
                let color = i === 0 ? "#00e5ff" : (i === 1 ? "#a855f7" : "#ff007f");
                if (previewSvg) {
                    previewSvg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
                }
                if (previewName) previewName.innerText = "Vacío";
            }
        }

        // Habilitar/Deshabilitar botón de confirmar
        const btnConfirm = document.getElementById("btn-confirm-team-3v3");
        if (btnConfirm) {
            const completado = teamSelection.every(Boolean);
            btnConfirm.disabled = !completado;
            if (completado) {
                btnConfirm.style.opacity = "1";
                btnConfirm.style.cursor = "pointer";
            } else {
                btnConfirm.style.opacity = "0.5";
                btnConfirm.style.cursor = "not-allowed";
            }
        }
    }

    function renderizarListaSeleccionable() {
        const container = document.getElementById("coliseum-team-genos-list");
        if (!container) return;

        container.innerHTML = "";

        window.misGenos.forEach(geno => {
            const indexInTeam = teamSelection.findIndex(g => g && String(g.id) === String(geno.id));
            const isSelected = indexInTeam !== -1;

            const card = document.createElement("div");
            card.className = "team-geno-select-card";
            
            const elementColors = {
                "Biomutante": "#69f0ae",
                "Viral": "#00e5ff",
                "Cibernético": "#ff8c00",
                "Radiactivo": "#ff3d00",
                "Tóxico": "#d500f9",
                "Sintético": "#b85cff",
                "Normal": "#ffffff"
            };
            const elColor = elementColors[geno.element] || "#ffffff";

            card.style.background = isSelected ? "rgba(0, 229, 255, 0.05)" : "rgba(255, 255, 255, 0.02)";
            card.style.border = isSelected ? `1.5px solid #00e5ff` : "1px solid rgba(255, 255, 255, 0.08)";
            card.style.borderRadius = "10px";
            card.style.display = "flex";
            card.style.alignItems = "center";
            card.style.padding = "8px 10px";
            card.style.gap = "10px";
            card.style.cursor = "pointer";
            card.style.transition = "0.2s";
            card.style.boxShadow = isSelected ? "0 0 10px rgba(0, 229, 255, 0.15)" : "none";

            const thumbnailSvg = ColiseumUI.inyectarSvgSeguro(geno);

            let statusBadge = "";
            if (isSelected) {
                const label = indexInTeam === 0 ? "Abridor" : (indexInTeam === 1 ? "Relevo" : "Cierre");
                const color = indexInTeam === 0 ? "#00e5ff" : (indexInTeam === 1 ? "#a855f7" : "#ff007f");
                statusBadge = `<span style="font-size: 8px; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1.5px solid ${color}; color: ${color}; background: rgba(0,0,0,0.3); text-transform: uppercase;">${label}</span>`;
            }

            card.innerHTML = `
                <div style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; pointer-events: none;">
                    <div style="width: 50px; height: 50px; transform: scale(0.8); display:flex; align-items:center; justify-content:center;">
                        ${thumbnailSvg}
                    </div>
                </div>
                <div style="flex: 1; overflow: hidden; pointer-events: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold; font-size: 11px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;">${geno.alias || geno.name || "Tu Geno"}</span>
                        ${statusBadge ? statusBadge : `<span style="font-size: 8px; font-weight: bold; padding: 1px 4px; border-radius: 3px; background: rgba(255,255,255,0.05); color: ${elColor};">${geno.element || 'Normal'}</span>`}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                        <span style="font-size: 9px; color: #888;">Nivel ${geno.level || 1}</span>
                        <span style="font-size: 9px; color: #aaa;">HP: ${geno.stats?.hp || 80} | ATK: ${geno.stats?.atk || 15}</span>
                    </div>
                </div>
            `;

            card.addEventListener("click", () => {
                if (isSelected) {
                    const prevValue = teamSelection[activeSlotIndex];
                    teamSelection[activeSlotIndex] = geno;
                    teamSelection[indexInTeam] = prevValue;
                } else {
                    teamSelection[activeSlotIndex] = geno;
                    const emptyIdx = teamSelection.findIndex(g => g === null);
                    if (emptyIdx !== -1) {
                        activeSlotIndex = emptyIdx;
                    }
                }
                actualizarVisualizacionSlots();
                renderizarListaSeleccionable();
            });

            container.appendChild(card);
        });
    }

    // Configurar manejadores de clic de slots al inicio
    for (let i = 0; i < 3; i++) {
        const slotEl = document.getElementById(`team-slot-${i}`);
        if (slotEl) {
            slotEl.addEventListener("click", () => {
                activeSlotIndex = i;
                actualizarVisualizacionSlots();
                renderizarListaSeleccionable();
            });
        }
    }

    // Cerrar modal
    const closeBtn = document.getElementById("close-coliseum-team");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            const modal = document.getElementById("coliseum-team-modal");
            if (modal) modal.classList.add("hidden");
        });
    }

    // Confirmar equipo
    const btnConfirm = document.getElementById("btn-confirm-team-3v3");
    if (btnConfirm) {
        btnConfirm.addEventListener("click", () => {
            if (teamSelection.includes(null)) return;
            
            const sinResistencia = teamSelection.some(g => (g.resistencia !== undefined ? g.resistencia : 100) < 20);
            if (sinResistencia) {
                alert("⚠️ Todos los Genos de tu equipo deben tener al menos 20 de Resistencia para combatir en el Coliseo.");
                return;
            }

            const enHuelga = teamSelection.some(g => window.isGenoNeglected && window.isGenoNeglected(g));
            if (enHuelga) {
                alert("⚠️ Al menos uno de tus Genos seleccionados está en huelga (necesidades por debajo del 20%) y no puede combatir.");
                return;
            }

            localStorage.setItem("coliseum_3v3_team", JSON.stringify(teamSelection.map(g => g.id)));
            window.ColiseumLogic.modoCombate = "3v3";
            window.ColiseumLogic.playerTeamIds = teamSelection.map(g => g.id);

            const modal = document.getElementById("coliseum-team-modal");
            if (modal) modal.classList.add("hidden");

            window.navegarA('coliseum-screen');
            window.iniciarColiseo();
        });
    }

    // Exponer para testing
    window.ColiseumManager.iniciarPelea = iniciarPelea;
    window.ColiseumManager.iniciarPeleaConfirmada = iniciarPeleaConfirmada;
    window.ColiseumManager.terminarCombate = terminarCombate;

    // ==========================================
    // SISTEMA DE PESTAÑAS (PVE VS PVP LOBBY)
    // ==========================================
    window.ColiseumManager.activeTab = 'pve';

    window.ColiseumManager.cambiarTabLobby = function(tab) {
        window.ColiseumManager.activeTab = tab;
        const pveBtn = document.getElementById("tab-pve-btn");
        const pvpBtn = document.getElementById("tab-pvp-btn");
        
        if (pveBtn && pvpBtn) {
            if (tab === 'pve') {
                pveBtn.style.border = "1.5px solid #ff8c00";
                pveBtn.style.background = "rgba(255, 140, 0, 0.05)";
                pveBtn.style.color = "#ff9800";
                pvpBtn.style.border = "1.5px solid rgba(255,255,255,0.1)";
                pvpBtn.style.background = "rgba(255,255,255,0.02)";
                pvpBtn.style.color = "#aaa";
            } else {
                pvpBtn.style.border = "1.5px solid #00e5ff";
                pvpBtn.style.background = "rgba(0, 229, 255, 0.05)";
                pvpBtn.style.color = "#00e5ff";
                pveBtn.style.border = "1.5px solid rgba(255,255,255,0.1)";
                pveBtn.style.background = "rgba(255,255,255,0.02)";
                pveBtn.style.color = "#aaa";
            }
        }
        window.ColiseumManager.actualizarLobbyUI();
    };

    window.checkWeeklyReset = function() {
        const now = window.obtenerTiempoSeguro ? window.obtenerTiempoSeguro() : Date.now();
        const lastReset = window.lastTowerResetAt || 0;
        const dateNow = new Date(now);
        const day = dateNow.getDay(); 
        const diff = dateNow.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(dateNow.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        const mondayTimestamp = monday.getTime();

        if (lastReset < mondayTimestamp) {
            window.towerClaimedFloorThisWeek = 0;
            window.lastTowerResetAt = now;
            console.log("[TOWER RESET] Weekly reset triggered. towerClaimedFloorThisWeek reset to 0.");
            if (typeof window.guardarLocalSilencioso === 'function') window.guardarLocalSilencioso();
        }
    };

    window.ColiseumManager.actualizarLobbyUI = function() {
        const listContainer = document.getElementById("coliseum-lobby-list");
        if (!listContainer) return;
        
        window.checkWeeklyReset();
        listContainer.innerHTML = "";
        const tab = window.ColiseumManager.activeTab || 'pve';
        
        if (tab === 'pve') {
            // 1. COMBATE ESTANDAR
            const estandarCard = document.createElement("div");
            estandarCard.className = "lobby-card card-estandar";
            estandarCard.onclick = () => window.ColiseumManager.seleccionarModo('estandar');
            estandarCard.innerHTML = `
                <div style="background: rgba(255, 140, 0, 0.1); border: 1px solid #ff8c00; border-radius: 10px; width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff8c00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="20" y1="20" x2="14" y2="14" /><line x1="10" y1="10" x2="4" y2="4" /><line x1="15" y1="19" x2="19" y2="15" /><line x1="4" y1="20" x2="20" y2="4" /><line x1="5" y1="15" x2="9" y2="19" />
                    </svg>
                </div>
                <div style="flex: 1;">
                    <h3 style="color: #ff9800; margin: 0 0 3px 0; font-size: 13px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Combate Estándar (IA)</h3>
                    <p style="color: #cbd5e1; margin: 0; font-size: 11px; line-height: 1.25;">Duelo clásico contra Genos aleatorios controlados por la IA de la arena. Gana EV y sube de nivel.</p>
                </div>
            `;
            listContainer.appendChild(estandarCard);
            
            // 2. TORRE DE MUTACION
            const maxFloor = window.maxFloor || 0;
            const towerCard = document.createElement("div");
            towerCard.className = "lobby-card card-tournament";
            towerCard.style.borderColor = "#d500f9";
            towerCard.onclick = () => window.ColiseumManager.entrarTorreMutacion();
            towerCard.innerHTML = `
                <div style="background: rgba(213, 0, 249, 0.1); border: 1px solid #d500f9; border-radius: 10px; width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d500f9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                </div>
                <div style="flex: 1;">
                    <h3 style="color: #d500f9; margin: 0 0 3px 0; font-size: 13px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Torre de Mutación</h3>
                    <p style="color: #cbd5e1; margin: 0; font-size: 11px; line-height: 1.25;">Modo supervivencia de escalada infinita. Récord: <strong style="color:#ffd700;">Piso ${maxFloor}</strong>. Recompensas de EV con reset semanal.</p>
                </div>
            `;
            listContainer.appendChild(towerCard);
            
            // 3. SIMULADOR DE CLON
            const cloneCard = document.createElement("div");
            cloneCard.className = "lobby-card card-clon";
            cloneCard.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; cursor: pointer; width: 100%;" onclick="ColiseumManager.seleccionarModo('clon')">
                    <div style="background: rgba(0, 172, 193, 0.1); border: 1px solid #00acc1; border-radius: 10px; width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00acc1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5"/><path d="M12 2C9.24 2 7 4.24 7 7c0 2.04 1.22 3.79 3 4.54V14h4v-2.46c1.78-.75 3-2.5 3-4.54 0-2.76-2.24-5-5-5z"/>
                        </svg>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="color: #00e5ff; margin: 0 0 3px 0; font-size: 13px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Simulador de Clon</h3>
                        <p style="color: #cbd5e1; margin: 0; font-size: 11px; line-height: 1.25;">Réplica exacta de tu Geno para testear scripts IFTTT.</p>
                    </div>
                </div>
                <div style="border-top: 1px solid rgba(0, 172, 193, 0.2); padding-top: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;">
                    <span style="color: #00e5ff; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Elemento:</span>
                    <select id="lobby-clone-element-select" style="background:#0c1620; color:#fff; border:1px solid #00acc1; padding:3px 8px; border-radius:4px; font-size:10px; font-weight:bold;">
                        <option value="mismo" selected>Mismo que tu Geno</option>
                        <option value="Biomutante">Biomutante</option>
                        <option value="Viral">Viral</option>
                        <option value="Cibernético">Cibernético</option>
                        <option value="Radiactivo">Radiactivo</option>
                        <option value="Tóxico">Tóxico</option>
                        <option value="Sintético">Sintético</option>
                    </select>
                </div>
            `;
            listContainer.appendChild(cloneCard);
            
            // 4. DESAFIO TACTICO
            const desafioCard = document.createElement("div");
            desafioCard.className = "lobby-card card-desafio";
            desafioCard.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; cursor: pointer; width: 100%;" onclick="ColiseumManager.seleccionarModo('desafio')">
                    <div style="background: rgba(138, 43, 226, 0.1); border: 1px solid #8A2BE2; border-radius: 10px; width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A2BE2" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
                        </svg>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="color: #b85cff; margin: 0 0 3px 0; font-size: 13px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Desafío Táctico</h3>
                        <p style="color: #cbd5e1; margin: 0; font-size: 11px; line-height: 1.25;">Duelos contra IAs preprogramadas con dificultades.</p>
                    </div>
                </div>
                <div style="border-top: 1px solid rgba(138, 43, 226, 0.2); padding-top: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;">
                    <span style="color: #b85cff; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Oponente:</span>
                    <select id="lobby-npc-select" style="background:#0c1620; color:#fff; border:1px solid #8A2BE2; padding:3px 8px; border-radius:4px; font-size:10px; font-weight:bold;">
                        <option value="cyborg" selected>Cyborg Defensivo</option>
                        <option value="viral">Infeccioso Viral</option>
                        <option value="sintetico">Rápido Sintético</option>
                        <option value="biomutante">Titán Biomutante</option>
                        <option value="radiactivo">Radiador Mutado</option>
                        <option value="toxico">Tóxico Mutante</option>
                    </select>
                </div>
                <div style="border-top: 1px solid rgba(138, 43, 226, 0.1); padding-top: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;">
                    <span style="color: #b85cff; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Dificultad:</span>
                    <select id="lobby-npc-level-select" style="background:#0c1620; color:#fff; border:1px solid #8A2BE2; padding:3px 8px; border-radius:4px; font-size:10px; font-weight:bold;">
                        <option value="10">Nivel 10 (Fácil)</option>
                        <option value="25" selected>Nivel 25 (Normal)</option>
                        <option value="40">Nivel 40 (Difícil)</option>
                        <option value="50">Nivel 50 (Élite)</option>
                    </select>
                </div>
            `;
            listContainer.appendChild(desafioCard);
            
            // 5. COMBATE 3v3 DE EQUIPOS
            const teamCard = document.createElement("div");
            teamCard.className = "lobby-card card-3v3";
            teamCard.onclick = () => window.ColiseumManager.abrirSeleccion3v3();
            teamCard.innerHTML = `
                <div style="background: rgba(0, 229, 255, 0.1); border: 1px solid #00e5ff; border-radius: 10px; width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </div>
                <div style="flex: 1;">
                    <h3 style="color: #00e5ff; margin: 0 0 3px 0; font-size: 13px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Combate 3v3 de Equipos</h3>
                    <p style="color: #cbd5e1; margin: 0; font-size: 11px; line-height: 1.25;">Duelos tácticos con relevos usando un equipo de 3 Genos.</p>
                </div>
            `;
            listContainer.appendChild(teamCard);
            
            // Re-inicializar selectores customizados para el simulador de clon y desafío táctico
            if (typeof window.ColiseumManager.initColiseumCustomSelects === 'function') {
                window.ColiseumManager.initColiseumCustomSelects();
            }
        } else {
            // 1. BAÚL BALANCE (Free-gas internal account)
            const pendingBalance = window.TournamentManager ? (window.TournamentManager.saldosPendientes || 0.0) : 0.0;
            const vaultCard = document.createElement("div");
            vaultCard.className = "lobby-card";
            vaultCard.style.borderColor = "#ffd700";
            vaultCard.style.cursor = "default";
            vaultCard.innerHTML = `
                <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 10px; width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffd700" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                </div>
                <div style="flex: 1; display:flex; align-items:center; justify-content:space-between;">
                    <div>
                        <h3 style="color: #ffd700; margin: 0 0 3px 0; font-size: 13px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Baúl del Jugador</h3>
                        <p style="color: #cbd5e1; margin: 0; font-size: 11px;">Bolsa de saldo $POL libre de gas: <strong style="color:#00ffcc;">${pendingBalance.toFixed(2)} POL</strong></p>
                    </div>
                    <button onclick="window.ColiseumManager.retirarSaldoWallet()" class="market-btn-neon" style="margin:0; padding:6px 12px; font-size:9px; background:linear-gradient(90deg, #1e293b, #334155); border:1px solid #475569; color:#fff; cursor:pointer; border-radius:6px; font-weight:bold;">Retirar</button>
                </div>
            `;
            listContainer.appendChild(vaultCard);
            
            // 2. ARENA DEL NEXO
            const activeLeague = window.ColiseumManager.obtenerLigaPorGeno(window.miMascota);
            const prField = window.ColiseumManager.obtenerPrFieldPorLiga(activeLeague);
            const prPoints = window[prField] || 0;
            
            const arenaConfig = window.GameEconomyConfig?.mechanics?.arena || {};
            const ticketCost = arenaConfig.ticket_cost !== undefined ? arenaConfig.ticket_cost : 0.50;
            
            const arenaCard = document.createElement("div");
            arenaCard.className = "lobby-card card-estandar";
            arenaCard.style.borderColor = "#00e5ff";
            
            const defGenoName = (window.defensiveAlignment && window.defensiveAlignment.geno) 
                ? (window.defensiveAlignment.geno.alias || window.defensiveAlignment.geno.name) 
                : "Mascota Activa (Predet.)";
            
            if (!window.arenaTicketActive) {
                arenaCard.innerHTML = `
                    <div style="background: rgba(0, 229, 255, 0.1); border: 1px solid #00e5ff; border-radius: 10px; width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                        </svg>
                    </div>
                    <div style="flex: 1; display:flex; flex-direction:column; gap:8px;">
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
                            <div>
                                <h3 style="color: #00e5ff; margin: 0 0 3px 0; font-size: 13px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Arena del Nexo (PvP)</h3>
                                <p style="color: #cbd5e1; margin: 0; font-size: 11px;">Liga actual: <strong style="color:#ff007f;">${activeLeague}</strong> (${prPoints} PR). Coste pase (5 peleas): ${ticketCost.toFixed(2)} $POL.</p>
                            </div>
                            <button onclick="window.ColiseumManager.comprarPaseArena()" class="market-btn-neon" style="margin:0; padding:8px 12px; font-size:10px; font-weight:bold; background:linear-gradient(90deg, #00b4d8, #0077b6); border:1px solid #0096c7; color:#fff; cursor:pointer; border-radius:6px; box-shadow:0 0 10px rgba(0,229,255,0.3);">Comprar</button>
                        </div>
                        <div style="border-top:1px dashed rgba(0, 229, 255, 0.2); padding-top:6px; margin-top:2px; display:flex; align-items:center; justify-content:space-between; gap: 8px;">
                            <span style="font-size:10px; color:#aaa; display:flex; align-items:center; gap:4px;">🛡️ Defensa: <strong style="color:#00ffcc;">${defGenoName}</strong></span>
                            <button onclick="window.ColiseumManager.abrirConfigurarDefensa(event)" class="market-btn-neon" style="margin:0; padding:4px 8px; font-size:9px; font-weight:bold; background:#111b24; border:1px solid #00e5ff; color:#00e5ff; cursor:pointer; border-radius:4px; box-shadow:0 0 5px rgba(0,229,255,0.1);">Configurar Defensa</button>
                        </div>
                    </div>
                `;
            } else {
                const played = window.arenaBattlesPlayed || 0;
                const wins = window.arenaWins || 0;
                const losses = window.arenaLosses || 0;
                arenaCard.innerHTML = `
                    <div style="background: rgba(0, 229, 255, 0.2); border: 1px solid #00e5ff; border-radius: 10px; width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; animation: status-pulse 1.5s infinite alternate;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                        </svg>
                    </div>
                    <div style="flex: 1; display:flex; flex-direction:column; gap:8px;">
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
                            <div>
                                <h3 style="color: #00e5ff; margin: 0 0 3px 0; font-size: 13px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Pase Activo: ${played}/5 peleas</h3>
                                <p style="color: #cbd5e1; margin: 0; font-size: 11px;">Récord de ronda: <strong style="color:#69f0ae;">${wins}V</strong> - <strong style="color:#ff3d00;">${losses}D</strong> en Liga ${activeLeague}.</p>
                            </div>
                            <button onclick="window.ColiseumManager.buscarOponentePvP()" class="market-btn-neon" style="margin:0; padding:8px 12px; font-size:10px; font-weight:bold; background:linear-gradient(90deg, #ff007f, #b85cff); border:1px solid #ff007f; color:#fff; cursor:pointer; border-radius:6px; box-shadow:0 0 10px rgba(255,0,127,0.3); animation: status-pulse 1.5s infinite alternate;">Pelear</button>
                        </div>
                        <div style="border-top:1px dashed rgba(0, 229, 255, 0.2); padding-top:6px; margin-top:2px; display:flex; align-items:center; justify-content:space-between; gap: 8px;">
                            <span style="font-size:10px; color:#aaa; display:flex; align-items:center; gap:4px;">🛡️ Defensa: <strong style="color:#00ffcc;">${defGenoName}</strong></span>
                            <button onclick="window.ColiseumManager.abrirConfigurarDefensa(event)" class="market-btn-neon" style="margin:0; padding:4px 8px; font-size:9px; font-weight:bold; background:#111b24; border:1px solid #00e5ff; color:#00e5ff; cursor:pointer; border-radius:4px; box-shadow:0 0 5px rgba(0,229,255,0.1);">Configurar Defensa</button>
                        </div>
                    </div>
                `;
            }
            listContainer.appendChild(arenaCard);
            
            // 3. TORNEO DE LLAVES
            const tourneyCard = document.createElement("div");
            tourneyCard.className = "lobby-card card-tournament";
            tourneyCard.onclick = () => window.TournamentManager.abrirTorneos();
            tourneyCard.innerHTML = `
                <div style="background: rgba(255, 0, 127, 0.1); border: 1px solid #ff007f; border-radius: 10px; width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff007f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                </div>
                <div style="flex: 1;">
                    <h3 style="color: #ff007f; margin: 0 0 3px 0; font-size: 13px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Torneos de Fin de Semana</h3>
                    <p style="color: #cbd5e1; margin: 0; font-size: 11px; line-height: 1.25;">Torneos Sit & Go con eliminación de 16 participantes, descenso FIFO y colas por stakes de $POL.</p>
                </div>
            `;
            listContainer.appendChild(tourneyCard);
            
            // 4. VOTOS DE GOBERNANZA SEMANAL
            const govCard = document.createElement("div");
            govCard.className = "lobby-card card-desafio";
            govCard.id = "gov-voting-card";
            govCard.innerHTML = `
                <div style="width: 100%;">
                    <h3 style="color: #b85cff; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Votación de Gobernanza (Catálogo)</h3>
                    <p style="color: #cbd5e1; margin: 0 0 8px 0; font-size: 10px; line-height: 1.25;">Selecciona el modificador del torneo de este fin de semana. (Nivel de Lab >= 5 + Licencia requerido).</p>
                    <div id="gov-options-container" style="display:flex; flex-direction:column; gap:5px;">
                        <span style="color:#aaa; font-size:10px;">Cargando propuestas de gobernanza en tiempo real...</span>
                    </div>
                </div>
            `;
            listContainer.appendChild(govCard);
            window.ColiseumManager.cargarOpcionesVotacion();
            
            // 5. RANKING DE LEADERBOARDS POR LIGA
            const leadCard = document.createElement("div");
            leadCard.className = "lobby-card card-clon";
            leadCard.onclick = () => window.ColiseumManager.abrirLeaderboardsLobby();
            leadCard.innerHTML = `
                <div style="background: rgba(0, 172, 193, 0.1); border: 1px solid #00acc1; border-radius: 10px; width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00acc1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                </div>
                <div style="flex: 1;">
                    <h3 style="color: #00e5ff; margin: 0 0 3px 0; font-size: 13px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Leaderboards de Ligas</h3>
                    <p style="color: #cbd5e1; margin: 0; font-size: 11px; line-height: 1.25;">Visualiza las tablas de posiciones y los PR de Bronce, Plata, Oro y Diamante en tiempo real.</p>
                </div>
            `;
            listContainer.appendChild(leadCard);
        }
    };

    window.ColiseumManager.obtenerLigaPorGeno = function(geno) {
        if (!geno) return "Bronce";
        const level = geno.level || 1;
        const rarity = geno.rarity || geno.rareza || "Común";
        
        if (rarity === "Épica" || rarity === "Legendaria" || rarity === "Épico" || rarity === "Legendario") {
            return "Diamante";
        }
        if (rarity === "Rara" || rarity === "Raro" || rarity === "Mítica" || rarity === "Mítico") {
            return "Oro";
        }
        if (level >= 20) {
            return "Plata";
        }
        return "Bronce";
    };

    window.ColiseumManager.obtenerPrFieldPorLiga = function(liga) {
        if (liga === "Bronce") return "prBronce";
        if (liga === "Plata") return "prPlata";
        if (liga === "Oro") return "prOro";
        if (liga === "Diamante") return "prDiamante";
        return "prBronce";
    };

    window.ColiseumManager.comprarPaseArena = async function() {
        const arenaConfig = window.GameEconomyConfig?.mechanics?.arena || {};
        const ticketCost = arenaConfig.ticket_cost !== undefined ? arenaConfig.ticket_cost : 0.50;

        if (!window.miWallet || window.miWallet.pol < ticketCost) {
            alert(`Saldo de Wallet insuficiente. Necesitas al menos ${ticketCost.toFixed(2)} POL en tu balance.`);
            return;
        }
        
        ColiseumUI.agregarLog("<span style='color:#ffd700;'>[WEB3] Firmando transacción de compra de pase con Privy...</span>");
        
        // Simular distribución de comisiones
        window.miWallet.pol -= ticketCost;
        window.arenaTicketActive = true;
        window.arenaBattlesPlayed = 0;
        window.arenaWins = 0;
        window.arenaLosses = 0;
        
        ColiseumUI.agregarLog("<span style='color:#69f0ae;'>[WEB3] Pase de Arena de 5 combates adquirido con éxito en Polygon Testnet.</span>");
        
        const activeLeagueForTicket = window.ColiseumManager.obtenerLigaPorGeno(window.miMascota);
        if (typeof window.registrarLogEconomia === 'function') {
            window.registrarLogEconomia("arena_ticket_buy", ticketCost, "MetaMask - " + activeLeagueForTicket);
        }
        
        if (window.guardarProgreso) window.guardarProgreso();
        window.ColiseumManager.actualizarLobbyUI();
        
        alert("¡Pase de Arena activado! Tienes 5 combates de Liga disponibles.");
    };

    window.ColiseumManager.buscarOponentePvP = function() {
        if (!window.arenaTicketActive) {
            alert("No tienes un pase de arena activo.");
            return;
        }
        
        ColiseumUI.limpiarLog();
        ColiseumUI.agregarLog("<span style='color:#00e5ff;'>🔍 Escaneando canales de Supabase Realtime Broadcast...</span>");
        ColiseumUI.agregarLog("<span style='color:#aaa;'>Buscando rival en vivo en tu misma liga (Espera de 10 segundos)...</span>");
        
        let seconds = 10;
        let overlay = document.getElementById("coliseum-matchmaking-overlay");
        
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "coliseum-matchmaking-overlay";
            overlay.style.position = "absolute";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.background = "rgba(13, 22, 30, 0.95)";
            overlay.style.display = "flex";
            overlay.style.flexDirection = "column";
            overlay.style.justifyContent = "center";
            overlay.style.alignItems = "center";
            overlay.style.zIndex = "2000";
            overlay.style.borderRadius = "16px";
            overlay.style.border = "2px solid #00e5ff";
            overlay.style.boxShadow = "0 0 30px rgba(0, 229, 255, 0.4)";
            
            overlay.innerHTML = `
                <div class="spinner" style="border: 4px solid rgba(0,229,255,0.1); border-top: 4px solid #00e5ff; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h3 style="color:#00e5ff; text-transform:uppercase; letter-spacing:1px; margin:0 0 10px 0; font-size:14px; font-weight:bold;">Buscando Rival en Vivo</h3>
                <div id="matchmaking-countdown" style="font-size:24px; font-weight:bold; color:#fff; margin-bottom:10px;">10s</div>
                <p style="color:#cbd5e1; font-size:11px; text-align:center; padding:0 20px; line-height:1.3;">Escaneando canal de Supabase Broadcast en tiempo real...</p>
                <button id="cancel-matchmaking-btn" style="margin-top:20px; background:#111b24; border:1px solid #ff3d00; color:#ff3d00; padding:8px 16px; border-radius:6px; font-size:10px; font-weight:bold; cursor:pointer;">Cancelar</button>
                <style>
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </style>
            `;
            
            const coliseumScreen = document.getElementById("coliseum-screen");
            if (coliseumScreen) coliseumScreen.appendChild(overlay);
        }
        
        overlay.style.display = "flex";
        window.navegarA('coliseum-screen');
        
        let timer = null;
        
        const cancelBtn = document.getElementById("cancel-matchmaking-btn");
        cancelBtn.onclick = () => {
            clearInterval(timer);
            overlay.style.display = "none";
            window.navegarA('coliseum-lobby-screen');
            window.ColiseumManager.actualizarLobbyUI();
        };
        
        timer = setInterval(async () => {
            seconds--;
            const countdownEl = document.getElementById("matchmaking-countdown");
            if (countdownEl) countdownEl.innerText = `${seconds}s`;
            
            // Simular un 15% de probabilidad de conexión live con otro navegador por segundo (matchmaking preferente)
            if (seconds > 0 && Math.random() < 0.15) {
                clearInterval(timer);
                overlay.style.display = "none";
                window.ColiseumManager.isLiveMatch = true; 
                await window.ColiseumManager.cargarOponentePvP(true);
                return;
            }
            
            if (seconds <= 0) {
                clearInterval(timer);
                overlay.style.display = "none";
                window.ColiseumManager.isLiveMatch = false; 
                
                ColiseumUI.agregarLog("<span style='color:#ff8c00;'>⏱️ Tiempo de espera agotado. Activando respaldo asíncrono...</span>");
                ColiseumUI.agregarLog("<span style='color:#b85cff;'>🔮 Cargando Fantasma IFTTT de la misma liga...</span>");
                
                await window.ColiseumManager.cargarOponentePvP(false);
            }
        }, 1000);
    };

    window.ColiseumManager.cargarOponentePvP = async function(isLive) {
        const activeGeno = window.miMascota;
        const activeLeague = window.ColiseumManager.obtenerLigaPorGeno(activeGeno);
        const counterMap = {
            "Biomutante": "Sintético",
            "Sintético": "Tóxico",
            "Tóxico": "Radiactivo",
            "Radiactivo": "Cibernético",
            "Cibernético": "Viral",
            "Viral": "Biomutante"
        };
        const excludedElement = counterMap[activeGeno.element] || "Normal";
        
        // Elemento que vence al jugador
        const counterDelJugador = { "Biomutante": "Viral", "Sintético": "Biomutante", "Tóxico": "Sintético", "Radiactivo": "Tóxico", "Cibernético": "Radiactivo", "Viral": "Cibernético" };
        const counterElement = counterDelJugador[activeGeno.element] || "Normal";

        // Válvula de seguridad actuarial
        const wins = window.arenaWins || 0;
        const losses = window.arenaLosses || 0;
        const cumpleRequisitosValvula = (wins >= 3) && (losses < 3);
        let esValvulaActiva = false;

        if (cumpleRequisitosValvula && window.supabaseClient) {
            try {
                const { data, error } = await window.supabaseClient
                    .rpc('obtener_estado_valvula', { p_liga: activeLeague });
                if (!error && data !== null) {
                    esValvulaActiva = !!data;
                }
            } catch (err) {
                console.error("[VALVULA CHECK ERROR]", err);
            }
        }
        const aplicarValvula = esValvulaActiva && cumpleRequisitosValvula;
        
        let rivalGeno = null;
        let rivalName = "";
        let ghostOwnerId = null;
        
        if (!isLive) {
            try {
                // Consultamos desde la vista de fantasmas para obtener los usos diarios
                const { data: profiles, error } = await window.supabaseClient
                    .from('vista_fantasmas')
                    .select('id, email, datos_juego, ifttt_script, usos_hoy')
                    .neq('id', window.miUsuarioCloud.id);
                    
                if (!error && profiles && profiles.length > 0) {
                    const validGhosts = profiles.filter(p => {
                        if (!p.datos_juego) return false;
                        const defenseAlign = p.datos_juego.defensive_alignment;
                        const mascot = (defenseAlign && defenseAlign.geno) ? defenseAlign.geno : p.datos_juego.mascotaActiva;
                        if (!mascot) return false;
                        
                        const gLeague = window.ColiseumManager.obtenerLigaPorGeno(mascot);
                        if (gLeague !== activeLeague) return false;
                        
                        if (aplicarValvula) {
                            // En modo válvula de seguridad, no excluimos ningún elemento
                            return true;
                        } else {
                            if (mascot.element === excludedElement) return false;
                            return true;
                        }
                    });
                    
                    if (validGhosts.length > 0) {
                        let candidates = validGhosts;
                        if (aplicarValvula) {
                            // Priorizar fantasmas que tengan el elemento counter
                            const counterGhosts = validGhosts.filter(g => {
                                const defenseAlign = g.datos_juego.defensive_alignment;
                                const mascot = (defenseAlign && defenseAlign.geno) ? defenseAlign.geno : g.datos_juego.mascotaActiva;
                                return mascot && mascot.element === counterElement;
                            });
                            if (counterGhosts.length > 0) {
                                candidates = counterGhosts;
                            }
                        }

                        // Preferimos fantasmas que tengan menos de 5 usos hoy
                        let ghostsUnderLimit = candidates.filter(g => (g.usos_hoy || 0) < 5);
                        const chosenGhost = ghostsUnderLimit.length > 0 
                            ? ghostsUnderLimit[Math.floor(Math.random() * ghostsUnderLimit.length)]
                            : candidates[Math.floor(Math.random() * candidates.length)];
                        
                        const defenseAlign = chosenGhost.datos_juego.defensive_alignment;
                        if (defenseAlign && defenseAlign.geno) {
                            rivalGeno = JSON.parse(JSON.stringify(defenseAlign.geno));
                            rivalName = rivalGeno.alias || rivalGeno.name || "Geno Fantasma";
                            rivalGeno.iftttRules = defenseAlign.geno.iftttRules || [];
                        } else {
                            rivalGeno = JSON.parse(JSON.stringify(chosenGhost.datos_juego.mascotaActiva));
                            rivalName = rivalGeno.alias || rivalGeno.name || "Geno Fantasma";
                            rivalGeno.iftttRules = chosenGhost.ifttt_script || [];
                        }
                        ghostOwnerId = chosenGhost.id;
                        
                        if (aplicarValvula) {
                            ColiseumUI.agregarLog("<span style='color:#ff003c; font-weight:bold;'>⚠️ [SEGURIDAD] Válvula Actuarial de Liga Activa. Calibrando rival asíncrono...</span>");
                            
                            rivalGeno.element = counterElement;
                            rivalGeno.level = Math.max(rivalGeno.level || 1, (activeGeno.level || 1) + 3);
                            
                            rivalGeno.rarity = activeGeno.rarity || "Común";
                            if (rivalGeno.quality !== undefined && activeGeno.quality !== undefined) {
                                rivalGeno.quality = Math.max(rivalGeno.quality, activeGeno.quality + 5);
                            }
                            
                            const playerStats = activeGeno.stats || { hp: 100, atk: 15, def: 5, spd: 10, luk: 5 };
                            if (!rivalGeno.stats) rivalGeno.stats = {};
                            rivalGeno.stats.hp = Math.max(rivalGeno.stats.hp || 100, Math.floor(playerStats.hp * 1.15));
                            rivalGeno.stats.atk = Math.max(rivalGeno.stats.atk || 15, Math.floor(playerStats.atk * 1.15));
                            rivalGeno.stats.def = Math.max(rivalGeno.stats.def || 5, Math.floor(playerStats.def * 1.15));
                            rivalGeno.stats.spd = Math.max(rivalGeno.stats.spd || 10, Math.floor(playerStats.spd * 1.12));
                            rivalGeno.stats.luk = Math.max(rivalGeno.stats.luk || 5, Math.floor(playerStats.luk * 1.15));
                        } else {
                            // Dado genético asíncrono
                            const rollLvl = Math.random();
                            let lvlBonus = rollLvl < 0.50 ? 1 : 2; // Garantiza +1 o +2 niveles de ventaja
                            const rollQual = Math.random();
                            let qualBonus = rollQual < 0.33 ? 0 : (rollQual < 0.66 ? 1 : 2);
                            
                            rivalGeno.level = (rivalGeno.level || 1) + lvlBonus;
                            if (rivalGeno.stats) {
                                rivalGeno.stats.hp += lvlBonus * 5 + qualBonus * 8;
                                rivalGeno.stats.atk += lvlBonus * 1 + qualBonus * 2;
                                rivalGeno.stats.def += lvlBonus * 1 + qualBonus * 2;
                                rivalGeno.stats.spd += lvlBonus * 1 + qualBonus * 2;
                                rivalGeno.stats.luk += lvlBonus * 1 + qualBonus * 2;
                            }
                        }
                    }
                }
            } catch(e) {
                console.error("[MATCHMAKING GHOST ERROR]", e);
            }
        }
        
        if (!rivalGeno) {
            let targetRarity = "Común";
            if (activeLeague === "Diamante") targetRarity = "Legendario";
            else if (activeLeague === "Oro") targetRarity = "Raro";
            else if (activeLeague === "Plata") targetRarity = "Raro";
            
            let targetLevel = activeGeno.level || 10;
            if (isLive) {
                ColiseumUI.agregarLog("<span style='color:#00ffcc;'>¡Rival en vivo encontrado! Iniciando emparejamiento interactivo...</span>");
            } else {
                if (aplicarValvula) {
                    ColiseumUI.agregarLog("<span style='color:#ff003c; font-weight:bold;'>⚠️ [SEGURIDAD] No se encontraron fantasmas. Inyectando IA de Liga calibrada...</span>");
                } else {
                    ColiseumUI.agregarLog("<span style='color:#b85cff;'>No se encontraron fantasmas guardados en esta liga. Inyectando IA de Liga.</span>");
                }
            }
            
            const procRivalObj = window.ColiseumLogic.crearRivalObjeto(targetLevel, targetRarity, false, true, aplicarValvula);
            rivalGeno = procRivalObj.adn;
            rivalName = procRivalObj.nombre;
        }
        
        window.ColiseumLogic.modoCombate = 'pvp';
        window.ColiseumLogic.playerTimeouts = 0;
        window.ColiseumLogic.playerAutopilot = false;
        
        window.ColiseumLogic.enemy = {
            nombre: rivalName,
            isPlayer: false,
            adn: rivalGeno,
            ownerId: ghostOwnerId, // ID del dueño para acreditar EV pasivo
            maxHp: rivalGeno.stats?.hp || 100,
            hp: rivalGeno.stats?.hp || 100,
            atk: rivalGeno.stats?.atk || 15,
            def: rivalGeno.stats?.def || 5,
            spd: rivalGeno.stats?.spd || 10,
            luk: rivalGeno.stats?.luk || 5,
            baseAtk: rivalGeno.stats?.atk || 15,
            baseDef: rivalGeno.stats?.def || 5,
            baseSpd: rivalGeno.stats?.spd || 10,
            baseLuk: rivalGeno.stats?.luk || 5,
            element: rivalGeno.element || "Normal",
            rareza: rivalGeno.rarity || rivalGeno.rareza || "Común",
            genesId: [
                (rivalGeno.hidden_genes?.B?.id || "ninguno").toLowerCase(),
                (rivalGeno.hidden_genes?.C?.id || "ninguno").toLowerCase()
            ],
            estados: [],
            efectosActivos: [],
            cooldowns: { especial: 0, tactica: 0, definitivo: 0 },
            escudoCibernetico: rivalGeno.element === "Cibernético",
            crystalSkin: false,
            decoyUsado: false,
            coreArUsado: false,
            rachaGolpes: 0,
            adaptativaStacks: 0,
            ultimoElementoRecibido: null,
            danoRecibidoEsteTurno: 0,
            danoRecibidoTurnoAnterior: 0,
            proxVenenoDoble: false,
            ataquesEquipados: (aplicarValvula) ? {
                "ataque": window.ColiseumLogic.obtenerAtaqueAleatorio(rivalGeno.element || "Normal", "basicos"),
                "especial": window.ColiseumLogic.obtenerAtaqueAleatorio(rivalGeno.element || "Normal", "especiales"),
                "tactica": window.ColiseumLogic.obtenerAtaqueAleatorio(rivalGeno.element || "Normal", "soportes"),
                "definitivo": (rivalGeno.level >= 20) ? window.ColiseumLogic.obtenerAtaqueAleatorio(rivalGeno.element || "Normal", "definitivos") : null
            } : {
                "ataque": window.ColiseumLogic.obtenerAtaqueAleatorio(rivalGeno.element || "Normal", "basicos"),
                "especial": window.ColiseumLogic.obtenerAtaqueAleatorio(rivalGeno.element || "Normal", "especiales"),
                "tactica": window.ColiseumLogic.obtenerAtaqueAleatorio(rivalGeno.element || "Normal", "soportes"),
                "definitivo": rivalGeno.level >= 25 ? window.ColiseumLogic.obtenerAtaqueAleatorio(rivalGeno.element || "Normal", "definitivos") : null
            }
        };
        
        window.ColiseumManager.iniciarPeleaConfirmada(false);
    };

    window.ColiseumManager.entrarTorreMutacion = function() {
        if (!window.miMascota || window.miMascota.id === "temp") {
            alert("No tienes un Geno activo para entrar a la Torre de Mutación.");
            return;
        }
        
        const rarity = window.miMascota.rarity || window.miMascota.rareza || "Común";
        let startingFloor = 1;
        if (rarity === "Mítica" || rarity === "Mítico") startingFloor = 101;
        else if (rarity === "Legendaria" || rarity === "Legendario") startingFloor = 76;
        else if (rarity === "Épica" || rarity === "Épico") startingFloor = 51;
        else if (rarity === "Rara" || rarity === "Raro") startingFloor = 26;
        
        const currentFloor = window.currentTowerFloor || 1;
        
        if (currentFloor < startingFloor) {
            let totalEVGranted = 0;
            for (let f = currentFloor; f < startingFloor; f++) {
                let isFirstTime = (f > window.maxFloor);
                let ev = 10 + f * 2;
                if (isFirstTime) ev = Math.round(ev * 1.5);
                if (f > window.towerClaimedFloorThisWeek) {
                    totalEVGranted += ev;
                }
            }
            
            window.currentTowerFloor = startingFloor;
            window.maxFloor = Math.max(window.maxFloor, startingFloor - 1);
            window.towerClaimedFloorThisWeek = Math.max(window.towerClaimedFloorThisWeek, startingFloor - 1);
            
            if (totalEVGranted > 0) {
                if (!window.miInventario) window.miInventario = { vitalEssence: 0, items: [] };
                window.miInventario.vitalEssence = (window.miInventario.vitalEssence || 0) + totalEVGranted;
                alert(`🛡️ AUTO-ASCENSO: Tu Geno es de categoría [${rarity}]. Has sido elevado directamente al Piso ${startingFloor}.\n¡Se te han acreditado +${totalEVGranted} EV de forma automática!`);
            } else {
                alert(`🛡️ AUTO-ASCENSO: Tu Geno es de categoría [${rarity}]. Elevado directamente al Piso ${startingFloor}.`);
            }
            if (window.guardarProgreso) window.guardarProgreso();
        }
        
        window.ColiseumLogic.modoCombate = 'torre';
        window.navegarA('coliseum-screen');
        window.iniciarColiseo();
    };

    window.ColiseumManager.cargarOpcionesVotacion = async function() {
        const container = document.getElementById("gov-options-container");
        if (!container) return;
        
        try {
            const opciones = [
                { id: "solo_comunes", name: "Solo Comunes", desc: "Solo Genos Comunes. Habilidades básicas sin desbalance." },
                { id: "modo_berserker", name: "Modo Berserker", desc: "Defensa = 0. Puro ataque. Combates de 3 turnos." },
                { id: "sin_genes", name: "Sin Genes", desc: "Genes ocultos y pasivas desactivados. Stats puros." }
            ];
            
            let counts = { solo_comunes: 0, modo_berserker: 0, sin_genes: 0 };
            let totalVotes = 0;
            
            for (let opId in counts) {
                const { count, error: countErr } = await window.supabaseClient
                    .from('tournament_votes')
                    .select('*', { count: 'exact', head: true })
                    .eq('torneo_id', opId);
                if (!countErr && count !== null) {
                    counts[opId] = count;
                    totalVotes += count;
                }
            }
            
            container.innerHTML = "";
            opciones.forEach(op => {
                const votesCount = counts[op.id] || 0;
                const pct = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
                
                const btn = document.createElement("button");
                btn.className = "market-btn-neon";
                btn.style.width = "100%";
                btn.style.margin = "4px 0";
                btn.style.padding = "10px";
                btn.style.textAlign = "left";
                btn.style.display = "flex";
                btn.style.justifyContent = "space-between";
                btn.style.alignItems = "center";
                btn.style.background = "rgba(13, 22, 30, 0.6)";
                btn.style.border = "1px solid rgba(184, 92, 255, 0.3)";
                btn.style.borderRadius = "8px";
                btn.style.cursor = "pointer";
                
                btn.innerHTML = `
                    <div>
                        <span style="font-weight:bold; color:#b85cff; font-size:11px; text-transform:uppercase;">${op.name}</span><br>
                        <span style="font-size:9px; color:#aaa;">${op.desc}</span>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:12px; font-weight:bold; color:#00ffcc;">${pct}%</span><br>
                        <span style="font-size:8px; color:#888;">(${votesCount} votos)</span>
                    </div>
                `;
                
                btn.onclick = () => window.ColiseumManager.emitirVoto(op.id);
                container.appendChild(btn);
            });
        } catch(e) {
            console.error("[GOV LOAD ERROR]", e);
            container.innerHTML = "<span style='color:#ff5722;'>Fallo al conectar con el senado Nexo.</span>";
        }
    };

    window.ColiseumManager.emitirVoto = async function(torneoId) {
        if (!window.miUsuarioCloud) {
            alert("Debes iniciar sesión para votar.");
            return;
        }
        
        const labLvl = window.labLevel || 1;
        const hasLicense = window.comercioDesbloqueado || false;
        
        if (labLvl < 5 || !hasLicense) {
            alert("⚠️ RESTRICCIÓN DE URNAS Nexo:\nSe requiere Nivel 5 de Laboratorio y Licencia de Comercio Web3 desbloqueada para participar en la Gobernanza Semanal.");
            return;
        }
        
        try {
            ColiseumUI.agregarLog("<span style='color:#b85cff;'>[SENADO] Registrando tu voto en la base de datos...</span>");
            
            const { error } = await window.supabaseClient
                .from('tournament_votes')
                .upsert({
                    player_id: window.miUsuarioCloud.id,
                    torneo_id: torneoId,
                    voted_at: new Date().toISOString()
                });
                
            if (error) {
                if (error.message && error.message.includes("unique")) {
                    alert("Ya has emitido tu voto esta semana. Cada cuenta está limitada a un voto por ciclo.");
                } else {
                    alert("Error al emitir voto: " + error.message);
                }
            } else {
                alert("¡Voto registrado con éxito! Gracias por tu participación.");
                window.ColiseumManager.cargarOpcionesVotacion();
            }
        } catch(e) {
            console.error("[VOTE ERROR]", e);
        }
    };

    window.ColiseumManager.retirarSaldoWallet = function() {
        const pendingBalance = window.TournamentManager ? (window.TournamentManager.saldosPendientes || 0.0) : 0.0;
        if (pendingBalance <= 0) {
            alert("No tienes saldo acumulado para retirar.");
            return;
        }
        
        const address = window.miWallet ? window.miWallet.address : null;
        if (!address) {
            alert("Asocia o conecta una Wallet en tu perfil primero.");
            return;
        }
        
        if (confirm(`¿Deseas retirar ${pendingBalance.toFixed(2)} POL a tu Wallet Privy (${address})?`)) {
            ColiseumUI.agregarLog(`<span style='color:#ffd700;'>[WEB3] Procesando retiro de ${pendingBalance.toFixed(2)} POL hacia ${address}...</span>`);
            if (!window.miWallet) window.miWallet = { pol: 0.0 };
            window.miWallet.pol = (window.miWallet.pol || 0.0) + pendingBalance;
            window.TournamentManager.saldosPendientes = 0.0;
            
            if (window.guardarProgreso) window.guardarProgreso();
            alert(`¡Retiro exitoso! Se han transferido los fondos a tu wallet.`);
            window.ColiseumManager.actualizarLobbyUI();
        }
    };

    window.ColiseumManager.abrirLeaderboardsLobby = async function() {
        let modal = document.getElementById("lobby-leaderboards-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "lobby-leaderboards-modal";
            modal.style.position = "absolute";
            modal.style.top = "0";
            modal.style.left = "0";
            modal.style.width = "100%";
            modal.style.height = "100%";
            modal.style.background = "rgba(15, 23, 42, 0.98)";
            modal.style.padding = "20px";
            modal.style.boxSizing = "border-box";
            modal.style.zIndex = "3000";
            modal.style.display = "flex";
            modal.style.flexDirection = "column";
            modal.style.borderRadius = "16px";
            modal.style.border = "1.5px solid #00e5ff";
            
            const coliseumScreen = document.getElementById("coliseum-lobby-screen");
            if (coliseumScreen) coliseumScreen.appendChild(modal);
        }
        
        modal.style.display = "flex";
        modal.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; margin-bottom:15px;">
                <h3 style="color:#00e5ff; margin:0; text-transform:uppercase; letter-spacing:1px; font-size:14px; font-weight:bold;">Rankings de Ligas</h3>
                <button id="close-leaderboards-btn" style="background:transparent; border:1px solid #ff3d00; color:#ff3d00; padding:4px 8px; border-radius:6px; cursor:pointer; font-size:9px; font-weight:bold;">Cerrar</button>
            </div>
            <div style="display:flex; gap:5px; margin-bottom:15px; flex-shrink:0;">
                <button class="rank-tab-btn" onclick="window.ColiseumManager.cargarLeaderboardLiga('Bronce')" style="flex:1; padding:6px; font-size:9px; font-weight:bold; cursor:pointer; border-radius:4px; border:1px solid #cd7f32; background:rgba(205,127,50,0.1); color:#cd7f32;">Bronce</button>
                <button class="rank-tab-btn" onclick="window.ColiseumManager.cargarLeaderboardLiga('Plata')" style="flex:1; padding:6px; font-size:9px; font-weight:bold; cursor:pointer; border-radius:4px; border:1px solid #c0c0c0; background:rgba(192,192,192,0.1); color:#c0c0c0;">Plata</button>
                <button class="rank-tab-btn" onclick="window.ColiseumManager.cargarLeaderboardLiga('Oro')" style="flex:1; padding:6px; font-size:9px; font-weight:bold; cursor:pointer; border-radius:4px; border:1px solid #ffd700; background:rgba(255,215,0,0.1); color:#ffd700;">Oro</button>
                <button class="rank-tab-btn" onclick="window.ColiseumManager.cargarLeaderboardLiga('Diamante')" style="flex:1; padding:6px; font-size:9px; font-weight:bold; cursor:pointer; border-radius:4px; border:1px solid #00e5ff; background:rgba(0,229,255,0.1); color:#00e5ff;">Diamante</button>
            </div>
            <div id="leaderboard-players-list" style="flex-grow:1; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
                <span style="color:#aaa; font-size:11px; text-align:center; margin-top:20px;">Cargando clasificaciones...</span>
            </div>
        `;
        
        document.getElementById("close-leaderboards-btn").onclick = () => {
            modal.style.display = "none";
        };
        
        const activeGeno = window.miMascota;
        const activeLeague = window.ColiseumManager.obtenerLigaPorGeno(activeGeno);
        window.ColiseumManager.cargarLeaderboardLiga(activeLeague);
    };

    window.ColiseumManager.cargarLeaderboardLiga = async function(liga) {
        const listContainer = document.getElementById("leaderboard-players-list");
        if (!listContainer) return;
        
        listContainer.innerHTML = "<span style='color:#aaa; font-size:11px; text-align:center; margin-top:20px;'>Descargando posiciones Nexo...</span>";
        
        try {
            const prField = window.ColiseumManager.obtenerPrFieldPorLiga(liga);
            const dbCol = prField === "prBronce" ? "pr_bronce" : (prField === "prPlata" ? "pr_plata" : (prField === "prOro" ? "pr_oro" : "pr_diamante"));
            
            const { data: players, error } = await window.supabaseClient
                .from('jugadores')
                .select(`email, ${dbCol}`)
                .order(dbCol, { ascending: false })
                .limit(10);
                
            if (error) {
                listContainer.innerHTML = `<span style='color:#ff3d00; font-size:11px; text-align:center;'>Error: ${error.message}</span>`;
                return;
            }
            
            listContainer.innerHTML = "";
            if (players.length === 0) {
                listContainer.innerHTML = "<span style='color:#888; font-size:11px; text-align:center; margin-top:20px;'>Nadie ha combatido en esta liga aún.</span>";
                return;
            }
            
            players.forEach((p, idx) => {
                const item = document.createElement("div");
                item.style.display = "flex";
                item.style.justifyContent = "space-between";
                item.style.alignItems = "center";
                item.style.padding = "8px 12px";
                item.style.background = "rgba(255,255,255,0.02)";
                item.style.border = "1px solid rgba(255,255,255,0.05)";
                item.style.borderRadius = "8px";
                
                const isMe = p.email === window.miUsuarioCloud?.email;
                const rankColor = idx === 0 ? "#ffd700" : (idx === 1 ? "#c0c0c0" : (idx === 2 ? "#cd7f32" : "#fff"));
                
                item.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-weight:bold; color:${rankColor}; font-size:13px;">#${idx + 1}</span>
                        <span style="font-size:11px; color:${isMe ? '#00ffcc' : '#fff'}; font-weight:${isMe ? 'bold' : 'normal'};">${p.email.split('@')[0]} ${isMe ? '(Tú)' : ''}</span>
                    </div>
                    <span style="font-weight:bold; color:#00e5ff; font-size:12px;">${p[dbCol] || 0} PR</span>
                `;
                listContainer.appendChild(item);
            });
        } catch(e) {
            console.error(e);
            listContainer.innerHTML = "<span style='color:#ff3d00; font-size:11px; text-align:center;'>Excepción al conectar con Supabase.</span>";
        }
    };

    window.ColiseumManager.liquidarPaseArena = function() {
        const wins = window.arenaWins || 0;
        let polPayout = 0.0;
        let evPayout = 0.0;
        let itemsGranted = [];
        
        if (wins === 5) {
            polPayout = 1.50;
            evPayout = 0.50;
            itemsGranted.push({ id: "implante_raro", name: "Implante Raro", qty: 1 });
        } else if (wins === 4) {
            polPayout = 0.80;
            evPayout = 1.00;
            itemsGranted.push({ id: "implante_comun", name: "Implante Común", qty: 1 });
        } else if (wins === 3) {
            polPayout = 0.50; // Break-even
            evPayout = 2.50;
        } else if (wins === 2) {
            polPayout = 0.20;
            evPayout = 5.00; // Consolación
        } else if (wins === 1) {
            polPayout = 0.00;
            evPayout = 2.00;
        } else {
            polPayout = 0.00;
            evPayout = 0.50;
        }
        
        if (evPayout > 0) {
            if (!window.miInventario) window.miInventario = { vitalEssence: 0, items: [] };
            window.miInventario.vitalEssence = (window.miInventario.vitalEssence || 0) + evPayout;
        }
        
        if (polPayout > 0) {
            if (!window.TournamentManager) window.TournamentManager = { saldosPendientes: 0.0 };
            window.TournamentManager.saldosPendientes = (window.TournamentManager.saldosPendientes || 0.0) + polPayout;
            
            const activeLeagueForPayout = window.ColiseumManager.obtenerLigaPorGeno(window.miMascota);
            if (typeof window.registrarLogEconomia === 'function') {
                window.registrarLogEconomia("arena_payout", polPayout, "Nexus Arena - " + activeLeagueForPayout);
            }
        }
        
        itemsGranted.forEach(item => {
            if (window.miInventario && window.miInventario.items) {
                const existing = window.miInventario.items.find(i => i.id === item.id);
                if (existing) {
                    existing.quantity = (existing.quantity || 0) + item.qty;
                } else {
                    window.miInventario.items.push({ id: item.id, name: item.name, quantity: item.qty, type: "implant" });
                }
            }
        });
        
        window.arenaTicketActive = false;
        window.arenaBattlesPlayed = 0;
        window.arenaWins = 0;
        window.arenaLosses = 0;
        
        if (window.guardarProgreso) window.guardarProgreso();
        
        let msg = `¡Ronda de Arena de 5 combates completada! \nResultados: ${wins} Victorias y ${5 - wins} Derrotas.\nRecompensas:\n`;
        if (polPayout > 0) msg += `- $POL: +${polPayout} (añadido a saldos pendientes)\n`;
        if (evPayout > 0) msg += `- EV: +${evPayout}\n`;
        if (itemsGranted.length > 0) {
            msg += `- Objetos: ${itemsGranted.map(i => i.name).join(", ")}\n`;
        }
        
        alert(msg);
        window.navegarA('coliseum-lobby-screen');
        window.ColiseumManager.actualizarLobbyUI();
    };

    // ==========================================
    // PROTOCOLO DE DESCONEXIÓN Y TIMEOUTS (IFTTT AUTOPILOT)
    // ==========================================
    let turnoTimer = null;
    
    window.ColiseumManager.iniciarTemporizadorTurno = function() {
        if (turnoTimer) clearTimeout(turnoTimer);
        const esTorneo = window.TournamentManager && window.TournamentManager.activeMatch;
        if (window.ColiseumLogic.modoCombate !== 'pvp' && !esTorneo) return;
        
        let secondsLeft = 30;
        if (window.ColiseumLogic.playerAutopilot) {
            window.ColiseumManager.ejecutarTurnoAutopilot();
            return;
        }
        
        const updateTimer = () => {
            let timerEl = document.getElementById("coliseum-turn-timer");
            if (!timerEl) {
                timerEl = document.createElement("div");
                timerEl.id = "coliseum-turn-timer";
                timerEl.style.position = "absolute";
                timerEl.style.top = "10px";
                timerEl.style.right = "20px";
                timerEl.style.color = "#ff3d00";
                timerEl.style.fontWeight = "bold";
                timerEl.style.fontSize = "16px";
                timerEl.style.textShadow = "0 0 5px rgba(255, 61, 0, 0.5)";
                timerEl.style.zIndex = "100";
                const battleArea = document.getElementById("battle-area");
                if (battleArea) battleArea.appendChild(timerEl);
            }
            timerEl.style.display = "block";
            timerEl.innerText = `⏱️ ${secondsLeft}s`;
            
            if (secondsLeft <= 0) {
                clearTimeout(turnoTimer);
                timerEl.style.display = "none";
                window.ColiseumManager.registrarTimeoutJugador();
            } else {
                secondsLeft--;
                turnoTimer = setTimeout(updateTimer, 1000);
            }
        };
        updateTimer();
    };
    
    window.ColiseumManager.detenerTemporizadorTurno = function() {
        if (turnoTimer) clearTimeout(turnoTimer);
        const timerEl = document.getElementById("coliseum-turn-timer");
        if (timerEl) timerEl.style.display = "none";
    };
    
    window.ColiseumManager.registrarTimeoutJugador = function() {
        if (!window.ColiseumLogic.playerTimeouts) window.ColiseumLogic.playerTimeouts = 0;
        window.ColiseumLogic.playerTimeouts++;
        
        ColiseumUI.agregarLog(`<span style="color:#ff3d00; font-weight:bold;">⚠️ ¡Tiempo de turno agotado! (${window.ColiseumLogic.playerTimeouts}/2)</span>`);
        
        if (window.ColiseumLogic.playerTimeouts >= 2) {
            window.ColiseumLogic.playerAutopilot = true;
            ColiseumUI.agregarLog(`<span style="color:#d500f9; font-weight:bold; font-size:13px; text-shadow:0 0 5px rgba(213,0,249,0.5);">⚠️ PILOTO AUTOMÁTICO ACTIVADO: Se ejecutará el script IFTTT de tu Geno para el resto del combate.</span>`);
        }
        window.ColiseumManager.ejecutarTurnoAutopilot();
    };
    
    window.ColiseumManager.ejecutarTurnoAutopilot = function() {
        const p = window.ColiseumLogic.player;
        const e = window.ColiseumLogic.enemy;
        let accionAuto = window.ColiseumLogic.resolverAccionIFTTT(p, e);
        procesarRonda(accionAuto);
    };

    // ==========================================
    // CONTROLADORES DE ALINEACIÓN DEFENSIVA
    // ==========================================
    window.ColiseumManager.tempSelectedGenoId = null;

    window.ColiseumManager.abrirConfigurarDefensa = function(event) {
        if (event) event.stopPropagation();
        
        const modal = document.getElementById("coliseum-defense-modal");
        if (!modal) return;
        
        // Cargar lista de Genos
        const listContainer = document.getElementById("coliseum-defense-genos-list");
        if (!listContainer) return;
        listContainer.innerHTML = "";
        
        if (!window.misGenos || window.misGenos.length === 0) {
            listContainer.innerHTML = `<p style="color:#aaa; font-size:11px; text-align:center; padding:10px 0;">No tienes Genos en tu base de datos genética.</p>`;
            modal.classList.remove("hidden");
            return;
        }
        
        // Determinar qué Geno está actualmente seleccionado en defensiveAlignment o usar miMascota
        let currentDefId = null;
        if (window.defensiveAlignment && window.defensiveAlignment.genoId) {
            currentDefId = window.defensiveAlignment.genoId;
        } else if (window.miMascota) {
            currentDefId = window.miMascota.id;
        }
        
        window.ColiseumManager.tempSelectedGenoId = currentDefId;
        
        window.misGenos.forEach(geno => {
            const card = document.createElement("div");
            card.className = "defense-geno-card";
            card.id = `defense-card-${geno.id}`;
            const isSelected = String(geno.id) === String(currentDefId);
            
            card.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: ${isSelected ? 'rgba(0, 229, 255, 0.15)' : 'rgba(13, 22, 30, 0.4)'};
                border: 2px solid ${isSelected ? '#00e5ff' : 'rgba(255, 255, 255, 0.1)'};
                border-radius: 12px;
                cursor: pointer;
                transition: 0.2s;
                margin-bottom: 4px;
            `;
            
            let svgMarkup = "";
            if (geno.svg) {
                svgMarkup = geno.svg;
            } else if (typeof generarSvgGeno === 'function') {
                svgMarkup = generarSvgGeno(geno);
            } else {
                svgMarkup = `<svg width="30" height="30"></svg>`;
            }
            
            card.onclick = () => window.ColiseumManager.seleccionarGenoDefensivo(geno.id);
            
            card.innerHTML = `
                <div style="width: 36px; height: 36px; display:flex; justify-content:center; align-items:center; flex-shrink:0;">
                    ${svgMarkup}
                </div>
                <div style="flex:1; text-align:left;">
                    <span style="font-size:11px; font-weight:bold; color:#fff; display:block;">${geno.alias || geno.name}</span>
                    <span style="font-size:9px; color:#aaa; text-transform:uppercase;">${geno.rarity || 'Común'} | ${geno.element} | Nv.${geno.level}</span>
                </div>
                ${isSelected ? '<span style="font-size:9px; color:#00e5ff; font-weight:bold; flex-shrink:0;">🛡️ DEFENSOR</span>' : ''}
            `;
            listContainer.appendChild(card);
        });
        
        modal.classList.remove("hidden");
        window.ColiseumManager.seleccionarGenoDefensivo(currentDefId);
    };

    window.ColiseumManager.seleccionarGenoDefensivo = function(genoId) {
        window.ColiseumManager.tempSelectedGenoId = genoId;
        
        // Actualizar bordes en la lista
        const cards = document.querySelectorAll(".defense-geno-card");
        cards.forEach(card => {
            const isTarget = card.id === `defense-card-${genoId}`;
            card.style.background = isTarget ? 'rgba(0, 229, 255, 0.15)' : 'rgba(13, 22, 30, 0.4)';
            card.style.borderColor = isTarget ? '#00e5ff' : 'rgba(255, 255, 255, 0.1)';
        });
        
        const geno = window.misGenos.find(g => String(g.id) === String(genoId));
        const previewContainer = document.getElementById("defense-geno-preview");
        if (!previewContainer) return;
        
        if (!geno) {
            previewContainer.innerHTML = `<p style="color:#aaa; font-size:11px; text-align:center; padding:20px 0;">Selecciona un Geno de la lista.</p>`;
            return;
        }
        
        let svgMarkup = "";
        if (geno.svg) {
            svgMarkup = geno.svg;
        } else if (typeof generarSvgGeno === 'function') {
            svgMarkup = generarSvgGeno(geno);
        } else {
            svgMarkup = `<svg width="40" height="40"></svg>`;
        }
        
        previewContainer.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; background:rgba(0,0,0,0.2); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                <div style="width: 50px; height: 50px; background:rgba(0,0,0,0.3); border-radius:50%; border:1px dashed #00e5ff; display:flex; justify-content:center; align-items:center; flex-shrink:0;">
                    ${svgMarkup}
                </div>
                <div style="text-align:left;">
                    <h4 style="margin:0; font-size:13px; color:#00e5ff; font-weight:bold;">${geno.alias || geno.name}</h4>
                    <span style="font-size:10px; color:#cbd5e1; text-transform:uppercase;">Nv.${geno.level} | ${geno.rarity || 'Común'} | ${geno.element}</span>
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:10px; margin-bottom:12px; text-align:left;">
                <div style="background:rgba(0,0,0,0.2); padding:5px 8px; border-radius:4px; color:#aaa;">❤️ HP: <span style="float:right; color:#fff; font-weight:bold;">${geno.stats?.hp || 100}</span></div>
                <div style="background:rgba(0,0,0,0.2); padding:5px 8px; border-radius:4px; color:#aaa;">⚔️ ATK: <span style="float:right; color:#fff; font-weight:bold;">${geno.stats?.atk || 15}</span></div>
                <div style="background:rgba(0,0,0,0.2); padding:5px 8px; border-radius:4px; color:#aaa;">🛡️ DEF: <span style="float:right; color:#fff; font-weight:bold;">${geno.stats?.def || 5}</span></div>
                <div style="background:rgba(0,0,0,0.2); padding:5px 8px; border-radius:4px; color:#aaa;">⚡ SPD: <span style="float:right; color:#fff; font-weight:bold;">${geno.stats?.spd || 10}</span></div>
            </div>
        `;
        
        // Renderizar reglas IFTTT en modo visual
        const rulesList = document.getElementById("defense-ifttt-rules-list");
        if (!rulesList) return;
        rulesList.innerHTML = "";
        
        const rules = geno.iftttRules || [];
        if (rules.length === 0) {
            rulesList.innerHTML = `<p style="color:#aaa; font-size:10px; text-align:center; padding:10px 0; font-style:italic;">No tiene reglas programadas. En combate usará ataques automáticos por defecto.</p>`;
            return;
        }
        
        const conditionLabels = {
            "always": "Siempre",
            "hp_under_50": "Mi HP < 50%",
            "hp_under_30": "Mi HP < 30%",
            "turn_1": "En el Turno 1",
            "rival_infected": "Rival Infectado",
            "rival_buffed_atk": "Rival con Buff de ATK",
            "self_buffed_spd": "Tengo Buff de SPD",
            "rival_element_biomutante": "Rival es Biomutante",
            "rival_element_viral": "Rival es Viral",
            "rival_element_cibernetico": "Rival es Cibernético",
            "rival_element_radiactivo": "Rival es Radiactivo",
            "rival_element_toxico": "Rival es Tóxico",
            "rival_element_sintetico": "Rival es Sintético"
        };
        
        const actionLabels = {
            "ataque": "Usar Ataque Básico",
            "especial": "Usar Ataque Especial",
            "tactica": "Usar Soporte",
            "definitivo": "Usar Definitivo"
        };
        
        rules.forEach((rule, idx) => {
            const row = document.createElement("div");
            row.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(13, 22, 28, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 6px;
                padding: 6px 10px;
                font-size: 10px;
                margin-bottom: 4px;
            `;
            
            const condText = conditionLabels[rule.condition] || rule.condition;
            const actText = actionLabels[rule.action] || rule.action;
            
            row.innerHTML = `
                <span style="color:#aaa; font-weight:bold;">${idx + 1}.</span>
                <span style="color:#00ffcc; font-weight:500;">IF [${condText}]</span>
                <span style="color:#aaa;">➔</span>
                <span style="color:#ff8c00; font-weight:bold;">THEN [${actText}]</span>
            `;
            rulesList.appendChild(row);
        });
    };

    window.ColiseumManager.guardarDefensa = function() {
        const genoId = window.ColiseumManager.tempSelectedGenoId;
        if (!genoId) {
            alert("Por favor selecciona un Geno para defender.");
            return;
        }
        
        const geno = window.misGenos.find(g => String(g.id) === String(genoId));
        if (!geno) {
            alert("No se pudo encontrar el Geno seleccionado.");
            return;
        }
        
        // Clonación limpia
        const genoSnapshot = JSON.parse(JSON.stringify(geno));
        
        window.defensiveAlignment = {
            genoId: String(geno.id),
            geno: genoSnapshot
        };
        
        // Cerrar modal
        const modal = document.getElementById("coliseum-defense-modal");
        if (modal) modal.classList.add("hidden");
        
        // Guardar progreso local y nube
        if (window.guardarProgreso) {
            window.guardarProgreso();
        }
        
        window.ColiseumManager.actualizarLobbyUI();
        
        alert(`¡Defensa PvP establecida con éxito! ${geno.alias || geno.name} defenderá tu rango en la arena.`);
    };

    window.ColiseumManager.cerrarConfigurarDefensa = function() {
        const modal = document.getElementById("coliseum-defense-modal");
        if (modal) modal.classList.add("hidden");
    };

    window.ColiseumManager.irAlLaboratorioImplantes = function() {
        const modal = document.getElementById("coliseum-defense-modal");
        if (modal) modal.classList.add("hidden");
        if (typeof window.navegarA === 'function') {
            if (window.ImplantsManager && typeof window.ImplantsManager.init === 'function') {
                window.ImplantsManager.init();
            }
            window.navegarA('implants-area');
        }
    };
});