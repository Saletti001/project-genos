// =========================================
// CloudManager.js - LÓGICA DE NUBE Y LOGIN
// =========================================

const supabaseUrl = 'https://xoxkapvondvtlftecwcv.supabase.co';
const supabaseKey = 'sb_publishable_FBCAFJCwTr9xtSgbcZC6rQ_oudcDLza';

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
window.supabaseClient = supabaseClient;
window.miUsuarioCloud = null;

window.clockOffset = 0;

window.obtenerHoraServidor = async function() {
    try {
        const respuesta = await fetch(supabaseUrl + '/auth/v1/health', {
            method: 'GET',
            headers: { 'apikey': supabaseKey }
        });
        const fechaHeader = respuesta.headers.get('Date');
        if (fechaHeader) {
            return new Date(fechaHeader).getTime();
        }
    } catch (e) {
        console.warn("[TIME SYNC] No se pudo obtener la hora del servidor, usando hora local:", e);
    }
    return Date.now();
};

window.obtenerTiempoSeguro = function() {
    return Date.now() + (window.clockOffset || 0);
};

window.cargarConfiguracionBalance = async function() {
    const DEFAULT_CONFIG = {
        shop_items: {
            bazar: {
                bio_nucleo_basico: { price: 3000.0, currency: "EV" },
                incubator_01: { price: 0.20, currency: "POL" },
                ration_auto: { price: 200.0, currency: "EV" },
                plasma_shower: { price: 100.0, currency: "EV" },
                escaner_basico: { price: 1500.0, currency: "EV" },
                escaner_completo: { price: 5000.0, currency: "EV" },
                antidoto_uni: { price: 10.0, currency: "EV" },
                nexo_charge: { price: 2000.0, currency: "EV" },
                catalizador_xp: { price: 5000.0, currency: "EV" },
                comercio_licencia: { price: 3000.0, currency: "EV" }
            },
            dojo_base_prices: {
                Basico: 1000.0,
                Tecnica: 4000.0,
                Soporte: 6000.0,
                Definitivo: 10000.0
            },
            premium: {
                exp_20: { price: 2.0, currency: "POL" },
                exp_30: { price: 5.0, currency: "POL" },
                exp_40: { price: 10.0, currency: "POL" },
                acelerador_elite: { price: 0.50, currency: "POL" }
            }
        },
        tournaments: {
            practicante: { costo: 0.15, payouts: { 1: 1.20, 2: 0.66, 3: 0.30 } },
            casual: { costo: 0.50, payouts: { 1: 4.00, 2: 2.20, 3: 1.00 } },
            competitivo: { costo: 2.00, payouts: { 1: 16.00, 2: 8.80, 3: 4.00 } },
            elite: { costo: 5.00, payouts: { 1: 40.00, 2: 22.00, 3: 10.00 } },
            tematicos: {
                solo_comunes: { costo: 0.05, payouts: { 1: 0.40, 2: 0.16, 3: 0.08 } },
                copa_raro: { costo: 0.10, payouts: { 1: 0.80, 2: 0.32, 3: 0.16 } },
                liga_novatos: { costo: 0.05, payouts: { 1: 0.40, 2: 0.16, 3: 0.08 } },
                elemental_pura: { costo: 0.10, payouts: { 1: 0.80, 2: 0.32, 3: 0.16 } },
                torneo_inverso: { costo: 0.10, payouts: { 1: 0.80, 2: 0.32, 3: 0.16 } },
                gran_linaje: { costo: 0.15, payouts: { 1: 1.20, 2: 0.48, 3: 0.24 } }
            }
        },
        login_rewards: {
            essence_day1: 15,
            essence_day4: 25,
            multiplier_enabled: true
        },
        gameplay_rewards: {
            arcade_catch: {
                apple_ratio: 5,
                ev_gem_value: 0.05
            },
            coliseum: {
                win_xp: 25,
                lose_xp: 5
            }
        },
        mechanics: {
            reactor: {
                cost_lvl1: 5000,
                cost_lvl2: 15000,
                cost_lvl3: 30000,
                refund_lvl1: 8000,
                refund_lvl2: 25000,
                refund_lvl3: 60000
            },
            breeding: {
                cost_0: 1000,
                cost_1: 1500,
                cost_2: 2500,
                cost_3: 4500,
                cost_4: 7000,
                cost_5_plus_base: 5000,
                incubator_basic: 1000,
                incubator_plasma: 0.20,
                skip_hatch: 0.50
            },
            arena: {
                ticket_cost: 0.50
            },
            slots: {
                slot_7_ev: 1500,
                slot_8_ev: 3000,
                slot_9_ev: 6000,
                slot_9_pol: 0.50,
                slot_10_ev: 12000,
                slot_10_pol: 1.00,
                slot_11_ev: 15000,
                slot_11_pol: 2.00
            },
            daily_care: {
                harvest_limit: 150,
                passive_rate_day: 50
            }
        }
    };

    window.GameEconomyConfig = DEFAULT_CONFIG;

    try {
        if (!window.supabaseClient) {
            console.log("[ECONOMY CONFIG] Usando fallback estático (supabase no disponible).");
            const localCached = localStorage.getItem("genos_config");
            if (localCached) window.GameEconomyConfig = JSON.parse(localCached);
            return;
        }

        const { data: balanceData, error } = await window.supabaseClient
            .from('game_balance')
            .select('version, config')
            .eq('id', 1)
            .single();

        if (error) {
            console.warn("[ECONOMY CONFIG] Error al cargar de Supabase, usando fallback:", error);
            const localCached = localStorage.getItem("genos_config");
            if (localCached) {
                window.GameEconomyConfig = JSON.parse(localCached);
                console.log("[ECONOMY CONFIG] Cargada caché local offline.");
            }
            return;
        }

        if (balanceData) {
            const serverVersion = balanceData.version;
            const serverConfig = balanceData.config;
            const localVersion = parseInt(localStorage.getItem("genos_config_version") || "0");

            if (serverVersion !== localVersion || !localStorage.getItem("genos_config")) {
                console.log(`[ECONOMY CONFIG] Actualizando de versión ${localVersion} a ${serverVersion}`);
                localStorage.setItem("genos_config", JSON.stringify(serverConfig));
                localStorage.setItem("genos_config_version", serverVersion.toString());
                window.GameEconomyConfig = serverConfig;
            } else {
                console.log(`[ECONOMY CONFIG] Usando caché local (Versión ${localVersion} al día)`);
                window.GameEconomyConfig = JSON.parse(localStorage.getItem("genos_config"));
            }
        }
    } catch (e) {
        console.error("[ECONOMY CONFIG] Excepción al inicializar configuración de balance:", e);
        const localCached = localStorage.getItem("genos_config");
        if (localCached) {
            window.GameEconomyConfig = JSON.parse(localCached);
        }
    } finally {
        if (window.TournamentManager && typeof window.TournamentManager.sincronizarConBalance === "function") {
            window.TournamentManager.sincronizarConBalance();
        }
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    // Sincronizar el reloj del servidor de Supabase inmediatamente
    window.obtenerHoraServidor().then(serverTime => {
        window.clockOffset = serverTime - Date.now();
        console.log(`[TIME SYNC] Sincronización inicial. Offset: ${window.clockOffset} ms`);
    });

    // Cargar balance de economía dinámico
    await window.cargarConfiguracionBalance();

    window.LoginUI.inyectar();

    const btnIniciar = document.getElementById("btn-iniciar");
    const btnRegistro = document.getElementById("btn-registro");
    const inputEmail = document.getElementById("login-email");
    const inputPass = document.getElementById("login-pass");

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        window.miUsuarioCloud = session.user;
        window.LoginUI.ocultar();
        cargarDatosDeLaNube();
    }

    btnIniciar.onclick = async () => {
        const email = inputEmail.value;
        const password = inputPass.value;
        if(!email || !password) return window.LoginUI.mostrarMensaje("Completa todos los campos");

        btnIniciar.innerText = "CONECTANDO...";
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            window.LoginUI.mostrarMensaje("Error: " + error.message);
            btnIniciar.innerText = "INICIAR SESIÓN";
        } else {
            window.miUsuarioCloud = data.user;
            window.LoginUI.mostrarMensaje("¡Conexión exitosa!", "#4CAF50");
            setTimeout(async () => {
                window.LoginUI.ocultar();
                await window.cargarConfiguracionBalance();
                cargarDatosDeLaNube();
            }, 1000);
        }
    };

    btnRegistro.onclick = async () => {
        const email = inputEmail.value;
        const password = inputPass.value;
        if(!email || !password) return window.LoginUI.mostrarMensaje("Completa campos para registrarte");

        btnRegistro.innerText = "CREANDO...";
        const { data, error } = await supabaseClient.auth.signUp({ email, password });

        if (error) {
            window.LoginUI.mostrarMensaje("Error: " + error.message);
            btnRegistro.innerText = "CREAR CUENTA NUEVA";
        } else {
            window.miUsuarioCloud = data.user;
            window.LoginUI.mostrarMensaje("¡Cuenta creada!", "#00d2ff");
            setTimeout(async () => {
                window.LoginUI.ocultar();
                await window.cargarConfiguracionBalance();
                if (!localStorage.getItem("proyecto_genos_save_v1")) {
                    if (typeof window.iniciarSecuenciaBienvenida === 'function') {
                        window.iniciarSecuenciaBienvenida();
                    }
                } else {
                    window.respaldarEnNube();
                }
            }, 1000);
        }
    };

    const btnRecuperar = document.getElementById("btn-recuperar");
    if(btnRecuperar) {
        btnRecuperar.onclick = async () => {
            const email = inputEmail.value;
            if(!email) return window.LoginUI.mostrarMensaje("Escribe tu correo arriba primero.", "#ffcc00");

            btnRecuperar.innerText = "ENVIANDO...";
            const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://saletti001.github.io/Mascotas/', 
            });

            if (error) {
                window.LoginUI.mostrarMensaje("Error: " + error.message);
                btnRecuperar.innerText = "¿Olvidaste tu contraseña?";
            } else {
                window.LoginUI.mostrarMensaje("¡Revisa tu bandeja de entrada!", "#4CAF50");
                btnRecuperar.innerText = "ENLACE ENVIADO";
            }
        };
    }
});

// ========================================================
// FUNCIONES DE GUARDADO Y CARGA (NUBE)
// ========================================================
window.respaldarEnNube = async function() {
    if (!window.miUsuarioCloud) return;

    const datosJuego = {
        mascotaActiva: window.miMascota || null,
        inventario: window.miInventario ? {
            slots: window.miInventario.slots,
            items: window.miInventario.items,
            vitalEssence: window.miInventario.vitalEssence
        } : null,
        wallet: window.miWallet || null,
        genosGuardados: window.misGenos || [],
        ventasActivas: window.misVentas || [],
        nexoEnergy: window.nexoEnergy !== undefined ? window.nexoEnergy : 100,
        rationAutoActiveUntil: window.rationAutoActiveUntil !== undefined ? window.rationAutoActiveUntil : 0,
        dailyLogin: window.dailyLoginData || null,
        newsMailbox: window.newsMailboxData || null,
        tournamentSaldosPendientes: window.TournamentManager ? window.TournamentManager.saldosPendientes : 0.0,
        tournamentActive: window.TournamentManager ? window.TournamentManager.activeTournament : null,
        becasPlaza: window.becasPlaza || [],
        defensiveAlignment: window.defensiveAlignment || null,
        prBronce: window.prBronce !== undefined ? window.prBronce : 0,
        prPlata: window.prPlata !== undefined ? window.prPlata : 0,
        prOro: window.prOro !== undefined ? window.prOro : 0,
        prDiamante: window.prDiamante !== undefined ? window.prDiamante : 0,
        arenaTicketActive: window.arenaTicketActive !== undefined ? window.arenaTicketActive : false,
        arenaBattlesPlayed: window.arenaBattlesPlayed !== undefined ? window.arenaBattlesPlayed : 0,
        arenaWins: window.arenaWins !== undefined ? window.arenaWins : 0,
        arenaLosses: window.arenaLosses !== undefined ? window.arenaLosses : 0,
        maxFloor: window.maxFloor !== undefined ? window.maxFloor : 0,
        towerClaimedFloorThisWeek: window.towerClaimedFloorThisWeek !== undefined ? window.towerClaimedFloorThisWeek : 0,
        lastTowerResetAt: window.lastTowerResetAt !== undefined ? window.lastTowerResetAt : 0,
        // Guardar nivel de laboratorio en JSONB como respaldo
        labLevel: window.labLevel || 1,
        labXP: window.labXP || 0,
        comercioDesbloqueado: window.comercioDesbloqueado || false,
        lastActiveTime: window.obtenerTiempoSeguro()
    };

    const payload = {
        id: window.miUsuarioCloud.id,
        email: window.miUsuarioCloud.email,
        datos_juego: datosJuego,
        lab_level: window.labLevel || 1,
        lab_xp: window.labXP || 0,
        comercio_desbloqueado: window.comercioDesbloqueado || false,
        pr_bronce: window.prBronce !== undefined ? window.prBronce : 0,
        pr_plata: window.prPlata !== undefined ? window.prPlata : 0,
        pr_oro: window.prOro !== undefined ? window.prOro : 0,
        pr_diamante: window.prDiamante !== undefined ? window.prDiamante : 0,
        saldo_pendiente_pol: window.TournamentManager ? (window.TournamentManager.saldosPendientes || 0.0) : 0.0,
        arena_ticket_active: window.arenaTicketActive !== undefined ? window.arenaTicketActive : false,
        arena_battles_played: window.arenaBattlesPlayed !== undefined ? window.arenaBattlesPlayed : 0,
        arena_wins: window.arenaWins !== undefined ? window.arenaWins : 0,
        arena_losses: window.arenaLosses !== undefined ? window.arenaLosses : 0,
        max_floor: window.maxFloor !== undefined ? window.maxFloor : 0,
        ifttt_script: window.miMascota ? (window.miMascota.iftttRules || []) : [],
        last_active_at: new Date().toISOString()
    };

    let { error } = await supabaseClient
        .from('jugadores')
        .upsert(payload);

    // Fallback resiliente si las columnas dedicadas no existen en la base de datos
    if (error && error.message && error.message.includes("column")) {
        console.warn("[CloudManager] Las columnas lab_* no existen en 'jugadores'. Guardando solo datos_juego...");
        const fallbackRes = await supabaseClient
            .from('jugadores')
            .upsert({
                id: window.miUsuarioCloud.id,
                email: window.miUsuarioCloud.email,
                datos_juego: datosJuego,
                last_active_at: new Date().toISOString()
            });
        error = fallbackRes.error;
    }

    if (error) console.error("Error al guardar en la nube:", error);
    else console.log("☁️ Progreso guardado en la Nube.");
};

window.registrarLogEconomia = async function(actionType, amount, source) {
    if (!window.supabaseClient || !window.miUsuarioCloud) return;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    try {
        const { error } = await window.supabaseClient
            .from('economy_logs')
            .insert([{
                player_id: window.miUsuarioCloud.id,
                action_type: actionType,
                amount: parsedAmount,
                source: source
            }]);
            
        if (error) {
            console.error("[ECONOMY LOG ERROR] Fallo al registrar log:", error);
        } else {
            console.log(`[ECONOMY LOG] Registrado: ${actionType} - ${parsedAmount} de ${source}`);
        }
    } catch (e) {
        console.error("[ECONOMY LOG EXCEPTION]", e);
    }
};

async function cargarDatosDeLaNube() {
    if (!window.miUsuarioCloud) return;

    // Sincronización fresca antes de descargar y aplicar la recuperación pasiva
    const serverTime = await window.obtenerHoraServidor();
    window.clockOffset = serverTime - Date.now();
    console.log(`[TIME SYNC] Carga de nube: Offset refrescado: ${window.clockOffset} ms`);

    let result = await supabaseClient
        .from('jugadores')
        .select('datos_juego, lab_level, lab_xp, comercio_desbloqueado, pr_bronce, pr_plata, pr_oro, pr_diamante, saldo_pendiente_pol, arena_ticket_active, arena_battles_played, arena_wins, arena_losses, max_floor, ifttt_script')
        .eq('id', window.miUsuarioCloud.id)
        .single();

    let data = result.data;
    let error = result.error;

    // Fallback resiliente si las columnas no están creadas en Supabase
    if (error && error.message && error.message.includes("column")) {
        console.warn("[CloudManager] Columnas lab_* no encontradas en la consulta select. Recuperando solo datos_juego...");
        const fallbackRes = await supabaseClient
            .from('jugadores')
            .select('datos_juego')
            .eq('id', window.miUsuarioCloud.id)
            .single();
        data = fallbackRes.data;
        error = fallbackRes.error;
    }

    if (error) {
        console.log("Perfil nuevo o error. Iniciando partida fresca.");
        if (!localStorage.getItem("proyecto_genos_save_v1")) {
            if (typeof window.iniciarSecuenciaBienvenida === 'function') {
                window.iniciarSecuenciaBienvenida();
            }
        }
        return;
    }

    if (data && data.datos_juego) {
        const dj = data.datos_juego;
        // Si no tiene mascota activa y no hay partida guardada localmente
        if ((!dj.mascotaActiva || dj.mascotaActiva.id === "temp") && !localStorage.getItem("proyecto_genos_save_v1")) {
            if (typeof window.iniciarSecuenciaBienvenida === 'function') {
                window.iniciarSecuenciaBienvenida();
            }
        }
        console.log("☁️ Descargando progreso del jugador desde la Red Nexo...");
        
        // Actualizar última actividad de forma asíncrona en la base de datos
        supabaseClient
            .from('jugadores')
            .update({ last_active_at: new Date().toISOString() })
            .eq('id', window.miUsuarioCloud.id)
            .then(({ error }) => {
                if (error) console.warn("[CloudManager] No se pudo actualizar last_active_at:", error);
            });

        // Heartbeat periódico de actividad (cada 3 minutos) para mantener el estado "En Vivo" en el panel
        if (window.activityHeartbeatInterval) clearInterval(window.activityHeartbeatInterval);
        window.activityHeartbeatInterval = setInterval(() => {
            if (!window.miUsuarioCloud) return;
            supabaseClient
                .from('jugadores')
                .update({ last_active_at: new Date().toISOString() })
                .eq('id', window.miUsuarioCloud.id)
                .then(({ error }) => {
                    if (error) console.warn("[CloudManager] Fallo en heartbeat de actividad:", error);
                });
        }, 180000);

        // Cargar variables de laboratorio con prioridad de columna y fallback a JSONB
        window.labLevel = data.lab_level !== undefined && data.lab_level !== null ? data.lab_level : (dj.labLevel || 1);
        window.labXP = data.lab_xp !== undefined && data.lab_xp !== null ? data.lab_xp : (dj.labXP || 0);
        window.comercioDesbloqueado = data.comercio_desbloqueado !== undefined && data.comercio_desbloqueado !== null ? data.comercio_desbloqueado : (dj.comercioDesbloqueado || false);

        window.prBronce = data.pr_bronce !== undefined && data.pr_bronce !== null ? data.pr_bronce : (dj.prBronce || 0);
        window.prPlata = data.pr_plata !== undefined && data.pr_plata !== null ? data.pr_plata : (dj.prPlata || 0);
        window.prOro = data.pr_oro !== undefined && data.pr_oro !== null ? data.pr_oro : (dj.prOro || 0);
        window.prDiamante = data.pr_diamante !== undefined && data.pr_diamante !== null ? data.pr_diamante : (dj.prDiamante || 0);
        
        window.arenaTicketActive = data.arena_ticket_active !== undefined && data.arena_ticket_active !== null ? data.arena_ticket_active : (dj.arenaTicketActive || false);
        window.arenaBattlesPlayed = data.arena_battles_played !== undefined && data.arena_battles_played !== null ? data.arena_battles_played : (dj.arenaBattlesPlayed || 0);
        window.arenaWins = data.arena_wins !== undefined && data.arena_wins !== null ? data.arena_wins : (dj.arenaWins || 0);
        window.arenaLosses = data.arena_losses !== undefined && data.arena_losses !== null ? data.arena_losses : (dj.arenaLosses || 0);
        window.maxFloor = data.max_floor !== undefined && data.max_floor !== null ? data.max_floor : (dj.maxFloor || 0);
        
        window.towerClaimedFloorThisWeek = dj.towerClaimedFloorThisWeek !== undefined ? dj.towerClaimedFloorThisWeek : 0;
        window.lastTowerResetAt = dj.lastTowerResetAt !== undefined ? dj.lastTowerResetAt : 0;

        if (typeof window.actualizarHUDLaboratorio === 'function') {
            window.actualizarHUDLaboratorio();
        }
        
        if (dj.mascotaActiva) {
            window.miMascota = dj.mascotaActiva;
            if (data.ifttt_script) {
                window.miMascota.iftttRules = data.ifttt_script;
            }
        }
        if (dj.inventario && window.miInventario) {
            window.miInventario.slots = Array.isArray(dj.inventario.slots) ? dj.inventario.slots : (dj.inventario.items || []);
            window.miInventario.vitalEssence = dj.inventario.vitalEssence || 0;
        }
        if (dj.wallet) window.miWallet = dj.wallet;
        if (dj.genosGuardados) window.misGenos = dj.genosGuardados;
        if (dj.ventasActivas) window.misVentas = dj.ventasActivas;
        
        if (dj.nexoEnergy !== undefined) window.nexoEnergy = dj.nexoEnergy;
        if (dj.rationAutoActiveUntil !== undefined) window.rationAutoActiveUntil = dj.rationAutoActiveUntil;
        if (dj.dailyLogin !== undefined) window.dailyLoginData = dj.dailyLogin;
        if (dj.newsMailbox !== undefined) window.newsMailboxData = dj.newsMailbox;
        if (window.TournamentManager) {
            window.TournamentManager.saldosPendientes = data.saldo_pendiente_pol !== undefined && data.saldo_pendiente_pol !== null ? parseFloat(data.saldo_pendiente_pol) : (dj.tournamentSaldosPendientes || 0.0);
        }
        if (dj.tournamentActive !== undefined && window.TournamentManager) {
            window.TournamentManager.activeTournament = dj.tournamentActive;
        }
        if (dj.becasPlaza !== undefined) {
            window.becasPlaza = dj.becasPlaza;
        }
        if (dj.defensiveAlignment !== undefined) {
            window.defensiveAlignment = dj.defensiveAlignment;
        } else {
            window.defensiveAlignment = null;
        }
        if (window.NexoEnergyManager && dj.lastActiveTime) {
            window.NexoEnergyManager.aplicarRecuperacionPasiva(dj.lastActiveTime);
        }

        if (window.misGenos) {
            window.misGenos.forEach(geno => {
                if (typeof generarSvgGeno === 'function') geno.svg = generarSvgGeno(geno);
            });
        }
        if (window.miMascota && typeof generarSvgGeno === 'function') {
            window.miMascota.svg = generarSvgGeno(window.miMascota);
        }

        if (typeof window.guardarLocalSilencioso === 'function') window.guardarLocalSilencioso();
        
        // ✨ Inyección Buzón de Cobro: Revisar si alguien nos compró algo mientras estábamos offline
        if (typeof window.revisarVentasCompletadas === 'function') {
            window.revisarVentasCompletadas();
        }
        
        // ✨ Activar WebSockets de Supabase para recibir pagos instantáneos
        if (typeof window.iniciarMonitoreoRealtime === 'function') {
            window.iniciarMonitoreoRealtime();
        } else {
            setTimeout(() => {
                if (typeof window.iniciarMonitoreoRealtime === 'function') window.iniciarMonitoreoRealtime();
            }, 1000); // Esperar a que MarketManager cargue si la red es muy rápida
        }

        if (typeof window.actualizarHUD === 'function') window.actualizarHUD();
        if (typeof window.actualizarInventarioUI === 'function') window.actualizarInventarioUI();
        if (typeof window.actualizarPanelRPG === 'function') window.actualizarPanelRPG();
        if (typeof window.renderizarIncubadora === 'function') window.renderizarIncubadora();

        // Forzar a la mochila a actualizar sus números al cargar de la Nube
        if (window.miInventario && typeof window.miInventario.updateUI === 'function') {
            window.miInventario.updateUI();
            window.miInventario.renderGrid();
        }

        // ✨ PASO 3 APLICADO: Avisamos al WalletManager en lugar de pintar texto estático
        if (typeof window.WalletManager !== 'undefined') {
            window.WalletManager.actualizarBoton();
        }

        if (typeof window.actualizarSuciedadVisual === 'function') {
            window.actualizarSuciedadVisual();
        } else {
            const pedestal = document.getElementById("geno-container");
            if (pedestal && window.miMascota && window.miMascota.id && window.miMascota.id !== "temp") {
                pedestal.style.display = "block";
                pedestal.innerHTML = `<div class="geno-idle" style="color: ${window.miMascota.color}; top: 50%; left: 50%; display: flex; justify-content: center; align-items: center;">${window.miMascota.svg}</div>`;
            }
        }
    }
}

let timeoutGuardado = null;

window.autoGuardar = function() {
    if (!window.miUsuarioCloud) return;
    if (timeoutGuardado) clearTimeout(timeoutGuardado);
    
    timeoutGuardado = setTimeout(() => {
        window.respaldarEnNube();
    }, 3000);
};