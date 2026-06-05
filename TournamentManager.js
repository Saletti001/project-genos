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
    activeTab: "brackets", // "brackets" | "tematicos"
    activeQueueConfig: null,

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

    TEMATICOS_CONFIG: {
        // Semana 1: Rareza y Novatos
        solo_comunes: {
            id: "solo_comunes",
            nombre: "Torneo Solo Comunes",
            categoria: "Rareza",
            descripcion: "Competición exclusiva para criaturas de rareza Común.",
            costo: 0.05,
            premios: { 1: 0.40, 2: 0.16, 3: 0.08 },
            semana: 1,
            iconoEmoji: "⚪",
            restriccionDesc: "Solo rareza Común"
        },
        copa_raro: {
            id: "copa_raro",
            nombre: "Copa Raro",
            categoria: "Rareza",
            descripcion: "Competición exclusiva para criaturas de rareza Raro.",
            costo: 0.10,
            premios: { 1: 0.80, 2: 0.32, 3: 0.16 },
            semana: 1,
            iconoEmoji: "🟢",
            restriccionDesc: "Solo rareza Raro"
        },
        liga_novatos: {
            id: "liga_novatos",
            nombre: "Liga Novatos",
            categoria: "Progresión",
            descripcion: "Para Genos jóvenes que están dando sus primeros pasos (niveles 1-20).",
            costo: 0.05,
            premios: { 1: 0.40, 2: 0.16, 3: 0.08 },
            semana: 1,
            iconoEmoji: "🌱",
            restriccionDesc: "Nivel 1 a 20"
        },
        // Semana 2: Elementales
        elemental_pura: {
            id: "elemental_pura",
            nombre: "Liga Elemental Pura",
            categoria: "Elemental",
            descripcion: "Solo para Genos cuya afinidad domine el elemento activo de la semana.",
            costo: 0.10,
            premios: { 1: 0.80, 2: 0.32, 3: 0.16 },
            semana: 2,
            iconoEmoji: "🌀",
            restriccionDesc: "Elemento activo de la semana"
        },
        torneo_inverso: {
            id: "torneo_inverso",
            nombre: "Torneo Inverso",
            categoria: "Elemental",
            descripcion: "Solo para Genos del elemento débil frente al elemento de la semana.",
            costo: 0.10,
            premios: { 1: 0.80, 2: 0.32, 3: 0.16 },
            semana: 2,
            iconoEmoji: "🔄",
            restriccionDesc: "Elemento débil de la semana"
        },
        // Semana 3: Progresión y Reglas Especiales
        gran_linaje: {
            id: "gran_linaje",
            nombre: "El Gran Linaje",
            categoria: "Progresión",
            descripcion: "Solo para Genos criados por bio-síntesis (generación 1 o superior).",
            costo: 0.15,
            premios: { 1: 1.20, 2: 0.48, 3: 0.24 },
            semana: 3,
            iconoEmoji: "🧬",
            restriccionDesc: "Generación > 0 (Criado, no Gen 0)"
        },
        sin_genes: {
            id: "sin_genes",
            nombre: "Torneo Sin Genes",
            categoria: "Especial",
            descripcion: "Combate puro: las habilidades de los genes pasivos se desactivan.",
            costo: 0.10,
            premios: { 1: 0.80, 2: 0.32, 3: 0.16 },
            semana: 3,
            iconoEmoji: "🚫",
            restriccionDesc: "Ninguna (sin genes en combate)"
        },
        // Semana 4: Nivel Alto y Reglas Especiales
        el_olimpo: {
            id: "el_olimpo",
            nombre: "El Olimpo",
            categoria: "Nivel",
            descripcion: "Solo para los Genos más poderosos y experimentados (Nivel 45+).",
            costo: 0.20,
            premios: { 1: 1.60, 2: 0.64, 3: 0.32 },
            semana: 4,
            iconoEmoji: "⚡",
            restriccionDesc: "Nivel 45 o superior"
        },
        modo_berserker: {
            id: "modo_berserker",
            nombre: "Modo Berserker",
            categoria: "Especial",
            descripcion: "Combate ofensivo extremo: la defensa de ambos contendientes se reduce a 0.",
            costo: 0.10,
            premios: { 1: 0.80, 2: 0.32, 3: 0.16 },
            semana: 4,
            iconoEmoji: "🩸",
            restriccionDesc: "Ninguna (0 defensa en combate)"
        },
        el_espejo: {
            id: "el_espejo",
            nombre: "El Espejo",
            categoria: "Especial",
            descripcion: "Combate de reflejo: tu oponente imita tus stats base, nivel y elemento.",
            costo: 0.10,
            premios: { 1: 0.80, 2: 0.32, 3: 0.16 },
            semana: 4,
            iconoEmoji: "🪞",
            restriccionDesc: "Ninguna (NPC copia tus stats)"
        }
    },

    NPC_NAMES: [
        "AeroPulse", "VorMorph", "KaelGen", "PyroSpark", "ToxShard", 
        "BioCore", "ZarLith", "CrioVolt", "NexPhase", "GravGlow", 
        "MutaVibe", "ViroClaw", "LumiNova", "XenonGeno", "ZeroCool",
        "ProtoType", "CyberGlow", "ByteClaw", "SparkMorph", "PulseNexo"
    ],

    ELEMENTS: ["Biomutante", "Viral", "Cibernético", "Radiactivo", "Tóxico", "Sintético"],

    getSemanaAño: function() {
        const inicio = new Date('2026-01-05'); // Lunes
        const ahora = new Date();
        const semanasTotales = Math.floor((ahora - inicio) / (7 * 24 * 60 * 60 * 1000));
        return Math.max(0, semanasTotales);
    },

    getCicloSemana: function() {
        const semanas = this.getSemanaAño();
        return (semanas % 4) + 1; // Rota 1, 2, 3, 4
    },

    getElementoSemana: function() {
        const elementos = ["Biomutante", "Viral", "Cibernético", "Radiactivo", "Tóxico", "Sintético"];
        const semanas = this.getSemanaAño();
        return elementos[semanas % elementos.length];
    },

    getElementoDebilSemana: function() {
        const elem = this.getElementoSemana();
        const ventajas = { 
            "Biomutante": "Sintético", "Sintético": "Tóxico", "Tóxico": "Radiactivo", 
            "Radiactivo": "Cibernético", "Cibernético": "Viral", "Viral": "Biomutante" 
        };
        return ventajas[elem] || "Sintético";
    },

    getTorneosActivosSemana: function() {
        const sem = this.getCicloSemana();
        const lista = [];
        for (let key in this.TEMATICOS_CONFIG) {
            const t = this.TEMATICOS_CONFIG[key];
            if (t.semana === sem) {
                lista.push(t);
            }
        }
        return lista;
    },

    setTab: function(tabName) {
        this.activeTab = tabName;
        this.actualizarVista();
    },

    validarRestriccion: function(geno, torneo) {
        if (!geno || geno.id === "temp") {
            return { puede: false, motivo: "Debes seleccionar un Geno activo primero." };
        }
        
        // Regla antiabuso: Un Geno solo puede participar en UN torneo temático por semana
        const absWeek = this.getSemanaAño();
        if (geno.lastThematicWeek === absWeek) {
            return { puede: false, motivo: "Este Geno ya participó en un torneo temático esta semana." };
        }

        const level = geno.level || 1;
        const rarity = geno.rarity || geno.rareza || "Común";
        const element = (geno.genes && geno.genes.afinidad) ? geno.genes.afinidad.dom : (geno.element || "Normal");

        switch (torneo.id) {
            case "solo_comunes":
                if (rarity !== "Común") return { puede: false, motivo: "Solo para Genos de rareza Común." };
                break;
            case "copa_raro":
                if (rarity !== "Raro") return { puede: false, motivo: "Solo para Genos de rareza Raro." };
                break;
            case "liga_novatos":
                if (level < 1 || level > 20) return { puede: false, motivo: "Solo para Genos de nivel 1 al 20." };
                break;
            case "elemental_pura":
                const elemSemana = this.getElementoSemana();
                if (element !== elemSemana) return { puede: false, motivo: `Solo para Genos de elemento ${elemSemana}.` };
                break;
            case "torneo_inverso":
                const elemDebil = this.getElementoDebilSemana();
                if (element !== elemDebil) return { puede: false, motivo: `Solo para Genos de elemento débil (${elemDebil}).` };
                break;
            case "gran_linaje":
                const gen = geno.generation || 0;
                if (gen <= 0) return { puede: false, motivo: "Solo para Genos con linaje (Generación 1+)." };
                break;
            case "el_olimpo":
                if (level < 45) return { puede: false, motivo: "Solo para Genos de nivel 45 o superior." };
                break;
            // "sin_genes", "modo_berserker", "el_espejo" no tienen restricciones
        }

        return { puede: true, motivo: "" };
    },

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

        // Obtener elementos de pestañas
        const tabContentBrackets = document.getElementById("tourney-brackets-tab-content");
        const tabContentTematicos = document.getElementById("tourney-tematicos-tab-content");
        const tabBrackets = document.getElementById("tab-tourney-brackets");
        const tabTematicos = document.getElementById("tab-tourney-tematicos");

        if (this.activeTab === "tematicos") {
            tabContentBrackets?.classList.add("hidden");
            tabContentTematicos?.classList.remove("hidden");
            tabBrackets?.classList.remove("active");
            tabTematicos?.classList.add("active");
            this.renderizarTematicos();
        } else {
            tabContentBrackets?.classList.remove("hidden");
            tabContentTematicos?.classList.add("hidden");
            tabBrackets?.classList.add("active");
            tabTematicos?.classList.remove("active");
        }

        // Determinar qué panel mostrar
        const lobbyPanel = document.getElementById("tourney-lobby-panel");
        const queuePanel = document.getElementById("tourney-queue-panel");
        const bracketPanel = document.getElementById("tourney-bracket-panel");

        if (this.activeTournament) {
            // Ocultar tabs de selección de torneo y mostrar brackets
            document.querySelector(".tournament-tabs")?.classList.add("hidden");
            lobbyPanel.classList.add("hidden");
            tabContentTematicos?.classList.add("hidden");
            queuePanel.classList.add("hidden");
            bracketPanel.classList.remove("hidden");
            this.renderizarBracket();
        } else if (this.queuePlayers.length > 0) {
            // Ocultar tabs de selección y mostrar cola
            document.querySelector(".tournament-tabs")?.classList.add("hidden");
            lobbyPanel.classList.add("hidden");
            tabContentTematicos?.classList.add("hidden");
            queuePanel.classList.remove("hidden");
            bracketPanel.classList.add("hidden");
            this.renderizarQueue();
        } else {
            // Mostrar tabs y el lobby correspondiente
            document.querySelector(".tournament-tabs")?.classList.remove("hidden");
            if (this.activeTab === "tematicos") {
                lobbyPanel.classList.add("hidden");
                tabContentTematicos?.classList.remove("hidden");
            } else {
                lobbyPanel.classList.remove("hidden");
                tabContentTematicos?.classList.add("hidden");
            }
            queuePanel.classList.add("hidden");
            bracketPanel.classList.add("hidden");
        }
    },

    renderizarTematicos: function() {
        const list = document.getElementById("tourney-tematicos-list");
        if (!list) return;

        const bannerWeek = document.getElementById("tematicos-banner-week");
        const bannerDesc = document.getElementById("tematicos-banner-desc");

        const week = this.getCicloSemana();
        const activeTourneys = this.getTorneosActivosSemana();

        if (bannerWeek) {
            bannerWeek.innerText = `Semana ${week} de 4 — Rotación Temática`;
        }

        if (bannerDesc) {
            if (week === 2) {
                const elemSemana = this.getElementoSemana();
                const elemDebil = this.getElementoDebilSemana();
                bannerDesc.innerHTML = `Categoría <b>Elemental</b> activa.<br>Elemento de la semana: <span style="color: #4dd0e1; font-weight: bold;">${elemSemana}</span> &nbsp;|&nbsp; Elemento débil: <span style="color: #ff9800; font-weight: bold;">${elemDebil}</span>`;
            } else if (week === 1) {
                bannerDesc.innerHTML = `Categoría <b>Rareza</b> activa.<br>Inscribe criaturas comunes, raras, o entrena a tus novatos de nivel bajo.`;
            } else if (week === 3) {
                bannerDesc.innerHTML = `Categoría <b>Progresión/Especial</b> activa.<br>Inscribe tus Genos con linaje o combate sin pasivas genéticas en el Torneo Sin Genes.`;
            } else if (week === 4) {
                bannerDesc.innerHTML = `Categoría <b>Élite/Especial</b> activa.<br>Inscribe tus Genos veteranos de nivel 45+, o combate en Berserker / El Espejo.`;
            }
        }

        if (activeTourneys.length === 0) {
            list.innerHTML = `<div style="text-align: center; color: #888; font-style: italic; padding: 20px;">No hay torneos activos para esta semana.</div>`;
            return;
        }

        list.innerHTML = activeTourneys.map(t => {
            const validation = this.validarRestriccion(window.miMascota, t);
            const canEnter = validation.puede;
            const btnClass = canEnter ? "neon" : "disabled";
            const disabledAttr = canEnter ? "" : "disabled";
            const btnText = canEnter ? `Inscribirse (${t.costo.toFixed(2)} POL)` : `No Disponible`;

            let restriccionHtml = `<span style="color: #ff55a3; font-weight: bold;">${t.restriccionDesc}</span>`;
            if (t.id === "elemental_pura") {
                restriccionHtml = `<span style="color: #4dd0e1; font-weight: bold;">Solo elemento ${this.getElementoSemana()}</span>`;
            } else if (t.id === "torneo_inverso") {
                restriccionHtml = `<span style="color: #ff9800; font-weight: bold;">Solo elemento ${this.getElementoDebilSemana()}</span>`;
            }

            const catClass = "cat-" + t.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return `
                <div class="tourney-card thematic-card ${catClass}">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">${t.iconoEmoji}</span>
                            <div>
                                <h3 style="margin: 0; font-size: 13px; font-weight: bold; color: #ff007f; text-transform: uppercase; letter-spacing: 0.5px; text-shadow: 0 0 5px rgba(255,0,127,0.3);">${t.nombre}</h3>
                                <span style="font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Categoría: ${t.categoria}</span>
                            </div>
                        </div>
                        <div style="text-align: right; flex-shrink: 0;">
                            <span style="font-size: 13px; font-weight: bold; color: #ffd700;">${t.costo.toFixed(2)} POL</span>
                            <div style="font-size: 8px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Costo</div>
                        </div>
                    </div>
                    
                    <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.35;">${t.descripcion}</p>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; margin-top: 2px;">
                        <div style="font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">
                            Req: ${restriccionHtml}
                        </div>
                        <div style="font-size: 10px; color: #69f0ae; font-family: monospace;">
                            1º: <b>${t.premios[1].toFixed(2)} POL</b>
                        </div>
                    </div>

                    ${!canEnter ? `<div style="font-size: 9px; color: #ef4444; font-weight: bold; text-align: left; margin-top: 2px; padding: 4px 8px; background: rgba(239, 68, 68, 0.1); border-radius: 4px; border-left: 3px solid #ef4444;">⚠️ ${validation.motivo}</div>` : ''}

                    <div style="margin-top: 4px;">
                        <button class="market-btn-neon ${btnClass}" ${disabledAttr} onclick="TournamentManager.inscribirse('${t.id}')" style="width: 100%; margin: 0; padding: 10px 0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                            ${btnText}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
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

        let conf = this.CONFIG[tourneyId];
        let isThematic = false;
        if (!conf) {
            conf = this.TEMATICOS_CONFIG[tourneyId];
            isThematic = true;
        }
        if (!conf) return;

        if (isThematic) {
            const validation = this.validarRestriccion(window.miMascota, conf);
            if (!validation.puede) {
                alert(`⚠️ No puedes inscribirte: ${validation.motivo}`);
                return;
            }
        }

        // Comprobar saldo en la wallet
        let balance = window.miWallet && window.miWallet.pol !== undefined ? window.miWallet.pol : 0.0;
        if (balance < conf.costo) {
            window.mostrarModalSaldoCero("buy");
            return;
        }

        // Confirmación consciente
        const msg = isThematic ? `el Torneo Temático ${conf.nombre}` : `la ${conf.nombre}`;
        if (!confirm(`¿Deseas inscribir a tu Geno en ${msg} por un valor de ${conf.costo.toFixed(2)} POL?`)) {
            return;
        }

        // Descontar saldo y guardar
        window.miWallet.pol -= conf.costo;
        if (window.WalletManager && window.WalletManager.actualizarBoton) {
            window.WalletManager.actualizarBoton();
        }

        // Marcar participación de este Geno si es temático
        if (isThematic) {
            const absWeek = this.getSemanaAño();
            window.miMascota.lastThematicWeek = absWeek;
            const idx = window.misGenos.findIndex(g => String(g.id) === String(window.miMascota.id));
            if (idx !== -1) {
                window.misGenos[idx].lastThematicWeek = absWeek;
            }
        }

        // Añadir historial local
        window.miWallet.history = window.miWallet.history || [];
        window.miWallet.history.unshift({
            tipo: isThematic ? 'Torneo Temático' : 'Inscripción Torneo',
            monto: conf.costo,
            fecha: new Date().toLocaleTimeString()
        });

        // Iniciar Simulación de Cola
        this.iniciarSimulacionCola(conf);
    },

    iniciarSimulacionCola: function(conf) {
        this.activeQueueConfig = conf;
        
        const elementActual = (window.miMascota.genes && window.miMascota.genes.afinidad) ? window.miMascota.genes.afinidad.dom : (window.miMascota.element || "Normal");
        
        this.queuePlayers = [
            { nombre: "TÚ (" + (window.miMascota.name || "Geno") + ")", isPlayer: true, level: window.miMascota.level || 1, element: elementActual }
        ];
        
        this.injectedBotUsed = false;
        this.actualizarVista();

        // Llenado aleatorio inicial
        const initialCount = Math.floor(Math.random() * 5) + 6; // 6 a 10 jugadores
        for (let i = 0; i < initialCount; i++) {
            this.queuePlayers.push(this.generarRivalCola(conf));
        }
        this.renderizarQueue();

        // Programar ticks de cola
        if (this.queueTimer) clearInterval(this.queueTimer);
        
        let overflowTriggered = false;

        this.queueTimer = setInterval(() => {
            if (this.queuePlayers.length < 15) {
                // Añadir un bot aleatorio
                this.queuePlayers.push(this.generarRivalCola(conf));
                this.renderizarQueue();
            } else if (this.queuePlayers.length === 15) {
                // 10% probabilidad de overflow FIFO antes del 16 si coincide
                if (Math.random() < 0.12 && !overflowTriggered && conf.id === "neon") {
                    overflowTriggered = true;
                    // Simular entrada masiva que empuja al jugador fuera
                    this.queuePlayers.push(this.generarRivalCola(conf));
                    this.queuePlayers.push(this.generarRivalCola(conf));
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

                    const npcSubsidio = this.generarRivalCola(conf);
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

    generarRivalCola: function(conf) {
        const nombre = this.NPC_NAMES[Math.floor(Math.random() * this.NPC_NAMES.length)] + "#" + Math.floor(Math.random() * 900 + 100);
        let lvl = Math.max(1, (window.miMascota.level || 1) + Math.floor(Math.random() * 5) - 2); // +- 2 del jugador
        let element = this.ELEMENTS[Math.floor(Math.random() * this.ELEMENTS.length)];
        
        if (conf.id === "liga_novatos") {
            lvl = Math.floor(Math.random() * 20) + 1; // Nivel 1 a 20
        } else if (conf.id === "el_olimpo") {
            lvl = Math.floor(Math.random() * 6) + 45; // Nivel 45 a 50
        }

        if (conf.id === "elemental_pura") {
            element = this.getElementoSemana();
        } else if (conf.id === "torneo_inverso") {
            element = this.getElementoDebilSemana();
        }
        
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
        if (this.activeQueueConfig) {
            const conf = this.activeQueueConfig;
            const reembolso = conf.costo;

            window.miWallet.pol += reembolso;
            if (window.WalletManager && window.WalletManager.actualizarBoton) {
                window.WalletManager.actualizarBoton();
            }

            // Si era temático, quitarle la marca de participación
            if (this.TEMATICOS_CONFIG[conf.id]) {
                delete window.miMascota.lastThematicWeek;
                const idx = window.misGenos.findIndex(g => String(g.id) === String(window.miMascota.id));
                if (idx !== -1) {
                    delete window.misGenos[idx].lastThematicWeek;
                }
            }

            alert(`🚪 Has salido de la cola. Se te han devuelto ${reembolso.toFixed(2)} POL a tu balance.`);
        }

        this.queuePlayers = [];
        this.activeQueueConfig = null;
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

        let eStats = { hp: 120, atk: 12, def: 8, spd: 10, luk: 5 };
        let eRarity = "Común";
        let eLevel = rival.level;
        let eElement = rival.element;
        let eShape = "frijol";
        let eColor = "#ff6b6b";
        let eEye = "angry";
        let eMouth = "colmillos";
        let gB = "ninguno";
        let gC = "ninguno";
        let eHiddenGenes = { A: null, B: null, C: null };

        const isEspejo = t.config && t.config.id === "el_espejo";
        const isRaro = t.config && t.config.id === "copa_raro";

        if (isEspejo && window.miMascota) {
            eStats = { ...window.miMascota.stats };
            eLevel = window.miMascota.level || 1;
            eElement = (window.miMascota.genes && window.miMascota.genes.afinidad) ? window.miMascota.genes.afinidad.dom : (window.miMascota.element || "Normal");
            eRarity = window.miMascota.rarity || window.miMascota.rareza || "Común";
            eShape = window.miMascota.body_shape || (window.miMascota.genes && window.miMascota.genes.cuerpo ? window.miMascota.genes.cuerpo.dom : "frijol");
            eColor = window.miMascota.color || "#ff6b6b";
            eEye = window.miMascota.eye_type || "angry";
            eMouth = window.miMascota.mouth_type || "colmillos";
            eHiddenGenes = window.miMascota.hidden_genes || { A: null, B: null, C: null };
            gB = (eHiddenGenes.B?.id || "ninguno").toLowerCase();
            gC = (eHiddenGenes.C?.id || "ninguno").toLowerCase();
        } else {
            eRarity = isRaro ? "Raro" : "Común";
            
            // Generar stats por rareza
            const baseStats = window.generarStatsPorRareza ? window.generarStatsPorRareza(eRarity) : { hp: 120, atk: 12, def: 8, spd: 10, luk: 5 };
            eStats = { ...baseStats };

            // Escalar stats al nivel del rival
            const scale = eLevel / 5;
            eStats.hp = Math.round(eStats.hp * scale);
            eStats.atk = Math.round(eStats.atk * scale);
            eStats.def = Math.round(eStats.def * scale);
            eStats.spd = Math.round(eStats.spd * scale);
            
            if (window.generarGenesV9) {
                eHiddenGenes = window.generarGenesV9(eRarity);
                gB = (eHiddenGenes.B?.id || "ninguno").toLowerCase();
                gC = (eHiddenGenes.C?.id || "ninguno").toLowerCase();
            }
        }

        const rivalAdn = {
            id: "tourney_npc_" + Date.now(),
            name: rival.nombre,
            level: eLevel,
            element: eElement,
            rarity: eRarity,
            body_shape: eShape,
            color: eColor,
            eye_type: eEye,
            mouth_type: eMouth,
            stats: eStats,
            hidden_genes: eHiddenGenes
        };

        const isSinGenes = t.config && t.config.id === "sin_genes";

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
            element: eElement,
            rareza: eRarity,
            genesId: isSinGenes ? ["ninguno", "ninguno"] : [gB, gC],
            estados: [],
            efectosActivos: [],
            cooldowns: { especial: 0, tactica: 0, definitivo: 0 },
            escudoCibernetico: eElement === "Cibernético",
            crystalSkin: isSinGenes ? false : (gB === "piel_cristal" || gC === "piel_cristal"),
            decoyUsado: false,
            coreArUsado: false,
            rachaGolpes: 0,
            adaptativaStacks: 0,
            ultimoElementoRecibido: null,
            danoRecibidoEsteTurno: 0,
            danoRecibidoTurnoAnterior: 0,
            proxVenenoDoble: false,
            ataquesEquipados: {
                "ataque": window.ColiseumLogic.obtenerAtaqueAleatorio(eElement, "basicos"),
                "especial": window.ColiseumLogic.obtenerAtaqueAleatorio(eElement, "especiales"),
                "tactica": window.ColiseumLogic.obtenerAtaqueAleatorio(eElement, "soportes"),
                "definitivo": eLevel >= 25 ? window.ColiseumLogic.obtenerAtaqueAleatorio(eElement, "definitivos") : null
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
                let premio = 0;
                if (pos === 1) {
                    premio = t.config.premios[1];
                } else if (pos === 2) {
                    premio = t.config.premios[2];
                } else if (pos === 3) {
                    premio = t.config.premios[3];
                }

                if (premio > 0) {
                    if (window.miMascota && window.miMascota.scholarship && window.ScholarshipManager) {
                        window.ScholarshipManager.aplicarSplitPremio(premio, window.miMascota);
                    } else {
                        window.miWallet.pol += premio;
                    }
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

            /* Pestañas de torneos */
            .tournament-tabs .market-btn-neon {
                background: linear-gradient(90deg, #101c26 0%, #091219 100%) !important;
                border: 1px solid #384a5e !important;
                color: #888 !important;
                box-shadow: none !important;
                transition: all 0.3s ease;
            }
            .tournament-tabs .market-btn-neon:hover {
                color: #fff !important;
                border-color: #ff007f !important;
            }
            .tournament-tabs .market-btn-neon.active {
                background: linear-gradient(90deg, #6A1B9A, #D500F9) !important;
                border: 1px solid #d500f9 !important;
                color: #fff !important;
                box-shadow: 0 0 10px rgba(213, 0, 249, 0.4) !important;
                text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
            }

            /* Tarjetas Temáticas */
            .thematic-card {
                border: 1px solid #384a5e !important;
                background: rgba(15, 28, 38, 0.8) !important;
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 14px 18px !important;
                border-radius: 12px;
                margin-bottom: 0;
                position: relative;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
                border-left-width: 5px !important;
            }
            
            .thematic-card.cat-rareza {
                border-left: 5px solid #2e7d32 !important;
            }
            .thematic-card.cat-rareza:hover {
                border-color: #69f0ae !important;
                box-shadow: 0 8px 25px rgba(105, 240, 174, 0.15) !important;
                transform: translateY(-2px);
            }

            .thematic-card.cat-elemental {
                border-left: 5px solid #00e5ff !important;
            }
            .thematic-card.cat-elemental:hover {
                border-color: #00e5ff !important;
                box-shadow: 0 8px 25px rgba(0, 229, 255, 0.15) !important;
                transform: translateY(-2px);
            }

            .thematic-card.cat-progresion {
                border-left: 5px solid #ab47bc !important;
            }
            .thematic-card.cat-progresion:hover {
                border-color: #e040fb !important;
                box-shadow: 0 8px 25px rgba(224, 64, 251, 0.15) !important;
                transform: translateY(-2px);
            }

            .thematic-card.cat-nivel {
                border-left: 5px solid #ffd700 !important;
            }
            .thematic-card.cat-nivel:hover {
                border-color: #ffd700 !important;
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.15) !important;
                transform: translateY(-2px);
            }

            .thematic-card.cat-especial {
                border-left: 5px solid #ff007f !important;
            }
            .thematic-card.cat-especial:hover {
                border-color: #ff007f !important;
                box-shadow: 0 8px 25px rgba(255, 0, 127, 0.15) !important;
                transform: translateY(-2px);
            }

            /* Scroll bar para lista temática */
            #tourney-tematicos-list::-webkit-scrollbar {
                width: 6px;
                display: block !important;
            }
            #tourney-tematicos-list::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.2);
                border-radius: 3px;
            }
            #tourney-tematicos-list::-webkit-scrollbar-thumb {
                background: #384a5e;
                border-radius: 3px;
            }
            #tourney-tematicos-list::-webkit-scrollbar-thumb:hover {
                background: #546e7a;
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
