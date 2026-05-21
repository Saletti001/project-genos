// =========================================
// CloudManager.js - LÓGICA DE NUBE Y LOGIN
// =========================================

const supabaseUrl = 'https://xoxkapvondvtlftecwcv.supabase.co';
const supabaseKey = 'sb_publishable_FBCAFJCwTr9xtSgbcZC6rQ_oudcDLza';

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
window.miUsuarioCloud = null;

document.addEventListener("DOMContentLoaded", async () => {
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
        ventasActivas: window.misVentas || []
    };

    const { error } = await supabaseClient
        .from('jugadores')
        .upsert({ id: window.miUsuarioCloud.id, email: window.miUsuarioCloud.email, datos_juego: datosJuego });

    if (error) console.error("Error al guardar en la nube:", error);
    else console.log("☁️ Progreso guardado en la Nube.");
};

async function cargarDatosDeLaNube() {
    if (!window.miUsuarioCloud) return;

    const { data, error } = await supabaseClient
        .from('jugadores')
        .select('datos_juego')
        .eq('id', window.miUsuarioCloud.id)
        .single();

    if (error) return console.log("Perfil nuevo o error. Iniciando partida fresca.");

    if (data && data.datos_juego) {
        console.log("☁️ Descargando progreso del jugador desde la Red Nexo...");
        const dj = data.datos_juego;
        
        if (dj.mascotaActiva) window.miMascota = dj.mascotaActiva;
        if (dj.inventario && window.miInventario) {
            window.miInventario.slots = Array.isArray(dj.inventario.slots) ? dj.inventario.slots : (dj.inventario.items || []);
            window.miInventario.vitalEssence = dj.inventario.vitalEssence || 0;
        }
        if (dj.wallet) window.miWallet = dj.wallet;
        if (dj.genosGuardados) window.misGenos = dj.genosGuardados;
        if (dj.ventasActivas) window.misVentas = dj.ventasActivas;

        if (window.misGenos) {
            window.misGenos.forEach(geno => {
                if (typeof generarSvgGeno === 'function') geno.svg = generarSvgGeno(geno);
            });
        }
        if (window.miMascota && typeof generarSvgGeno === 'function') {
            window.miMascota.svg = generarSvgGeno(window.miMascota);
        }

        if (typeof window.guardarLocalSilencioso === 'function') window.guardarLocalSilencioso();

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

        const pedestal = document.getElementById("geno-container");
        if (pedestal && window.miMascota && window.miMascota.id && window.miMascota.id !== "temp") {
            pedestal.style.display = "block";
            pedestal.innerHTML = `<div class="geno-idle" style="color: ${window.miMascota.color}; top: 50%; left: 50%; display: flex; justify-content: center; align-items: center;">${window.miMascota.svg}</div>`;
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