// =========================================
// CloudManager.js - PUENTE CON SUPABASE
// =========================================

// ⚠️ PEGA AQUÍ TUS CLAVES DE SUPABASE
const supabaseUrl = 'https://TU-URL-DEL-PROYECTO.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsIn... (TU LLAVE PUBLISHABLE LARGA)';

// Inicializar el cliente
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
window.miUsuarioCloud = null;

// Botón de prueba flotante para conectar a la nube sin romper la UI actual
document.addEventListener("DOMContentLoaded", () => {
    const btnNube = document.createElement("button");
    btnNube.innerHTML = "☁️ Conectar Nube";
    btnNube.style = "position: absolute; top: 15px; left: 15px; z-index: 9999; background: linear-gradient(90deg, #8A2BE2, #00d2ff); color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 10px rgba(0,210,255,0.4); text-transform: uppercase; font-size: 11px;";
    
    btnNube.onclick = async () => {
        const email = prompt("Registro en la Nube\nIngresa un email de prueba (ej: test@genos.com):", "test@genos.com");
        if(!email) return;
        const password = prompt("Ingresa una contraseña (mínimo 6 caracteres):", "123456");
        if(!password) return;

        btnNube.innerHTML = "⏳ Conectando...";

        // Intentar iniciar sesión
        let { data, error } = await supabase.auth.signInWithPassword({ email, password });

        // Si da error (el usuario no existe), lo creamos
        if (error) {
            console.log("Usuario no existe. Creando nueva cuenta...");
            const res = await supabase.auth.signUp({ email, password });
            data = res.data;
            error = res.error;
            if(!error) alert("✅ ¡Cuenta en la nube creada con éxito!");
        } else {
            alert("✅ ¡Sesión iniciada correctamente en la nube!");
        }

        if (error) {
            alert("❌ Error: " + error.message);
            btnNube.innerHTML = "☁️ Conectar Nube";
            return;
        }

        window.miUsuarioCloud = data.user;
        btnNube.innerHTML = "☁️ Respaldar Datos";
        btnNube.style.background = "linear-gradient(90deg, #4CAF50, #8bc34a)";
        
        // Sobreescribimos temporalmente tu botón de test para que ahora sea el de "Guardar"
        btnNube.onclick = window.respaldarEnNube;
        
        // Hacemos el primer respaldo automático
        window.respaldarEnNube();
    };
    
    document.body.appendChild(btnNube);
});

// Función para agarrar los datos del juego y mandarlos a Supabase
window.respaldarEnNube = async function() {
    if (!window.miUsuarioCloud) return;

    // Empaquetamos todo tu progreso local
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

    // Subimos a la "Caja Fuerte" (Tabla jugadores)
    const { error } = await supabase
        .from('jugadores')
        .upsert({
            id: window.miUsuarioCloud.id,
            email: window.miUsuarioCloud.email,
            datos_juego: datosJuego
        });

    if (error) {
        console.error("Error al guardar en la nube:", error);
        alert("❌ Error guardando datos en la nube.");
    } else {
        console.log("☁️ ¡Datos guardados en Supabase!");
        const btn = document.querySelector("button[style*='8bc34a']");
        if(btn) {
            btn.innerHTML = "✅ Guardado en Nube";
            setTimeout(() => btn.innerHTML = "☁️ Respaldar Datos", 2000);
        }
    }
};