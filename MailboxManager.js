// =========================================
// MailboxManager.js - BUZÓN DE NOTICIAS Y ANUNCIOS
// =========================================

window.MailboxManager = {
    news: [
        {
            id: 1,
            tag: "Actualización",
            tagColor: "#8A2BE2", // Neon Violet
            title: "Ajuste del Centro de Cuidado",
            date: "01 JUN 2026",
            content: "Se han calibrado los sistemas de recuperación del Centro de Cuidado. La regeneración pasiva de resistencia ahora es de 25 pts/h y las duchas de plasma limpian al 100% de Higiene a todo el inventario de mascotas de manera uniforme."
        },
        {
            id: 2,
            tag: "Torneo",
            tagColor: "#00e5ff", // Neon Cyan
            title: "Copa Neón Nexo: Semana 1",
            date: "04 JUN 2026",
            content: "Prepárate para la Copa Neón Nexo. El primer torneo del Coliseo off-chain se abrirá pronto. Entrena a tus Genos para alcanzar el mayor rango y asegurar bolsas de recompensa en $POL y Esencia Vital."
        },
        {
            id: 3,
            tag: "Balance",
            tagColor: "#ff9800", // Neon Orange
            title: "Optimización de Genoma",
            date: "08 JUN 2026",
            content: "Se ha optimizado el motor de renderizado de SVGEngine v2. Las expresiones de felicidad, enojo y fatiga se renderizan con mayor fluidez. El estado de huelga por baja felicidad se actualiza al instante en la interfaz."
        }
    ],

    getLatestNewsId: function() {
        if (this.news.length === 0) return 0;
        return Math.max(...this.news.map(n => n.id));
    },

    checkUnreadNews: function() {
        const badge = document.getElementById("news-unread-badge");
        if (!badge) return;

        const lastRead = window.newsMailboxData ? window.newsMailboxData.lastReadNewsId : 0;
        const latest = this.getLatestNewsId();

        if (lastRead < latest) {
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    },

    markAllAsRead: function() {
        const latest = this.getLatestNewsId();
        if (window.newsMailboxData) {
            window.newsMailboxData.lastReadNewsId = latest;
        }

        // Ocultar el badge
        const badge = document.getElementById("news-unread-badge");
        if (badge) {
            badge.classList.add("hidden");
        }

        // Guardar progreso local y remoto
        if (typeof window.guardarProgreso === "function") {
            window.guardarProgreso();
        }
    },

    renderList: function() {
        const listContainer = document.getElementById("news-mailbox-list");
        if (!listContainer) return;

        listContainer.innerHTML = "";

        // Ordenar noticias: más reciente primero
        const sortedNews = [...this.news].sort((a, b) => b.id - a.id);

        sortedNews.forEach(item => {
            const newsItem = document.createElement("div");
            newsItem.style = "background: rgba(255, 255, 255, 0.02); border: 1.5px solid rgba(138, 43, 226, 0.15); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 6px; box-sizing: border-box; transition: border-color 0.2s ease;";
            
            newsItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span style="background: ${item.tagColor}; color: #07111c; font-size: 8px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">${item.tag}</span>
                    <span style="color: #8b9bb4; font-size: 8.5px; font-family: monospace;">${item.date}</span>
                </div>
                <h4 style="color: #fff; font-size: 11px; margin: 0; font-weight: bold; letter-spacing: 0.2px; text-transform: uppercase;">${item.title}</h4>
                <p style="color: #cbd5e1; font-size: 9.5px; line-height: 1.4; margin: 0; text-align: justify;">${item.content}</p>
            `;
            listContainer.appendChild(newsItem);
        });
    },

    init: function() {
        const btnOpen = document.getElementById("btn-news-mailbox");
        const btnClose = document.getElementById("close-news-mailbox");
        const btnCloseConfirm = document.getElementById("btn-close-news-confirm");
        const modal = document.getElementById("news-mailbox-modal");

        if (btnOpen && modal) {
            btnOpen.onclick = () => {
                modal.classList.remove("hidden");
                this.renderList();
                this.markAllAsRead();
            };
        }

        const cerrarModal = () => {
            if (modal) modal.classList.add("hidden");
        };

        if (btnClose) btnClose.onclick = cerrarModal;
        if (btnCloseConfirm) btnCloseConfirm.onclick = cerrarModal;

        // Comprobación de novedades con un breve delay para asegurar la carga del guardado
        setTimeout(() => {
            this.checkUnreadNews();
        }, 300);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.MailboxManager.init();
});
