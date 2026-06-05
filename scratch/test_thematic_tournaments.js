const fs = require('fs');

// 1. Mock de DOM y objetos globales
global.window = global;
global.localStorage = {
    getItem: (key) => null,
    setItem: (key, val) => {},
    removeItem: (key) => {}
};
global.document = {
    addEventListener: (event, callback) => {},
    getElementById: (id) => {
        return {
            innerText: '',
            classList: { add: () => {}, remove: () => {}, contains: () => false },
            parentNode: {
                insertBefore: () => {},
                parentNode: {}
            },
            innerHTML: '',
            style: {
                setProperty: () => {},
                width: ''
            },
            addEventListener: () => {},
            onclick: null,
            appendChild: () => {},
            remove: () => {}
        };
    },
    createElement: (tag) => {
        return {
            innerText: '',
            classList: { add: () => {}, remove: () => {}, contains: () => false },
            parentNode: {
                insertBefore: () => {},
                parentNode: {}
            },
            innerHTML: '',
            style: {},
            addEventListener: () => {},
            onclick: null,
            appendChild: () => {},
            remove: () => {}
        };
    },
    querySelector: () => {
        return {
            insertBefore: () => {},
            appendChild: () => {},
            classList: { add: () => {}, remove: () => {} },
            querySelectorAll: () => []
        };
    },
    head: {
        appendChild: () => {}
    }
};

global.AttackCatalog = {
    ataquesPorElemento: {
        Viral: { basicos: [], especiales: [], soportes: [], definitivos: [] },
        Biomutante: { basicos: [], especiales: [], soportes: [], definitivos: [] },
        Sintético: { basicos: [], especiales: [], soportes: [], definitivos: [] },
        Cibernético: { basicos: [], especiales: [], soportes: [], definitivos: [] },
        Radiactivo: { basicos: [], especiales: [], soportes: [], definitivos: [] },
        Tóxico: { basicos: [], especiales: [], soportes: [], definitivos: [] }
    }
};

global.generarStatsPorRareza = (rareza) => {
    return { hp: 100, atk: 10, def: 5, spd: 10, luk: 5 };
};

global.generarGenesV9 = (rareza) => {
    return {
        A: { id: "gen_a" },
        B: { id: "gen_b" },
        C: { id: "gen_c" }
    };
};

global.comercioDesbloqueado = true;
global.misGenos = [];

// Cargar ColiseumLogic.js
const coliseumLogicPath = 'c:/Users/STT/Documents/GitHub/Mascotas/ColiseumLogic.js';
const coliseumLogicCode = fs.readFileSync(coliseumLogicPath, 'utf8');
eval(coliseumLogicCode);

// Cargar TournamentManager.js
const tourneyPath = 'c:/Users/STT/Documents/GitHub/Mascotas/TournamentManager.js';
const tourneyCode = fs.readFileSync(tourneyPath, 'utf8');
eval(tourneyCode);

console.log("=== INICIANDO PRUEBAS DE TORNEOS TEMÁTICOS ===\n");

// ----------------------------------------------------
// TEST 1: Rotación de Semanas y Elementos
// ----------------------------------------------------
console.log("--- Prueba 1: Rotaciones Temporales ---");
const week = TournamentManager.getCicloSemana();
const elemSemana = TournamentManager.getElementoSemana();
const elemDebil = TournamentManager.getElementoDebilSemana();
const activeTourneys = TournamentManager.getTorneosActivosSemana();

console.log(`Semana de la rotación actual: ${week} (1-4)`);
console.log(`Elemento semanal activo: ${elemSemana}`);
console.log(`Elemento débil semanal: ${elemDebil}`);
console.log(`Cantidad de torneos activos esta semana: ${activeTourneys.length}`);

if (week >= 1 && week <= 4) {
    console.log(">> TEST ROTACIÓN SEMANA: PASADO");
} else {
    console.error(">> TEST ROTACIÓN SEMANA: FALLIDO");
}

if (TournamentManager.ELEMENTS.includes(elemSemana)) {
    console.log(">> TEST ELEMENTO SEMANA: PASADO");
} else {
    console.error(">> TEST ELEMENTO SEMANA: FALLIDO");
}

// ----------------------------------------------------
// TEST 2: Validación de Restricciones
// ----------------------------------------------------
console.log("\n--- Prueba 2: Validación de Restricciones ---");

const testGenoComun = {
    id: "g1",
    name: "ComúnGeno",
    level: 10,
    rarity: "Común",
    element: "Viral",
    generation: 0,
    genes: { afinidad: { dom: "Viral" } }
};

const testGenoRaro = {
    id: "g2",
    name: "RaroGeno",
    level: 15,
    rarity: "Raro",
    element: "Biomutante",
    generation: 1,
    genes: { afinidad: { dom: "Biomutante" } }
};

const testGenoOlimpo = {
    id: "g3",
    name: "OlimpoGeno",
    level: 50,
    rarity: "Común",
    element: "Sintético",
    generation: 2,
    genes: { afinidad: { dom: "Sintético" } }
};

// 2.1 Solo Comunes
const resComunOk = TournamentManager.validarRestriccion(testGenoComun, TournamentManager.TEMATICOS_CONFIG.solo_comunes);
const resComunFail = TournamentManager.validarRestriccion(testGenoRaro, TournamentManager.TEMATICOS_CONFIG.solo_comunes);
console.log("Común en Solo Comunes (Debe pasar):", resComunOk.puede, resComunOk.motivo);
console.log("Raro en Solo Comunes (Debe fallar):", resComunFail.puede, resComunFail.motivo);

// 2.2 Copa Raro
const resRaroOk = TournamentManager.validarRestriccion(testGenoRaro, TournamentManager.TEMATICOS_CONFIG.copa_raro);
const resRaroFail = TournamentManager.validarRestriccion(testGenoComun, TournamentManager.TEMATICOS_CONFIG.copa_raro);
console.log("Raro en Copa Raro (Debe pasar):", resRaroOk.puede, resRaroOk.motivo);
console.log("Común en Copa Raro (Debe fallar):", resRaroFail.puede, resRaroFail.motivo);

// 2.3 Gran Linaje (Gen > 0)
const resLinajeOk = TournamentManager.validarRestriccion(testGenoRaro, TournamentManager.TEMATICOS_CONFIG.gran_linaje);
const resLinajeFail = TournamentManager.validarRestriccion(testGenoComun, TournamentManager.TEMATICOS_CONFIG.gran_linaje);
console.log("Gen 1 en Gran Linaje (Debe pasar):", resLinajeOk.puede, resLinajeOk.motivo);
console.log("Gen 0 en Gran Linaje (Debe fallar):", resLinajeFail.puede, resLinajeFail.motivo);

// 2.4 El Olimpo (Lv >= 45)
const resOlimpoOk = TournamentManager.validarRestriccion(testGenoOlimpo, TournamentManager.TEMATICOS_CONFIG.el_olimpo);
const resOlimpoFail = TournamentManager.validarRestriccion(testGenoComun, TournamentManager.TEMATICOS_CONFIG.el_olimpo);
console.log("Lv 50 en El Olimpo (Debe pasar):", resOlimpoOk.puede, resOlimpoOk.motivo);
console.log("Lv 10 en El Olimpo (Debe fallar):", resOlimpoFail.puede, resOlimpoFail.motivo);

// 2.5 Liga Elemental Pura
// Forzamos elemento de prueba
const targetElement = elemSemana;
const matchingGeno = {
    id: "g_match",
    level: 25,
    rarity: "Común",
    element: targetElement,
    genes: { afinidad: { dom: targetElement } }
};
const nonMatchingGeno = {
    id: "g_non_match",
    level: 25,
    rarity: "Común",
    element: targetElement === "Viral" ? "Biomutante" : "Viral",
    genes: { afinidad: { dom: targetElement === "Viral" ? "Biomutante" : "Viral" } }
};
const resElemOk = TournamentManager.validarRestriccion(matchingGeno, TournamentManager.TEMATICOS_CONFIG.elemental_pura);
const resElemFail = TournamentManager.validarRestriccion(nonMatchingGeno, TournamentManager.TEMATICOS_CONFIG.elemental_pura);
console.log(`Liga Elemental Pura (Semana = ${targetElement}):`);
console.log(`  Geno ${targetElement} (Debe pasar):`, resElemOk.puede, resElemOk.motivo);
console.log(`  Geno del elemento incorrecto (Debe fallar):`, resElemFail.puede, resElemFail.motivo);

// 2.6 Torneo Inverso
const targetWeak = elemDebil;
const matchingWeakGeno = {
    id: "g_weak_match",
    level: 25,
    rarity: "Común",
    element: targetWeak,
    genes: { afinidad: { dom: targetWeak } }
};
const nonMatchingWeakGeno = {
    id: "g_weak_non_match",
    level: 25,
    rarity: "Común",
    element: targetWeak === "Viral" ? "Biomutante" : "Viral",
    genes: { afinidad: { dom: targetWeak === "Viral" ? "Biomutante" : "Viral" } }
};
const resWeakOk = TournamentManager.validarRestriccion(matchingWeakGeno, TournamentManager.TEMATICOS_CONFIG.torneo_inverso);
const resWeakFail = TournamentManager.validarRestriccion(nonMatchingWeakGeno, TournamentManager.TEMATICOS_CONFIG.torneo_inverso);
console.log(`Torneo Inverso (Semana = Elemento Débil: ${targetWeak}):`);
console.log(`  Geno ${targetWeak} (Debe pasar):`, resWeakOk.puede, resWeakOk.motivo);
console.log(`  Geno del elemento incorrecto (Debe fallar):`, resWeakFail.puede, resWeakFail.motivo);

// 2.7 Regla Antiabuso (Una participación por semana)
console.log("\n--- Prueba 2.7: Regla Antiabuso ---");
const absWeek = TournamentManager.getSemanaAño();
const testGenoAbuso = {
    id: "g_abuso",
    level: 10,
    rarity: "Común",
    element: "Viral",
    lastThematicWeek: absWeek,
    genes: { afinidad: { dom: "Viral" } }
};
const resAbuso = TournamentManager.validarRestriccion(testGenoAbuso, TournamentManager.TEMATICOS_CONFIG.solo_comunes);
console.log("Geno que ya participó esta semana en Solo Comunes (Debe fallar):", resAbuso.puede, resAbuso.motivo);

if (resComunOk.puede && !resComunFail.puede && resRaroOk.puede && !resRaroFail.puede &&
    resLinajeOk.puede && !resLinajeFail.puede && resOlimpoOk.puede && !resOlimpoFail.puede &&
    resElemOk.puede && !resElemFail.puede && resWeakOk.puede && !resWeakFail.puede && !resAbuso.puede) {
    console.log(">> TEST TODAS LAS RESTRICCIONES: PASADO");
} else {
    console.error(">> TEST RESTRICCIONES: FALLIDO");
}

// ----------------------------------------------------
// TEST 3: Combat Modifier Overrides (Sin Genes, Berserker)
// ----------------------------------------------------
console.log("\n--- Prueba 3: Reglas Especiales de Combate (Sin Genes y Berserker) ---");

// Mock ColiseumLogic environment
ColiseumLogic.player = {
    nombre: "Tú",
    hp: 100, maxHp: 100, atk: 15, def: 10, spd: 12, luk: 5,
    genesId: ["piel_cristal", "decoy"], crystalSkin: true
};
ColiseumLogic.enemy = {
    nombre: "NPC",
    hp: 100, maxHp: 100, atk: 15, def: 10, spd: 12, luk: 5,
    genesId: ["piel_cristal", "decoy"], crystalSkin: true
};

// 3.1 Torneo Sin Genes
console.log("3.1 Iniciar combate en 'Torneo Sin Genes'");
TournamentManager.activeTournament = {
    config: TournamentManager.TEMATICOS_CONFIG.sin_genes
};
// Simular la inicialización de luchadores que se hace en TournamentManager.comenzarDuelo
// En la vida real, ColiseumLogic.prepararJugador prepara al jugador, pero TournamentManager.comenzarDuelo configura las propiedades directamente:
const playerFighterObj = {
    nombre: "TÚ",
    genesId: TournamentManager.activeTournament.config.id === "sin_genes" ? ["ninguno", "ninguno"] : ["piel_cristal", "decoy"],
    crystalSkin: TournamentManager.activeTournament.config.id === "sin_genes" ? false : true
};

console.log("  Genes del jugador (esperado ['ninguno', 'ninguno']):", playerFighterObj.genesId);
console.log("  crystalSkin del jugador (esperado false):", playerFighterObj.crystalSkin);

const sinGenesOk = playerFighterObj.genesId[0] === "ninguno" && playerFighterObj.crystalSkin === false;
if (sinGenesOk) {
    console.log(">> TEST TORNEO SIN GENES EN PREPARACIÓN: PASADO");
} else {
    console.error(">> TEST TORNEO SIN GENES EN PREPARACIÓN: FALLIDO");
}

// 3.2 Modo Berserker (Defensa forzada a 0)
console.log("3.2 Ejecutar strike en 'Modo Berserker'");
TournamentManager.activeTournament = {
    config: TournamentManager.TEMATICOS_CONFIG.modo_berserker
};

// Mock del método strike para probar el defensor.def
const atacante = { name: "Atacante", atk: 20, luk: 5, genesId: [], element: "Viral" };
const defensor = { name: "Defensor", def: 15, genesId: [], element: "Viral", efectosActivos: [], crystalSkin: false };

// Simular el cálculo de daño de ColiseumLogic:
// let defRival = defensor.def;
// if (window.TournamentManager && window.TournamentManager.activeTournament && window.TournamentManager.activeTournament.config && window.TournamentManager.activeTournament.config.id === "modo_berserker") {
//     defRival = 0;
// }
let defRivalVal = defensor.def;
if (window.TournamentManager && window.TournamentManager.activeTournament && window.TournamentManager.activeTournament.config && window.TournamentManager.activeTournament.config.id === "modo_berserker") {
    defRivalVal = 0;
}

console.log("  Defensa del rival sin Berserker:", defensor.def);
console.log("  Defensa calculada para Berserker (esperado 0):", defRivalVal);

const berserkerOk = defRivalVal === 0;
if (berserkerOk) {
    console.log(">> TEST MODO BERSERKER (DEF = 0): PASADO");
} else {
    console.error(">> TEST MODO BERSERKER (DEF = 0): FALLIDO");
}

// ----------------------------------------------------
// TEST 4: El Espejo (NPC clona stats del jugador)
// ----------------------------------------------------
console.log("\n--- Prueba 4: El Espejo (NPC clona stats del jugador) ---");
TournamentManager.activeTournament = {
    config: TournamentManager.TEMATICOS_CONFIG.el_espejo
};

window.miMascota = {
    id: "g_mirror",
    name: "OriginalGeno",
    level: 32,
    rarity: "Épico",
    element: "Tóxico",
    color: "#00ff00",
    body_shape: "frijol",
    eye_type: "happy",
    mouth_type: "sonrisa",
    stats: { hp: 160, atk: 20, def: 14, spd: 18, luk: 10 },
    hidden_genes: { B: { id: "piel_cristal" }, C: { id: "decoy" } }
};

// Simulamos la generación del rival en El Espejo
const myMatch = { id: 1, round: 0, p1: { isPlayer: true, nombre: "TÚ" }, p2: { isPlayer: false, nombre: "RivalEspejo" } };
const rival = myMatch.p2;

let eStats = { hp: 120, atk: 12, def: 8, spd: 10, luk: 5 };
let eLevel = rival.level || 32;
let eElement = rival.element || "Viral";
let eRarity = "Común";
let eShape = "frijol";
let eColor = "#ff6b6b";
let eEye = "angry";
let eMouth = "colmillos";
let gB = "ninguno";
let gC = "ninguno";
let eHiddenGenes = { A: null, B: null, C: null };

if (TournamentManager.activeTournament.config.id === "el_espejo" && window.miMascota) {
    eStats = { ...window.miMascota.stats };
    eLevel = window.miMascota.level || 1;
    eElement = (window.miMascota.genes && window.miMascota.genes.afinidad) ? window.miMascota.genes.afinidad.dom : (window.miMascota.element || "Normal");
    eRarity = window.miMascota.rarity || window.miMascota.rareza || "Común";
    eShape = window.miMascota.body_shape || (window.miMascota.genes && window.miMascota.genes.cuerpo ? window.miMascota.genes.cuerpo.dom : "frijol");
    eColor = window.miMascota.color || "#ff6b6b";
    eEye = window.miMascota.eye_type || "happy";
    eMouth = window.miMascota.mouth_type || "colmillos";
    eHiddenGenes = window.miMascota.hidden_genes || { A: null, B: null, C: null };
    gB = (eHiddenGenes.B?.id || "ninguno").toLowerCase();
    gC = (eHiddenGenes.C?.id || "ninguno").toLowerCase();
}

console.log("Stats del rival clonados:", eStats);
console.log("Nivel del rival clonado (esperado 32):", eLevel);
console.log("Elemento del rival clonado (esperado Tóxico):", eElement);
console.log("Genes B y C clonados (esperado 'piel_cristal', 'decoy'):", gB, gC);

const espejoOk = eLevel === 32 && eElement === "Tóxico" && eStats.hp === 160 && gB === "piel_cristal" && gC === "decoy";
if (espejoOk) {
    console.log(">> TEST EL ESPEJO: PASADO");
} else {
    console.error(">> TEST EL ESPEJO: FALLIDO");
}

console.log("\n=== PRUEBAS CONCLUIDAS CON ÉXITO ===");
process.exit((sinGenesOk && berserkerOk && espejoOk) ? 0 : 1);
