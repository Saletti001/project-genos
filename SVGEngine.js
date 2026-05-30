// =========================================
// SVGEngine.js - V21 (100% PURO, SIN SALTOS DE ANIMACIÓN, HONGO Y SIMETRÍA CONSERVADOS)
// =========================================

function generarSvgGeno(genesVisuales) {
    const safeData = genesVisuales || {};
    
    // =========================================
    // 🧬 DIBUJO DE CÁPSULA (HUEVOS)
    // =========================================
    if (safeData.isEgg) {
        const adnColor = safeData.color || safeData.base_color || "#00d2ff";
        const rndId = safeData.id || Math.floor(Math.random() * 1000);

        return `
        <svg width="100%" height="100%" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
            <defs>
                <clipPath id="clip-cristal-${rndId}"><rect x="32" y="25" width="36" height="70" rx="12" /></clipPath>
                <linearGradient id="liquid-amber-${rndId}" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stop-color="#ffbf00" stop-opacity="0.6"/> <stop offset="100%" stop-color="#ffbf00" stop-opacity="0.1"/>
                </linearGradient>
                <linearGradient id="glass-front-${rndId}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5"/> <stop offset="15%" stop-color="#ffffff" stop-opacity="0.1"/>
                    <stop offset="85%" stop-color="#ffffff" stop-opacity="0.0"/> <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2"/>
                </linearGradient>
                <linearGradient id="metal-cap-${rndId}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#2c3e50"/> <stop offset="25%" stop-color="#7f8c8d"/>
                    <stop offset="50%" stop-color="#bdc3c7"/> <stop offset="75%" stop-color="#7f8c8d"/>
                    <stop offset="100%" stop-color="#2c3e50"/>
                </linearGradient>
                <filter id="glow-adn-${rndId}">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>
            <style>
                @keyframes bionucleoFlota { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                @keyframes adnPulse { 0%, 100% { opacity: 0.8; transform: scaleX(1); } 50% { opacity: 1; transform: scaleX(1.03); } }
                @keyframes burbujas { 0% { transform: translateY(10px); opacity: 0; } 50% { opacity: 0.9; } 100% { transform: translateY(-35px); opacity: 0; } }
                .capsula-anim { animation: bionucleoFlota 3.5s ease-in-out infinite; transform-origin: center; }
                .adn-glow { animation: adnPulse 2.5s ease-in-out infinite; transform-origin: center; filter: url(#glow-adn-${rndId}); }
                .burbuja { animation: burbujas 2s ease-in infinite; fill: #ffffff; }
            </style>
            <g class="capsula-anim">
                <rect x="32" y="25" width="36" height="70" rx="12" fill="none" stroke="#4dd0e1" stroke-width="1.5" stroke-opacity="0.7"/>
                <rect x="32" y="25" width="36" height="70" rx="12" fill="url(#liquid-amber-${rndId})"/>
                <g clip-path="url(#clip-cristal-${rndId})">
                    <g class="adn-glow">
                        <path d="M 60 35 C 30 45, 30 55, 50 65 C 70 75, 70 85, 60 95" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 4" opacity="0.5"/>
                        <path d="M 40 35 C 70 45, 70 55, 50 65 C 30 75, 30 85, 40 95" fill="none" stroke="${adnColor}" stroke-width="3" stroke-linecap="round"/>
                        <line x1="45" y1="35" x2="55" y2="35" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/> <line x1="45" y1="45" x2="55" y2="45" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
                        <line x1="45" y1="55" x2="55" y2="55" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/> <line x1="45" y1="65" x2="55" y2="65" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
                        <line x1="45" y1="75" x2="55" y2="75" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/> <line x1="45" y1="85" x2="55" y2="85" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
                        <line x1="45" y1="95" x2="55" y2="95" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
                    </g>
                    <circle cx="40" cy="85" r="1.5" class="burbuja" style="animation-delay: 0s;"/>
                    <circle cx="55" cy="80" r="2.5" class="burbuja" style="animation-delay: 0.6s;"/>
                    <circle cx="48" cy="90" r="2" class="burbuja" style="animation-delay: 1.2s;"/>
                </g>
                <rect x="32" y="25" width="36" height="70" rx="12" fill="url(#glass-front-${rndId})" />
                <path d="M 36 32 Q 38 60 36 88" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
                <path d="M 38 25 L 62 25 L 57 15 L 43 15 Z" fill="url(#metal-cap-${rndId})" stroke="#4dd0e1" stroke-width="1.5"/>
                <path d="M 38 95 L 62 95 L 57 105 L 43 105 Z" fill="url(#metal-cap-${rndId})" stroke="#4dd0e1" stroke-width="1.5"/>
            </g>
        </svg>`;
    }

    // =========================================
    // 🧬 DIBUJO DE GENOS ADULTOS
    // =========================================
    const color = safeData.base_color || "#77DD77";
    const shape = safeData.body_shape || "frijol";
    const rndId = Math.floor(Math.random() * 100000);
    const gradId = `grad-${rndId}`;
    const maskId = `mask-cuerpo-${rndId}`; 

    let safeAnclaje = (typeof anclajes !== 'undefined' && anclajes[shape]) ? {...anclajes[shape]} : { cabezaX: 80, cabezaY: 25, espaldaX: 80, espaldaY: 80 };
    if (safeData.mutated_espaldaX) safeAnclaje.espaldaX = safeData.mutated_espaldaX;
    if (safeData.mutated_espaldaY) safeAnclaje.espaldaY = safeData.mutated_espaldaY;
    if (safeData.mutated_cabezaX) safeAnclaje.cabezaX = safeData.mutated_cabezaX;
    if (safeData.mutated_cabezaY) safeAnclaje.cabezaY = safeData.mutated_cabezaY;
    
    const obtenerPieza = (dic, gen, fallback) => {
        if (typeof dic === 'undefined' || Object.keys(dic).length === 0) return '';
        if (gen && dic[gen]) return dic[gen]; 
        if (dic[fallback]) return dic[fallback]; 
        const keys = Object.keys(dic); return dic[keys[0]] || ''; 
    };

    const ojo = obtenerPieza(typeof dicOjos !== 'undefined' ? dicOjos : {}, safeData.eye_type, "estandar");
    const boca = obtenerPieza(typeof dicBocas !== 'undefined' ? dicBocas : {}, safeData.mouth_type, "estandar");
    const hat = obtenerPieza(typeof dicSombreros !== 'undefined' ? dicSombreros : {}, safeData.hat_type, "ninguno");
    const wing = obtenerPieza(typeof dicAlas !== 'undefined' ? dicAlas : {}, safeData.wing_type, "ninguno");
    const auraRaw = obtenerPieza(typeof dicAuras !== 'undefined' ? dicAuras : {}, safeData.aura_type, "ninguno");
    let dronRaw = obtenerPieza(typeof dicDrones !== 'undefined' ? dicDrones : {}, safeData.skin_type, "estandar");

    if (dronRaw) {
        dronRaw = dronRaw.replace(/glow-dron-grid/g, `glow-dron-${rndId}`);
        dronRaw = dronRaw.replace(/url\(#glow-dron-grid\)/g, `url(#glow-dron-${rndId})`);
    }

    let pathD = "", shineD = "", extras = "", detallesFrente = ""; 
    
    switch (shape) {
        case "gota": pathD = "M 80 24 Q 28 80 28 108 A 52 52 0 0 0 132 108 Q 132 80 80 24 Z"; shineD = "M 65 50 Q 55 65 58 80 Q 62 70 70 55 Z"; break;
        case "hongo": 
            const tallo = "M 72 110 C 72 120 65 130 60 135 C 50 148 65 150 80 150 C 95 150 110 148 100 135 C 95 130 88 120 88 110 Z";
            pathD = "M 15 90 C 15 20, 145 20, 145 90 C 145 118, 122 122, 80 122 C 38 122, 15 118, 15 90 Z"; 
            shineD = "M 40 55 Q 50 40 70 40 Q 55 48 40 55 Z"; 

            // ✨ FIX: Generación aleatoria vinculada 100% al ID único del Geno.
            // Nace aleatorio por su ID, pero se queda fijo para siempre.
            let seedStr = String(safeData.id || "preview");
            let baseSeed = 0;
            for (let i = 0; i < seedStr.length; i++) { 
                baseSeed = seedStr.charCodeAt(i) + ((baseSeed << 5) - baseSeed); 
            }
            baseSeed = Math.abs(baseSeed);

            const randomFijo = (s) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };
            
            let generatedManchas = `<g fill="#ffffff" opacity="0.6">`;
            for (let i = 0; i < 8; i++) {
                // Coordenadas calculadas en base a la semilla inmutable
                const cx = 40 + randomFijo(baseSeed + i) * (120 - 40);
                const cy = 48 + randomFijo(baseSeed + i + 10) * (105 - 48);
                const r = 2 + randomFijo(baseSeed + i + 20) * (6.5 - 2);
                generatedManchas += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}"/>`;
            }
            generatedManchas += `</g>`;

            extras = `<path d="${tallo}" fill="${color}" stroke="#1a2a36" stroke-width="5"/><path d="${tallo}" fill="url(#${gradId})"/>`;
            detallesFrente = `<defs><clipPath id="hongoMask-${rndId}"><path d="${pathD}"/></clipPath></defs><g clip-path="url(#hongoMask-${rndId})">${generatedManchas}</g>`;
            break;
        case "triangulo": pathD = "M 80 24 Q 88 24 96 40 L 136 120 Q 144 136 120 136 L 40 136 Q 16 136 24 120 L 64 40 Q 72 24 80 24 Z"; shineD = "M 72 48 L 48 104 Q 56 80 80 56 Z"; break;
        case "circulo": pathD = "M 24 88 A 56 56 0 1 0 136 88 A 56 56 0 1 0 24 88 Z"; shineD = "M 40 72 A 40 40 0 0 1 88 40 A 48 48 0 0 0 40 96 Z"; break;
        case "cuadrado": pathD = "M 32 48 Q 32 32 48 32 L 112 32 Q 128 32 128 48 L 128 112 Q 128 128 112 128 L 48 128 Q 32 128 32 112 Z"; shineD = "M 45 48 Q 45 45 56 45 L 96 45 Q 64 64 45 88 Z"; break;
        case "estrella": pathD = "M 80 35 Q 84 35 86 41 L 98 68 L 136 68 Q 142 68 139 74 L 110 98 L 119 142 Q 121 148 115 144 L 80 126 L 45 144 Q 39 148 41 142 L 50 98 L 21 74 Q 18 68 24 68 L 62 68 L 74 41 Q 76 35 80 35 Z"; shineD = "M 70 60 L 55 95 Q 75 85 90 80 Z"; break;
        case "pentagono": pathD = "M 80 25 Q 84 25 86 29 L 132 63 Q 135 66 134 70 L 112 125 Q 110 130 105 130 L 55 130 Q 50 130 48 125 L 26 70 Q 25 66 28 63 L 74 29 Q 76 25 80 25 Z"; shineD = "M 70 45 L 45 80 Q 60 70 90 70 Z"; break;
        case "nube": pathD = "M 45 130 C 20 130, 20 75, 50 70 C 55 25, 105 25, 110 70 C 140 75, 140 130, 115 130 Z"; shineD = "M 55 60 Q 80 40 105 60 Q 80 50 55 60 Z"; break;
        case "chili": pathD = "M 80 20 C 40 20, 30 70, 45 105 C 60 140, 80 145, 80 145 C 80 145, 100 140, 115 105 C 130 70, 120 20, 80 20 Z"; shineD = "M 50 60 C 40 90, 60 120, 75 135 C 60 110, 50 80, 65 50 Z"; break;
        case "rayo": pathD = "M 95 20 L 35 85 L 85 85 L 65 145 L 125 80 L 75 80 Z"; shineD = "M 75 45 L 55 75 L 80 75 Z"; break;
        default: pathD = "M 65 25 C 110 20, 135 50, 135 85 C 135 125, 105 145, 75 145 C 35 145, 25 115, 35 75 C 40 50, 35 30, 65 25 Z"; shineD = "M 45 48 Q 60 38 75 40 Q 55 52 50 75 Q 40 60 45 48 Z"; break;
    }

    // =========================================
    // ✨ INYECCIÓN DE GENES COSMÉTICOS Y SIMETRÍA
    // =========================================
    let capaFondo = ""; 
    let capaCosmeticaFrente = ""; 
    let claseCuerpoExtra = "";
    let cssExtra = "";
    let estiloCuerpoEnLinea = "";

    const oculto = safeData.hidden_genes ? safeData.hidden_genes.A : safeData.hidden_gene;

    if (safeData.scanned && oculto) {
        const idGenCosmetico = oculto.id;

        if (idGenCosmetico === "cromatico_latente") {
            estiloCuerpoEnLinea = "filter: hue-rotate(180deg) saturate(1.5);";
        }
        
        if (idGenCosmetico === "forma_invertida") {
            estiloCuerpoEnLinea = "filter: invert(1) contrast(1.2);";
        }

        if (idGenCosmetico === "metamorfosis_estacional") {
            claseCuerpoExtra = `anim-estacional-${rndId}`;
            cssExtra += `@keyframes hueShift-${rndId} { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } } 
                         .anim-estacional-${rndId} { animation: hueShift-${rndId} 8s linear infinite; }`;
        }

        if (idGenCosmetico === "brillo_bioluminiscente") {
            claseCuerpoExtra = `anim-biolum-${rndId}`;
            cssExtra += `@keyframes biolum-${rndId} { 0% { filter: drop-shadow(0 0 5px ${color}); } 100% { filter: drop-shadow(0 0 20px ${color}); } } 
                         .anim-biolum-${rndId} { animation: biolum-${rndId} 2s infinite alternate ease-in-out; }`;
        }

        if (idGenCosmetico === "aura_linaje") {
            capaFondo += `
                <g class="anim-aura">
                    <circle cx="80" cy="85" r="70" fill="none" stroke="#ffcc00" stroke-width="4" stroke-dasharray="15 10" opacity="0.6"/>
                    <circle cx="80" cy="85" r="60" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="5 20" opacity="0.8"/>
                </g>
            `;
        }

        if (idGenCosmetico === "patron_holografico") {
            capaCosmeticaFrente += `
                <g clip-path="url(#${maskId})" class="anim-holograma">
                    <path d="M 0 0 L 200 160 M 0 20 L 200 180 M 0 40 L 200 200 M 0 60 L 200 220" stroke="#ff00ea" stroke-width="2.5" opacity="0.8" stroke-dasharray="12 6" />
                    <path d="M 200 0 L 0 160 M 200 20 L 0 180 M 200 40 L 0 200 M 200 60 L 0 220" stroke="#ff00ea" stroke-width="2.5" opacity="0.8" stroke-dasharray="12 6" />
                </g>
            `;
        }

        if (idGenCosmetico === "emblema_fundador") {
            cssExtra += `
                @keyframes emblemaGlow-${rndId} {
                    0% { filter: drop-shadow(0 0 5px #ffcc00) drop-shadow(0 0 15px #ff00ea); transform: translateY(0px) scale(0.6); }
                    50% { filter: drop-shadow(0 0 10px #00d2ff) drop-shadow(0 0 25px #00d2ff) hue-rotate(180deg); transform: translateY(-8px) scale(0.65); }
                    100% { filter: drop-shadow(0 0 5px #ffcc00) drop-shadow(0 0 15px #ff00ea) hue-rotate(360deg); transform: translateY(0px) scale(0.6); }
                }
                .anim-emblema-${rndId} { 
                    animation: emblemaGlow-${rndId} 4s infinite alternate ease-in-out; 
                    transform-origin: 15px 15px; 
                }
                @keyframes girarCentro-${rndId} {
                    0% { transform: rotate(0deg) scale(1); }
                    50% { transform: rotate(180deg) scale(1.2); }
                    100% { transform: rotate(360deg) scale(1); }
                }
                .anim-centro-${rndId} {
                    transform-origin: 15px 15px;
                    animation: girarCentro-${rndId} 6s infinite linear;
                }
            `;

            capaCosmeticaFrente += `
                <g transform="translate(165, 15)">
                    <g class="anim-emblema-${rndId}">
                        <path d="M 15 -5 C 30 -5, 35 10, 35 15 C 35 25, 15 40, 15 40 C 15 40, -5 25, -5 15 C -5 10, 0 -5, 15 -5 Z" fill="rgba(255, 215, 0, 0.2)" stroke="#ffcc00" stroke-width="2" stroke-dasharray="4 2"/>
                        <g class="anim-centro-${rndId}">
                            <path d="M 15 2 L 19 10 L 28 10 L 21 16 L 24 25 L 15 20 L 6 25 L 9 16 L 2 10 L 11 10 Z" fill="#ffffff" stroke="#ffcc00" stroke-width="1"/>
                            <circle cx="15" cy="15" r="4" fill="#00ffff" />
                            <circle cx="15" cy="15" r="2" fill="#ffffff" />
                        </g>
                    </g>
                </g>
            `;
        }

        if (idGenCosmetico === "sombra_genetica") {
            cssExtra += `@keyframes sombraGen-${rndId} { 0% { transform: translate(15px, 5px) skewX(-10deg); } 100% { transform: translate(-15px, 5px) skewX(10deg); } } 
                         .anim-sombra-gen-${rndId} { animation: sombraGen-${rndId} 3s infinite alternate ease-in-out; transform-origin: 80px 136px; }`;
            capaFondo += `<g class="anim-sombra-gen-${rndId}"><path d="${pathD}" fill="#000" opacity="0.4"/></g>`;
        }

        if (idGenCosmetico === "rastro_elemental") {
            capaFondo += `<g transform="translate(-15, 0)" opacity="0.3" filter="blur(3px)"><path d="${pathD}" fill="${color}"/></g>`;
        }

        if (idGenCosmetico === "eco_visual") {
            cssExtra += `
                @keyframes ecoMove-${rndId} {
                    0%, 100% { transform: translate(-10px, -5px) scale(1); opacity: 0.2; }
                    50% { transform: translate(10px, 5px) scale(1.02); opacity: 0.5; }
                }
                .anim-eco-${rndId} { 
                    transform-origin: 80px 136px; 
                    animation: ecoMove-${rndId} 4s ease-in-out infinite; 
                    filter: blur(2px) brightness(1.4) hue-rotate(20deg); 
                }
            `;
            capaFondo += `
                <g class="anim-eco-${rndId}">
                    <g transform="translate(${safeAnclaje.espaldaX}, ${safeAnclaje.espaldaY})">${wing}</g>
                    <path d="${pathD}" fill="${color}"/>
                </g>
            `;
        }
    }

    let dirtMarkup = "";
    if (safeData.dirtSpots && safeData.dirtSpots.length > 0) {
        dirtMarkup = `<g clip-path="url(#${maskId})">`;
        safeData.dirtSpots.forEach(s => {
            dirtMarkup += `<circle cx="${s.x}" cy="${s.y}" r="${s.r || 10}" fill="url(#grad-dirt-${rndId})" filter="url(#blur-dirt-${rndId})" />`;
        });
        dirtMarkup += `</g>`;
    }

    let soapMarkup = "";
    if (safeData.soapySpots && safeData.soapySpots.length > 0) {
        soapMarkup = `<g clip-path="url(#${maskId})">`;
        safeData.soapySpots.forEach(s => {
            soapMarkup += `<circle cx="${s.x}" cy="${s.y}" r="${s.r || 12}" fill="url(#grad-soap-${rndId})" filter="url(#blur-dirt-${rndId})" />`;
        });
        soapMarkup += `</g>`;
    }

    return `
    <svg width="200" height="190" viewBox="-20 0 200 160" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
        <defs>
            <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#000" stop-opacity="0"/>
                <stop offset="100%" stop-color="#000" stop-opacity="0.25"/>
            </linearGradient>
            <clipPath id="${maskId}"><path d="${pathD}" /></clipPath>
            <radialGradient id="grad-dirt-${rndId}" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#795548" stop-opacity="0.95"/>
                <stop offset="70%" stop-color="#5d4037" stop-opacity="0.8"/>
                <stop offset="100%" stop-color="#5d4037" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="grad-soap-${rndId}" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
                <stop offset="70%" stop-color="#e0f7fa" stop-opacity="0.8"/>
                <stop offset="100%" stop-color="#b2ebf2" stop-opacity="0.3"/>
            </radialGradient>
            <filter id="blur-dirt-${rndId}">
                <feGaussianBlur stdDeviation="0.8"/>
            </filter>
        </defs>
        <style>
            @keyframes respirar { 0%, 100% { transform: scale(1); } 50% { transform: scaleY(0.97) scaleX(1.02); } }
            @keyframes parpadear { 0%, 94%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.05); } }
            @keyframes propulsor { 0% { transform: scaleY(1); opacity: 0.9; } 100% { transform: scaleY(1.5); opacity: 1; } }
            @keyframes rotarAura { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes deslizarHolograma { 0% { transform: translateY(-20px); opacity: 0.3; } 50% { opacity: 0.8; } 100% { transform: translateY(20px); opacity: 0.3; } }
            @keyframes flotarDron { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            
            .g-cuerpo { transform-origin: 80px 136px; animation: respirar 3.5s ease-in-out infinite; }
            .g-ojos { transform-origin: 80px 85px; animation: parpadear 5s infinite; }
            .anim-flotar { animation: respirar 3s ease-in-out infinite; }
            .anim-fuego { animation: propulsor 0.1s infinite alternate ease-in-out; }
            .anim-aura { transform-origin: 80px 85px; animation: rotarAura 15s linear infinite; }
            .anim-holograma { animation: deslizarHolograma 4s ease-in-out infinite alternate; }
            .anim-flotar-dron { animation: flotarDron 4s ease-in-out infinite; }
            
            ${cssExtra}
        </style>
        
        ${capaFondo}
        ${auraRaw} 
        
        <g class="g-cuerpo ${claseCuerpoExtra}" style="${estiloCuerpoEnLinea}">
            <g transform="translate(${safeAnclaje.espaldaX}, ${safeAnclaje.espaldaY})">${wing}</g>
            ${extras}
            <path d="${pathD}" fill="${color}" stroke="#1a2a36" stroke-width="5"/>
            <path d="${pathD}" fill="url(#${gradId})"/>
            ${detallesFrente}
            ${dirtMarkup}
            ${soapMarkup}
            <path d="${shineD}" fill="#fff" opacity="0.4"/>
            ${capaCosmeticaFrente}
            ${dronRaw} 
            <g class="g-ojos">${ojo}</g>
            <g class="g-boca">${boca}</g>
            <g transform="translate(${safeAnclaje.cabezaX}, ${safeAnclaje.cabezaY})">${hat}</g>
        </g>
    </svg>`;
}