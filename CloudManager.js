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
        const respuesta = await fetch(supabaseUrl, { method: 'HEAD' });
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

document.addEventListener("DOMContentLoaded", async () => {
    // Sincronizar el reloj del servidor de Supabase inmediatamente
    window.obtenerHoraServidor().then(serverTime => {
        window.clockOffset = serverTime - Date.now();
        console.log(`[TIME SYNC] Sincronización inicial. Offset: ${window.clockOffset} ms`);
    });

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
            setTimeout(() => {
                window.LoginUI.ocultar();
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
            setTimeout(() => {
                window.LoginUI.ocultar();
                window.respaldarEnNube();
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
                datos_juego: datosJuego
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
        .select('datos_juego, lab_level, lab_xp, comercio_desbloqueado')
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

    if (error) return console.log("Perfil nuevo o error. Iniciando partida fresca.");

    if (data && data.datos_juego) {
        console.log("☁️ Descargando progreso del jugador desde la Red Nexo...");
        const dj = data.datos_juego;
        
        // Cargar variables de laboratorio con prioridad de columna y fallback a JSONB
        window.labLevel = data.lab_level !== undefined && data.lab_level !== null ? data.lab_level : (dj.labLevel || 1);
        window.labXP = data.lab_xp !== undefined && data.lab_xp !== null ? data.lab_xp : (dj.labXP || 0);
        window.comercioDesbloqueado = data.comercio_desbloqueado !== undefined && data.comercio_desbloqueado !== null ? data.comercio_desbloqueado : (dj.comercioDesbloqueado || false);

        if (typeof window.actualizarHUDLaboratorio === 'function') {
            window.actualizarHUDLaboratorio();
        }
        
        if (dj.mascotaActiva) window.miMascota = dj.mascotaActiva;
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
        if (dj.tournamentSaldosPendientes !== undefined && window.TournamentManager) {
            window.TournamentManager.saldosPendientes = dj.tournamentSaldosPendientes;
        }
        if (dj.tournamentActive !== undefined && window.TournamentManager) {
            window.TournamentManager.activeTournament = dj.tournamentActive;
        }
        if (dj.becasPlaza !== undefined) {
            window.becasPlaza = dj.becasPlaza;
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