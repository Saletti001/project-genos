// ========================================================
// TournamentManager.js - LÓGICA DE TORNEOS DE LLAVES Y FIFO
// ========================================================

window.TournamentManager = {
    saldosPendientes: 0.0,
    activeTournament: null,
    activeMatch: null,
    queuePlayers: [],
    queueTimer: null,
    injectedBotUsed: false,

    // Configuración de Torneos
    CONFIG: {
        neon: {
            id: "neon",
            nombre: "Copa Neón Nexo",
            costo: 1.0,
            division: "Neón",
            premios: { 1: 9.0, 2: 3.6, 3: 1.8 },
            minLevel: 1
        },
        satelite: {
            id: "satelite",
            nombre: "Copa Satélite",
            costo: 0.5,
            division: "Satélite",
            premios: { 1: 4.5, 2: 1.8, 3: 0.9 },
            minLevel: 1
        }
    },

    NPC_NAMES: [
        "AeroPulse", "VorMorph", "KaelGen", "PyroSpark", "ToxShard", 
        "BioCore", "ZarLith", "CrioVolt", "NexPhase", "GravGlow", 
        "MutaVibe", "ViroClaw", "LumiNova", "XenonGeno", "ZeroCool",
        "ProtoType", "CyberGlow", "ByteClaw", "SparkMorph", "PulseNexo"
    ],

    ELEMENTS: ["Biomutante", "Viral", "Cibernético", "Radiactivo", "Tóxico", "Sintético"],

    init: function() {
        this.cargarSaldos();
        this.inyectarEstilos();
        this.vincularHooks();
    },

    cargarSaldos: function() {
        const savedSaldos = localStorage.getItem("tournament_saldos_pendientes");
        if (savedSaldos) {
            this.saldosPendientes = parseFloat(savedSaldos) || 0.0;
        }

        const savedActive = localStorage.getItem("tournament_active");
        if (savedActive) {
            try {
                this.activeTournament = JSON.parse(savedActive);
            } catch (e) {
                console.error("Error cargando torneo activo:", e);
            }
        }
    },

    guardarEstado: function() {
        localStorage.setItem("tournament_saldos_pendientes", this.saldosPendientes.toString());
        if (this.activeTournament) {
            localStorage.setItem("tournament_active", JSON.stringify(this.activeTournament));
        } else {
            localStorage.removeItem("tournament_active");
        }
        
        // Autoguardar en nube si procede
        if (typeof window.autoGuardar === 'function') {
            window.autoGuardar();
        }
    },

    abrirTorneos: function() {
        // Asegurar que el modal del drawer esté cerrado
        const drawer = document.getElementById('drawer-menu');
        if (drawer) drawer.classList.add('hidden');

        window.navegarA("tournament-screen");
        this.actualizarVista();
    },

    actualizarVista: function() {
        const screen = document.getElementById("tournament-screen");
        if (!screen) return;

        // Actualizar panel de saldos pendientes
        const saldoVal = document.getElementById("tourney-pending-balance-val");
        if (saldoVal) {
            saldoVal.innerText = this.saldosPendientes.toFixed(2);
        }

        const claimBtn = document.getElementById("tourney-btn-claim-pending");
        if (claimBtn) {
            if (this.saldosPendientes > 0) {
                claimBtn.disabled = false;
                claimBtn.classList.remove("disabled");
            } else {
                claimBtn.disabled = true;
                claimBtn.classList.add("disabled");
            }
        }

        // Determinar qué panel mostrar
        const lobbyPanel = document.getElementById("tourney-lobby-panel");
        const queuePanel = document.getElementById("tourney-queue-panel");
        const bracketPanel = document.getElementById("tourney-bracket-panel");

        if (this.activeTournament) {
            lobbyPanel.classList.add("hidden");
            queuePanel.classList.add("hidden");
            bracketPanel.classList.remove("hidden");
            this.renderizarBracket();
        } else if (this.queuePlayers.length > 0) {
            lobbyPanel.classList.add("hidden");
            queuePanel.classList.remove("hidden");
            bracketPanel.classList.add("hidden");
            this.renderizarQueue();
        } else {
            lobbyPanel.classList.remove("hidden");
            queuePanel.classList.add("hidden");
            bracketPanel.classList.add("hidden");
        }
    },

    inscribirse: function(tourneyId) {
        if (!window.comercioDesbloqueado) {
            alert("⚠️ Se requiere el 'Permiso de Comercio' (adquirible en el Bazar por 15 EV al llegar a Nv. 5 de Laboratorio) para participar en Torneos competitivos.");
            return;
        }

        if (!window.miMascota || window.miMascota.id === "temp") {
            alert("⚠️ Debes tener un Geno activo para poder competir.");
            return;
        }

        const activeGenoRes = window.miMascota.resistencia !== undefined ? window.miMascota.resistencia : 100;
        if (activeGenoRes < 20) {
            alert("⚠️ Tu Geno activo no tiene suficiente Resistencia (se requiere al menos 20%). Déjalo descansar en el Laboratorio.");
            return;
        }

        const conf = this.CONFIG[tourneyId];
        if (!conf) return;

        // Comprobar saldo en la wallet
        let balance = window.miWallet && window.miWallet.pol !== undefined ? window.miWallet.pol : 0.0;
        if (balance < conf.costo) {
            window.mostrarModalSaldoCero("buy");
            return;
        }

        // Confirmación consciente
        if (!confirm(`¿Deseas inscribir a tu Geno en la ${conf.nombre} por un valor de ${conf.costo.toFixed(2)} POL?`)) {
            return;
        }

        // Descontar saldo y guardar
        window.miWallet.pol -= conf.costo;
        if (window.WalletManager && window.WalletManager.actualizarBoton) {
            window.WalletManager.actualizarBoton();
        }

        // Añadir historial local
        window.miWallet.history = window.miWallet.history || [];
        window.miWallet.history.unshift({
            tipo: 'Inscripción Torneo',
            monto: conf.costo,
            fecha: new Date().toLocaleTimeString()
        });

        // Iniciar Simulación de Cola
        this.iniciarSimulacionCola(conf);
    },

    iniciarSimulacionCola: function(conf) {
        this.queuePlayers = [
            { nombre: "TÚ (" + (window.miMascota.name || "Geno") + ")", isPlayer: true, level: window.miMascota.level || 1, element: window.miMascota.element }
        ];
        
        this.injectedBotUsed = false;
        this.actualizarVista();

        // Llenado aleatorio inicial
        const initialCount = Math.floor(Math.random() * 5) + 6; // 6 a 10 jugadores
        for (let i = 0; i < initialCount; i++) {
            this.queuePlayers.push(this.generarRivalCola(conf.minLevel));
        }
        this.renderizarQueue();

        // Programar ticks de cola
        if (this.queueTimer) clearInterval(this.queueTimer);
        
        let overflowTriggered = false;

        this.queueTimer = setInterval(() => {
            if (this.queuePlayers.length < 15) {
                // Añadir un bot aleatorio
                this.queuePlayers.push(this.generarRivalCola(conf.minLevel));
                this.renderizarQueue();
            } else if (this.queuePlayers.length === 15) {
                // 10% probabilidad de overflow FIFO antes del 16 si coincide
                if (Math.random() < 0.12 && !overflowTriggered && conf.id === "neon") {
                    overflowTriggered = true;
                    // Simular entrada masiva que empuja al jugador fuera
                    this.queuePlayers.push(this.generarRivalCola(conf.minLevel));
                    this.queuePlayers.push(this.generarRivalCola(conf.minLevel));
                    this.renderizarQueue();
                    
                    setTimeout(() => {
                        clearInterval(this.queueTimer);
                        this.queueTimer = null;
                        
                        alert(`⚠️ ¡DIVISIÓN LLENA! (Cola Desbordada)\n\nLa Copa Neón ha alcanzado el límite de 16 jugadores antes de tu confirmación de bloque. \n\nPor protocolo FIFO, has sido reubicado automáticamente en la Copa Satélite (0.50 POL). Los 0.50 POL de exceso se han reembolsado a tus saldos pendientes.`);
                        
                        // Añadir saldo pendiente
                        this.saldosPendientes += 0.50;
                        this.guardarEstado();

                        // Cancelar cola y arrancar la Copa Satélite inmediatamente
                        this.queuePlayers = [];
                        this.iniciarSimulacionCola(this.CONFIG.satelite);
                    }, 1200);
                } else {
                    // Llenar el 16 con inyección de bot NPC subsidiado
                    clearInterval(this.queueTimer);
                    this.queueTimer = null;

                    const npcSubsidio = this.generarRivalCola(conf.minLevel);
                    npcSubsidio.nombre = "[NPC] " + npcSubsidio.nombre;
                    npcSubsidio.isBotSubsidiado = true;
                    this.queuePlayers.push(npcSubsidio);
                    this.renderizarQueue();

                    setTimeout(() => {
                        alert(`⚙️ QUÓRUM COMPLETADO\n\nSe ha inyectado el competidor número 16 (${npcSubsidio.nombre}) subsidiado por la casa para evitar demoras competitivas. ¡Comienza el Torneo!`);
                        this.inicializarBracketTorneo(conf);
                    }, 1500);
                }
            }
        }, 1200);
    },

    generarRivalCola: function(minLevel) {
        const nombre = this.NPC_NAMES[Math.floor(Math.random() * this.NPC_NAMES.length)] + "#" + Math.floor(Math.random() * 900 + 100);
        const lvl = Math.max(1, (window.miMascota.level || 1) + Math.floor(Math.random() * 5) - 2); // +- 2 del jugador
        const element = this.ELEMENTS[Math.floor(Math.random() * this.ELEMENTS.length)];
        return { nombre, isPlayer: false, level: lvl, element };
    },

    renderizarQueue: function() {
        const list = document.getElementById("tourney-queue-list");
        if (!list) return;

        list.innerHTML = this.queuePlayers.map((p, idx) => `
            <div class="queue-item ${p.isPlayer ? 'player' : ''} ${p.isBotSubsidiado ? 'subsidio' : ''}" style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 8px 10px; font-family: monospace; font-size: 11px;">
                <span>[${(idx + 1).toString().padStart(2, '0')}] ${p.nombre}</span>
                <span style="color: #888;">Lv.${p.level} | ${p.element}</span>
            </div>
        `).join('');

        const countEl = document.getElementById("tourney-queue-count");
        if (countEl) {
            countEl.innerText = `${this.queuePlayers.length}/16`;
        }
    },

    cancelarCola: function() {
        if (this.queueTimer) {
            clearInterval(this.queueTimer);
            this.queueTimer = null;
        }

        // Devolución completa de la inscripción
        if (this.queuePlayers.length > 0) {
            // Buscamos cuál fue el torneo
            const isNeon = this.queuePlayers[0].level === window.miMascota.level && this.CONFIG.neon.costo === 1.0; 
            const reembolso = isNeon ? 1.0 : 0.5;

            window.miWallet.pol += reembolso;
            if (window.WalletManager && window.WalletManager.actualizarBoton) {
                window.WalletManager.actualizarBoton();
            }
            alert(`🚪 Has salido de la cola. Se te han devuelto ${reembolso.toFixed(2)} POL a tu balance.`);
        }

        this.queuePlayers = [];
        this.actualizarVista();
    },

    inicializarBracketTorneo: function(conf) {
        // Mezclar participantes
        const participantes = [...this.queuePlayers].sort(() => 0.5 - Math.random());
        
        // Si el jugador no quedó en participantes por alguna razón, forzarlo en el índice 0
        const playerIdx = participantes.findIndex(p => p.isPlayer);
        if (playerIdx === -1) {
            participantes[0] = { nombre: "TÚ (" + (window.miMascota.name || "Geno") + ")", isPlayer: true, level: window.miMascota.level || 1, element: window.miMascota.element };
        }

        // Estructura de Brackets
        // Rondas: 0 = Octavos (16), 1 = Cuartos (8), 2 = Semifinales (4), 3 = Final (2), 4 = Campeón
        const matches = [];
        // Generar 8 encuentros iniciales
        for (let i = 0; i < 8; i++) {
            matches.push({
                id: i + 1,
                round: 0,
                p1: participantes[i * 2],
                p2: participantes[i * 2 + 1],
                score1: null,
                score2: null,
                winner: null
            });
        }

        this.activeTournament = {
            id: Date.now(),
            config: conf,
            rondaActual: 0, // Octavos
            matches: matches,
            participantes: participantes,
            log: [ `🏆 Torneo ${conf.nombre} iniciado.` ],
            estado: "jugando" // "jugando", "finalizado"
        };

        this.queuePlayers = [];
        this.guardarEstado();
        this.actualizarVista();
    },

    renderizarBracket: function() {
        const container = document.getElementById("tourney-bracket-rounds");
        if (!container) return;

        const t = this.activeTournament;
        const matches = t.matches;

        // Agrupar encuentros por ronda
        const rondas = [[], [], [], []]; // 0: Octavos, 1: Cuartos, 2: Semis, 3: Final
        matches.forEach(m => {
            if (rondas[m.round]) {
                rondas[m.round].push(m);
            }
        });

        // Generar el HTML de las columnas
        let html = "";
        const nombresRondas = ["Octavos", "Cuartos", "Semifinal", "Final"];
        
        for (let r = 0; r < 4; r++) {
            const listMatches = rondas[r];
            html += `
                <div class="bracket-column round-${r}">
                    <div class="round-title">${nombresRondas[r]}</div>
                    <div class="round-matches-list">
            `;

            // Si es una ronda que aún no se ha generado/poblado
            if (listMatches.length === 0) {
                // Rellenar con nodos fantasma
                const numNodos = 8 / Math.pow(2, r);
                for (let n = 0; n < numNodos; n++) {
                    html += `
                        <div class="bracket-match-node empty">
                            <div class="fighter-row">Pendiente</div>
                            <div class="fighter-row">Pendiente</div>
                        </div>
                    `;
                }
            } else {
                listMatches.forEach(m => {
                    const p1Name = m.p1 ? m.p1.nombre : "Pendiente";
                    const p2Name = m.p2 ? m.p2.nombre : "Pendiente";
                    
                    const p1Winner = m.winner && m.winner.nombre === p1Name;
                    const p2Winner = m.winner && m.winner.nombre === p2Name;
                    
                    const isPlayerMatch = (m.p1 && m.p1.isPlayer) || (m.p2 && m.p2.isPlayer);
                    const isCompleted = m.winner !== null;
                    const isCurrentRound = t.rondaActual === m.round;

                    html += `
                        <div class="bracket-match-node ${isPlayerMatch ? 'highlight' : ''} ${isCompleted ? 'completed' : ''} ${isCurrentRound && isPlayerMatch && !isCompleted ? 'active' : ''}">
                            <div class="fighter-row ${p1Winner ? 'winner' : ''} ${m.p1 && m.p1.isPlayer ? 'player' : ''}">
                                <span>${p1Name}</span>
                                <span class="score">${m.score1 !== null ? m.score1 : ''}</span>
                            </div>
                            <div class="fighter-row ${p2Winner ? 'winner' : ''} ${m.p2 && m.p2.isPlayer ? 'player' : ''}">
                                <span>${p2Name}</span>
                                <span class="score">${m.score2 !== null ? m.score2 : ''}</span>
                            </div>
                        </div>
                    `;
                });
            }

            html += `
                    </div>
                </div>
            `;
        }

        // Columna del campeón
        const finalMatch = matches.find(m => m.round === 3);
        const campeonNombre = finalMatch && finalMatch.winner ? finalMatch.winner.nombre : "???";
        const isPlayerCampeon = finalMatch && finalMatch.winner && finalMatch.winner.isPlayer;

        html += `
            <div class="bracket-column champion-col">
                <div class="round-title" style="color: #ffd700;">Campeón</div>
                <div class="round-matches-list" style="justify-content: center;">
                    <div class="bracket-champion-node ${isPlayerCampeon ? 'player' : ''}">
                        <div class="cup-icon">🏆</div>
                        <div class="champ-name">${campeonNombre}</div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Actualizar panel lateral de información del encuentro
        this.renderizarPanelEncuentro();
    },

    renderizarPanelEncuentro: function() {
        const sidePanel = document.getElementById("tourney-match-details");
        if (!sidePanel) return;

        const t = this.activeTournament;
        if (t.estado === "finalizado") {
            const finalMatch = t.matches.find(m => m.round === 3);
            const ganoPlayer = finalMatch && finalMatch.winner && finalMatch.winner.isPlayer;
            const playerPos = this.obtenerPosicionJugador();

            let payoutText = "";
            let payout = 0;
            if (playerPos === 1) {
                payout = t.config.premios[1];
                payoutText = `<div style="color: #69f0ae; font-weight: bold; margin-top: 10px;">🎁 Premio por 1er Lugar: +${payout.toFixed(2)} POL</div>`;
            } else if (playerPos === 2) {
                payout = t.config.premios[2];
                payoutText = `<div style="color: #80deea; font-weight: bold; margin-top: 10px;">🎁 Premio por 2do Lugar: +${payout.toFixed(2)} POL</div>`;
            } else if (playerPos === 3) {
                payout = t.config.premios[3];
                payoutText = `<div style="color: #ffb300; font-weight: bold; margin-top: 10px;">🎁 Premio por 3er Lugar: +${payout.toFixed(2)} POL</div>`;
            } else {
                payoutText = `<div style="color: #888; margin-top: 10px;">Posición final: R16/Cuartos. Sigue entrenando para el próximo torneo.</div>`;
            }

            sidePanel.innerHTML = `
                <div style="background: rgba(0,0,0,0.4); border: 2px solid #ffd700; border-radius: 12px; padding: 15px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #ffd700; margin-bottom: 8px;">🏆 TORNEO FINALIZADO</div>
                    <div style="font-size: 13px; color: #fff;">El ganador de la ${t.config.nombre} es:</div>
                    <div style="font-size: 16px; font-weight: bold; color: #00e5ff; margin-top: 5px; text-shadow: 0 0 8px rgba(0,229,255,0.4);">${finalMatch.winner.nombre}</div>
                    ${payoutText}
                    <button class="btn-primary" onclick="TournamentManager.cerrarTorneo()" style="width: 100%; margin-top: 15px; background: linear-gradient(90deg, #ffd700, #ff8c00); color: #000; box-shadow: 0 0 15px rgba(255,215,0,0.3);">
                        Volver al Lobby
                    </button>
                </div>
            `;
            return;
        }

        // Buscar el encuentro del jugador en la ronda actual
        const rAct = t.rondaActual;
        const myMatch = t.matches.find(m => m.round === rAct && ((m.p1 && m.p1.isPlayer) || (m.p2 && m.p2.isPlayer)));

        if (!myMatch) {
            // El jugador fue eliminado
            sidePanel.innerHTML = `
                <div style="background: rgba(255,0,127,0.06); border: 1.5px dashed rgba(255,0,127,0.4); border-radius: 12px; padding: 15px; text-align: center;">
                    <div style="font-size: 14px; font-weight: bold; color: #ff007f; margin-bottom: 8px;">💥 ESTÁS ELIMINADO</div>
                    <p style="font-size: 11px; color: #ccc; line-height: 1.35; margin: 0 0 12px 0;">
                        Tu Geno ha caído en una ronda anterior. Puedes simular el resto del torneo para ver quién resulta ganador.
                    </p>
                    <button class="market-btn-neon" onclick="TournamentManager.simularRestoTorneo()" style="width: 100%; padding: 10px 5px; margin-bottom: 8px; font-size: 11px; background: linear-gradient(90deg, #1e293b, #334155); border: 1px solid #475569; box-shadow: none;">
                        Simular Rondas Restantes
                    </button>
                    <button class="market-btn-neon red" onclick="TournamentManager.cerrarTorneo()" style="width: 100%; padding: 10px 5px; font-size: 11px; margin-top: 0;">
                        Abandonar Torneo
                    </button>
                </div>
            `;
            return;
        }

        if (myMatch.winner !== null) {
            // El combate del jugador ya terminó, pero faltan otros por simular
            sidePanel.innerHTML = `
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #384a5e; border-radius: 12px; padding: 15px; text-align: center;">
                    <div style="font-size: 13px; font-weight: bold; color: #69f0ae; margin-bottom: 5px;">✅ COMBATE COMPLETADO</div>
                    <p style="font-size: 11px; color: #aaa; margin-bottom: 12px;">Esperando que terminen las demás simulaciones del Coliseo.</p>
                    <button class="btn-primary" onclick="TournamentManager.simularOtrosMatchsDeRonda()" style="width: 100%; background: linear-gradient(90deg, #00e5ff, #8A2BE2); text-transform: uppercase;">
                        Simular Siguientes Llaves
                    </button>
                </div>
            `;
            return;
        }

        // El combate del jugador está pendiente
        const rival = myMatch.p1.isPlayer ? myMatch.p2 : myMatch.p1;
        
        sidePanel.innerHTML = `
            <div style="background: rgba(0,0,0,0.4); border: 1px solid #384a5e; border-radius: 12px; padding: 15px;">
                <div style="font-size: 10px; color: #80deea; text-transform: uppercase; font-weight: bold; margin-bottom: 8px; text-align: center; letter-spacing: 1px;">Encuentro Pendiente</div>
                
                <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;">
                        <span style="color: #aaa; font-size: 11px;">Rival:</span>
                        <span style="font-weight: bold; color: #ff6b6b; font-size: 11px;">${rival.nombre}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;">
                        <span style="color: #aaa; font-size: 11px;">Nivel:</span>
                        <span style="font-weight: bold; color: #fff; font-size: 11px;">Lv.${rival.level}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;">
                        <span style="color: #aaa; font-size: 11px;">Elemento:</span>
                        <span style="font-weight: bold; color: #00e5ff; font-size: 11px;">${rival.element}</span>
                    </div>
                </div>

                <button class="btn-primary" onclick="TournamentManager.comenzarDuelo()" style="width: 100%; padding: 12px 0; background: linear-gradient(90deg, #ff007f, #d500f9); text-transform: uppercase; font-weight: bold; letter-spacing: 1px; box-shadow: 0 0 15px rgba(255, 0, 127, 0.4);">
                    ⚔️ INICIAR DUELO
                </button>
            </div>
        `;
    },

    comenzarDuelo: function() {
        const t = this.activeTournament;
        const myMatch = t.matches.find(m => m.round === t.rondaActual && ((m.p1 && m.p1.isPlayer) || (m.p2 && m.p2.isPlayer)));
        if (!myMatch) return;

        const rival = myMatch.p1.isPlayer ? myMatch.p2 : myMatch.p1;

        // Crear objeto de rival adecuado
        const eStats = window.generarStatsPorRareza ? window.generarStatsPorRareza("Común") : { hp: 120, atk: 12, def: 8, spd: 10, luk: 5 };
        
        // Escalar stats al nivel del rival
        const scale = rival.level / 5;
        eStats.hp = Math.round(eStats.hp * scale);
        eStats.atk = Math.round(eStats.atk * scale);
        eStats.def = Math.round(eStats.def * scale);
        eStats.spd = Math.round(eStats.spd * scale);
        
        const rivalAdn = {
            id: "tourney_npc_" + Date.now(),
            name: rival.nombre,
            level: rival.level,
            element: rival.element,
            rarity: "Común",
            body_shape: "frijol",
            color: "#ff6b6b",
            eye_type: "angry",
            mouth_type: "colmillos",
            stats: eStats
        };

        const rivalFighterObj = {
            nombre: rival.nombre,
            isPlayer: false,
            adn: rivalAdn,
            maxHp: eStats.hp,
            hp: eStats.hp,
            atk: eStats.atk,
            def: eStats.def,
            spd: eStats.spd,
            luk: eStats.luk,
            baseAtk: eStats.atk,
            baseDef: eStats.def,
            baseSpd: eStats.spd,
            baseLuk: eStats.luk,
            element: rival.element,
            rareza: "Común",
            genesId: ["ninguno", "ninguno"],
            estados: [],
            efectosActivos: [],
            cooldowns: { especial: 0, tactica: 0, definitivo: 0 },
            escudoCibernetico: rival.element === "Cibernético",
            crystalSkin: false,
            decoyUsado: false,
            coreArUsado: false,
            rachaGolpes: 0,
            adaptativaStacks: 0,
            ultimoElementoRecibido: null,
            danoRecibidoEsteTurno: 0,
            danoRecibidoTurnoAnterior: 0,
            proxVenenoDoble: false,
            ataquesEquipados: {
                "ataque": window.ColiseumLogic.obtenerAtaqueAleatorio(rival.element, "basicos"),
                "especial": window.ColiseumLogic.obtenerAtaqueAleatorio(rival.element, "especiales"),
                "tactica": window.ColiseumLogic.obtenerAtaqueAleatorio(rival.element, "soportes"),
                "definitivo": rival.level >= 25 ? window.ColiseumLogic.obtenerAtaqueAleatorio(rival.element, "definitivos") : null
            }
        };

        // Guardar combate activo para interceptación
        this.activeMatch = {
            matchId: myMatch.id,
            enemy: rivalFighterObj
        };

        // Cambiar el modo de combate y lanzar coliseo
        window.ColiseumLogic.modoCombate = "estandar"; 
        
        window.navegarA('coliseum-screen');
        window.iniciarColiseo();
    },

    completarCombateJugador: function(ganoPlayer) {
        if (!this.activeTournament || !this.activeMatch) return;

        const t = this.activeTournament;
        const matchId = this.activeMatch.matchId;
        const myMatch = t.matches.find(m => m.id === matchId);

        if (myMatch) {
            myMatch.score1 = ganoPlayer ? 3 : 1;
            myMatch.score2 = ganoPlayer ? 1 : 3;
            myMatch.winner = ganoPlayer ? myMatch.p1 : myMatch.p2;
            myMatch.winner.isPlayer = ganoPlayer; // Asegurar consistencia

            t.log.push(`⚔️ Llave ${matchId}: ${myMatch.winner.nombre} avanzó tras derrotar a ${ganoPlayer ? myMatch.p2.nombre : myMatch.p1.nombre}.`);
        }

        // Limpiar combate activo
        this.activeMatch = null;
        this.guardarEstado();

        // Regresar a la vista de torneo
        window.navegarA("tournament-screen");
        this.actualizarVista();
        
        if (ganoPlayer) {
            alert("🎉 ¡Victoria en tu llave de torneo! Has avanzado a la siguiente ronda.");
        } else {
            alert("💥 Derrota en el Coliseo. Has sido eliminado del torneo.");
        }
    },

    simularOtrosMatchsDeRonda: function() {
        const t = this.activeTournament;
        const rAct = t.rondaActual;

        // Filtrar encuentros de la ronda actual que no se han resuelto
        const unresolved = t.matches.filter(m => m.round === rAct && m.winner === null);
        
        unresolved.forEach(m => {
            // Duelo entre CPUs
            const diff = m.p1.level - m.p2.level;
            const p1Chance = 0.5 + (diff * 0.05); // Nivel mayor da ligera ventaja
            const roll = Math.random();

            const p1Wins = roll <= p1Chance;
            
            m.score1 = p1Wins ? 3 : Math.floor(Math.random() * 2);
            m.score2 = p1Wins ? Math.floor(Math.random() * 2) : 3;
            m.winner = p1Wins ? m.p1 : m.p2;

            t.log.push(`🤖 Simulación: ${m.winner.nombre} vence a ${p1Wins ? m.p2.nombre : m.p1.nombre} por ${m.score1}-${m.score2}.`);
        });

        // Avanzar la ronda si todo el nivel se completó
        const todosResueltos = t.matches.filter(m => m.round === rAct && m.winner === null).length === 0;

        if (todosResueltos) {
            if (rAct < 3) {
                // Generar los emparejamientos de la ronda siguiente
                const ganadores = t.matches.filter(m => m.round === rAct).map(m => m.winner);
                const nextRound = rAct + 1;
                
                // Si el jugador avanzó, debe estar en la lista de ganadores
                const nextRoundMatchesCount = 4 / Math.pow(2, rAct); // 4, 2, 1
                
                const baseMatchId = t.matches.length + 1;
                for (let i = 0; i < nextRoundMatchesCount; i++) {
                    t.matches.push({
                        id: baseMatchId + i,
                        round: nextRound,
                        p1: ganadores[i * 2],
                        p2: ganadores[i * 2 + 1],
                        score1: null,
                        score2: null,
                        winner: null
                    });
                }

                t.rondaActual = nextRound;
                t.log.push(`📢 Ronda de ${ganadores.length} competidores lista.`);
            } else {
                // Finalizó el torneo
                t.estado = "finalizado";
                
                const finalMatch = t.matches.find(m => m.round === 3);
                t.log.push(`👑 ¡${finalMatch.winner.nombre} se consagra campeón de la ${t.config.nombre}!`);

                const pos = this.obtenerPosicionJugador();
                if (pos === 1) {
                    window.miWallet.pol += t.config.premios[1];
                } else if (pos === 2) {
                    window.miWallet.pol += t.config.premios[2];
                } else if (pos === 3) {
                    window.miWallet.pol += t.config.premios[3];
                }

                if (window.WalletManager && window.WalletManager.actualizarBoton) {
                    window.WalletManager.actualizarBoton();
                }
            }
        }

        this.guardarEstado();
        this.actualizarVista();
    },

    simularRestoTorneo: function() {
        const t = this.activeTournament;
        while (t.estado === "jugando") {
            this.simularOtrosMatchsDeRonda();
        }
    },

    obtenerPosicionJugador: function() {
        const t = this.activeTournament;
        if (!t) return 16;

        // Comprobar final
        const finalMatch = t.matches.find(m => m.round === 3);
        if (finalMatch && finalMatch.winner && finalMatch.winner.isPlayer) {
            return 1; // Campeón
        }
        if (finalMatch && ((finalMatch.p1 && finalMatch.p1.isPlayer) || (finalMatch.p2 && finalMatch.p2.isPlayer))) {
            return 2; // Subcampeón
        }

        // Comprobar semifinales para el 3er puesto
        const semis = t.matches.filter(m => m.round === 2);
        const jugoSemis = semis.some(m => (m.p1 && m.p1.isPlayer) || (m.p2 && m.p2.isPlayer));
        if (jugoSemis) {
            return 3; // 3er lugar (ambos perdedores de semis comparten premio o simulación simplificada)
        }

        const cuartos = t.matches.filter(m => m.round === 1);
        const jugoCuartos = cuartos.some(m => (m.p1 && m.p1.isPlayer) || (m.p2 && m.p2.isPlayer));
        if (jugoCuartos) return 8; // Cuartos

        return 16; // Octavos
    },

    cerrarTorneo: function() {
        this.activeTournament = null;
        this.guardarEstado();
        this.actualizarVista();
    },

    reclamarSaldoPendiente: function() {
        if (this.saldosPendientes <= 0) return;

        const monto = this.saldosPendientes;
        this.saldosPendientes = 0;

        if (!window.miWallet) window.miWallet = { pol: 0 };
        window.miWallet.pol += monto;

        if (window.WalletManager && window.WalletManager.actualizarBoton) {
            window.WalletManager.actualizarBoton();
        }

        window.miWallet.history = window.miWallet.history || [];
        window.miWallet.history.unshift({
            tipo: 'Reembolso Torneo',
            monto: monto,
            fecha: new Date().toLocaleTimeString()
        });

        this.guardarEstado();
        this.actualizarVista();

        alert(`💰 Reclamación exitosa: Se añadieron +${monto.toFixed(2)} POL a tu Wallet.`);
    },

    vincularHooks: function() {
        // Enlazar interceptor de rivales
        if (window.ColiseumLogic) {
            const originalGenerarRivalProcedural = window.ColiseumLogic.generarRivalProcedural;
            window.ColiseumLogic.generarRivalProcedural = function(nivelJugador, esJefeDeLiga) {
                if (window.TournamentManager && window.TournamentManager.activeMatch) {
                    this.enemy = window.TournamentManager.activeMatch.enemy;
                    this.enemyTeam = [this.enemy];
                    this.enemyActiveIndex = 0;
                    console.log("🏆 Interceptando rival del torneo:", this.enemy.nombre);
                    return;
                }
                originalGenerarRivalProcedural.call(this, nivelJugador, esJefeDeLiga);
            };
        }

        // Enlazar finalizador de combate
        if (window.ColiseumManager) {
            const originalTerminarCombate = window.ColiseumManager.terminarCombate;
            window.ColiseumManager.terminarCombate = function() {
                originalTerminarCombate.call(this);
                if (window.TournamentManager && window.TournamentManager.activeMatch) {
                    const playerGano = window.ColiseumLogic.modoCombate === '3v3' 
                        ? window.ColiseumLogic.playerTeam.some(g => g.hp > 0) 
                        : (window.ColiseumLogic.player.hp > 0);
                    
                    window.TournamentManager.completarCombateJugador(playerGano);
                }
            };
        }

        // Interceptación de salida del combate (RETIRARSE)
        const originalNavegarA = window.navegarA;
        window.navegarA = function(idPantalla) {
            if (idPantalla === "room-area" && window.TournamentManager && window.TournamentManager.activeMatch) {
                if (confirm("⚠️ Estás en medio de un combate de Torneo. Si te retiras ahora, perderás por abandono. ¿Seguro que deseas retirarte?")) {
                    window.TournamentManager.completarCombateJugador(false); // Derrota por abandono
                    idPantalla = "tournament-screen";
                } else {
                    return; // Cancelar navegación
                }
            }
            originalNavegarA(idPantalla);
        };
    },

    inyectarEstilos: function() {
        const styleId = "tournament-styles-neon";
        if (document.getElementById(styleId)) return;

        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
            #tournament-screen {
                background: radial-gradient(circle at center, #111e28 0%, #071017 100%) !important;
                display: flex;
                flex-direction: column;
                padding: 15px;
                overflow-y: auto !important;
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%; box-sizing: border-box;
            }

            #tournament-screen::-webkit-scrollbar {
                display: none !important;
            }

            .tourney-card {
                background: rgba(17, 30, 40, 0.6);
                border: 1px solid #384a5e;
                border-radius: 14px;
                padding: 15px;
                margin-bottom: 12px;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.5);
            }

            .tourney-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-top: 10px;
            }

            .tourney-option-card {
                background: linear-gradient(135deg, #101c26 0%, #091219 100%);
                border: 2px solid #334155;
                border-radius: 12px;
                padding: 12px;
                text-align: center;
                cursor: pointer;
                transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
            }

            .tourney-option-card:hover {
                transform: translateY(-2px);
                border-color: #ff007f;
                box-shadow: 0 5px 15px rgba(255, 0, 127, 0.25);
            }

            .tourney-title-glow {
                font-size: 16px;
                font-weight: bold;
                text-transform: uppercase;
                margin-bottom: 5px;
                letter-spacing: 0.5px;
            }

            .bracket-tree {
                display: flex;
                gap: 15px;
                overflow-x: auto !important;
                padding: 10px 5px;
                margin-top: 10px;
                flex-grow: 1;
                min-height: 250px;
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
            }

            .bracket-tree::-webkit-scrollbar {
                display: none !important;
            }

            .bracket-column {
                display: flex;
                flex-direction: column;
                min-width: 140px;
                flex-shrink: 0;
            }

            .round-title {
                text-align: center;
                font-size: 10px;
                text-transform: uppercase;
                color: #80deea;
                font-weight: bold;
                letter-spacing: 1px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                padding-bottom: 5px;
                margin-bottom: 15px;
            }

            .round-matches-list {
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                flex-grow: 1;
                gap: 10px;
            }

            .bracket-match-node {
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid #384a5e;
                border-radius: 6px;
                padding: 4px 6px;
                display: flex;
                flex-direction: column;
                gap: 2px;
                font-size: 9px;
                font-family: monospace;
            }

            .bracket-match-node.highlight {
                border-color: #ff007f;
                box-shadow: 0 0 8px rgba(255,0,127,0.25);
            }

            .bracket-match-node.active {
                border-color: #00e5ff;
                animation: activeMatchPulse 1.5s infinite alternate;
            }

            @keyframes activeMatchPulse {
                from { box-shadow: 0 0 4px rgba(0, 229, 255, 0.2); }
                to { box-shadow: 0 0 12px rgba(0, 229, 255, 0.6); }
            }

            .bracket-match-node.completed {
                opacity: 0.7;
            }

            .fighter-row {
                display: flex;
                justify-content: space-between;
                color: #aaa;
                padding: 2px 4px;
                border-radius: 3px;
            }

            .fighter-row.winner {
                color: #69f0ae !important;
                font-weight: bold;
            }

            .fighter-row.player {
                background: rgba(0, 229, 255, 0.15);
                color: #fff;
            }

            .fighter-row .score {
                font-weight: bold;
                color: #fff;
            }

            .bracket-champion-node {
                background: radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(0,0,0,0.5) 100%);
                border: 2px solid #ffd700;
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                box-shadow: 0 0 15px rgba(255,215,0,0.25);
            }

            .bracket-champion-node.player {
                border-color: #00e5ff;
                box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
                background: radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, rgba(0,0,0,0.5) 100%);
            }

            .bracket-champion-node .cup-icon {
                font-size: 24px;
                margin-bottom: 5px;
                animation: cupFloat 2s infinite ease-in-out;
            }

            @keyframes cupFloat {
                0% { transform: translateY(0); }
                50% { transform: translateY(-4px); }
                100% { transform: translateY(0); }
            }

            .bracket-champion-node .champ-name {
                font-size: 11px;
                font-weight: bold;
                color: #ffd700;
                font-family: monospace;
            }

            .bracket-champion-node.player .champ-name {
                color: #00e5ff;
            }

            .queue-item.player {
                background: rgba(0,229,255,0.1) !important;
                border-left: 3px solid #00e5ff !important;
            }

            .queue-item.subsidio {
                background: rgba(255,0,127,0.06) !important;
                border-left: 3px solid #ff007f !important;
            }
        `;
        document.head.appendChild(style);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.TournamentManager.init();
});
