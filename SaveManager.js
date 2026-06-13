// =========================================
// SaveManager.js - SISTEMA DE GUARDADO LOCAL Y NUBE
// =========================================

const SAVE_KEY = "proyecto_genos_save_v1";

window.dailyLoginData = { lastClaimDate: "", currentDayStreak: 0 };
window.newsMailboxData = { lastReadNewsId: 0 };
window.dailyCareHarvest = { date: "", harvested: 0 };
window.towerSessionActive = false;
window.towerSessionEvAccumulated = 0;

window.cargarProgreso = function() {
    const dataString = localStorage.getItem(SAVE_KEY);
    if (dataString) {
        const data = JSON.parse(dataString);

        const getTempId = () => {
            if (typeof window.generarNuevoID === 'function') {
                return window.generarNuevoID();
            }
            let maxId = 0;
            if (data.misGenos) {
                data.misGenos.forEach(g => {
                    if (g && g.id) {
                        const num = parseInt(g.id, 10);
                        if (!isNaN(num) && num > maxId) maxId = num;
                    }
                });
            }
            let counterVal = parseInt(localStorage.getItem('genoGlobalCounter') || '0', 10);
            if (counterVal > maxId) maxId = counterVal;
            const nextId = maxId + 1;
            localStorage.setItem('genoGlobalCounter', nextId);
            return String(nextId).padStart(6, '0');
        };

        if (data.misGenos) {
            const idsVistos = new Set();
            const uniqueGenos = [];
            data.misGenos.forEach(g => {
                if (!g || !g.id) return;
                const idStr = String(g.id);
                if (idsVistos.has(idStr)) {
                    const oldId = g.id;
                    const newId = getTempId();
                    g.id = newId;
                    console.log(`[DEDUPLICATOR] Geno duplicado detectado. Reasignando ID de ${oldId} a ${newId}`);
                    
                    // Renombrar bionucleo en inventario
                    const oldBionucleoId = "bionucleo_" + oldId;
                    const newBionucleoId = "bionucleo_" + newId;
                    if (data.inventarioItems) {
                        data.inventarioItems.forEach(item => {
                            if (item && item.id === oldBionucleoId) {
                                item.id = newBionucleoId;
                                console.log(`[DEDUPLICATOR] Renombrado item de inventario ${oldBionucleoId} a ${newBionucleoId}`);
                            }
                        });
                    }
                }
                idsVistos.add(String(g.id));
                uniqueGenos.push(g);
            });
            window.misGenos = uniqueGenos;
        }
        
        if (data.miMascota) {
            window.miMascota = data.miMascota;
            // Alinear referencia de miMascota con el de misGenos
            if (window.misGenos && window.miMascota.id !== "temp") {
                const matchingGeno = window.misGenos.find(g => String(g.id) === String(window.miMascota.id));
                if (matchingGeno) {
                    window.miMascota = matchingGeno;
                }
            }
        }
        if (data.maxGenoSlots) window.maxGenoSlots = data.maxGenoSlots;

        // ✨ AUTO-REPARADOR DE GENOS
        if (window.miMascota && window.miMascota.id !== "temp") {
            if (!window.misGenos) window.misGenos = [];
            const yaExiste = window.misGenos.find(g => String(g.id) === String(window.miMascota.id));
            if (!yaExiste) window.misGenos.push(window.miMascota);
        }

        if (!window.miInventario) window.miInventario = {};
        if (data.inventarioItems) window.miInventario.items = data.inventarioItems;
        if (data.esencia !== undefined) window.miInventario.vitalEssence = data.esencia;

        if (data.nexoEnergy !== undefined) window.nexoEnergy = data.nexoEnergy;
        if (data.rationAutoActiveUntil !== undefined) window.rationAutoActiveUntil = data.rationAutoActiveUntil;
        if (data.dailyLogin !== undefined) window.dailyLoginData = data.dailyLogin;
        if (data.newsMailbox !== undefined) window.newsMailboxData = data.newsMailbox;

        // Cargar nuevos campos Arena y Torre
        window.prBronce = data.prBronce !== undefined ? data.prBronce : 0;
        window.prPlata = data.prPlata !== undefined ? data.prPlata : 0;
        window.prOro = data.prOro !== undefined ? data.prOro : 0;
        window.prDiamante = data.prDiamante !== undefined ? data.prDiamante : 0;
        window.arenaTicketActive = data.arenaTicketActive !== undefined ? data.arenaTicketActive : false;
        window.arenaBattlesPlayed = data.arenaBattlesPlayed !== undefined ? data.arenaBattlesPlayed : 0;
        window.arenaWins = data.arenaWins !== undefined ? data.arenaWins : 0;
        window.arenaLosses = data.arenaLosses !== undefined ? data.arenaLosses : 0;
        window.maxFloor = data.maxFloor !== undefined ? data.maxFloor : 0;
        window.towerClaimedFloorThisWeek = data.towerClaimedFloorThisWeek !== undefined ? data.towerClaimedFloorThisWeek : 0;
        window.lastTowerResetAt = data.lastTowerResetAt !== undefined ? data.lastTowerResetAt : 0;
        window.dailyCareHarvest = data.dailyCareHarvest !== undefined ? data.dailyCareHarvest : { date: "", harvested: 0 };
        window.towerSessionActive = data.towerSessionActive !== undefined ? data.towerSessionActive : false;
        window.towerSessionEvAccumulated = data.towerSessionEvAccumulated !== undefined ? data.towerSessionEvAccumulated : 0;

        if (window.NexoEnergyManager && data.lastActiveTime) {
            window.NexoEnergyManager.aplicarRecuperacionPasiva(data.lastActiveTime);
        }

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

                if (!window.miWallet) window.miWallet = { pol: 10.0 };
                if (data.pol !== undefined) window.miWallet.pol = data.pol;
                if (data.walletAddress !== undefined) window.miWallet.address = data.walletAddress;
                if (data.walletHistory !== undefined) window.miWallet.history = data.walletHistory;

                if (data.tournamentSaldosPendientes !== undefined && window.TournamentManager) {
                    window.TournamentManager.saldosPendientes = data.tournamentSaldosPendientes;
                }
                if (data.tournamentActive !== undefined && window.TournamentManager) {
                    window.TournamentManager.activeTournament = data.tournamentActive;
                }
                if (data.becasPlaza !== undefined) {
                    window.becasPlaza = data.becasPlaza;
                }
                if (data.defensiveAlignment !== undefined) {
                    window.defensiveAlignment = data.defensiveAlignment;
                } else {
                    window.defensiveAlignment = null;
                }

                if (typeof window.WalletManager !== 'undefined') {
                    window.WalletManager.actualizarBoton();
                }

                const pedestal = document.getElementById("geno-container");
                if (typeof window.actualizarSuciedadVisual === 'function') {
                    window.actualizarSuciedadVisual();
                } else if (pedestal && window.miMascota && window.miMascota.id && window.miMascota.id !== "temp") {
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

    // De-duplicar misGenos antes de guardar
    const idsVistos = new Set();
    window.misGenos = window.misGenos.filter(g => {
        if (!g || !g.id) return false;
        const idStr = String(g.id);
        if (idsVistos.has(idStr)) return false;
        idsVistos.add(idStr);
        return true;
    });

    const yaExiste = window.misGenos.find(g => String(g.id) === String(window.miMascota.id));
    if (!yaExiste) window.misGenos.push(window.miMascota);

    const dataToSave = {
        misGenos: window.misGenos,
        miMascota: window.miMascota,
        maxGenoSlots: window.maxGenoSlots || 6,
        esencia: window.miInventario ? (window.miInventario.vitalEssence || 0) : 0,
        pol: window.miWallet ? window.miWallet.pol : 10.0,
        walletAddress: window.miWallet ? window.miWallet.address : null,
        walletHistory: window.miWallet ? window.miWallet.history : [],
        inventarioItems: window.miInventario ? (window.miInventario.items || window.miInventario.slots || []) : [],
        nexoEnergy: window.nexoEnergy !== undefined ? window.nexoEnergy : 100,
        rationAutoActiveUntil: window.rationAutoActiveUntil !== undefined ? window.rationAutoActiveUntil : 0,
        dailyLogin: window.dailyLoginData,
        newsMailbox: window.newsMailboxData,
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
        dailyCareHarvest: window.dailyCareHarvest || { date: "", harvested: 0 },
        towerSessionActive: window.towerSessionActive !== undefined ? window.towerSessionActive : false,
        towerSessionEvAccumulated: window.towerSessionEvAccumulated !== undefined ? window.towerSessionEvAccumulated : 0,
        lastActiveTime: typeof window.obtenerTiempoSeguro === 'function' ? window.obtenerTiempoSeguro() : Date.now()
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
    if (window.NexoEnergyManager) {
        window.NexoEnergyManager.iniciar();
    }
    setInterval(() => {
        window.guardarLocalSilencioso();
    }, 5000);
});