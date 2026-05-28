// ArcadeManager.js - El motor que construye la interfaz automáticamente
class ArcadeManager {
    constructor() {
        this.menuScreen = document.getElementById("arcade-menu");
        this.gameScreen = document.getElementById("minigame-screen");
        this.gridContainer = document.querySelector(".arcade-games-grid");
        
        // Elementos del modal de información
        this.infoModal = document.getElementById("arcade-info-modal");
        this.infoIcon = document.getElementById("arcade-info-icon");
        this.infoTitle = document.getElementById("arcade-info-title");
        this.infoDesc = document.getElementById("arcade-info-desc");
        this.closeInfoBtn = document.getElementById("close-arcade-info");
        this.playInfoBtn = document.getElementById("btn-play-from-info");
        
        this.init();
    }

    init() {
        this.renderGames();
        this.setupEvents();
    }

    renderGames() {
        if (!this.gridContainer) return;
        this.gridContainer.innerHTML = "";

        ARCADE_GAMES_DATABASE.forEach(game => {
            const card = document.createElement("div");
            card.className = `arcade-card ${game.locked ? 'locked' : ''}`;
            card.id = `card-${game.id}`;
            
            // HTML de la tarjeta (Ahora solo con Icono, Título y el botón 'i')
            card.innerHTML = `
                <div class="arcade-info-btn">i</div>
                <div class="card-icon">${game.icon}</div>
                <h3>${game.title}</h3>
            `;

            // Lógica inteligente de clics
            card.onclick = (e) => {
                // Si el jugador tocó exactamente el botón 'i'
                if (e.target.classList.contains('arcade-info-btn')) {
                    e.stopPropagation(); // Evita que se lance el juego al tocar la 'i'
                    this.showInfo(game);
                } 
                // Si tocó el resto de la tarjeta y no está bloqueada
                else if (!game.locked) {
                    this.launchMinigame(game.id);
                }
            };

            this.gridContainer.appendChild(card);
        });
    }

    showInfo(game) {
        if(!this.infoModal) return;
        
        // Llenar datos
        this.infoIcon.innerText = game.icon;
        this.infoTitle.innerText = game.title;
        this.infoDesc.innerText = game.desc;
        
        // Si el juego está bloqueado, ocultar botón de jugar, si no, mostrarlo
        if(game.locked) {
            this.playInfoBtn.style.display = "none";
        } else {
            this.playInfoBtn.style.display = "block";
            this.playInfoBtn.onclick = () => {
                this.infoModal.classList.add("hidden");
                this.launchMinigame(game.id);
            };
        }
        
        this.infoModal.classList.remove("hidden");
    }

    launchMinigame(gameName) {
        if (window.nexoEnergy < 5) {
            alert("No tienes suficiente Energía Nexo para jugar en el Arcade. Se requieren 5 de Energía Nexo (Tienes: " + Math.floor(window.nexoEnergy || 100) + ").");
            return;
        }
        if (window.NexoEnergyManager) {
            window.NexoEnergyManager.descontarEnergia(5);
        }
        this.menuScreen.classList.add("hidden");
        this.gameScreen.classList.remove("hidden");
        if (gameName === 'catch' && window.minigameCatch) {
            window.minigameCatch.start();
        }
    }

    returnToMenu() {
        this.gameScreen.classList.add("hidden");
        this.menuScreen.classList.remove("hidden");
    }

    setupEvents() {
        if(this.closeInfoBtn) {
            this.closeInfoBtn.onclick = () => {
                this.infoModal.classList.add("hidden");
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.miArcade = new ArcadeManager();
});