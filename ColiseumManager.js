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
    };

    function iniciarPelea() {
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

        let btnStart = document.getElementById("btn-start-battle");
        let btnLeave = document.getElementById("btn-leave-battle");
        let controls = document.getElementById("battle-controls");
        
        if(btnStart) btnStart.style.setProperty("display", "none", "important");
        if(btnLeave) btnLeave.style.setProperty("display", "none", "important");
        if(controls) controls.style.setProperty("display", "grid", "important");
        
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
        ColiseumUI.agregarLog(`<br><span style="color:#ffcc00; font-size: 16px; font-weight: bold;">--- FIN DEL COMBATE ---</span>`);
        const playerGano = ColiseumLogic.modoCombate === '3v3' ? ColiseumLogic.playerTeam.some(g => g.hp > 0) : (ColiseumLogic.player.hp > 0);
        if (playerGano) {
            ColiseumUI.agregarLog(`<span style="color:#4CAF50">🏆 ¡VICTORIA!</span>`, "#ffd54f");
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

                // Cuidado / Necesidades: +15 Diversión, e Incrementar Amistad por combate (1 a 3, una vez al día)
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
        }

        setTimeout(() => {
            let controls = document.getElementById("battle-controls");
            let btnStart = document.getElementById("btn-start-battle");
            let btnLeave = document.getElementById("btn-leave-battle"); 
            
            if(controls) controls.style.setProperty("display", "none", "important");
            if(btnStart) { btnStart.style.setProperty("display", "block", "important"); 
            btnStart.innerText = "Buscar otro rival"; }
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
});