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
                    }
                });

                trigger.classList.toggle('open');
                optionsContainer.classList.toggle('open');
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
    };

    function iniciarPelea() {
        let btnStart = document.getElementById("btn-start-battle");
        let btnLeave = document.getElementById("btn-leave-battle");
        let controls = document.getElementById("battle-controls");
        
        if(btnStart) btnStart.style.setProperty("display", "none", "important");
        if(btnLeave) btnLeave.style.setProperty("display", "none", "important");
        if(controls) controls.style.setProperty("display", "grid", "important");
        
        ColiseumUI.limpiarLog();
        ColiseumUI.agregarLog(`<span style="color:#4dd0e1">> INICIALIZANDO SECUENCIA DE COMBATE...</span>`);
        ColiseumUI.agregarLog(`<br><span style="color:#ffcc00; font-weight:bold;">--- BATTLE START ---</span>`);

        ColiseumLogic.prepararJugador(window.miMascota);
        ColiseumLogic.generarRivalProcedural(window.miMascota.level || 1);
        
        const p = ColiseumLogic.player;
        const e = ColiseumLogic.enemy;

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
        const p = ColiseumLogic.player;
        const e = ColiseumLogic.enemy;

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
            ColiseumUI.actualizarHP(p, e);
            
            if (typeof ColiseumUI.actualizarEstados === 'function') {
                ColiseumUI.actualizarEstados(p, e);
            }
            
            ColiseumLogic.turno++;
            
            if (p.hp <= 0 || e.hp <= 0) terminarCombate();
            else actualizarBotones();
        }, tiempoTotalEfectos);
    }

    function terminarCombate() {
        bloquearBotones(true);
        ColiseumUI.agregarLog(`<br><span style="color:#ffcc00; font-size: 16px; font-weight: bold;">--- FIN DEL COMBATE ---</span>`);
        if (ColiseumLogic.player.hp > 0) {
            ColiseumUI.agregarLog(`<span style="color:#4CAF50">🏆 ¡VICTORIA!</span>`, "#ffd54f");
            const xpGanada = 50 + (ColiseumLogic.player.adn.level * 10);
            ColiseumUI.agregarLog(`<span style="color:#aaa">Ganaste ${xpGanada} XP.</span>`);
            if (window.ganarXP) window.ganarXP(xpGanada);
        } else {
            ColiseumUI.agregarLog(`<span style="color:#f44336">💀 DERROTA. Tu Geno debe descansar.</span>`);
        }

        setTimeout(() => {
            let controls = document.getElementById("battle-controls");
            let btnStart = document.getElementById("btn-start-battle");
            let btnLeave = document.getElementById("btn-leave-battle"); 
            
            if(controls) controls.style.setProperty("display", "none", "important");
            if(btnStart) { btnStart.style.setProperty("display", "block", "important"); 
            btnStart.innerText = "Buscar otro rival"; }
            if(btnLeave) btnLeave.style.setProperty("display", "", "important"); 
        }, 1000);
    }

    function actualizarBotones() {
        if (typeof ColiseumUI.actualizarBotonesAtaque === 'function') {
            ColiseumUI.actualizarBotonesAtaque(window.miMascota);
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
        ["btn-atk-1", "btn-atk-2", "btn-atk-3", "btn-atk-4"].forEach(id => {
            let btn = document.getElementById(id);
            if(btn && btn.innerText !== "VACÍO" && !btn.innerText.includes("NV. 25")) {
                btn.disabled = bloquear;
            }
        });
    }
});