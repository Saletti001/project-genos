// =========================================
// CloudManager.js - LÓGICA DE NUBE Y LOGIN
// =========================================

const supabaseUrl = 'https://xoxkapvondvtlftecwcv.supabase.co';
const supabaseKey = 'sb_publishable_FBCAFJCwTr9xtSgbcZC6rQ_oudcDLza';

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
window.miUsuarioCloud = null;

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Inyectamos la interfaz visual desde nuestro nuevo archivo
    window.LoginUI.inyectar();

    const btnIniciar = document.getElementById("btn-iniciar");
    const btnRegistro = document.getElementById("btn-registro");
    const inputEmail = document.getElementById("login-email");
    const inputPass = document.getElementById("login-pass");

    // 2. REVISAR SI YA ESTÁ CONECTADO (Memoria Automática)
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        window.miUsuarioCloud = session.user;
        window.LoginUI.ocultar(); // Ocultamos la UI si ya tiene el token guardado
        cargarDatosDeLaNube();
    }

    // 3. INICIAR SESIÓN MANUALMENTE
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

    // 4. REGISTRAR CUENTA NUEVA
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
                window.respaldarEnNube(); // Creamos su primer perfil vacío en la DB
            }, 1000);
        }
    };

    // ========================================================
    // 5. RECUPERAR CONTRASEÑA (Ahora está dentro de la función correcta)
    // ========================================================
    const btnRecuperar = document.getElementById("btn-recuperar");
    if(btnRecuperar) {
        btnRecuperar.onclick = async () => {
            const email = inputEmail.value;
            if(!email) {
                return window.LoginUI.mostrarMensaje("Escribe tu correo arriba primero.", "#ffcc00");
            }

            btnRecuperar.innerText = "ENVIANDO...";
            
            // Ya configurado con tu usuario real de GitHub
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
// FUNCIONES DE GUARDADO Y CARGA
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
        console.log("☁️ Descargando progreso del jugador...");
        const dj = data.datos_juego;
        
        if (dj.mascotaActiva) window.miMascota = dj.mascotaActiva;
        if (dj.inventario && window.miInventario) {
            window.miInventario.slots = dj.inventario.slots || 10;
            window.miInventario.items = dj.inventario.items || [];
            window.miInventario.vitalEssence = dj.inventario.vitalEssence || 0;
        }
        if (dj.wallet) window.miWallet = dj.wallet;
        if (dj.genosGuardados) window.misGenos = dj.genosGuardados;
        if (dj.ventasActivas) window.misVentas = dj.ventasActivas;

        if(typeof window.actualizarHUD === 'function') window.actualizarHUD();
        if(typeof window.actualizarInventarioUI === 'function') window.actualizarInventarioUI();
    }
}

// ========================================================
// AUTO-GUARDADO INVISIBLE (DEBOUNCE)
// ========================================================
let timeoutGuardado = null;

window.autoGuardar = function() {
    // Si no hay cuenta conectada, ignoramos la orden
    if (!window.miUsuarioCloud) return; 
    
    // Si ya había un guardado programado en cola, lo cancelamos
    if (timeoutGuardado) {
        clearTimeout(timeoutGuardado);
    }
    
    // Programamos un nuevo guardado silencioso para dentro de 3 segundos
    timeoutGuardado = setTimeout(() => {
        console.log("⏳ Ejecutando auto-guardado en la Red Nexo...");
        window.respaldarEnNube();
    }, 3000); // 3000 milisegundos = 3 segundos
};
// ========================================================
// AUTO-GUARDADO INVISIBLE EN LA RED NEXO (DEBOUNCE)
// ========================================================
let timeoutGuardado = null;

window.autoGuardar = function() {
    // Si el jugador no ha iniciado sesión, no hacemos nada
    if (!window.miUsuarioCloud) return; 
    
    // Si ya había un guardado en cola, lo reiniciamos
    if (timeoutGuardado) {
        clearTimeout(timeoutGuardado);
    }
    
    // Esperamos 3 segundos de inactividad antes de enviar el paquete a Alemania
    timeoutGuardado = setTimeout(() => {
        window.respaldarEnNube();
    }, 3000); 
};