// =========================================
// ColiseumLogic.js - MODELO MATEMÁTICO V14.9 (NERF AL PERFORANTE - BALANCE)
// =========================================

window.ColiseumLogic = {
    player: null,
    enemy: null,
    turno: 1,
    modoCombate: 'estandar', // 'estandar', 'clon', 'desafio'
    npcDesafio: 'cyborg',    // 'cyborg', 'viral', 'sintetico',
    trainingSupportActive: false,

    cName: function(fighter) {
        const color = fighter.isPlayer ? "#4dd0e1" : "#ff6b6b";
        return `<span style="color:${color}; font-weight:bold;">${fighter.nombre}</span>`;
    },

    generarNombreAleatorio: function() {
        const prefijos = ["Nex", "Crio", "Bio", "Zar", "Vor", "Kael", "Lum", "Pyro", "Grav", "Aero", "Tox", "Muta", "Viro"];
        const sufijos = ["core", "morph", "tron", "lith", "pex", "byte", "spark", "fang", "claw", "pulse", "shade", "vibe", "gen"];
        return prefijos[Math.floor(Math.random() * prefijos.length)] + sufijos[Math.floor(Math.random() * sufijos.length)];
    },

    buscarAtaquePorNombre: function(nombreItem) {
        if (!nombreItem || !window.AttackCatalog) return null;
        let nomNormalizado = nombreItem.replace(/💿/g, "").replace(/MT /gi, "").replace(/\n/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
        let catalogoAUsar = window.AttackCatalog.ataquesPorElemento || window.AttackCatalog.movimientos;
        if (!catalogoAUsar) return null;

        for (const el in catalogoAUsar) {
            const ramas = catalogoAUsar[el];
            for (const cat in ramas) {
                let encontrado = ramas[cat].find(a => nomNormalizado.includes(a.nombre.toLowerCase()) || a.nombre.toLowerCase().includes(nomNormalizado));
                if (encontrado) return { ...encontrado, elemento: el };
            }
        }
        return null;
    },

    obtenerAtaqueAleatorio: function(elemento, categoria) {
        if (!window.AttackCatalog) return null;
        let catalogoAUsar = window.AttackCatalog.ataquesPorElemento || window.AttackCatalog.movimientos;
        if (!catalogoAUsar || !catalogoAUsar[elemento]) return null;
        const lista = catalogoAUsar[elemento][categoria];
        if (!lista || lista.length === 0) return null;
        return { ...lista[Math.floor(Math.random() * lista.length)], elemento: elemento };
    },

    generarRivalProcedural: function(nivelJugador, esJefeDeLiga = false) {
        if (this.modoCombate === '3v3') {
            const raritiesOrder = { "Común": 1, "Raro": 2, "Épico": 3, "Legendario": 4, "Mítico": 5 };
            let maxRarityVal = 0;
            let maxRarity = "Común";
            let maxLevel = 1;

            this.playerTeam.forEach(fighter => {
                const rareza = fighter.rareza || "Común";
                const val = raritiesOrder[rareza] || 1;
                if (val > maxRarityVal) {
                    maxRarityVal = val;
                    maxRarity = rareza;
                }
                if (fighter.adn.level > maxLevel) {
                    maxLevel = fighter.adn.level;
                }
            });

            this.enemyTeam = [];
            for (let i = 0; i < 3; i++) {
                const rivalGeno = this.crearRivalObjeto(maxLevel, maxRarity, esJefeDeLiga && i === 2);
                this.enemyTeam.push(rivalGeno);
            }
            this.enemyActiveIndex = 0;
            this.enemy = this.enemyTeam[0];
            return;
        }

        if (this.modoCombate === "clon") {
            if (!window.miMascota) return;
            const mascota = window.miMascota;
            
            let pElemento = (mascota.genes && mascota.genes.afinidad) ? mascota.genes.afinidad.dom : (mascota.element || "Normal");
            const overrideEl = this.clonElementoOverride || "mismo";
            if (overrideEl !== "mismo") {
                pElemento = overrideEl;
            }
            
            const pStats = {
                hp: mascota.stats?.hp || 80,
                atk: mascota.stats?.atk || 15,
                def: mascota.stats?.def || 5,
                spd: mascota.stats?.spd || 15,
                luk: mascota.stats?.luk || 10
            };
            
            let pGenB = (mascota.hidden_genes?.B?.id || "ninguno").toLowerCase(); 
            let pGenC = (mascota.hidden_genes?.C?.id || "ninguno").toLowerCase();
            
            let cloneAtaques = {};
            if (overrideEl === "mismo") {
                let pAtks = mascota.ataques || {};
                cloneAtaques = {
                    "ataque": this.obtenerAtaqueAleatorio(pElemento, "basicos"),
                    "especial": pAtks.atk_2 ? this.buscarAtaquePorNombre(pAtks.atk_2.nombre) : null,
                    "tactica": pAtks.atk_3 ? this.buscarAtaquePorNombre(pAtks.atk_3.nombre) : null,
                    "definitivo": pAtks.atk_4 ? this.buscarAtaquePorNombre(pAtks.atk_4.nombre) : null
                };
            } else {
                cloneAtaques = {
                    "ataque": this.obtenerAtaqueAleatorio(pElemento, "basicos"),
                    "especial": this.obtenerAtaqueAleatorio(pElemento, "especiales"),
                    "tactica": this.obtenerAtaqueAleatorio(pElemento, "soportes"),
                    "definitivo": this.obtenerAtaqueAleatorio(pElemento, "definitivos")
                };
            }

            const cloneAdn = JSON.parse(JSON.stringify(mascota));
            cloneAdn.id = mascota.id + "_clon";
            cloneAdn.name = "Clon de " + (mascota.name || "Geno");
            cloneAdn.element = pElemento;
            cloneAdn.iftttRules = JSON.parse(JSON.stringify(mascota.iftttRules || []));

            this.enemy = {
                nombre: "Clon de " + (mascota.name || "Geno"),
                isPlayer: false,
                adn: cloneAdn,
                maxHp: mascota.maxHp || pStats.hp,
                hp: mascota.maxHp || pStats.hp,
                atk: pStats.atk,
                def: pStats.def || 5,
                spd: pStats.spd,
                luk: pStats.luk,
                baseAtk: pStats.atk,
                baseDef: pStats.def || 5,
                baseSpd: pStats.spd,
                baseLuk: pStats.luk,
                element: pElemento,
                rareza: mascota.rarity || mascota.rareza || "Común",
                genesId: [pGenB, pGenC],
                estados: [],
                efectosActivos: [],
                cooldowns: { especial: 0, tactica: 0, definitivo: 0 },
                escudoCibernetico: pElemento === "Cibernético", 
                crystalSkin: pGenB === "piel_cristal" || pGenC === "piel_cristal",
                decoyUsado: false,
                coreArUsado: false,
                rachaGolpes: 0,
                adaptativaStacks: 0,
                ultimoElementoRecibido: null,
                danoRecibidoEsteTurno: 0,
                danoRecibidoTurnoAnterior: 0,
                proxVenenoDoble: false,
                ataquesEquipados: cloneAtaques
            };
            return;
        }

        if (this.modoCombate === "desafio") {
            const npc = this.npcDesafio || "cyborg";
            const L = this.npcNivelOverride || 25;
            const scale = L / 25;

            let npcName = "Cyborg Defensivo";
            let npcElement = "Cibernético";
            let npcRareza = "Épico";
            let npcStats25 = { hp: 240, atk: 35, def: 45, spd: 25, luk: 20 };
            let npcAttacks = {};
            let npcRules = [];
            let npcGenB = "armadura_adaptativa";
            let npcGenC = "nucleo_coraza";

            if (npc === "cyborg") {
                npcName = "Cyborg Defensivo";
                npcElement = "Cibernético";
                npcStats25 = { hp: 240, atk: 35, def: 45, spd: 25, luk: 20 };
                npcGenB = "armadura_adaptativa";
                npcGenC = "nucleo_coraza";
                npcAttacks = {
                    "ataque": this.buscarAtaquePorNombre("Láser de Precisión"),
                    "especial": this.buscarAtaquePorNombre("Descarga en Cadena"),
                    "tactica": this.buscarAtaquePorNombre("Protocolo de Escudo"),
                    "definitivo": null
                };
                npcRules = [
                    { condition: "hp_under_30", action: "tactica" },
                    { condition: "always", action: "especial" }
                ];
            } else if (npc === "viral") {
                npcName = "Infeccioso Viral";
                npcElement = "Viral";
                npcStats25 = { hp: 220, atk: 45, def: 30, spd: 40, luk: 20 };
                npcGenB = "vampirismo_genetico";
                npcGenC = "esquiva_genetica";
                npcAttacks = {
                    "ataque": this.buscarAtaquePorNombre("Descarga Viral"),
                    "especial": this.buscarAtaquePorNombre("Infección Aguda"),
                    "tactica": this.buscarAtaquePorNombre("Niebla Viral"),
                    "definitivo": this.buscarAtaquePorNombre("Pandemia Global")
                };
                npcRules = [
                    { condition: "turn_1", action: "especial" },
                    { condition: "rival_infected", action: "definitivo" },
                    { condition: "always", action: "tactica" }
                ];
            } else if (npc === "sintetico") {
                npcName = "Rápido Sintético";
                npcElement = "Sintético";
                npcStats25 = { hp: 200, atk: 40, def: 25, spd: 55, luk: 35 };
                npcGenB = "velocidad_fantasma";
                npcGenC = "reflejo_genetico";
                npcAttacks = {
                    "ataque": this.buscarAtaquePorNombre("Ráfaga Sintética"),
                    "especial": this.buscarAtaquePorNombre("Impacto Total"),
                    "tactica": this.buscarAtaquePorNombre("Aceleración Sintética"),
                    "definitivo": null
                };
                npcRules = [
                    { condition: "self_buffed_spd", action: "especial" },
                    { condition: "always", action: "tactica" }
                ];
            } else if (npc === "biomutante") {
                npcName = "Titán Biomutante";
                npcElement = "Biomutante";
                npcStats25 = { hp: 260, atk: 30, def: 40, spd: 20, luk: 25 };
                npcGenB = "postura_inquebrantable";
                npcGenC = "resiliencia_ultima";
                npcAttacks = {
                    "ataque": this.buscarAtaquePorNombre("Pulso Vital"),
                    "especial": this.buscarAtaquePorNombre("Espinas Óseas"),
                    "tactica": this.buscarAtaquePorNombre("Espora Curativa"),
                    "definitivo": this.buscarAtaquePorNombre("Ira de la Naturaleza")
                };
                npcRules = [
                    { condition: "hp_under_50", action: "tactica" },
                    { condition: "always", action: "definitivo" }
                ];
            } else if (npc === "radiactivo") {
                npcName = "Radiador Mutado";
                npcElement = "Radiactivo";
                npcStats25 = { hp: 210, atk: 50, def: 25, spd: 30, luk: 20 };
                npcGenB = "frenesi";
                npcGenC = "vampirismo_genetico";
                npcAttacks = {
                    "ataque": this.buscarAtaquePorNombre("Proyectil Radiactivo"),
                    "especial": this.buscarAtaquePorNombre("Explosión Nuclear"),
                    "tactica": this.buscarAtaquePorNombre("Campo Radioactivo"),
                    "definitivo": this.buscarAtaquePorNombre("Crítico Nuclear")
                };
                npcRules = [
                    { condition: "turn_1", action: "tactica" },
                    { condition: "always", action: "especial" }
                ];
            } else if (npc === "toxico") {
                npcName = "Tóxico Mutante";
                npcElement = "Tóxico";
                npcStats25 = { hp: 230, atk: 30, def: 35, spd: 25, luk: 20 };
                npcGenB = "piel_cristal";
                npcGenC = "barrera_limite";
                npcAttacks = {
                    "ataque": this.buscarAtaquePorNombre("Colmillo Venenoso"),
                    "especial": this.buscarAtaquePorNombre("Corrosión de Ácido"),
                    "tactica": this.buscarAtaquePorNombre("Nube Tóxica"),
                    "definitivo": this.buscarAtaquePorNombre("Plaga Final")
                };
                npcRules = [
                    { condition: "rival_infected", action: "definitivo" },
                    { condition: "always", action: "especial" }
                ];
            }

            const npcStats = {
                hp: Math.max(10, Math.round(npcStats25.hp * scale)),
                atk: Math.max(1, Math.round(npcStats25.atk * scale)),
                def: Math.max(1, Math.round(npcStats25.def * scale)),
                spd: Math.max(1, Math.round(npcStats25.spd * scale)),
                luk: Math.max(1, Math.round(npcStats25.luk * scale))
            };

            const npcAdn = {
                id: "npc_" + npc + "_" + Date.now(),
                name: npcName,
                rarity: npcRareza,
                element: npcElement,
                level: L,
                iftttRules: npcRules,
                body_shape: "gota",
                color: npc === "cyborg" ? "#ff8c00" : 
                       (npc === "viral" ? "#00acc1" : 
                       (npc === "sintetico" ? "#8A2BE2" : 
                       (npc === "biomutante" ? "#4CAF50" : 
                       (npc === "radiactivo" ? "#E65100" : "#9C27B0")))),
                eye_type: "cibernetico",
                mouth_type: "colmillos",
                wing_type: "ninguno",
                hat_type: "ninguno",
                stats: npcStats
            };

            this.enemy = {
                nombre: npcName,
                isPlayer: false,
                adn: npcAdn,
                maxHp: npcStats.hp,
                hp: npcStats.hp,
                atk: npcStats.atk,
                def: npcStats.def,
                spd: npcStats.spd,
                luk: npcStats.luk,
                baseAtk: npcStats.atk,
                baseDef: npcStats.def,
                baseSpd: npcStats.spd,
                baseLuk: npcStats.luk,
                element: npcElement,
                rareza: npcRareza,
                genesId: [npcGenB, npcGenC],
                estados: [],
                efectosActivos: [],
                cooldowns: { especial: 0, tactica: 0, definitivo: 0 },
                escudoCibernetico: npcElement === "Cibernético",
                crystalSkin: false,
                decoyUsado: false,
                coreArUsado: false,
                rachaGolpes: 0,
                adaptativaStacks: 0,
                ultimoElementoRecibido: null,
                danoRecibidoEsteTurno: 0,
                danoRecibidoTurnoAnterior: 0,
                proxVenenoDoble: false,
                ataquesEquipados: npcAttacks
            };
            return;
        }

        let roll = Math.random();
        let pRareza = this.player ? (this.player.rareza || this.player.rarity || "Común") : "Común";
        let eRareza = "Común";

        if (esJefeDeLiga) {
            if (pRareza === "Común") {
                eRareza = "Raro";
            } else if (pRareza === "Raro") {
                eRareza = "Épico";
            } else if (pRareza === "Épico") {
                eRareza = "Legendario";
            } else {
                eRareza = "Legendario";
            }
        } else {
            eRareza = pRareza;
        }
        
        this.trainingSupportActive = (nivelJugador < 5);

        const eStats = window.generarStatsPorRareza ? window.generarStatsPorRareza(eRareza) : {hp: 120, atk: 12, def: 8, spd: 10, luk: 5};
        
        let rollCalidad = Math.random();
        let purezaEnemigo = 60; 
        
        if (rollCalidad < 0.25) purezaEnemigo = 95; 
        else if (rollCalidad < 0.65) purezaEnemigo = 85; 
        else if (rollCalidad < 0.90) purezaEnemigo = 70; 
        else purezaEnemigo = 40; 

        eStats.pureza = purezaEnemigo;
        
        let bonoPureza = purezaEnemigo >= 90 ? 4 : (purezaEnemigo >= 80 ? 3 : (purezaEnemigo >= 60 ? 1 : 0));
        if (this.trainingSupportActive) {
            bonoPureza = 0; // Sin bono de pureza adicional para rivales de bajo nivel
        } else if (nivelJugador <= 8) {
            bonoPureza = Math.floor(bonoPureza / 2);
        }

        eStats.hp += bonoPureza * 3; eStats.atk += bonoPureza; eStats.def += bonoPureza; eStats.spd += bonoPureza; eStats.luk += bonoPureza;

        let nivelEnemigo = this.trainingSupportActive 
            ? (nivelJugador + (esJefeDeLiga ? 2 : 0)) 
            : (nivelJugador + (esJefeDeLiga ? 5 : 3));
        if (nivelEnemigo < 1) nivelEnemigo = 1;

        if (this.trainingSupportActive) {
            // Debilitar stats base un 15% para dar ventaja de entrenamiento
            eStats.hp = Math.max(10, Math.round(eStats.hp * 0.85));
            eStats.atk = Math.max(2, Math.round(eStats.atk * 0.85));
            eStats.def = Math.max(1, Math.round(eStats.def * 0.85));
            eStats.spd = Math.max(2, Math.round(eStats.spd * 0.85));
        }

        // Multiplicador +20% HP/ATK para Jefes de nivel Legendario/Mítico
        if (esJefeDeLiga && (pRareza === "Legendario" || pRareza === "Mítico")) {
            eStats.hp = Math.round(eStats.hp * 1.2);
            eStats.atk = Math.round(eStats.atk * 1.2);
        }

        const elementos = ["Biomutante", "Viral", "Cibernético", "Radiactivo", "Tóxico", "Sintético"];
        const eElemento = elementos[Math.floor(Math.random() * elementos.length)];
        
        let eHiddenGenes = {A: null, B: null, C: null};
        if (typeof window.generarGenesV9 === 'function') eHiddenGenes = window.generarGenesV9(eRareza);
        let gB = (eHiddenGenes.B?.id || "ninguno").toLowerCase();
        let gC = (eHiddenGenes.C?.id || "ninguno").toLowerCase();
        const genesEnemigo = [gB, gC];

        let pesos = { hp: 20, atk: 20, def: 20, spd: 20, luk: 20 };
        if (eElemento === "Biomutante") { pesos.hp += 40; pesos.def += 20; pesos.spd -= 10; }
        else if (eElemento === "Sintético") { pesos.spd += 40; pesos.luk += 30; pesos.def -= 10; }
        else if (eElemento === "Cibernético") { pesos.def += 40; pesos.atk += 20; pesos.luk -= 10; }
        else if (eElemento === "Viral") { pesos.spd += 25; pesos.atk += 25; pesos.hp += 10; }
        else if (eElemento === "Radiactivo") { pesos.atk += 40; pesos.hp += 20; pesos.def -= 10; }
        else if (eElemento === "Tóxico") { pesos.hp += 30; pesos.def += 30; pesos.atk -= 10; }

        if (genesEnemigo.includes("velocidad_fantasma") || genesEnemigo.includes("esquiva_genetica")) pesos.spd += 50;
        if (genesEnemigo.includes("vampirismo_genetico") || genesEnemigo.includes("instinto_caza") || genesEnemigo.includes("ruptura_defensiva")) pesos.atk += 50;
        if (genesEnemigo.includes("armadura_adaptativa") || genesEnemigo.includes("postura_inquebrantable") || genesEnemigo.includes("nucleo_coraza")) pesos.def += 50;
        if (genesEnemigo.includes("resiliencia_ultima") || genesEnemigo.includes("frenesi") || genesEnemigo.includes("barrera_limite")) { pesos.hp += 40; pesos.atk += 20; }
        if (genesEnemigo.includes("reflejo_genetico")) pesos.luk += 50;

        for (let stat in pesos) if (pesos[stat] < 1) pesos[stat] = 1;

        let bolsaStats = [];
        for (let stat in pesos) for (let i = 0; i < pesos[stat]; i++) bolsaStats.push(stat);

        let puntosExtra = (nivelEnemigo > 1) ? (nivelEnemigo - 1) * 3 : 0;
        for(let i=0; i<puntosExtra; i++) {
            let rStat = bolsaStats[Math.floor(Math.random() * bolsaStats.length)];
            if(rStat === 'hp') eStats.hp += 5; else eStats[rStat] += 1;
        }
            
        const formas = ["gota", "frijol", "circulo", "cuadrado", "triangulo", "hongo", "estrella", "pentagono", "nube", "chili", "diamante"];
        const colores = ["#ff6b6b", "#4dd0e1", "#fdfd96", "#b19cd9", "#77DD77", "#ff9800", "#ffb347", "#a8e6cf"];
        const opcionesOjos = typeof dicOjos !== 'undefined' ? Object.keys(dicOjos) : ["estandar", "cute", "angry", "cibernetico", "alien", "ojeras"];
        const opcionesBocas = typeof dicBocas !== 'undefined' ? Object.keys(dicBocas) : ["estandar", "feliz", "colmillos", "abierta", "sorpresa", "lengua"];
        
        const opcionesSombreros = typeof dicSombreros !== 'undefined' ? Object.keys(dicSombreros).filter(k => k !== "ninguno") : ["gorra", "corona", "casco", "cinta"];
        const opcionesAlas = typeof dicAlas !== 'undefined' ? Object.keys(dicAlas).filter(k => k !== "ninguno") : ["alas_angel", "alas_murcielago", "jetpack", "capa"];
        const opcionesGafas = typeof dicGafas !== 'undefined' ? Object.keys(dicGafas).filter(k => k !== "ninguno") : ["lentes", "parche", "visor", "monoculo"];
        const opcionesExtras = typeof dicExtras !== 'undefined' ? Object.keys(dicExtras).filter(k => k !== "ninguno") : ["bufanda", "collar", "auriculares", "corbata"];

        let probBase = eRareza === "Legendario" ? 0.85 : (eRareza === "Épico" ? 0.65 : (eRareza === "Raro" ? 0.40 : 0.15));
        let cantidadAccesorios = 0;

        if (Math.random() < probBase) {
            cantidadAccesorios = 1;
            let probExtra = probBase * 0.6; 
            if (Math.random() < probExtra) {
                cantidadAccesorios = 2;
                if (Math.random() < (probExtra * 0.5)) { 
                    cantidadAccesorios = 3;
                    if (Math.random() < (probExtra * 0.25)) cantidadAccesorios = 4; 
                }
            }
        }

        let eHat = "ninguno", eWing = "ninguno", eGlasses = "ninguno", eExtra = "ninguno";
        if (cantidadAccesorios > 0) {
            let slotsDisponibles = ["hat", "wing", "glasses", "extra"].sort(() => 0.5 - Math.random()).slice(0, cantidadAccesorios);
            if (slotsDisponibles.includes("hat") && opcionesSombreros.length > 0) eHat = opcionesSombreros[Math.floor(Math.random() * opcionesSombreros.length)];
            if (slotsDisponibles.includes("wing") && opcionesAlas.length > 0) eWing = opcionesAlas[Math.floor(Math.random() * opcionesAlas.length)];
            if (slotsDisponibles.includes("glasses") && opcionesGafas.length > 0) eGlasses = opcionesGafas[Math.floor(Math.random() * opcionesGafas.length)];
            if (slotsDisponibles.includes("extra") && opcionesExtras.length > 0) eExtra = opcionesExtras[Math.floor(Math.random() * opcionesExtras.length)];
        }

        const adn = { 
            id: 888, scanned: true, rarity: eRareza, stats: eStats, element: eElemento,
            body_shape: formas[Math.floor(Math.random() * formas.length)], color: colores[Math.floor(Math.random() * colores.length)],
            eye_type: opcionesOjos[Math.floor(Math.random() * opcionesOjos.length)], mouth_type: opcionesBocas[Math.floor(Math.random() * opcionesBocas.length)], 
            wing_type: eWing, hat_type: eHat, glasses_type: eGlasses, extra_type: eExtra,
            hidden_genes: eHiddenGenes, level: nivelEnemigo
        };

        let pAtks = window.miMascota && window.miMascota.ataques ? window.miMascota.ataques : {};
        
        const counterDelJugador = { "Biomutante": "Viral", "Sintético": "Biomutante", "Tóxico": "Sintético", "Radiactivo": "Tóxico", "Cibernético": "Radiactivo", "Viral": "Cibernético" };
        let pElement = this.player ? this.player.element : "Normal";
        let elementoCounter = counterDelJugador[pElement] || eElemento;

        let atkEsp = pAtks.atk_2 ? this.obtenerAtaqueAleatorio(eElemento, "especiales") : null;
        let atkTac = pAtks.atk_3 ? this.obtenerAtaqueAleatorio(eElemento, "soportes") : null;

        if (pAtks.atk_2 && pAtks.atk_3) {
            if (Math.random() < 0.5) atkEsp = this.obtenerAtaqueAleatorio(elementoCounter, "especiales");
            else atkTac = this.obtenerAtaqueAleatorio(elementoCounter, "soportes");
        } else if (pAtks.atk_2) atkEsp = this.obtenerAtaqueAleatorio(elementoCounter, "especiales");

        let enemyAtaques = {
            "ataque": this.obtenerAtaqueAleatorio(eElemento, "basicos"),
            "especial": atkEsp, "tactica": atkTac,
            "definitivo": (pAtks.atk_4 && nivelEnemigo >= 25) ? this.obtenerAtaqueAleatorio(eElemento, "definitivos") : null
        };
        
        this.enemy = {
            nombre: (esJefeDeLiga ? "[JEFE] " : "") + this.generarNombreAleatorio(), isPlayer: false, adn: adn,
            maxHp: eStats.hp, hp: eStats.hp, atk: eStats.atk, def: eStats.def || 5, spd: eStats.spd, luk: eStats.luk,
            baseAtk: eStats.atk, baseDef: eStats.def || 5, baseSpd: eStats.spd, baseLuk: eStats.luk,
            element: eElemento, rareza: eRareza, genesId: genesEnemigo,
            estados: [], efectosActivos: [], cooldowns: { especial: 0, tactica: 0, definitivo: 0 },
            escudoCibernetico: eElemento === "Cibernético", 
            crystalSkin: gB === "piel_cristal" || gC === "piel_cristal",
            decoyUsado: false, coreArUsado: false, rachaGolpes: 0, adaptativaStacks: 0, ultimoElementoRecibido: null,
            danoRecibidoEsteTurno: 0, danoRecibidoTurnoAnterior: 0, proxVenenoDoble: false,
            ataquesEquipados: enemyAtaques,
            esJefeDeLiga: esJefeDeLiga
        };
    },

    prepararJugador: function(mascota) {
        const isSinGenes = window.TournamentManager && window.TournamentManager.activeTournament && window.TournamentManager.activeTournament.config && window.TournamentManager.activeTournament.config.id === "sin_genes";

        if (this.modoCombate === '3v3') {
            const teamGenos = (this.playerTeamIds || []).map(id => window.misGenos.find(g => String(g.id) === String(id))).filter(Boolean);
            if (teamGenos.length === 3) {
                this.playerTeam = teamGenos.map(m => {
                    const pElemento = (m.genes && m.genes.afinidad) ? m.genes.afinidad.dom : (m.element || "Normal");
                    const pStats = { hp: m.stats?.hp || 80, atk: m.stats?.atk || 15, def: m.stats?.def || 5, spd: m.stats?.spd || 15, luk: m.stats?.luk || 10 };
                    
                    if (window.isGenoHappy && window.isGenoHappy(m)) {
                        pStats.luk += 25;
                    }

                    let pGenB = (m.hidden_genes?.B?.id || "ninguno").toLowerCase(); 
                    let pGenC = (m.hidden_genes?.C?.id || "ninguno").toLowerCase();
                    
                    let pAtks = m.ataques || {};
                    let playerAtaques = {
                        "ataque": this.obtenerAtaqueAleatorio(pElemento, "basicos"),
                        "especial": pAtks.atk_2 ? this.buscarAtaquePorNombre(pAtks.atk_2.nombre) : null,
                        "tactica": pAtks.atk_3 ? this.buscarAtaquePorNombre(pAtks.atk_3.nombre) : null,
                        "definitivo": pAtks.atk_4 ? this.buscarAtaquePorNombre(pAtks.atk_4.nombre) : null
                    };

                    return {
                        nombre: m.alias || m.apodo || m.nombre || m.name || "Tu Geno", 
                        isPlayer: true, adn: m,
                        maxHp: m.maxHp || pStats.hp, hp: m.hp || pStats.hp, atk: pStats.atk, def: pStats.def, spd: pStats.spd, luk: pStats.luk,
                        baseAtk: pStats.atk, baseDef: pStats.def, baseSpd: pStats.spd, baseLuk: pStats.luk,
                        element: pElemento, rareza: m.rarity || m.rareza || "Común", genesId: isSinGenes ? ["ninguno", "ninguno"] : [pGenB, pGenC], 
                        estados: [], efectosActivos: [], cooldowns: { especial: 0, tactica: 0, definitivo: 0 },
                        escudoCibernetico: pElemento === "Cibernético", 
                        crystalSkin: isSinGenes ? false : (pGenB === "piel_cristal" || pGenC === "piel_cristal"),
                        decoyUsado: false, coreArUsado: false, rachaGolpes: 0, adaptativaStacks: 0, ultimoElementoRecibido: null,
                        danoRecibidoEsteTurno: 0, danoRecibidoTurnoAnterior: 0, proxVenenoDoble: false,
                        ataquesEquipados: playerAtaques
                    };
                });
                this.playerActiveIndex = 0;
                this.player = this.playerTeam[0];
                this.turno = 1;
                return;
            }
        }

        const pElemento = (mascota.genes && mascota.genes.afinidad) ? mascota.genes.afinidad.dom : (mascota.element || "Normal");
        const pStats = { hp: mascota.stats?.hp || 80, atk: mascota.stats?.atk || 15, def: mascota.stats?.def || 5, spd: mascota.stats?.spd || 15, luk: mascota.stats?.luk || 10 };
        
        // Bonus de Estado Óptimo (>80% en todas las necesidades)
        if (window.isGenoHappy && window.isGenoHappy(mascota)) {
            pStats.luk += 25;
        }

        let pGenB = (mascota.hidden_genes?.B?.id || "ninguno").toLowerCase(); 
        let pGenC = (mascota.hidden_genes?.C?.id || "ninguno").toLowerCase();
        
        let pAtks = mascota.ataques || {};
        let playerAtaques = {
            "ataque": this.obtenerAtaqueAleatorio(pElemento, "basicos"),
            "especial": pAtks.atk_2 ? this.buscarAtaquePorNombre(pAtks.atk_2.nombre) : null,
            "tactica": pAtks.atk_3 ? this.buscarAtaquePorNombre(pAtks.atk_3.nombre) : null,
            "definitivo": pAtks.atk_4 ? this.buscarAtaquePorNombre(pAtks.atk_4.nombre) : null
        };

        this.player = {
            nombre: mascota.alias || mascota.apodo || mascota.nombre || mascota.name || "Tu Geno", 
            isPlayer: true, adn: mascota,
            maxHp: mascota.maxHp || pStats.hp, hp: mascota.hp || pStats.hp, atk: pStats.atk, def: pStats.def, spd: pStats.spd, luk: pStats.luk,
            baseAtk: pStats.atk, baseDef: pStats.def, baseSpd: pStats.spd, baseLuk: pStats.luk,
            element: pElemento, rareza: mascota.rarity || mascota.rareza || "Común", genesId: isSinGenes ? ["ninguno", "ninguno"] : [pGenB, pGenC], 
            estados: [], efectosActivos: [], cooldowns: { especial: 0, tactica: 0, definitivo: 0 },
            escudoCibernetico: pElemento === "Cibernético", 
            crystalSkin: isSinGenes ? false : (pGenB === "piel_cristal" || pGenC === "piel_cristal"),
            decoyUsado: false, coreArUsado: false, rachaGolpes: 0, adaptativaStacks: 0, ultimoElementoRecibido: null,
            danoRecibidoEsteTurno: 0, danoRecibidoTurnoAnterior: 0, proxVenenoDoble: false,
            ataquesEquipados: playerAtaques
        };
        this.turno = 1;
    },

    ejecutarAtaqueCompleto: function(atacante, defensor, slotAccion) {
        let logs = [];
        let anims = { atacanteGrita: true, danoDefensor: 0, critico: false, curacionAtacante: 0, danoReflejo: 0, multElem: 1, detalleGolpes: [] };
        
        let ataqueReal = atacante.ataquesEquipados[slotAccion];
        if (!ataqueReal) {
            logs.push(`<span style="color:#888;">> ${this.cName(atacante)} intenta atacar pero tropieza.</span>`);
            return { logs, anims };
        }

        if (ataqueReal.costoHp) {
            let selfDmg = Math.floor(atacante.maxHp * ataqueReal.costoHp);
            atacante.hp = Math.max(0, atacante.hp - selfDmg);
            logs.push(`<span style="color:#ff3333">🩸 ${this.cName(atacante)} sacrifica ${selfDmg} HP para potenciar su cuerpo.</span>`);
        }

        if (slotAccion === "definitivo" && defensor.genesId.includes("ults_counter")) {
            let buffAtk = Math.floor(defensor.baseAtk * 0.30);
            defensor.atk += buffAtk;
            defensor.efectosActivos.push({ nombre: "Contra-Golpe", stat: "atk", valor: buffAtk, turnos: 2, isNuevo: true });
            logs.push(`<span style="color:#ff3333">🔥 🧬 [Gen Oculto: Contra-Golpe] ¡${this.cName(defensor)} gana +30% ATK por la adrenalina del Definitivo!</span>`);
        }

        if (slotAccion === "especial") {
            atacante.cooldowns.especial = 3;
            logs.push(`<span style="color:#e040fb">> ¡${this.cName(atacante)} usa [${ataqueReal.nombre}]!</span>`);
            if(ataqueReal.descripcion) logs.push(`<span style="color:#ce93d8; font-style:italic;">* Info: ${ataqueReal.descripcion}</span>`);
        } else if (slotAccion === "definitivo") {
            atacante.cooldowns.definitivo = 5;
            logs.push(`<span style="color:#ff0000; font-weight:bold; text-transform:uppercase;">> ¡${this.cName(atacante)} desata [${ataqueReal.nombre}]!</span>`);
            if(ataqueReal.descripcion) logs.push(`<span style="color:#ff8a80; font-style:italic;">* Info: ${ataqueReal.descripcion}</span>`);
        } else if (slotAccion === "tactica") {
            atacante.cooldowns.tactica = 4;
            logs.push(`<span style="color:#26a69a">> ¡${this.cName(atacante)} prepara [${ataqueReal.nombre}]!</span>`);
            if(ataqueReal.descripcion) logs.push(`<span style="color:#80cbc4; font-style:italic;">* Efecto: ${ataqueReal.descripcion}</span>`);
        }

        let potenciaAtaque = ataqueReal.potencia || ataqueReal.potenciaBase || 0;

        let buffDanoActivo = atacante.efectosActivos.find(ef => ef.stat === "buffDanoExtra");
        if (buffDanoActivo) {
            potenciaAtaque = Math.floor(potenciaAtaque * (1 + buffDanoActivo.valor));
            atacante.efectosActivos = atacante.efectosActivos.filter(ef => ef !== buffDanoActivo); 
            logs.push(`<span style="color:#ce93d8;">💥 ¡El ataque fue potenciado masivamente!</span>`);
        }

        if (ataqueReal.escalaConHP) {
            let pctHP = atacante.hp / atacante.maxHp;
            if (pctHP > 0.70) potenciaAtaque += Math.floor((pctHP - 0.70) * 100);
        }
        if (ataqueReal.bonusPorEstado) potenciaAtaque += (defensor.estados.length * ataqueReal.bonusPorEstado);
        if (ataqueReal.requiereEstado && defensor.estados.includes(ataqueReal.requiereEstado)) potenciaAtaque *= (ataqueReal.bonusMultiplicador || 1);
        if (ataqueReal.bonusContraEstado && defensor.estados.includes(ataqueReal.bonusContraEstado)) potenciaAtaque *= (ataqueReal.multiplier || 1);
        if (ataqueReal.bonusSiPrimero && (atacante.spd >= defensor.spd)) potenciaAtaque = ataqueReal.bonusSiPrimero;
        if (ataqueReal.duplicaSiguienteVeneno) atacante.proxVenenoDoble = true;

        if (ataqueReal.reactivo) {
            let danoPrevio = atacante.danoRecibidoEsteTurno > 0 ? atacante.danoRecibidoEsteTurno : (atacante.danoRecibidoTurnoAnterior || 0);
            let dmgDevuelto = Math.floor(danoPrevio * ataqueReal.reactivo);
            
            if (dmgDevuelto > 0) {
                defensor.hp = Math.max(0, defensor.hp - dmgDevuelto);
                anims.danoDefensor += dmgDevuelto;
                anims.detalleGolpes.push({ dmg: dmgDevuelto, critico: false, bloqueado: false, evadido: false });
                logs.push(`> ⚡ [Contrarrestar] ¡${this.cName(atacante)} devuelve el impacto y causa <span style="color:#ff6b6b; font-weight:bold;">${dmgDevuelto} de daño puro</span>!`);

                if (atacante.genesId.includes("vampirismo_genetico")) {
                    let roboVida = Math.max(1, Math.floor(dmgDevuelto * 0.15));
                    atacante.hp = Math.min(atacante.maxHp, atacante.hp + roboVida);
                    anims.curacionAtacante += roboVida;
                    logs.push(`<span style="color:#e0b0ff">🦇 🧬 [Gen Oculto: Vampirismo] ${this.cName(atacante)} recupera ${roboVida} HP.</span>`);
                }
            } else {
                logs.push(`<span style="color:#888;">> ...pero ${this.cName(atacante)} no había recibido daño reciente. ¡El contraataque falla!</span>`);
            }
        }

        if (potenciaAtaque > 0 && potenciaAtaque < 10) potenciaAtaque = potenciaAtaque * 100; 

        if (ataqueReal.curacion) {
            let cura = Math.floor(atacante.maxHp * ataqueReal.curacion);
            atacante.hp = Math.min(atacante.maxHp, atacante.hp + Math.max(1, cura));
            anims.curacionAtacante += cura;
            logs.push(`<span style="color:#4CAF50">* ${this.cName(atacante)} recupera ${cura} HP.</span>`);
        }

        let buffHitGarantizado = atacante.efectosActivos.find(ef => ef.stat === "hit_garantizado");
        if (buffHitGarantizado) {
            ataqueReal.noFalla = true;
            atacante.efectosActivos = atacante.efectosActivos.filter(ef => ef !== buffHitGarantizado);
        }

        if (potenciaAtaque > 0) {
            let numGolpes = ataqueReal.hits || 1;
            if (atacante.genesId.includes("velocidad_fantasma") && Math.random() <= 0.20 && numGolpes === 1) {
                numGolpes = 2;
                logs.push(`<span style="color:#b19cd9">⚡ 🧬 [Gen Oculto: Velocidad Fantasma] ¡${this.cName(atacante)} ataca rápido dos veces!</span>`);
            }

            for(let i=0; i<numGolpes; i++) {
                if (defensor.hp <= 0) break;
                
                let golpeActual = { dmg: 0, critico: false, bloqueado: false, evadido: false };
                let atkBruto = atacante.atk * (potenciaAtaque / 75) * (0.85 + Math.random() * 0.3);
                
                const ventajas = { 
                    "Biomutante": "Sintético", "Sintético": "Tóxico", "Tóxico": "Radiactivo", 
                    "Radiactivo": "Cibernético", "Cibernético": "Viral", "Viral": "Biomutante" 
                };
                
                let multElem = ventajas[ataqueReal.elemento] === defensor.element ? 1.35 : (ventajas[defensor.element] === ataqueReal.elemento ? 0.75 : 1.0);
                let stab = (slotAccion !== "ataque" && atacante.element === ataqueReal.elemento && atacante.element !== defensor.element) ? 1.20 : 1.0;

                atkBruto = atkBruto * multElem * stab;
                anims.multElem = multElem;

                let precision = (ataqueReal.precision !== undefined) ? ataqueReal.precision : 1.0;
                if (ataqueReal.nombre === "Oleada Mutante" || ataqueReal.nombre === "Cañón Orbital") precision = 0.85;

                if (atacante.estados.includes("Visión Nublada") || atacante.estados.includes("Vision Nublada")) {
                    precision -= 0.25;
                }
                
                let penaltyAcc = atacante.efectosActivos.find(ef => ef.stat === "acc_penalty");
                if (penaltyAcc) precision -= penaltyAcc.valor;

                let evasionPasiva = 0;
                evasionPasiva += (defensor.spd * 0.004); 
                if (defensor.genesId.includes("esquiva_genetica")) evasionPasiva += 0.15; 
                evasionPasiva = Math.min(evasionPasiva, 0.40);

                let evasionTotal = evasionPasiva;
                let buffEvasion = defensor.efectosActivos.find(ef => ef.stat === "evasion");
                if (buffEvasion) evasionTotal += buffEvasion.valor; 
                evasionTotal = Math.min(evasionTotal, 0.85);

                let probHit = precision - evasionTotal;
                if (ataqueReal.noFalla || ataqueReal.nombre.includes("Láser de Precisión")) probHit = 2.0; 
                
                if (Math.random() > probHit) {
                    golpeActual.evadido = true;
                    atkBruto = 0; 
                    logs.push(`> <span style="color:#e0e0e0; font-style:italic;">💨 ¡${this.cName(defensor)} logró evadir el ataque!</span>`);
                    
                    if (buffEvasion && buffEvasion.nombre.includes("Esquiva Calculada")) {
                        let spdBoost = Math.floor(defensor.baseSpd * 0.10) || 1;
                        defensor.spd += spdBoost;
                        defensor.efectosActivos.push({ nombre: "Reflejos", stat: "spd", valor: spdBoost, turnos: 2, isNuevo: true });
                        logs.push(`<span style="color:#00e5ff">⚡ ¡Tras evadir, ${this.cName(defensor)} aumenta su Velocidad en +${spdBoost}!</span>`);
                    }
                }

                let defRival = defensor.def;
                if (window.TournamentManager && window.TournamentManager.activeTournament && window.TournamentManager.activeTournament.config && window.TournamentManager.activeTournament.config.id === "modo_berserker") {
                    defRival = 0;
                }

                if (ataqueReal.perforante || ataqueReal.rompeEscudos) {
                    if (ataqueReal.perforante && defensor.genesId.includes("decoy") && !defensor.decoyUsado && atkBruto > 0) {
                        defensor.decoyUsado = true;
                        atkBruto = 0; 
                        golpeActual.evadido = true;
                        logs.push(`<span style="color:#e0e0e0; font-style:italic;">💨 🧬 [Gen Oculto: Maestro del Engaño] ¡${this.cName(defensor)} evadió el golpe perforante!</span>`);
                    } else if (ataqueReal.perforante && defensor.genesId.includes("steadfast")) {
                        // Postura inquebrantable retiene el 80% de su defensa
                        defRival = Math.floor(defensor.def * 0.80); 
                        logs.push(`<span style="color:#80deea;">🛡️ 🧬 [Gen Oculto: Postura Inquebrantable] Absorbe parcialmente la perforación.</span>`);
                    } else {
                        // ✨ BALANCE V14.10: Escalado Inteligente de Penetración
                        if (ataqueReal.perforante) {
                            if (slotAccion === "definitivo") {
                                defRival = Math.floor(defRival * 0.35); // Retiene 35% -> IGNORA EL 65%
                            } else {
                                defRival = Math.floor(defRival * 0.50); // Retiene 50% -> IGNORA EL 50%
                            }
                        } else if (ataqueReal.rompeEscudos) {
                            let penetracion = (typeof ataqueReal.rompeEscudos === "number") ? ataqueReal.rompeEscudos : 0.50;
                            defRival = Math.floor(defRival * (1 - penetracion));
                        }
                    }
                }

                let minDmgMultiplier = atacante.genesId.includes("min_dmg") ? 0.35 : 0.25;
                let dmgMinimo = Math.floor(atkBruto * minDmgMultiplier);
                let dmg = Math.floor(Math.max(atkBruto - defRival, dmgMinimo));

                // Protocolo de Soporte de Entrenamiento (Nexo Acompañante)
                if (this.trainingSupportActive && atkBruto > 0) {
                    if (atacante.isPlayer) {
                        dmg = Math.floor(dmg * 1.15); // +15% daño infligido
                    } else if (defensor.isPlayer) {
                        dmg = Math.floor(dmg * 0.85); // -15% daño recibido
                    }
                }

                if (defensor.genesId.includes("adapt_a") && atkBruto > 0) {
                    if (defensor.ultimoElementoRecibido === ataqueReal.elemento) {
                        defensor.adaptativaStacks = Math.min(5, defensor.adaptativaStacks + 1);
                    } else {
                        defensor.adaptativaStacks = 0;
                        defensor.ultimoElementoRecibido = ataqueReal.elemento;
                    }
                    if (defensor.adaptativaStacks > 0) {
                        dmg = Math.floor(dmg * (1 - (defensor.adaptativaStacks * 0.10)));
                        logs.push(`<span style="color:#80deea">🛡️ 🧬 [Gen Oculto: Armadura Adaptativa] Daño reducido un ${defensor.adaptativaStacks * 10}%.</span>`);
                    }
                }

                let probCrit = 0.05 + (atacante.luk * 0.002) + (atacante.element === "Sintético" ? 0.15 : 0) + (ataqueReal.bonusCrit || 0);
                if (ataqueReal.criticoGarantizado) probCrit = 1.0;

                let isCrit = Math.random() <= probCrit && atkBruto > 0;
                if (isCrit) { dmg = Math.floor(dmg * 1.5); anims.critico = true; golpeActual.critico = true; }

                if (defensor.escudoCibernetico && !ataqueReal.perforante && atkBruto > 0) {
                    dmg = Math.floor(dmg * 0.60); defensor.escudoCibernetico = false;
                    logs.push(`<span style="color:#00d2ff">🛡️ [Pasivo: Escudo Cibernético] ${this.cName(defensor)} absorbe el impacto.</span>`);
                    golpeActual.bloqueado = true;
                } else if (defensor.crystalSkin && atkBruto > 0) {
                    dmg = 0; defensor.crystalSkin = false;
                    logs.push(`<span style="color:#80deea">💎 🧬 [Gen Oculto: Piel de Cristal] ${this.cName(defensor)} anula el daño por completo.</span>`);
                    golpeActual.bloqueado = true;
                } 

                if (golpeActual.evadido || golpeActual.bloqueado) {
                    dmg = 0; 
                } else if (atkBruto > 0) {
                    defensor.hp = Math.max(0, defensor.hp - dmg);
                    anims.danoDefensor += dmg;
                    golpeActual.dmg = dmg;
                    defensor.danoRecibidoEsteTurno += dmg; 

                    if (atacante.genesId.includes("def_brk")) {
                        atacante.rachaGolpes++;
                        if (atacante.rachaGolpes >= 3) {
                            defensor.def = Math.floor(defensor.def * 0.90);
                            logs.push(`<span style="color:#ff9800">⚔️ 🧬 [Gen Oculto: Ruptura Defensiva] DEF de ${this.cName(defensor)} -10% permanente.</span>`);
                            atacante.rachaGolpes = 0;
                        }
                    }

                    if (dmg > (defensor.maxHp * 0.15) && defensor.genesId.includes("dmg_echo")) {
                        let buffAtk = Math.floor(defensor.baseAtk * 0.15);
                        defensor.atk += buffAtk;
                        defensor.efectosActivos.push({ nombre: "Ret. Daño", stat: "atk", valor: buffAtk, turnos: 2, isNuevo: true });
                        logs.push(`<span style="color:#ff3333">💢 🧬 [Gen Oculto: Retroalimentación] ${this.cName(defensor)} recibe +15% ATK por el gran impacto!</span>`);
                    }

                    let tipoGolpe = multElem === 1.35 ? ` <span style="color:#4CAF50; font-weight:bold;">(¡Súper Efectivo!)</span>` : (multElem === 0.75 ? ` <span style="color:#888; font-weight:bold;">(Poco efectivo...)</span>` : "");
                    let textoStab = (stab > 1.0) ? ` <span style="color:#ce93d8; font-size:10px;">[+Afinidad]</span>` : "";

                    if (isCrit) logs.push(`> 💥 <span style="color:#ff0000; font-weight:bold;">¡CRÍTICO!</span> ${this.cName(atacante)} causa <span style="color:#ff6b6b; font-weight:bold;">${dmg} de daño</span>.${tipoGolpe}${textoStab}`);
                    else logs.push(`> ${this.cName(atacante)} causa <span style="color:#ff6b6b">${dmg} de daño</span>.${tipoGolpe}${textoStab}`);

                    let roboGen = atacante.genesId.includes("vampirismo_genetico") ? 0.15 : 0;
                    let roboSkill = ataqueReal.roboVida || 0;
                    let roboTotal = Math.max(0, Math.floor(dmg * (roboGen + roboSkill)));
                    
                    if (roboTotal > 0) {
                        atacante.hp = Math.min(atacante.maxHp, atacante.hp + roboTotal);
                        anims.curacionAtacante += roboTotal;
                        if (roboSkill > 0) logs.push(`<span style="color:#e0b0ff">🦇 [Absorción] ${this.cName(atacante)} drena ${roboTotal} HP.</span>`);
                        else logs.push(`<span style="color:#e0b0ff">🦇 🧬 [Gen Oculto: Vampirismo] ${this.cName(atacante)} recupera ${roboTotal} HP.</span>`);
                    }
                }
                anims.detalleGolpes.push(golpeActual);
            }
        }

        if (ataqueReal.limpiaBuffsRival) {
            let purgoAlgo = false;
            defensor.efectosActivos = defensor.efectosActivos.filter(ef => {
                if (ef.valor > 0 && ef.stat !== "estado") {
                    if (["atk", "def", "spd", "luk"].includes(ef.stat)) defensor[ef.stat] -= ef.valor;
                    purgoAlgo = true;
                    return false; 
                }
                return true;
            });
            if (purgoAlgo) logs.push(`<span style="color:#ffcc00">🚫 ¡Los incrementos de stats de ${this.cName(defensor)} fueron purgados!</span>`);
        }

        if (ataqueReal.proximoHitGarantizado) {
            atacante.efectosActivos.push({ nombre: "Hit Garantizado", stat: "hit_garantizado", valor: 1, turnos: 99, isNuevo: true });
        }

        if (ataqueReal.buffProxAtaque) {
            atacante.efectosActivos.push({ nombre: "Daño Potenciado", stat: "buffDanoExtra", valor: ataqueReal.buffProxAtaque, turnos: 99, isNuevo: true });
        }

        let probAply = ataqueReal.probEstado !== undefined ? ataqueReal.probEstado : 1.0;
        if (Math.random() <= probAply) {
            let duracionBase = ataqueReal.duracion || 3;
            let aplicarDebuffAtk = ataqueReal.debuffAtk;
            let aplicarDebuffSpd = ataqueReal.debuffSpd;

            if ((aplicarDebuffAtk || aplicarDebuffSpd) && defensor.hp > 0 && defensor.genesId.includes("core_ar") && !defensor.coreArUsado) {
                defensor.coreArUsado = true;
                aplicarDebuffAtk = false; aplicarDebuffSpd = false;
                logs.push(`<span style="color:#80deea">🛡️ 🧬 [Gen Oculto: Núcleo Coraza] ¡${this.cName(defensor)} bloquea la reducción de stats!</span>`);
                anims.detalleGolpes.push({dmg: 0, bloqueado: true}); 
            }

            if (ataqueReal.buffSpd) {
                let val = Math.floor(atacante.baseSpd * ataqueReal.buffSpd);
                atacante.spd += val;
                atacante.efectosActivos.push({ nombre: ataqueReal.nombre, stat: "spd", valor: val, turnos: duracionBase, isNuevo: true });
                logs.push(`<span style="color:#00e5ff">💨 ¡${this.cName(atacante)} aumenta su Velocidad en +${val}!</span>`);
            }
            if (ataqueReal.buffAtk) {
                let val = Math.floor(atacante.baseAtk * ataqueReal.buffAtk);
                atacante.atk += val;
                atacante.efectosActivos.push({ nombre: ataqueReal.nombre, stat: "atk", valor: val, turnos: duracionBase, isNuevo: true });
                logs.push(`<span style="color:#ff3333">⚔️ ¡${this.cName(atacante)} aumenta su Ataque en +${val}!</span>`);
            }
            if (ataqueReal.escudo) {
                let val = Math.floor(atacante.maxHp * ataqueReal.escudo);
                if (val < 15) val = 15;
                atacante.def += val;
                atacante.efectosActivos.push({ nombre: ataqueReal.nombre, stat: "def", valor: val, turnos: duracionBase, isNuevo: true });
                logs.push(`<span style="color:#80deea">🛡️ ¡${this.cName(atacante)} levanta una barrera de +${val} DEF!</span>`);
            }
            if (ataqueReal.buffDef) {
                let val = Math.floor(atacante.baseDef * ataqueReal.buffDef);
                if (val < 15) val = 15;
                atacante.def += val;
                atacante.efectosActivos.push({ nombre: ataqueReal.nombre, stat: "def", valor: val, turnos: duracionBase, isNuevo: true });
                logs.push(`<span style="color:#80deea">🛡️ ¡${this.cName(atacante)} aumenta su Defensa en +${val}!</span>`);
            }

            if (ataqueReal.buffLukEfectiva) {
                let val = Math.floor(atacante.baseLuk * ataqueReal.buffLukEfectiva);
                atacante.luk += val;
                atacante.efectosActivos.push({ nombre: ataqueReal.nombre, stat: "luk", valor: val, turnos: duracionBase, isNuevo: true });
                logs.push(`<span style="color:#4CAF50">🍀 ¡${this.cName(atacante)} aumenta su Suerte en +${val}!</span>`);
            }

            if (ataqueReal.nombre && ataqueReal.nombre.includes("Esquiva Calculada") && !ataqueReal.buffEvasion) ataqueReal.buffEvasion = 0.75;
            if (ataqueReal.nombre && ataqueReal.nombre.includes("Evasión Viral") && !ataqueReal.buffEvasion) ataqueReal.buffEvasion = 0.60;
            
            if (ataqueReal.buffEvasion) {
                atacante.efectosActivos.push({ nombre: ataqueReal.nombre, stat: "evasion", valor: ataqueReal.buffEvasion, turnos: 2, isNuevo: true });
                logs.push(`<span style="color:#e0e0e0">💨 ¡${this.cName(atacante)} adopta una postura evasiva (+${Math.floor(ataqueReal.buffEvasion * 100)}% Evasión)!</span>`);
            }

            if (ataqueReal.nombre && ataqueReal.nombre.includes("Protocolo de Escudo") && !ataqueReal.escudo && !ataqueReal.buffDef) {
                let val = Math.floor(defensor.baseAtk * 0.35) || 15;
                atacante.def += val;
                atacante.efectosActivos.push({ nombre: ataqueReal.nombre, stat: "def", valor: val, turnos: 3, isNuevo: true });
                logs.push(`<span style="color:#80deea">🛡️ ¡${this.cName(atacante)} activa un Escudo Adaptativo de +${val} DEF!</span>`);
            }

            if (aplicarDebuffSpd && defensor.hp > 0) {
                let val = Math.floor(defensor.baseSpd * ataqueReal.debuffSpd);
                defensor.spd = Math.max(1, defensor.spd - val);
                defensor.efectosActivos.push({ nombre: ataqueReal.nombre, stat: "spd", valor: -val, turnos: duracionBase, isNuevo: true });
            }
            if (aplicarDebuffAtk && defensor.hp > 0) {
                let val = Math.floor(defensor.baseAtk * ataqueReal.debuffAtk);
                defensor.atk = Math.max(1, defensor.atk - val);
                defensor.efectosActivos.push({ nombre: ataqueReal.nombre, stat: "atk", valor: -val, turnos: duracionBase, isNuevo: true });
            }

            if (ataqueReal.debuffLuk && defensor.hp > 0) {
                let val = Math.floor(defensor.baseLuk * ataqueReal.debuffLuk);
                defensor.luk = Math.max(1, defensor.luk - val);
                defensor.efectosActivos.push({ nombre: ataqueReal.nombre, stat: "luk", valor: -val, turnos: duracionBase, isNuevo: true });
                logs.push(`<span style="color:#b19cd9">📉 ¡${this.cName(defensor)} pierde Suerte y probabilidad de crítico!</span>`);
            }
            if (ataqueReal.debuffAcc && defensor.hp > 0) {
                defensor.efectosActivos.push({ nombre: "Precisión Reducida", stat: "acc_penalty", valor: ataqueReal.debuffAcc, turnos: duracionBase, isNuevo: true });
                logs.push(`<span style="color:#888">🌫️ ¡La precisión de ${this.cName(defensor)} fue reducida a ciegas!</span>`);
            }

            let estadoAply = ataqueReal.aplicaEstado || ataqueReal.aplicaEstadoPropio || (ataqueReal.costoHpTurno ? "Sobrecarga" : null);
            let target = (ataqueReal.aplicaEstado) ? defensor : atacante;
            
            if (estadoAply && target.hp > 0) {
                if (target.genesId.includes("sangre_fria") && !target.sangreFriaUsada) {
                    target.sangreFriaUsada = true;
                    logs.push(`<span style="color:#00d2ff">❄️ 🧬 [Gen Oculto: Sangre Fría] ¡${this.cName(target)} bloquea el estado!</span>`);
                    anims.detalleGolpes.push({dmg: 0, bloqueado: true});
                } else if (!target.estados.includes(estadoAply)) {
                    let configEstado = window.AttackCatalog && window.AttackCatalog.estados ? window.AttackCatalog.estados[estadoAply] : null;
                    let durEstado = configEstado ? configEstado.duracionBase : (ataqueReal.duracion || 3);

                    if (atacante.proxVenenoDoble && (estadoAply === "Veneno" || estadoAply === "Veneno Fuerte")) {
                        estadoAply = "Veneno Fuerte";
                        durEstado *= 2;
                        atacante.proxVenenoDoble = false;
                        logs.push(`<span style="color:#9c27b0">🧪 ¡El Veneno fue concentrado con doble intensidad y duración!</span>`);
                    }

                    target.estados.push(estadoAply);
                    target.efectosActivos.push({ nombre: estadoAply, stat: "estado", valor: estadoAply, turnos: durEstado, isNuevo: true });
                    
                    if (configEstado) {
                        if (configEstado.efecto === "baja_atk" || configEstado.efecto === "baja_atk_permanente") {
                            let val = Math.floor(target.baseAtk * configEstado.valor);
                            target.atk = Math.max(1, target.atk - val);
                            if (configEstado.efecto !== "baja_atk_permanente") target.efectosActivos.push({ nombre: estadoAply + " (-ATK)", stat: "atk", valor: -val, turnos: durEstado, isNuevo: true });
                        } else if (configEstado.efecto === "baja_spd" || configEstado.efecto === "baja_spd_bloquea") {
                            let val = Math.floor(target.baseSpd * configEstado.valor);
                            target.spd = Math.max(1, target.spd - val);
                            target.efectosActivos.push({ nombre: estadoAply + " (-SPD)", stat: "spd", valor: -val, turnos: durEstado, isNuevo: true });
                        } else if (configEstado.efecto === "baja_stat_random") {
                            let pos = ["atk", "def", "spd"]; let s = pos[Math.floor(Math.random() * pos.length)];
                            let base = s === "atk" ? target.baseAtk : (s === "def" ? target.baseDef : target.baseSpd);
                            let val = Math.floor(base * configEstado.valor);
                            target[s] = Math.max(1, target[s] - val);
                            target.efectosActivos.push({ nombre: estadoAply + " (-"+s.toUpperCase()+")", stat: s, valor: -val, turnos: durEstado, isNuevo: true });
                        }
                    }

                    const descEstados = {
                        "Regeneracion": "Cura HP cada turno", "Infeccion": "Baja un stat al azar", "Quemadura": "Pierde HP cada turno",
                        "Quemadura Critica": "Pierde mucho HP cada turno", "Veneno": "Pierde HP (Acumulable)", "Veneno Fuerte": "Pierde mucho HP cada turno",
                        "Paralisis": "SPD -35% y puede fallar turno", "Congelacion": "Pierde su próximo turno", "Vision Nublada": "Precisión -25%",
                        "Enredado": "SPD -40% y bloquea soporte", "Corrosion": "ATK -15% permanente", "Campo Radiactivo": "Pierde 5% HP cada turno",
                        "Irradiacion": "ATK -25%", "Debilitacion SPD": "SPD -20%", "Sobrecarga": "Daño masivo residual por desgaste"
                    };
                    let textoEfecto = descEstados[estadoAply] ? ` <span style="font-size: 11px; color:#aaa; font-style:italic;">(${descEstados[estadoAply]})</span>` : "";
                    
                    logs.push(`<span style="color:#00bcd4">* ${this.cName(target)} sufre [${estadoAply}]${textoEfecto} por ${durEstado} turnos.</span>`);
                    
                    if (estadoAply === "Regeneracion" && target.element === "Biomutante") {
                         logs.push(`<span style="color:#4CAF50">🌿 [Pasiva: Biomutante] ${this.cName(target)} activa regeneración natural.</span>`);
                    }
                    
                    if (atacante.genesId.includes("state_rush") && (estadoAply.includes("Veneno") || estadoAply.includes("Quemadura"))) {
                        logs.push(`<span style="color:#ffcc00">⚡ 🧬 [Gen Oculto: Acel. de Estado] ¡El estado surte efecto de inmediato!</span>`);
                        let estadoDmg = Math.floor(target.maxHp * (estadoAply.includes("Veneno") ? 0.05 : 0.06)) + 2;
                        target.hp = Math.max(0, target.hp - estadoDmg);
                        anims.danoDefensor += estadoDmg;
                        target.danoRecibidoEsteTurno += estadoDmg;
                    }
                }
            }
        }
        return { logs, anims };
    },

    procesarEfectosFinTurno: function(fighter) {
        let logs = []; let anims = { heal: 0, dmg: 0 };
        if (fighter.hp <= 0) return { logs, anims };

        fighter.danoRecibidoTurnoAnterior = fighter.danoRecibidoEsteTurno || 0;
        fighter.danoRecibidoEsteTurno = 0;

        for (let i = fighter.efectosActivos.length - 1; i >= 0; i--) {
            let ef = fighter.efectosActivos[i];
            
            if (ef.isNuevo) {
                ef.isNuevo = false; 
            } else {
                ef.turnos--;
                if (ef.turnos <= 0) {
                    if (ef.stat === "estado") {
                        fighter.estados = fighter.estados.filter(e => e !== ef.valor);
                        logs.push(`<span style="color:#888;">> ⏳ El estado [${ef.nombre}] sobre ${this.cName(fighter)} se disipó.</span>`);
                    } else if (ef.stat && ef.stat !== "hit_garantizado" && ef.stat !== "buffDanoExtra" && ef.stat !== "acc_penalty") {
                        if (ef.stat !== "evasion") { 
                            fighter[ef.stat] -= ef.valor;
                        }
                        let accion = ef.valor > 0 ? "terminó" : "se recuperó";
                        logs.push(`<span style="color:#888;">> ⏳ El efecto de [${ef.nombre}] ${accion} en ${this.cName(fighter)}.</span>`);
                    }
                    fighter.efectosActivos.splice(i, 1);
                }
            }
        }
        
        if (fighter.element === "Biomutante" && fighter.hp < fighter.maxHp) {
            let regen = Math.floor(fighter.maxHp * 0.03) || 1;
            fighter.hp = Math.min(fighter.maxHp, fighter.hp + regen); anims.heal += regen;
            logs.push(`<span style="color:#4CAF50">🌿 [Pasivo: Biomutante] ${this.cName(fighter)} regenera ${regen} HP.</span>`);
        }

        if (fighter.estados.includes("Regeneracion")) {
            let healDmg = Math.floor(fighter.maxHp * 0.15) + 1;
            fighter.hp = Math.min(fighter.maxHp, fighter.hp + healDmg);
            logs.push(`<span style="color:#4CAF50">✨ [Regeneración] ${this.cName(fighter)} recupera ${healDmg} HP.</span>`); 
            anims.heal += healDmg;
        }
        if (fighter.estados.includes("Campo Radiactivo")) {
            let radDmg = Math.floor(fighter.maxHp * 0.05) + 1;
            fighter.hp = Math.max(0, fighter.hp - radDmg);
            logs.push(`<span style="color:#b2ff59">☢️ [Campo Radiactivo] ${this.cName(fighter)} pierde ${radDmg} HP.</span>`); 
            anims.dmg += radDmg;
        }
        
        if (fighter.estados.includes("Sobrecarga") || fighter.estados.includes("Sobrecarga del Sistema") || fighter.estados.includes("Sobrecarga del sistema")) {
            let sobreDmg = Math.floor(fighter.maxHp * 0.08) + 1; 
            fighter.hp = Math.max(0, fighter.hp - sobreDmg);
            logs.push(`<span style="color:#ff3d00">⚡ [Sobrecarga] ${this.cName(fighter)} pierde ${sobreDmg} HP por el esfuerzo.</span>`); 
            anims.dmg += sobreDmg;
        }
        
        if (fighter.estados.includes("Quemadura")) {
            let burnDmg = Math.floor(fighter.maxHp * 0.06) + 2;
            fighter.hp = Math.max(0, fighter.hp - burnDmg);
            logs.push(`<span style="color:#ff9800">🔥 [Quemadura] ${this.cName(fighter)} pierde ${burnDmg} HP.</span>`); anims.dmg += burnDmg;
        }
        if (fighter.estados.includes("Veneno") || fighter.estados.includes("Veneno Fuerte")) {
            let venDmg = Math.floor(fighter.maxHp * (fighter.estados.includes("Veneno Fuerte") ? 0.08 : 0.05)) + 2;
            fighter.hp = Math.max(0, fighter.hp - venDmg);
            logs.push(`<span style="color:#9c27b0">☠️ [Veneno] ${this.cName(fighter)} pierde ${venDmg} HP.</span>`); anims.dmg += venDmg;
        }
        
        return { logs, anims };
    },

    evaluarCondicionIFTTT: function(entidad, rival, condicion) {
        if (!condicion) return false;
        switch (condicion) {
            case 'always':
                return true;
            case 'turn_1':
                return this.turno === 1;
            case 'hp_under_50':
                return (entidad.hp / entidad.maxHp) < 0.50;
            case 'hp_under_30':
                return (entidad.hp / entidad.maxHp) < 0.30;
            case 'rival_infected':
                return rival.estados && (rival.estados.includes("Infección") || rival.estados.includes("Infeccion"));
            case 'rival_buffed_atk':
                return rival.efectosActivos && rival.efectosActivos.some(ef => ef.stat === "atk" && ef.valor > 0);
            case 'self_buffed_spd':
                return entidad.efectosActivos && entidad.efectosActivos.some(ef => ef.stat === "spd" && ef.valor > 0);
            default:
                if (condicion.startsWith("rival_element_")) {
                    const targetElement = condicion.replace("rival_element_", "").toLowerCase();
                    return rival.element && rival.element.toLowerCase() === targetElement;
                }
                return false;
        }
    },

    resolverAccionIFTTT: function(entidad, rival) {
        const rules = (entidad.adn && entidad.adn.iftttRules) ? entidad.adn.iftttRules : [];

        // 1. Procesamos las reglas IFTTT configuradas
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            if (this.evaluarCondicionIFTTT(entidad, rival, rule.condition)) {
                const action = rule.action;
                const atk = entidad.ataquesEquipados[action];
                if (atk) {
                    const cooldown = (action === "ataque") ? 0 : (entidad.cooldowns[action] || 0);
                    if (cooldown === 0) {
                        return action;
                    }
                }
            }
        }

        // 2. Prioridad de Reserva por defecto (Fallback)
        const order = ["especial", "tactica", "definitivo"];
        for (const action of order) {
            const atk = entidad.ataquesEquipados[action];
            if (atk) {
                const cooldown = entidad.cooldowns[action] || 0;
                if (cooldown === 0) {
                    return action;
                }
            }
        }

        return "ataque";
    },

    crearRivalObjeto: function(nivelJugador, rarezaJugador, esJefeDeLiga = false) {
        let eRareza = "Común";
        if (esJefeDeLiga) {
            if (rarezaJugador === "Común") eRareza = "Raro";
            else if (rarezaJugador === "Raro") eRareza = "Épico";
            else if (rarezaJugador === "Épico") eRareza = "Legendario";
            else eRareza = "Legendario";
        } else {
            eRareza = rarezaJugador;
        }

        const trainingSupport = (nivelJugador < 5);
        const eStats = window.generarStatsPorRareza ? window.generarStatsPorRareza(eRareza) : {hp: 120, atk: 12, def: 8, spd: 10, luk: 5};
        
        let rollCalidad = Math.random();
        let purezaEnemigo = 60; 
        if (rollCalidad < 0.25) purezaEnemigo = 95; 
        else if (rollCalidad < 0.65) purezaEnemigo = 85; 
        else if (rollCalidad < 0.90) purezaEnemigo = 70; 
        else purezaEnemigo = 40; 

        eStats.pureza = purezaEnemigo;
        
        let bonoPureza = purezaEnemigo >= 90 ? 4 : (purezaEnemigo >= 80 ? 3 : (purezaEnemigo >= 60 ? 1 : 0));
        if (trainingSupport) {
            bonoPureza = 0; 
        } else if (nivelJugador <= 8) {
            bonoPureza = Math.floor(bonoPureza / 2);
        }

        eStats.hp += bonoPureza * 3; eStats.atk += bonoPureza; eStats.def += bonoPureza; eStats.spd += bonoPureza; eStats.luk += bonoPureza;

        let nivelEnemigo = trainingSupport 
            ? (nivelJugador + (esJefeDeLiga ? 2 : 0)) 
            : (nivelJugador + (esJefeDeLiga ? 5 : 3));
        if (nivelEnemigo < 1) nivelEnemigo = 1;

        if (trainingSupport) {
            eStats.hp = Math.max(10, Math.round(eStats.hp * 0.85));
            eStats.atk = Math.max(2, Math.round(eStats.atk * 0.85));
            eStats.def = Math.max(1, Math.round(eStats.def * 0.85));
            eStats.spd = Math.max(2, Math.round(eStats.spd * 0.85));
        }

        if (esJefeDeLiga && (rarezaJugador === "Legendario" || rarezaJugador === "Mítico")) {
            eStats.hp = Math.round(eStats.hp * 1.2);
            eStats.atk = Math.round(eStats.atk * 1.2);
        }

        const elementos = ["Biomutante", "Viral", "Cibernético", "Radiactivo", "Tóxico", "Sintético"];
        const eElemento = elementos[Math.floor(Math.random() * elementos.length)];
        
        let eHiddenGenes = {A: null, B: null, C: null};
        if (typeof window.generarGenesV9 === 'function') eHiddenGenes = window.generarGenesV9(eRareza);
        let gB = (eHiddenGenes.B?.id || "ninguno").toLowerCase();
        let gC = (eHiddenGenes.C?.id || "ninguno").toLowerCase();
        const genesEnemigo = [gB, gC];

        let pesos = { hp: 20, atk: 20, def: 20, spd: 20, luk: 20 };
        if (eElemento === "Biomutante") { pesos.hp += 40; pesos.def += 20; pesos.spd -= 10; }
        else if (eElemento === "Sintético") { pesos.spd += 40; pesos.luk += 30; pesos.def -= 10; }
        else if (eElemento === "Cibernético") { pesos.def += 40; pesos.atk += 20; pesos.luk -= 10; }
        else if (eElemento === "Viral") { pesos.spd += 25; pesos.atk += 25; pesos.hp += 10; }
        else if (eElemento === "Radiactivo") { pesos.atk += 40; pesos.hp += 20; pesos.def -= 10; }
        else if (eElemento === "Tóxico") { pesos.hp += 30; pesos.def += 30; pesos.atk -= 10; }

        if (genesEnemigo.includes("velocidad_fantasma") || genesEnemigo.includes("esquiva_genetica")) pesos.spd += 50;
        if (genesEnemigo.includes("vampirismo_genetico") || genesEnemigo.includes("instinto_caza") || genesEnemigo.includes("ruptura_defensiva")) pesos.atk += 50;
        if (genesEnemigo.includes("armadura_adaptativa") || genesEnemigo.includes("postura_inquebrantable") || genesEnemigo.includes("nucleo_coraza")) pesos.def += 50;
        if (genesEnemigo.includes("resiliencia_ultima") || genesEnemigo.includes("frenesi") || genesEnemigo.includes("barrera_limite")) { pesos.hp += 40; pesos.atk += 20; }
        if (genesEnemigo.includes("reflejo_genetico")) pesos.luk += 50;

        for (let stat in pesos) if (pesos[stat] < 1) pesos[stat] = 1;

        let bolsaStats = [];
        for (let stat in pesos) for (let i = 0; i < pesos[stat]; i++) bolsaStats.push(stat);

        let puntosExtra = (nivelEnemigo > 1) ? (nivelEnemigo - 1) * 3 : 0;
        for(let i=0; i<puntosExtra; i++) {
            let rStat = bolsaStats[Math.floor(Math.random() * bolsaStats.length)];
            if(rStat === 'hp') eStats.hp += 5; else eStats[rStat] += 1;
        }
            
        const formas = ["gota", "frijol", "circulo", "cuadrado", "triangulo", "hongo", "estrella", "pentagono", "nube", "chili", "diamante"];
        const colores = ["#ff6b6b", "#4dd0e1", "#fdfd96", "#b19cd9", "#77DD77", "#ff9800", "#ffb347", "#a8e6cf"];
        const opcionesOjos = typeof dicOjos !== 'undefined' ? Object.keys(dicOjos) : ["estandar", "cute", "angry", "cibernetico", "alien", "ojeras"];
        const opcionesBocas = typeof dicBocas !== 'undefined' ? Object.keys(dicBocas) : ["estandar", "feliz", "colmillos", "abierta", "sorpresa", "lengua"];
        
        const opcionesSombreros = typeof dicSombreros !== 'undefined' ? Object.keys(dicSombreros).filter(k => k !== "ninguno") : ["gorra", "corona", "casco", "cinta"];
        const opcionesAlas = typeof dicAlas !== 'undefined' ? Object.keys(dicAlas).filter(k => k !== "ninguno") : ["alas_angel", "alas_murcielago", "jetpack", "capa"];
        const opcionesGafas = typeof dicGafas !== 'undefined' ? Object.keys(dicGafas).filter(k => k !== "ninguno") : ["lentes", "parche", "visor", "monoculo"];
        const opcionesExtras = typeof dicExtras !== 'undefined' ? Object.keys(dicExtras).filter(k => k !== "ninguno") : ["bufanda", "collar", "auriculares", "corbata"];

        let probBase = eRareza === "Legendario" ? 0.85 : (eRareza === "Épico" ? 0.65 : (eRareza === "Raro" ? 0.40 : 0.15));
        let cantidadAccesorios = 0;
        if (Math.random() < probBase) {
            cantidadAccesorios = 1;
            let probExtra = probBase * 0.6; 
            if (Math.random() < probExtra) {
                cantidadAccesorios = 2;
                if (Math.random() < (probExtra * 0.5)) { 
                    cantidadAccesorios = 3;
                    if (Math.random() < (probExtra * 0.25)) cantidadAccesorios = 4; 
                }
            }
        }

        let eHat = "ninguno", eWing = "ninguno", eGlasses = "ninguno", eExtra = "ninguno";
        if (cantidadAccesorios > 0) {
            let slotsDisponibles = ["hat", "wing", "glasses", "extra"].sort(() => 0.5 - Math.random()).slice(0, cantidadAccesorios);
            if (slotsDisponibles.includes("hat") && opcionesSombreros.length > 0) eHat = opcionesSombreros[Math.floor(Math.random() * opcionesSombreros.length)];
            if (slotsDisponibles.includes("wing") && opcionesAlas.length > 0) eWing = opcionesAlas[Math.floor(Math.random() * opcionesAlas.length)];
            if (slotsDisponibles.includes("glasses") && opcionesGafas.length > 0) eGlasses = opcionesGafas[Math.floor(Math.random() * opcionesGafas.length)];
            if (slotsDisponibles.includes("extra") && opcionesExtras.length > 0) eExtra = opcionesExtras[Math.floor(Math.random() * opcionesExtras.length)];
        }

        const adn = { 
            id: 888, scanned: true, rarity: eRareza, stats: eStats, element: eElemento,
            body_shape: formas[Math.floor(Math.random() * formas.length)], color: colores[Math.floor(Math.random() * colores.length)],
            eye_type: opcionesOjos[Math.floor(Math.random() * opcionesOjos.length)], mouth_type: opcionesBocas[Math.floor(Math.random() * opcionesBocas.length)], 
            wing_type: eWing, hat_type: eHat, glasses_type: eGlasses, extra_type: eExtra,
            hidden_genes: eHiddenGenes, level: nivelEnemigo
        };

        let pAtks = window.miMascota && window.miMascota.ataques ? window.miMascota.ataques : {};
        const counterDelJugador = { "Biomutante": "Viral", "Sintético": "Biomutante", "Tóxico": "Sintético", "Radiactivo": "Tóxico", "Cibernético": "Radiactivo", "Viral": "Cibernético" };
        let pElement = this.player ? this.player.element : "Normal";
        let elementoCounter = counterDelJugador[pElement] || eElemento;

        let atkEsp = pAtks.atk_2 ? this.obtenerAtaqueAleatorio(eElemento, "especiales") : null;
        let atkTac = pAtks.atk_3 ? this.obtenerAtaqueAleatorio(eElemento, "soportes") : null;

        if (pAtks.atk_2 && pAtks.atk_3) {
            if (Math.random() < 0.5) atkEsp = this.obtenerAtaqueAleatorio(elementoCounter, "especiales");
            else atkTac = this.obtenerAtaqueAleatorio(elementoCounter, "soportes");
        } else if (pAtks.atk_2) atkEsp = this.obtenerAtaqueAleatorio(elementoCounter, "especiales");

        let enemyAtaques = {
            "ataque": this.obtenerAtaqueAleatorio(eElemento, "basicos"),
            "especial": atkEsp, "tactica": atkTac,
            "definitivo": (pAtks.atk_4 && nivelEnemigo >= 25) ? this.obtenerAtaqueAleatorio(eElemento, "definitivos") : null
        };
        
        return {
            nombre: (esJefeDeLiga ? "[JEFE] " : "") + this.generarNombreAleatorio(), isPlayer: false, adn: adn,
            maxHp: eStats.hp, hp: eStats.hp, atk: eStats.atk, def: eStats.def || 5, spd: eStats.spd, luk: eStats.luk,
            baseAtk: eStats.atk, baseDef: eStats.def || 5, baseSpd: eStats.spd, baseLuk: eStats.luk,
            element: eElemento, rareza: eRareza, genesId: genesEnemigo,
            estados: [], efectosActivos: [], cooldowns: { especial: 0, tactica: 0, definitivo: 0 },
            escudoCibernetico: eElemento === "Cibernético", 
            crystalSkin: gB === "piel_cristal" || gC === "piel_cristal",
            decoyUsado: false, coreArUsado: false, rachaGolpes: 0, adaptativaStacks: 0, ultimoElementoRecibido: null,
            danoRecibidoEsteTurno: 0, danoRecibidoTurnoAnterior: 0, proxVenenoDoble: false,
            ataquesEquipados: enemyAtaques,
            esJefeDeLiga: esJefeDeLiga
        };
    },

    swapGeno: function(isPlayer, newIndex) {
        if (isPlayer) {
            this.playerActiveIndex = newIndex;
            this.player = this.playerTeam[newIndex];
            
            const gB = (this.player.adn.hidden_genes?.B?.id || "ninguno").toLowerCase();
            const gC = (this.player.adn.hidden_genes?.C?.id || "ninguno").toLowerCase();
            if (gB === "piel_cristal" || gC === "piel_cristal") {
                this.player.crystalSkin = true;
            } else {
                this.player.crystalSkin = false;
            }
            if (gB === "sangre_fria" || gC === "sangre_fria") {
                this.player.sangreFriaUsada = false;
            }
        } else {
            this.enemyActiveIndex = newIndex;
            this.enemy = this.enemyTeam[newIndex];
            
            const gB = (this.enemy.adn.hidden_genes?.B?.id || "ninguno").toLowerCase();
            const gC = (this.enemy.adn.hidden_genes?.C?.id || "ninguno").toLowerCase();
            if (gB === "piel_cristal" || gC === "piel_cristal") {
                this.enemy.crystalSkin = true;
            } else {
                this.enemy.crystalSkin = false;
            }
            if (gB === "sangre_fria" || gC === "sangre_fria") {
                this.enemy.sangreFriaUsada = false;
            }
        }
    }
};