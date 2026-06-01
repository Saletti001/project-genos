// =========================================
// DailyLoginManager.js - RECOMPENSAS DIARIAS ACUMULATIVAS
// =========================================

window.DailyLoginManager = {
    rewards: [
        { day: 1, name: "10 EV", type: "essence", amount: 10, iconName: "essence", desc: "Esencia Vital" },
        { day: 2, name: "25 EV", type: "essence", amount: 25, iconName: "essence", desc: "Esencia Vital" },
        { day: 3, name: "🍱 Ración Auto", type: "item", id: "ration_auto", name: "Ración Automática", iconName: "ration", itemType: "consumable", desc: "Alimenta en reserva 24h.", maxStack: 20 },
        { day: 4, name: "50 EV", type: "essence", amount: 50, iconName: "essence", desc: "Esencia Vital" },
        { day: 5, name: "💿 Escáner B.", type: "item", id: "escaner_basico", name: "Escáner Básico", iconName: "escaner_basico", itemType: "basic", desc: "Revela slots del Geno.", maxStack: 99 },
        { day: 6, name: "100 EV", type: "essence", amount: 100, iconName: "essence", desc: "Esencia Vital" },
        { day: 7, name: "💿 Escáner C.", type: "item", id: "escaner_completo", name: "Escáner Completo", iconName: "escaner_completo", itemType: "basic", desc: "Genética exacta S-D.", maxStack: 99 }
    ],

    getSVG: function(name) {
        if (name === "essence") {
            return window.iconoEV || `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L14.5 8.5L22 11L14.5 13.5L12 21L9.5 13.5L2 11L9.5 8.5L12 1Z" fill="#FFD700"/></svg>`;
        }
        if (name === "ration") {
            return `<span style="font-size: 24px;">🍱</span>`;
        }
        if (name === "escaner_basico") {
            return `<svg viewBox="0 0 100 100" width="24" height="24"><path d="M45 20 A25 25 0 1 1 20 45 A25 25 0 0 1 45 20" fill="none" stroke="#00E5FF" stroke-width="8"/><path d="M62 62 L90 90" stroke="#00E5FF" stroke-width="12" stroke-linecap="round"/><circle cx="45" cy="45" r="12" fill="#00B0FF" opacity="0.5"/><path d="M25 45 L65 45 M45 25 L45 65" stroke="#00E5FF" stroke-width="4" opacity="0.8"/></svg>`;
        }
        if (name === "escaner_completo") {
            return `<svg viewBox="0 0 100 100" width="24" height="24"><path d="M25 20 Q50 50 75 80 M75 20 Q50 50 25 80" fill="none" stroke="#D500F9" stroke-width="8"/><line x1="33" y1="50" x2="67" y2="50" stroke="#D500F9" stroke-width="5"/><line x1="42" y1="30" x2="58" y2="70" stroke="#D500F9" stroke-width="5"/><line x1="58" y1="30" x2="42" y2="70" stroke="#D500F9" stroke-width="5"/><circle cx="25" cy="20" r="7" fill="#AA00FF"/><circle cx="75" cy="80" r="7" fill="#AA00FF"/><circle cx="75" cy="20" r="7" fill="#AA00FF"/><circle cx="25" cy="80" r="7" fill="#AA00FF"/></svg>`;
        }
        return "🎁";
    },

    checkEligibility: function() {
        const todayStr = new Date().toDateString();
        return !window.dailyLoginData || window.dailyLoginData.lastClaimDate !== todayStr;
    },

    claimReward: function() {
        if (!this.checkEligibility()) {
            alert("🔒 Ya has reclamado tu recompensa de hoy. ¡Vuelve mañana!");
            return;
        }

        const currentStreak = window.dailyLoginData.currentDayStreak; // 0 to 6
        const reward = this.rewards[currentStreak];

        // Entregar recompensa
        if (reward.type === "essence") {
            if (window.miInventario && typeof window.miInventario.addEssence === "function") {
                window.miInventario.addEssence(reward.amount);
            } else {
                alert("Error: El sistema de inventario no está listo.");
                return;
            }
        } else if (reward.type === "item") {
            if (window.miInventario && typeof window.miInventario.addItem === "function") {
                const itemObj = {
                    id: reward.id,
                    name: reward.name,
                    icon: this.getSVG(reward.iconName),
                    type: reward.itemType,
                    maxStack: reward.maxStack,
                    desc: reward.desc
                };
                const exito = window.miInventario.addItem(itemObj);
                if (!exito) {
                    // Si el inventario está lleno, abortamos para no perder la recompensa
                    return;
                }
            } else {
                alert("Error: El sistema de inventario no está listo.");
                return;
            }
        }

        // Actualizar datos de guardado
        window.dailyLoginData.lastClaimDate = new Date().toDateString();
        window.dailyLoginData.currentDayStreak = (currentStreak + 1) % 7;

        // Guardar progreso y respaldar en la nube
        if (typeof window.guardarProgreso === "function") {
            window.guardarProgreso();
        }

        // Efectos de sonido
        if (window.Sonidos) {
            window.Sonidos.play("heal");
        }

        alert(`✨ ¡Felicidades! Has reclamado tu recompensa de Día ${reward.day}: ${reward.name}.`);

        // Actualizar UI del modal
        this.renderGrid();
        this.updateClaimButton();
    },

    renderGrid: function() {
        const grid = document.getElementById("daily-rewards-grid");
        if (!grid) return;

        grid.innerHTML = "";
        const todayStr = new Date().toDateString();
        const hasClaimedToday = !this.checkEligibility();
        const currentStreak = window.dailyLoginData ? window.dailyLoginData.currentDayStreak : 0;

        this.rewards.forEach((reward, index) => {
            let status = "locked"; // claimed, available, locked
            if (hasClaimedToday && currentStreak === 0) {
                // Si ya reclamó hoy y reinició el streak a 0, significa que acaba de reclamar el Día 7
                status = "claimed";
            } else {
                if (index < currentStreak) {
                    status = "claimed";
                } else if (index === currentStreak) {
                    status = hasClaimedToday ? "locked" : "available";
                } else {
                    status = "locked";
                }
            }

            let cardBg = "rgba(255, 255, 255, 0.02)";
            let borderStyle = "1px dashed rgba(0, 229, 255, 0.15)";
            let glowShadow = "none";
            let statusText = "Bloqueado";
            let statusColor = "#6b7280";
            let iconColor = "rgba(255, 255, 255, 0.3)";
            const isDay7 = (index === 6);

            if (status === "claimed") {
                cardBg = "rgba(76, 175, 80, 0.08)";
                borderStyle = "1.5px solid rgba(76, 175, 80, 0.35)";
                statusText = "Reclamado ✓";
                statusColor = "#4caf50";
                iconColor = "#a5d6a7";
            } else if (status === "available") {
                cardBg = "rgba(0, 229, 255, 0.08)";
                borderStyle = "1.5px solid #00e5ff";
                glowShadow = "0 0 12px rgba(0, 229, 255, 0.25)";
                statusText = "Disponible";
                statusColor = "#00e5ff";
                iconColor = "#00e5ff";
            }

            const gridSpan = isDay7 ? "grid-column: span 2;" : "";
            const paddingStyle = isDay7 ? "padding: 10px 8px;" : "padding: 8px 6px;";

            const card = document.createElement("div");
            card.style = `background: ${cardBg}; border: ${borderStyle}; border-radius: 12px; box-shadow: ${glowShadow}; ${gridSpan} ${paddingStyle} display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s ease; box-sizing: border-box;`;
            
            // Si es reclamable, añadir puntero y click para comodidad
            if (status === "available") {
                card.style.cursor = "pointer";
                card.onclick = () => this.claimReward();
            }

            card.innerHTML = `
                <span style="font-size: 8px; color: ${status === "available" ? "#00e5ff" : "#94a3b8"}; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Día ${reward.day}</span>
                <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: ${iconColor}; filter: ${status === "available" ? "drop-shadow(0 0 4px rgba(0,229,255,0.4))" : "none"}; margin-bottom: 2px;">
                    ${this.getSVG(reward.iconName)}
                </div>
                <span style="font-size: 10px; font-weight: bold; color: #fff; text-align: center; margin-bottom: 1px;">${reward.name}</span>
                <span style="font-size: 8px; color: #94a3b8; text-align: center; opacity: 0.8; margin-bottom: 3px;">${reward.desc}</span>
                <span style="font-size: 8px; font-weight: bold; color: ${statusColor}; text-transform: uppercase; letter-spacing: 0.5px;">${statusText}</span>
            `;
            grid.appendChild(card);
        });
    },

    updateClaimButton: function() {
        const btn = document.getElementById("btn-claim-daily");
        if (!btn) return;

        if (this.checkEligibility()) {
            btn.innerText = "Reclamar Recompensa";
            btn.style.background = "linear-gradient(90deg, #00d2ff, #008be2)";
            btn.style.cursor = "pointer";
            btn.disabled = false;
            btn.style.opacity = "1";
        } else {
            btn.innerText = "Mañana Siguiente Recompensa";
            btn.style.background = "rgba(255, 255, 255, 0.08)";
            btn.style.border = "1px solid rgba(255, 255, 255, 0.1)";
            btn.style.cursor = "not-allowed";
            btn.disabled = true;
            btn.style.opacity = "0.6";
        }
    },

    init: function() {
        // Enlazar botones de apertura y cierre
        const btnOpen = document.getElementById("btn-daily-login");
        const btnClose = document.getElementById("close-daily-login");
        const btnClaim = document.getElementById("btn-claim-daily");
        const modal = document.getElementById("daily-login-modal");

        if (btnOpen && modal) {
            btnOpen.onclick = () => {
                modal.classList.remove("hidden");
                this.renderGrid();
                this.updateClaimButton();
            };
        }

        if (btnClose && modal) {
            btnClose.onclick = () => {
                modal.classList.add("hidden");
            };
        }

        if (btnClaim) {
            btnClaim.onclick = () => {
                this.claimReward();
            };
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.DailyLoginManager.init();
});
