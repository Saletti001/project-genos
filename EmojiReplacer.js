// EmojiReplacer.js - Centralized Emoji to Premium Cyberpunk SVG Replacement Engine
// Autostarts DOM scanning on load and intercepts alert dialogs.

(function() {
    // 1. High-fidelity Cyberpunk themed SVGs for emojis
    const EMOJI_MAP = {
        // Warning / Alerts
        "⚠️": `<svg class="cyber-icon svg-warning" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff9800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,152,0,0.5));"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        "⚠": `<svg class="cyber-icon svg-warning" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff9800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,152,0,0.5));"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        "❌": `<svg class="cyber-icon svg-close" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff007f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,0,127,0.5));"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        "⛔": `<svg class="cyber-icon svg-stop" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
        "🚫": `<svg class="cyber-icon svg-prohibit" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff007f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,0,127,0.5));"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
        "🔒": `<svg class="cyber-icon svg-lock" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d500f9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(213,0,249,0.5));"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
        "🔓": `<svg class="cyber-icon svg-unlock" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(0,229,255,0.5));"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
        "✅": `<svg class="cyber-icon svg-check" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#69f0ae" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(105,240,174,0.5));"><polyline points="20 6 9 17 4 12"/></svg>`,
        "✓": `<svg class="cyber-icon svg-check" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#69f0ae" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(105,240,174,0.5));"><polyline points="20 6 9 17 4 12"/></svg>`,

        // Biology / Bio-Tech
        "🧬": `<svg class="cyber-icon svg-dna" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(0,229,255,0.5));"><path d="M4.5 10.5c3-6 12-6 15 0m-15 3c3 6 12 6 15 0"/><path d="M6 8v8m4-9v10m4-10v10m4-9v8"/></svg>`,
        "🧪": `<svg class="cyber-icon svg-flask" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#69f0ae" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(105,240,174,0.5));"><path d="M9 3h6M10 3v15a2 2 0 0 0 4 0V3M8 6h8"/></svg>`,
        "🎨": `<svg class="cyber-icon svg-palette" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03459 19.176 5.1226 19.264 5.1633 19.373C5.204 19.482 5.19141 19.6083 5.16622 19.861L5.05556 20.9678C5.00671 21.4563 5.38883 21.8889 5.88143 21.8889H12Z"/><circle cx="7.5" cy="10.5" r="1.5" fill="#ff007f"/><circle cx="11.5" cy="7.5" r="1.5" fill="#00e5ff"/><circle cx="16.5" cy="9.5" r="1.5" fill="#ffea00"/></svg>`,
        "💉": `<svg class="cyber-icon svg-injection" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#69f0ae" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="m18 2 4 4M17 3l-3.5 3.5M11 6l-6 6a2 2 0 0 0 0 2.83l1.17 1.17a2 2 0 0 0 2.83 0l6-6M9 17l-5 5M4 16v4h4"/></svg>`,

        // Energy / Stats
        "⚡": `<svg class="cyber-icon svg-energy" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffea00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,234,0,0.5));"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        "🔋": `<svg class="cyber-icon svg-battery" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#69f0ae" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(105,240,174,0.5));"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="11" x2="23" y2="13"/><line x1="5" y1="10" x2="5" y2="14"/><line x1="9" y1="10" x2="9" y2="14"/><line x1="13" y1="10" x2="13" y2="14"/></svg>`,
        "✨": `<svg class="cyber-icon svg-sparkles" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffea00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,234,0,0.5));"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
        "🌟": `<svg class="cyber-icon svg-star" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffea00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,234,0,0.5));"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>`,
        "⭐": `<svg class="cyber-icon svg-star" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffea00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,234,0,0.5));"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>`,
        "💫": `<svg class="cyber-icon svg-star" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffea00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><circle cx="12" cy="12" r="10"/><path d="m12 2 2 4 4 2-4 2-2 4-2-4-4-2 4-2z"/></svg>`,
        "🔥": `<svg class="cyber-icon svg-fire" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff3d00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,61,0,0.5));"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
        "❄": `<svg class="cyber-icon svg-snow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#80deea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(128,222,234,0.5));"><path d="M12 2v20M2 12h20M20 8l-8 4-8-4M4 16l8-4 8 4"/></svg>`,
        "❄️": `<svg class="cyber-icon svg-snow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#80deea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(128,222,234,0.5));"><path d="M12 2v20M2 12h20M20 8l-8 4-8-4M4 16l8-4 8 4"/></svg>`,

        // Combat / RPG
        "⚔️": `<svg class="cyber-icon svg-swords" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,0,127,0.5));"><path d="m3 21 18-18M21 21 3 3M5 16l3 3M19 16l-3 3"/></svg>`,
        "⚔": `<svg class="cyber-icon svg-swords" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,0,127,0.5));"><path d="m3 21 18-18M21 21 3 3M5 16l3 3M19 16l-3 3"/></svg>`,
        "🛡️": `<svg class="cyber-icon svg-shield" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4dd0e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(77,208,225,0.5));"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        "🛡": `<svg class="cyber-icon svg-shield" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4dd0e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(77,208,225,0.5));"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        "🛡️": `<svg class="cyber-icon svg-shield" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4dd0e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(77,208,225,0.5));"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        "🛡": `<svg class="cyber-icon svg-shield" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4dd0e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(77,208,225,0.5));"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        "💥": `<svg class="cyber-icon svg-explosion" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,0,127,0.5));"><path d="m12 2 3 5 5-2-2 5 5 3-5 1 2 5-5-2-3 5-1-5-5 2 2-5-5-3 5-1-2-5 5 2Z"/></svg>`,
        "💀": `<svg class="cyber-icon svg-skull" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(226,232,240,0.5));"><path d="M9 12H9.01M15 12H15.01M12 2a7 7 0 0 0-7 7v3c0 2.2 1.8 4 4 4h6c2.2 0 4-1.8 4-4V9a7 7 0 0 0-7-7zM10 20h4"/></svg>`,
        "☠️": `<svg class="cyber-icon svg-skull" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M9 12H9.01M15 12H15.01M12 2a7 7 0 0 0-7 7v3c0 2.2 1.8 4 4 4h6c2.2 0 4-1.8 4-4V9a7 7 0 0 0-7-7zM10 20h4 M6 20l12-8 M18 20L6 12"/></svg>`,
        "☠": `<svg class="cyber-icon svg-skull" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M9 12H9.01M15 12H15.01M12 2a7 7 0 0 0-7 7v3c0 2.2 1.8 4 4 4h6c2.2 0 4-1.8 4-4V9a7 7 0 0 0-7-7zM10 20h4 M6 20l12-8 M18 20L6 12"/></svg>`,
        "🏆": `<svg class="cyber-icon svg-trophy" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffd700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,215,0,0.5));"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a6 6 0 0 1 6 6v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"/></svg>`,
        "👑": `<svg class="cyber-icon svg-crown" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffd700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>`,
        "🎁": `<svg class="cyber-icon svg-gift" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d500f9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(213,0,249,0.5));"><rect x="3" y="8" width="18" height="14" rx="2"/><path d="M12 5a3 3 0 1 0-3 3h6a3 3 0 1 0-3-3zm0 3v14M3 12h18"/></svg>`,
        "🛍️": `<svg class="cyber-icon svg-bag" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>`,
        "🛍": `<svg class="cyber-icon svg-bag" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>`,

        // Items / Logistics
        "🍱": `<svg class="cyber-icon svg-bento" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#69f0ae" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(105,240,174,0.5));"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/><line x1="15" y1="9" x2="15" y2="3"/></svg>`,
        "🧼": `<svg class="cyber-icon svg-soap" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(0,229,255,0.5));"><rect x="2" y="7" width="20" height="10" rx="3" ry="3"/><circle cx="6" cy="12" r="1"/><circle cx="18" cy="12" r="1"/><circle cx="12" cy="12" r="2" fill="#00e5ff" opacity="0.4"/></svg>`,
        "🎒": `<svg class="cyber-icon svg-backpack" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d500f9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(213,0,249,0.5));"><path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M8 12h8m-8 4h8"/></svg>`,
        "📦": `<svg class="cyber-icon svg-package" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d500f9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(213,0,249,0.5));"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
        "📜": `<svg class="cyber-icon svg-scroll" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffea00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
        "💿": `<svg class="cyber-icon svg-disc" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d500f9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`,
        "🍎": `<svg class="cyber-icon svg-apple" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,0,127,0.5));"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6c0-2 1-3 1-3 M9.5 8C8.5 7 8 5.5 8 5.5"/></svg>`,
        "🧺": `<svg class="cyber-icon svg-basket" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffea00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M22 12h-4.58A6 6 0 0 0 12 6a6 6 0 0 0-5.42 6H2 M2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6M12 2v4"/></svg>`,

        // Economy / Navigation
        "💰": `<svg class="cyber-icon svg-money" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffea00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,234,0,0.5));"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="10" x2="12" y2="14"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
        "💎": `<svg class="cyber-icon svg-diamond" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(0,229,255,0.5));"><polygon points="12 2 22 12 12 22 2 12 12 2"/></svg>`,
        "🔷": `<svg class="cyber-icon svg-diamond" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(0,229,255,0.5));"><polygon points="12 2 22 12 12 22 2 12 12 2"/></svg>`,
        "🦊": `<svg class="cyber-icon svg-wallet" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff9800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,152,0,0.5));"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="12" y1="10" x2="12" y2="14"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
        "🦊": `<svg class="cyber-icon svg-wallet" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff9800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(255,152,0,0.5));"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="12" y1="10" x2="12" y2="14"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
        "💡": `<svg class="cyber-icon svg-bulb" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffea00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/></svg>`,
        "🚪": `<svg class="cyber-icon svg-door" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>`,
        "📢": `<svg class="cyber-icon svg-speaker" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d500f9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8zM22 12a3 3 0 0 1-3 3M21 12a2 2 0 0 0-2-2"/></svg>`,
        "🌐": `<svg class="cyber-icon svg-globe" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
        "📡": `<svg class="cyber-icon svg-signal" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M5 12a10 10 0 0 1 14 0M8.55 15.45a5 5 0 0 1 6.9 0M12 20h.01"/></svg>`,
        "🚀": `<svg class="cyber-icon svg-rocket" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff9800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M4.5 16.5c-1.5 1.5-2.5 3.5-2.5 5.5C4 22 6 21 7.5 19.5L18 9l-3-3L4.5 16.5zM12 5l3 3M19 5l-2.5 2.5"/></svg>`,
        "🎁": `<svg class="cyber-icon svg-gift" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d500f9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(213,0,249,0.5));"><rect x="3" y="8" width="18" height="14" rx="2"/><path d="M12 5a3 3 0 1 0-3 3h6a3 3 0 1 0-3-3zm0 3v14M3 12h18"/></svg>`,

        // Miscellaneous / UI Emojis
        "⚙️": `<svg class="cyber-icon svg-gear" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
        "⚙": `<svg class="cyber-icon svg-gear" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
        "🌱": `<svg class="cyber-icon svg-sprout" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#69f0ae" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(105,240,174,0.5));"><path d="M2 22c0-5.5 4.5-10 10-10s10 4.5 10 10M12 2v10M12 2a4 4 0 0 1 4 4c0 2-4 6-4 6s-4-4-4-6a4 4 0 0 1 4-4z"/></svg>`,
        "🕊": `<svg class="cyber-icon svg-dove" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M22 2L2 22 M22 2a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4 M2 22a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4"/></svg>`,
        "🕊️": `<svg class="cyber-icon svg-dove" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M22 2L2 22 M22 2a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4 M2 22a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4"/></svg>`,
        "🤖": `<svg class="cyber-icon svg-robot" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(0,229,255,0.5));"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/><path d="M9 20h6M6 11V9a3 3 0 0 1 6 0v2M12 2v4"/></svg>`,
        "🔮": `<svg class="cyber-icon svg-crystal" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d500f9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><circle cx="12" cy="10" r="8"/><path d="M12 18v4M9 22h6"/></svg>`,
        "🎉": `<svg class="cyber-icon svg-party" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d500f9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(213,0,249,0.5));"><path d="M20 4a2 2 0 0 0-3-3L13 5l3 3zm-6 6L9 15m0-11-2 2m5 5-2 2m9-4 2 2M3 21h3l7-7-3-3z"/></svg>`,
        "🎉": `<svg class="cyber-icon svg-party" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d500f9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(213,0,249,0.5));"><path d="M20 4a2 2 0 0 0-3-3L13 5l3 3zm-6 6L9 15m0-11-2 2m5 5-2 2m9-4 2 2M3 21h3l7-7-3-3z"/></svg>`,

        // Add additional common symbols for completeness
        "❤️": `<svg class="cyber-icon svg-heart" viewBox="0 0 24 24" width="16" height="16" fill="#ec407a" stroke="#ec407a" stroke-width="2" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(236,64,122,0.5));"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
        "💖": `<svg class="cyber-icon svg-heart" viewBox="0 0 24 24" width="16" height="16" fill="#ec407a" stroke="#ec407a" stroke-width="2" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(236,64,122,0.5));"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
        "💚": `<svg class="cyber-icon svg-heart" viewBox="0 0 24 24" width="16" height="16" fill="#69f0ae" stroke="#69f0ae" stroke-width="2" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(105,240,174,0.5));"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
        "💙": `<svg class="cyber-icon svg-heart" viewBox="0 0 24 24" width="16" height="16" fill="#00e5ff" stroke="#00e5ff" stroke-width="2" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(0,229,255,0.5));"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
        "🤍": `<svg class="cyber-icon svg-heart" viewBox="0 0 24 24" width="16" height="16" fill="#fff" stroke="#fff" stroke-width="2" style="vertical-align: middle; display: inline-block;"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
        "💔": `<svg class="cyber-icon svg-heart-break" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff007f" stroke-width="2" style="vertical-align: middle; display: inline-block;"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="m12 3-2 5 3 3-3 5"/></svg>`,
        "☘": `<svg class="cyber-icon svg-luck" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#69f0ae" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M12 22c0-4 3-7 6-7s5 2 5 5-2 4-5 4-6-2-6-2Z"/><path d="M12 22c0-4-3-7-6-7s-5 2-5 5 2 4 5 4 6-2 6-2Z"/><path d="M12 2c-3 0-6 3-6 6s2 5 5 5 7-3 7-6-3-5-6-5Z"/><path d="M12 12v10"/></svg>`,
        "🍀": `<svg class="cyber-icon svg-luck" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#69f0ae" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M12 22c0-4 3-7 6-7s5 2 5 5-2 4-5 4-6-2-6-2Z"/><path d="M12 22c0-4-3-7-6-7s-5 2-5 5 2 4 5 4 6-2 6-2Z"/><path d="M12 2c-3 0-6 3-6 6s2 5 5 5 7-3 7-6-3-5-6-5Z"/><path d="M12 12v10"/></svg>`,
        "🌱": `<svg class="cyber-icon svg-sprout" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#69f0ae" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 2px rgba(105,240,174,0.5));"><path d="M2 22c0-5.5 4.5-10 10-10s10 4.5 10 10M12 2v10M12 2a4 4 0 0 1 4 4c0 2-4 6-4 6s-4-4-4-6a4 4 0 0 1 4-4z"/></svg>`
    };

    // 2. Global search and replace function
    // Handles variation selectors and different forms of emojis
    window.replaceEmojis = function(text) {
        if (typeof text !== "string" || !text) return text;

        let result = text;
        
        // Loop over the map and replace each occurrence
        for (const [emoji, svg] of Object.entries(EMOJI_MAP)) {
            // Check for standard emoji
            if (result.includes(emoji)) {
                result = result.replaceAll(emoji, svg);
            }
            // Check for emoji with variation selector-16 (sometimes added by OS/browsers)
            const emojiWithVS = emoji + "\uFE0F";
            if (result.includes(emojiWithVS)) {
                result = result.replaceAll(emojiWithVS, svg);
            }
        }
        return result;
    };

    // 3. Recursive DOM text node replacement
    window.replaceEmojisInDOM = function(node) {
        if (!node) return;
        
        if (node.nodeType === Node.TEXT_NODE) {
            const originalVal = node.nodeValue;
            const replacedVal = window.replaceEmojis(originalVal);
            
            if (replacedVal !== originalVal) {
                // If replacement took place, create a span element to host the SVG elements
                const tempSpan = document.createElement("span");
                tempSpan.className = "replaced-emoji-wrapper";
                tempSpan.innerHTML = replacedVal;
                
                // Safely replace the text node
                if (node.parentNode) {
                    node.parentNode.replaceChild(tempSpan, node);
                }
            }
        } else {
            // Skip elements that shouldn't be altered or where SVGs might break things
            const skipTags = ["SCRIPT", "STYLE", "INPUT", "TEXTAREA", "IFRAME", "CANVAS", "SVG"];
            if (node.nodeName && !skipTags.includes(node.nodeName.toUpperCase())) {
                // Read childNodes array backward to allow safe replacements
                const children = Array.from(node.childNodes);
                for (let i = children.length - 1; i >= 0; i--) {
                    window.replaceEmojisInDOM(children[i]);
                }
            }
        }
    };

    // 4. Autostart DOM scan on load
    if (typeof document !== "undefined") {
        const startScan = () => {
            window.replaceEmojisInDOM(document.body);
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", startScan);
        } else {
            startScan();
        }
    }

    // 5. Intercept alert() and apply emoji-to-SVG replacement on index/laboratorio alerts
    if (typeof window !== "undefined") {
        // Safe check for alert override
        const origAlert = window.alert;
        
        // Wrap the standard alert
        window.alert = function(msg) {
            // Check if game-specific cyber-alert modal exists
            const modal = document.getElementById("cyber-alert-modal");
            const textEl = document.getElementById("cyber-alert-text");
            const btn = document.getElementById("cyber-alert-btn");
            const content = modal ? modal.querySelector("div") : null;
            
            if (!modal || !textEl || !btn) {
                // If no custom modal exists on this page, fall back to native alert (which only displays text, emojis are native)
                return origAlert(msg);
            }
            
            // If the custom modal exists, apply the premium SVG replacements!
            const htmlMessage = String(msg).replace(/\n/g, "<br>");
            const translatedHtml = window.replaceEmojis(htmlMessage);
            
            textEl.innerHTML = translatedHtml;
            modal.style.display = "flex";
            modal.classList.remove("hidden");
            
            setTimeout(() => {
                modal.style.opacity = "1";
                if (content) content.style.transform = "scale(1)";
            }, 10);
            
            btn.focus();
            
            return new Promise((resolve) => {
                const closeAlert = () => {
                    modal.style.opacity = "0";
                    if (content) content.style.transform = "scale(0.9)";
                    setTimeout(() => {
                        modal.style.display = "none";
                        modal.classList.add("hidden");
                        btn.removeEventListener("click", closeAlert);
                        document.removeEventListener("keydown", handleKey);
                        resolve();
                    }, 200);
                };
                
                const handleKey = (e) => {
                    if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
                        e.preventDefault();
                        closeAlert();
                    }
                };
                
                btn.addEventListener("click", closeAlert);
                document.addEventListener("keydown", handleKey);
            });
        };
    }
})();
