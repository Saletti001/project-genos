// =========================================
// AttackCatalog.js - DICCIONARIO MAESTRO DE COMBATE V1.1 (DESCRIPCIONES CLARAS)
// =========================================

window.AttackCatalog = {
    // 1. DICCIONARIO DE ESTADOS ALTERADOS
    estados: {
        "Regeneracion": { tipo: "buff", duracionBase: 3, efecto: "cura", valor: 0.15, apilable: true, maxStack: 15 },
        "Infeccion": { tipo: "debuff", duracionBase: 2, efecto: "baja_stat_random", valor: 0.20, apilable: true, maxStack: 3 },
        "Quemadura": { tipo: "dot", duracionBase: 3, efecto: "dano_hp", valor: 0.06, apilable_duracion: true },
        "Veneno": { tipo: "dot", duracionBase: 3, efecto: "dano_hp", valor: 0.05, apilable_intensidad: true, maxStack: 3 },
        "Paralisis": { tipo: "control", duracionBase: 2, efecto: "baja_spd", valor: 0.35, probPerderTurno: 0.30, maxStack: 1 },
        "Congelacion": { tipo: "control", duracionBase: 1, efecto: "pierde_turno", inmunidadPost: 2 },
        "Vision Nublada": { tipo: "debuff", duracionBase: 2, efecto: "baja_acc", valor: 0.25, apilable: true, maxStack: 45 },
        "Enredado": { tipo: "control", duracionBase: 2, efecto: "baja_spd_bloquea_soporte", valor: 0.40, maxStack: 1 },
        "Corrosion": { tipo: "debuff", duracionBase: 999, efecto: "baja_atk_permanente", valor: 0.15, apilable: true, maxStack: 3 },
        "Campo Radiactivo": { tipo: "dot", duracionBase: 3, efecto: "dano_hp_fijo", valor: 0.05 },
        "Irradiacion": { tipo: "debuff", duracionBase: 3, efecto: "baja_atk", valor: 0.25 }
    },

    // 2. CATÁLOGO DE MOVIMIENTOS POR ELEMENTO
    ataquesPorElemento: {
        
        // --- 🌿 BIOMUTANTE ---
        "Biomutante": {
            basicos: [
                { id: "pulso_vital", nombre: "Pulso Vital", slot: 1, potencia: 85, precision: 100, usos: 99, descripcion: "Ataque básico sin enfriamiento." }
            ],
            especiales: [
                { id: "espinas_oseas", nombre: "Espinas Óseas", slot: 2, potencia: 95, precision: 95, usos: 5, rompeEscudos: 0.30, descripcion: "Ignora el 30% de la Defensa y escudos del rival." },
                { id: "oleada_mutante", nombre: "Oleada Mutante", slot: 2, potencia: 130, precision: 85, usos: 4, descripcion: "Gran daño, pero con 85% de precisión." },
                { id: "transferencia_carga", nombre: "Transferencia de Carga", slot: 2, potencia: 60, escalaConHP: true, precision: 100, usos: 99, descripcion: "Gana hasta +30 de Potencia si el HP del usuario supera el 70%." }
            ],
            soportes: [
                { id: "espora_curativa", nombre: "Espora Curativa", slot: 3, potencia: 0, curacion: 0.20, precision: 100, usos: 3, descripcion: "El usuario recupera el 20% de su HP Máximo." },
                { id: "membrana_fortalecida", nombre: "Membrana Fortalecida", slot: 3, potencia: 0, escudo: 0.25, duracion: 2, precision: 100, usos: 2, descripcion: "Otorga un escudo de DEF equivalente al 25% del ATK rival." },
                { id: "raiz_enredadora", nombre: "Raíz Enredadora", slot: 3, potencia: 40, aplicaEstado: "Enredado", precision: 100, usos: 3, descripcion: "Daña y aplica Enredado (SPD -40% y bloquea soportes)." },
                { id: "frenesia_organica", nombre: "Frenesía Orgánica", slot: 3, potencia: 0, buffAtk: 0.35, duracion: 3, restriccion: "no_soporte", precision: 100, usos: 1, descripcion: "Aumenta el ATK propio un +35% durante 3 turnos." }
            ],
            definitivos: [
                { id: "gran_regeneracion", nombre: "Gran Regeneración", slot: 4, potencia: 60, curacion: 0.50, precision: 100, usos: 1, descripcion: "Causa daño moderado y cura el 50% de tu HP Máximo." },
                { id: "ira_naturaleza", nombre: "Ira de la Naturaleza", slot: 4, potencia: 130, perforante: true, precision: 90, usos: 1, descripcion: "Golpe brutal que ignora el 65% de la Defensa rival." },
                { id: "esporas_drenantes", nombre: "Esporas Drenantes", slot: 4, potencia: 80, aplicaEstado: "Enredado", probEstado: 1.0, curacion: 0.20, usos: 1, descripcion: "Cura 20% HP propio y atrapa al rival con Enredado (SPD -40%)." }
            ]
        },

        // --- 🦠 VIRAL ---
        "Viral": {
            basicos: [
                { id: "descarga_viral", nombre: "Descarga Viral", slot: 1, potencia: 80, aplicaEstado: "Infeccion", probEstado: 0.25, precision: 100, usos: 99, descripcion: "25% prob. de aplicar Infección (-20% a un stat al azar)." }
            ],
            especiales: [
                { id: "infeccion_aguda", nombre: "Infección Aguda", slot: 2, potencia: 30, aplicaEstado: "Infeccion", probEstado: 1.00, statObjetivo: "max", precision: 100, usos: 4, descripcion: "Aplica Infección garantizada a la mejor estadística del rival." },
                { id: "disolucion_celular", nombre: "Disolución Celular", slot: 2, potencia: 100, bonusPorEstado: 20, precision: 90, usos: 99, descripcion: "Añade +20 de Potencia plana por cada estado alterado en el rival." },
                { id: "proliferacion", nombre: "Proliferación", slot: 2, potencia: 70, bonusMultiplicador: 2.0, requiereEstado: "Infeccion", precision: 100, usos: 99, descripcion: "Multiplica su potencia x2 (140) si el rival sufre Infección." }
            ],
            soportes: [
                { id: "niebla_viral", nombre: "Niebla Viral", slot: 3, potencia: 0, aplicaEstado: "Vision Nublada", precision: 100, usos: 2, descripcion: "Aplica Visión Nublada (Precisión rival -25% por 2 turnos)." },
                { id: "adaptacion_viral", nombre: "Adaptación Viral", slot: 3, potencia: 0, buffSpd: 0.30, duracion: 3, precision: 100, usos: 2, descripcion: "Aumenta la Velocidad propia un +30% por 3 turnos." },
                { id: "cepa_parasita", nombre: "Cepa Parásita", slot: 3, potencia: 70, roboVida: 0.30, precision: 95, usos: 99, descripcion: "El usuario se cura un HP equivalente al 30% del daño causado." },
                { id: "evasion_viral", nombre: "Evasión Viral", slot: 3, potencia: 0, buffEvasion: 0.60, duracion: 1, precision: 100, usos: 3, descripcion: "Otorga un +60% de Evasión durante el próximo turno." }
            ],
            definitivos: [
                { id: "pandemia_global", nombre: "Pandemia Global", slot: 4, potencia: 40, hits: 3, aplicaEstado: "Infeccion", probEstado: 0.80, precision: 95, usos: 1, descripcion: "Ataca 3 veces. Cada golpe tiene 80% prob. de aplicar Infección." },
                { id: "asimilacion_celular", nombre: "Asimilación Celular", slot: 4, potencia: 100, aplicaEstado: "Corrosion", probEstado: 1.0, curacion: 0.25, usos: 1, descripcion: "Cura 25% HP y aplica Corrosión (ATK rival -15% permanente)." },
                { id: "falla_genetica", nombre: "Falla Genética", slot: 4, potencia: 0, aplicaEstado: "Paralisis", probEstado: 1.0, debuffAtk: 0.30, duracion: 3, usos: 1, descripcion: "Aplica Parálisis (SPD -35%) y reduce ATK rival un 30%." }
            ]
        },

        // --- 🤖 CIBERNÉTICO ---
        "Cibernético": {
            basicos: [
                { id: "laser_precision", nombre: "Láser de Precisión", slot: 1, potencia: 75, precision: 1000, noFalla: true, usos: 99, descripcion: "Ataque con seguimiento perfecto. Nunca falla." }
            ],
            especiales: [
                { id: "descarga_cadena", nombre: "Descarga en Cadena", slot: 2, potencia: 35, hits: 3, precision: 95, usos: 99, descripcion: "Golpea 3 veces. Eficaz para romper escudos pasivos." },
                { id: "disparo_perforante", nombre: "Disparo Perforante", slot: 2, potencia: 110, perforante: true, precision: 90, usos: 3, descripcion: "Ignora el 50% de la Defensa del rival." },
                { id: "contrarrestar", nombre: "Contrarrestar", slot: 2, potencia: 0, reactivo: 0.40, precision: 100, usos: 99, descripcion: "Devuelve como daño puro el 40% del daño recibido en el último turno." }
            ],
            soportes: [
                { id: "protocolo_escudo", nombre: "Protocolo de Escudo", slot: 3, potencia: 0, escudo: 0.35, duracion: 3, precision: 100, usos: 2, descripcion: "Añade a tu DEF un escudo equivalente al 35% del ATK rival." },
                { id: "interferencia", nombre: "Interferencia Electromagnética", slot: 3, potencia: 0, limpiaBuffsRival: true, precision: 100, usos: 2, descripcion: "Purga y elimina todos los aumentos de stats del rival." },
                { id: "sobrecarga_sistema", nombre: "Sobrecarga del Sistema", slot: 3, potencia: 0, buffAtk: 0.50, costoHpTurno: 0.08, duracion: 2, precision: 100, usos: 2, descripcion: "ATK +50%, pero sufres Sobrecarga (pierdes 8% HP Máx por turno)." },
                { id: "recalibrado_rapido", nombre: "Recalibrado Rápido", slot: 3, potencia: 0, buffSpd: 0.25, proximoHitGarantizado: true, precision: 100, usos: 3, descripcion: "SPD +25% y garantiza que tu próximo ataque no fallará." }
            ],
            definitivos: [
                { id: "colapso_sistema", nombre: "Colapso del Sistema", slot: 4, potencia: 110, rompeEscudos: true, aplicaEstado: "Paralisis", probEstado: 0.60, precision: 100, usos: 1, descripcion: "Ignora escudos activos y tiene 60% prob. de aplicar Parálisis." },
                { id: "canon_orbital", nombre: "Cañón Orbital", slot: 4, potencia: 140, criticoGarantizado: true, precision: 85, usos: 1, descripcion: "Precisión 85%. Si acierta, es un Golpe Crítico garantizado." },
                { id: "matriz_sobrecarga", nombre: "Matriz de Sobrecarga", slot: 4, potencia: 180, aplicaEstadoPropio: "Sobrecarga", probEstado: 1.0, precision: 100, usos: 1, descripcion: "Daño devastador. El usuario sufre Sobrecarga (-8% HP Máx por turno)." }
            ]
        },

        // --- ☢️ RADIACTIVO ---
        "Radiactivo": {
            basicos: [
                { id: "proyectil_radiactivo", nombre: "Proyectil Radiactivo", slot: 1, potencia: 85, aplicaEstado: "Quemadura", probEstado: 0.30, precision: 100, usos: 99, descripcion: "30% prob. de aplicar Quemadura (-6% HP por turno)." }
            ],
            especiales: [
                { id: "explosion_nuclear", nombre: "Explosión Nuclear", slot: 2, potencia: 100, bonusContraEstado: "Quemadura", multiplier: 1.35, precision: 80, usos: 3, descripcion: "Potencia 100. Se multiplica x1.35 si el rival sufre Quemadura." },
                { id: "lluvia_cenizas", nombre: "Lluvia de Cenizas", slot: 2, potencia: 70, debuffAcc: 0.20, duracion: 2, precision: 100, usos: 99, descripcion: "Causa daño y reduce la Precisión rival un 20%." },
                { id: "pulso_decaimiento", nombre: "Pulso de Decaimiento", slot: 2, potencia: 60, debuffLuk: 0.40, duracion: 3, precision: 95, usos: 4, descripcion: "Causa daño y reduce la Suerte (LUK) rival un 40%." }
            ],
            soportes: [
                { id: "campo_radioactivo", nombre: "Campo Radioactivo", slot: 3, potencia: 0, aplicaEstado: "Campo Radiactivo", precision: 100, usos: 2, descripcion: "Genera un aura que resta 5% del HP Máximo al rival por turno." },
                { id: "irradiacion", nombre: "Irradiación", slot: 3, potencia: 25, aplicaEstado: "Irradiacion", precision: 100, usos: 3, descripcion: "Aplica Irradiación (Reduce el ATK rival un 25%)." },
                { id: "nucleo_ardiente", nombre: "Núcleo Ardiente", slot: 3, potencia: 0, buffPasivo: "Quemadura", duracion: 2, precision: 100, usos: 2, descripcion: "Tus ataques con Quemadura hacen daño adicional." },
                { id: "autoirradiacion", nombre: "Autoirradiación", slot: 3, potencia: 0, costoHp: 0.12, buffProxAtaque: 0.60, precision: 100, usos: 2, descripcion: "Sacrifica 12% de tu HP para dar +60% de daño a tu próximo ataque." }
            ],
            definitivos: [
                { id: "critico_nuclear", nombre: "Crítico Nuclear", slot: 4, potencia: 120, aplicaEstado: "Campo Radiactivo", probEstado: 1.0, precision: 90, usos: 1, descripcion: "Gran daño. Envuelve al rival en un Campo Radiactivo (-5% HP/turno)." },
                { id: "fision_inestable", nombre: "Fisión Inestable", slot: 4, potencia: 160, aplicaEstadoPropio: "Quemadura", probEstado: 1.0, precision: 100, usos: 1, descripcion: "Daño masivo. El usuario sufre Quemadura (-6% HP por turno)." },
                { id: "desintegracion_atomica", nombre: "Desintegración Atómica", slot: 4, potencia: 95, perforante: true, aplicaEstado: "Irradiacion", probEstado: 1.0, usos: 1, descripcion: "Ignora 65% de la DEF rival y aplica Irradiación (ATK rival -25%)." }
            ]
        },

        // --- ☣️ TÓXICO ---
        "Tóxico": {
            basicos: [
                { id: "colmillo_venenoso", nombre: "Colmillo Venenoso", slot: 1, potencia: 80, aplicaEstado: "Veneno", probEstado: 0.35, precision: 100, usos: 99, descripcion: "35% prob. de envenenar (-5% HP). El Veneno es acumulable." }
            ],
            especiales: [
                { id: "veneno_mortal", nombre: "Veneno Mortal", slot: 2, potencia: 40, aplicaEstado: "Veneno Fuerte", probEstado: 1.00, precision: 100, usos: 3, descripcion: "Aplica Veneno Fuerte garantizado (-8% HP Máx por turno)." },
                { id: "corrosion_acido", nombre: "Corrosión de Ácido", slot: 2, potencia: 50, aplicaEstado: "Corrosion", precision: 100, usos: 3, descripcion: "Daña y aplica Corrosión (Reduce ATK rival 15% de forma PERMANENTE)." },
                { id: "espina_toxica", nombre: "Espina Tóxica", slot: 2, potencia: 65, prioridad: 1, aplicaEstado: "Veneno", probEstado: 0.25, precision: 100, usos: 99, descripcion: "Ataque con prioridad (golpea primero). 25% prob. de Veneno." }
            ],
            soportes: [
                { id: "nube_toxica", nombre: "Nube Tóxica", slot: 3, potencia: 0, debuffAtk: 0.20, debuffSpd: 0.15, duracion: 2, precision: 100, usos: 2, descripcion: "Reduce el ATK (20%) y la SPD (15%) del rival por 2 turnos." },
                { id: "inmunizacion_toxica", nombre: "Inmunización Tóxica", slot: 3, potencia: 0, inmunidadEstados: 2, buffDanoPropioVeneno: 0.20, precision: 100, usos: 1, descripcion: "Te hace inmune a estados alterados durante 2 turnos." },
                { id: "drenaje_esencia", nombre: "Drenaje de Esencia", slot: 3, potencia: 65, roboVida: 0.25, aplicaEstado: "Veneno", probEstado: 0.20, precision: 100, usos: 99, descripcion: "Cura tu HP un 25% del daño causado. 20% prob. de Veneno." },
                { id: "concentrar_veneno", nombre: "Concentrar Veneno", slot: 3, potencia: 0, duplicaSiguienteVeneno: true, precision: 100, usos: 3, descripcion: "Tu próxima aplicación de Veneno será Veneno Fuerte y durará el doble." }
            ],
            definitivos: [
                { id: "plaga_final", nombre: "Plaga Final", slot: 4, potenciaBase: 60, bonusPorEstado: 40, precision: 100, usos: 1, descripcion: "Potencia 60. Sube +40 de potencia por CADA estado alterado en el rival." },
                { id: "lluvia_acida", nombre: "Lluvia Ácida", slot: 4, potencia: 30, hits: 4, aplicaEstado: "Veneno Fuerte", probEstado: 0.50, precision: 95, usos: 1, descripcion: "Golpea 4 veces. Cada impacto tiene 50% prob. de aplicar Veneno Fuerte." },
                { id: "niebla_asfixiante", nombre: "Niebla Asfixiante", slot: 4, potencia: 75, aplicaEstado: "Vision Nublada", probEstado: 1.0, debuffSpd: 0.30, usos: 1, descripcion: "Aplica Visión Nublada (Precisión -25%) y reduce SPD rival un 30%." }
            ]
        },

        // --- ⚙️ SINTÉTICO ---
        "Sintético": {
            basicos: [
                { id: "rafaga_sintetica", nombre: "Ráfaga Sintética", slot: 1, potencia: 85, bonusCrit: 0.15, precision: 100, usos: 99, descripcion: "Ataque básico con un +15% de probabilidad de asestar un Crítico." }
            ],
            especiales: [
                { id: "golpe_certero", nombre: "Golpe Certero", slot: 2, potencia: 60, criticoGarantizado: true, precision: 100, usos: 99, descripcion: "Golpe Crítico garantizado (Daño x1.5)." },
                { id: "impacto_total", nombre: "Impacto Total", slot: 2, potencia: 70, bonusSiPrimero: 150, precision: 95, usos: 99, descripcion: "Potencia 70. Si atacas antes que el rival, su potencia sube a 150." },
                { id: "ataque_relampago", nombre: "Ataque Relámpago", slot: 2, potencia: 55, prioridad: 2, precision: 100, usos: 99, descripcion: "Prioridad máxima. Garantiza golpear primero en el turno." }
            ],
            soportes: [
                { id: "golpe_paralizante", nombre: "Golpe Paralizante", slot: 3, potencia: 70, aplicaEstado: "Paralisis", probEstado: 0.40, precision: 100, usos: 4, descripcion: "Daña y tiene 40% prob. de aplicar Parálisis (SPD -35%)." },
                { id: "aceleracion_sintetica", nombre: "Aceleración Sintética", slot: 3, potencia: 0, buffSpd: 0.45, duracion: 3, precision: 100, usos: 2, descripcion: "Aumenta tu Velocidad (SPD) un +45% durante 3 turnos." },
                { id: "potenciador_critico", nombre: "Potenciador de Crítico", slot: 3, potencia: 0, buffLukEfectiva: 0.50, duracion: 2, precision: 100, usos: 2, descripcion: "Aumenta tu Suerte (LUK) un +50% por 2 turnos." },
                { id: "esquiva_calculada", nombre: "Esquiva Calculada", slot: 3, potencia: 0, probEvasion: 0.75, buffSpdSiEvade: 0.10, precision: 100, usos: 3, descripcion: "75% prob. de Evasión. Si esquivas con éxito, ganas +10% SPD." }
            ],
            definitivos: [
                { id: "tormenta_criticos", nombre: "Tormenta de Críticos", slot: 4, potencia: 25, hits: 5, bonusCrit: 0.20, precision: 90, usos: 1, descripcion: "5 golpes rápidos. Cada uno tiene +20% extra de prob. Crítico." },
                { id: "aceleracion_cuantica", nombre: "Aceleración Cuántica", slot: 4, potencia: 85, buffSpd: 0.50, buffAtk: 0.50, duracion: 3, precision: 100, usos: 1, descripcion: "Daña y otorga al usuario +50% SPD y +50% ATK." },
                { id: "impacto_prisma", nombre: "Impacto Prisma", slot: 4, potencia: 90, bonusSiPrimero: 150, precision: 100, usos: 1, descripcion: "Potencia 90. Escala a 150 si el usuario ataca primero en el turno." }
            ]
        }
    }
};
};