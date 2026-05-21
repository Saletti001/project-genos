// =========================================
// SaveManager.js - SISTEMA DE GUARDADO LOCAL Y NUBE
// =========================================

const SAVE_KEY = "proyecto_genos_save_v1";

window.cargarProgreso = function() {
    const dataString = localStorage.getItem(SAVE_KEY);
    if (dataString) {
        const data = JSON.parse(dataString);

        if (data.misGenos) window.misGenos = data.misGenos;
        if (data.miMascota) window.miMascota = data.miMascota;
        if (data.maxGenoSlots) window.maxGenoSlots = data.maxGenoSlots;

        // ✨ AUTO-REPARADOR DE GENOS
        if (window.miMascota && window.miMascota.id !== "temp") {
            if (!window.misGenos) window.misGenos = [];
            const yaExiste = window.misGenos.find(g => g.id === window.miMascota.id);
            if (!yaExiste) window.misGenos.push(window.miMascota);
        }

        if (!window.miInventario) window.miInventario = {};
        if (data.inventarioItems) window.miInventario.items = data.inventarioItems;
        if (data.esencia !== undefined) window.miInventario.vitalEssence = data.esencia;

        document.addEventListener("DOMContentLoaded", () => {
            setTimeout(() => {
                if (window.misGenos) {
                    window.misGenos.forEach(geno => {
                        if (typeof generarSvgGeno === 'function') geno.svg = generarSvgGeno(geno);
                    });
                }
                if (window.miMascota && typeof generarSvgGeno === 'function') {
                    window.miMascota.svg = generarSvgGeno(window.miMascota);
                }

                if (window.miWallet && data.pol !== undefined) {
                    window.miWallet.pol = data.pol;
                    // ✨ PASO 3 APLICADO: Avisamos al WalletManager en lugar de pintar texto estático
                    if (typeof window.WalletManager !== 'undefined') {
                        window.WalletManager.actualizarBoton();
                    }
                }

                const pedestal = document.getElementById("geno-container");
                if (pedestal && window.miMascota && window.miMascota.id && window.miMascota.id !== "temp") {
                    pedestal.style.display = "block";
                    pedestal.innerHTML = `<div class="geno-idle" style="color: ${window.miMascota.color}; top: 50%; left: 50%; display: flex; justify-content: center; align-items: center;">${window.miMascota.svg}</div>`;
                }

                if(window.actualizarPanelRPG) window.actualizarPanelRPG();
                if(window.renderizarIncubadora) window.renderizarIncubadora();
                
                // ✨ Forzar a la mochila a actualizar sus números al cargar la partida local
                if (window.miInventario && typeof window.miInventario.updateUI === 'function') {
                    window.miInventario.updateUI();
                    window.miInventario.renderGrid();
                }
            }, 150); 
        });
        
        return true;
    }
    return false;
};

// 1. GUARDADO SILENCIOSO (Solo PC local)
window.guardarLocalSilencioso = function() {
    if (!window.miMascota || !window.miMascota.id || window.miMascota.id === "temp") return;

    if (!window.misGenos) window.misGenos = [];
    const yaExiste = window.misGenos.find(g => g.id === window.miMascota.id);
    if (!yaExiste) window.misGenos.push(window.miMascota);

    const dataToSave = {
        misGenos: window.misGenos,
        miMascota: window.miMascota,
        maxGenoSlots: window.maxGenoSlots || 6,
        esencia: window.miInventario ? (window.miInventario.vitalEssence || 0) : 0,
        pol: window.miWallet ? window.miWallet.pol : 10.0,
        inventarioItems: window.miInventario ? (window.miInventario.items || window.miInventario.slots || []) : []
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
};

// 2. GUARDADO DE ACCIÓN (Local + Nube)
window.guardarProgreso = function() {
    window.guardarLocalSilencioso();
    if (typeof window.autoGuardar === 'function') window.autoGuardar();
};

window.cargarProgreso();

document.addEventListener("DOMContentLoaded", () => {
    setInterval(() => {
        window.guardarLocalSilencioso();
    }, 5000);
});