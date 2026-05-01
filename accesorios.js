// =========================================
// accesorios.js - V19 (REDISEÑO DE DRON, ALAS SOLI DAS Y AURA NARANJA)
// =========================================

const anclajes = {
    frijol: { cabezaX: 80, cabezaY: 25, espaldaX: 88, espaldaY: 80 }, 
    hongo: { cabezaX: 80, cabezaY: 45, espaldaX: 80, espaldaY: 90 }, 
    gota: { cabezaX: 80, cabezaY: 35, espaldaX: 80, espaldaY: 85 }, 
    triangulo: { cabezaX: 80, cabezaY: 35, espaldaX: 80, espaldaY: 90 }, 
    circulo: { cabezaX: 80, cabezaY: 32, espaldaX: 80, espaldaY: 88 },
    cuadrado: { cabezaX: 80, cabezaY: 32, espaldaX: 80, espaldaY: 80 },
    estrella: { cabezaX: 80, cabezaY: 49, espaldaX: 80, espaldaY: 85 },
    nube: { cabezaX: 80, cabezaY: 42, espaldaX: 80, espaldaY: 98 },
    pentagono: { cabezaX: 80, cabezaY: 38, espaldaX: 80, espaldaY: 85 },
    chili: { cabezaX: 80, cabezaY: 25, espaldaX: 80, espaldaY: 90 },
    rayo: { cabezaX: 80, cabezaY: 30, espaldaX: 80, espaldaY: 85 }
};

const dicSombreros = {
    ninguno: ``,
    corona_rey: `<path d="M -18 0 L -24 -28 L -6 -16 L 0 -34 L 6 -16 L 24 -28 L 18 0 Z" fill="#facc15" stroke="#1a2a36" stroke-width="3" stroke-linejoin="round"/><circle cx="-24" cy="-28" r="3.5" fill="#ef4444"/><circle cx="0" cy="-34" r="3.5" fill="#22c55e"/><circle cx="24" cy="-28" r="3.5" fill="#ef4444"/><rect x="-18" y="-6" width="36" height="6" fill="#ca8a04"/>`,
    cuerno_mutante: `<path d="M -10 0 Q -20 -30 10 -45 Q 8 -20 10 0 Z" fill="#f8fafc" stroke="#1a2a36" stroke-width="3" stroke-linejoin="round"/><path d="M -3 0 Q -8 -30 14 -38 Q 10 -15 10 0 Z" fill="#cbd5e1"/>`,
    halo_neon: `<ellipse cx="0" cy="-25" rx="22" ry="7" fill="none" stroke="#ef4444" stroke-width="4" filter="drop-shadow(0 0 5px #ff0000)" class="anim-flotar"/>`
};

const dicAlas = {
    ninguno: ``,
    // FIX: Ala derecha (segundo path) ahora es color sólido, sin transparencia (opacity="0.8" eliminado)
    alas_murcielago: `
        <path d="M 0 -5 C -20 -8, -35 -10, -50 -10 Q -70 -40 -90 -50 Q -75 -15 -95 0 Q -70 0 -85 20 Q -60 10 -50 10 C -35 10, -20 8, 0 5 Z" fill="#4a5568" stroke="#0f172a" stroke-width="3"/>
        <path d="M 0 -5 C 20 -8, 35 -10, 50 -10 Q 70 -40 90 -50 Q 75 -15 95 0 Q 70 0 85 20 Q 60 10 50 10 C 35 10, 20 8, 0 5 Z" fill="#2d3748" stroke="#0f172a" stroke-width="3"/>
    `,
    jetpack: `
        <rect x="-60" y="-10" width="120" height="20" rx="5" fill="#4a5568" stroke="#1a2a36" stroke-width="3"/>
        
        <g transform="translate(-75, -15)">
            <rect width="25" height="40" rx="4" fill="#718096" stroke="#1a2a36" stroke-width="3"/>
            <rect x="7" y="5" width="11" height="8" rx="2" fill="#ef4444"/>
            <g class="anim-fuego" style="transform-origin: 12px 40px;">
                <path d="M 5 40 L 12 55 L 20 40 Z" fill="#f97316"/>
                <path d="M 8 40 L 12 50 L 16 40 Z" fill="#facc15"/>
            </g>
        </g>
        
        <g transform="translate(50, -15)">
            <rect width="25" height="40" rx="4" fill="#718096" stroke="#1a2a36" stroke-width="3"/>
            <rect x="7" y="5" width="11" height="8" rx="2" fill="#ef4444"/>
            <g class="anim-fuego" style="transform-origin: 12px 40px;">
                <path d="M 5 40 L 12 55 L 20 40 Z" fill="#f97316"/>
                <path d="M 8 40 L 12 50 L 16 40 Z" fill="#facc15"/>
            </g>
        </g>
    `
};

// =========================================
// accesorios.js - V20 (REDUCCIÓN DRON V20% Y RECOLOREADO)
// =========================================

const dicDrones = {
    estandar: ``,
    // ✨ REDISEÑO V20: Dron Centinela más pequeño, borde Oro Corona y antena Green/Red
    malla_cibernetica: `
        <!-- ✨ FIX: Coordenadas ajustadas a (-45, 25) para simetría -->
        <g transform="translate(-45, 25)">
            <defs>
                <filter id="glow-dron-grid">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>
            <g class="anim-flotar-dron" style="transform-origin: 20px 20px;">
                <g transform="scale(0.8)"> <rect x="0" y="0" width="40" height="40" rx="8" fill="#1a2a36" stroke="#facc15" stroke-width="2.5" filter="url(#glow-dron-grid)"/>
                    
                    <path d="M 10 0 L 10 40 M 20 0 L 20 40 M 30 0 L 30 40 M 0 10 L 40 10 M 0 20 L 40 20 M 0 30 L 40 30" stroke="#facc15" stroke-width="1" opacity="0.3"/>
                    
                    <circle cx="20" cy="20" r="8" fill="#000" stroke="#facc15" stroke-width="2"/>
                    <circle cx="20" cy="20" r="4" fill="#00ffff" class="anim-flotar" style="transform-origin: 20px 20px;">
                        <animate attributeName="fill" values="#00ffff;#ef4444;#00ffff" dur="0.8s" repeatCount="indefinite" />
                    </circle>
                    
                    <line x1="20" y1="0" x2="20" y2="-10" stroke="#facc15" stroke-width="2" stroke-linecap="round"/>

                    <circle cx="20" cy="-10" r="4" fill="#22c55e">
                        <animate attributeName="fill" values="#22c55e;#ef4444;#22c55e" dur="1s" repeatCount="indefinite" />
                    </circle>
                </g>
            </g>
        </g>
    `
};

const dicAuras = {
    ninguno: ``,
    // ✨ NUEVO: Efecto de Pulso de Energía Naranja Profesional (Nace, crece y se desvanece antes del borde)
    energia_oscura: `
        <defs>
            <filter id="orange-glow">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
        <g class="anim-flotar" style="opacity: 0.8;">
            <circle cx="80" cy="85" r="45" fill="none" stroke="#f97316" stroke-width="2.5" filter="url(#orange-glow)">
                <animate attributeName="r" from="45" to="85" dur="2.5s" begin="0s" repeatCount="indefinite"/>
                <animate attributeName="opacity" from="0.8" to="0" dur="2.5s" begin="0s" repeatCount="indefinite"/>
            </circle>
            <circle cx="80" cy="85" r="55" fill="rgba(249, 115, 22, 0.15)" filter="drop-shadow(0 0 15px #ea580c)"/>
        </g>
    `,
    fuego_solar: `
        <defs>
            <filter id="sun-glow">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
        <g class="anim-flotar" style="opacity: 0.8;">
            <circle cx="80" cy="85" r="70" fill="none" stroke="#f97316" stroke-width="6" stroke-dasharray="1 8" stroke-linecap="round" filter="url(#sun-glow)">
                <animateTransform attributeName="transform" type="rotate" from="0 80 85" to="360 80 85" dur="20s" repeatCount="indefinite"/>
            </circle>
             <circle cx="80" cy="85" r="72" fill="none" stroke="#ef4444" stroke-width="2" opacity="0.4" filter="url(#sun-glow)"/>
        </g>
    `
};