// =========================================
// EnergyManager.js - GESTIÓN DE ENERGÍA NEXO Y RESISTENCIA DE GENOS
// =========================================

window.NexoEnergyManager = {
    energiaMax: 100,

    iniciar: function() {
        if (window.nexoEnergy === undefined) {
            window.nexoEnergy = 100;
        }

        // Loop de recuperación activa cada 10 segundos
        setInterval(() => {
            this.recuperar(10); // Recuperar en base a 10 segundos transcurridos
        }, 10000);

        this.actualizarUI();
    },

    recuperar: function(segundosTranscurridos) {
        // 1 de energía cada 12 minutos = 1 / (12 * 60) por segundo = 1 / 720 por segundo
        const recuperacionEnergia = segundosTranscurridos / 720;
        window.nexoEnergy = Math.min(this.energiaMax, (window.nexoEnergy || 100) + recuperacionEnergia);

        // 25 de resistencia por hora = 25 / 3600 por segundo = 1 / 144 por segundo
        const hoy = new Date().toDateString();

        if (window.misGenos) {
            window.misGenos.forEach(geno => {
                if (geno.resistencia === undefined) geno.resistencia = 100;

                // El cuidado diario incrementa un 20% la velocidad de recuperación (de 25 a 30 por hora)
                const tieneCuidado = geno.ultimoCuidadoDiario === hoy;
                const tasaRecuperacion = tieneCuidado ? (25 * 1.20) : 25;
                const recuperacionResistencia = (tasaRecuperacion / 3600) * segundosTranscurridos;

                geno.resistencia = Math.min(100, geno.resistencia + recuperacionResistencia);
            });
        }

        // Sincronizar la resistencia del Geno activo
        if (window.miMascota && window.miMascota.id !== "temp" && window.misGenos) {
            const activoOriginal = window.misGenos.find(g => String(g.id) === String(window.miMascota.id));
            if (activoOriginal) {
                window.miMascota.resistencia = activoOriginal.resistencia;
            }
        }

        this.actualizarUI();
    },

    aplicarRecuperacionPasiva: function(timestampUltimaVez) {
        const segundosTranscurridos = Math.max(0, (Date.now() - timestampUltimaVez) / 1000);
        this.recuperar(segundosTranscurridos);
    },

    descontarEnergia: function(cantidad) {
        if (window.nexoEnergy < cantidad) return false;
        window.nexoEnergy -= cantidad;
        this.actualizarUI();
        if (window.guardarLocalSilencioso) window.guardarLocalSilencioso();
        return true;
    },

    descontarResistenciaGeno: function(geno, cantidad) {
        if (geno.resistencia === undefined) geno.resistencia = 100;
        geno.resistencia = Math.max(0, geno.resistencia - cantidad);

        // Sincronizar en la lista de todos los Genos
        if (window.misGenos) {
            const index = window.misGenos.findIndex(g => String(g.id) === String(geno.id));
            if (index !== -1) {
                window.misGenos[index].resistencia = geno.resistencia;
            }
        }

        this.actualizarUI();
        if (window.guardarLocalSilencioso) window.guardarLocalSilencioso();
    },

    actualizarUI: function() {
        const energyText = document.getElementById("hud-energy-text");
        const energyFill = document.getElementById("hud-energy-fill");

        const currentEnergy = Math.floor(window.nexoEnergy || 100);
        if (energyText) energyText.innerText = `${currentEnergy} / ${this.energiaMax}`;
        if (energyFill) energyFill.style.width = `${currentEnergy}%`;

        // Actualizar la resistencia del Geno activo en el panel RPG
        if (window.miMascota && window.miMascota.id !== "temp") {
            const resVal = Math.floor(window.miMascota.resistencia !== undefined ? window.miMascota.resistencia : 100);
            const resText = document.getElementById("geno-resistance");
            const resFill = document.getElementById("geno-resistance-fill");
            if (resText) resText.innerText = `${resVal}/100`;
            if (resFill) {
                resFill.style.width = `${resVal}%`;
                const resColor = resVal > 50 ? "#4CAF50" : (resVal > 20 ? "#ff9800" : "#ff3333");
                resFill.style.backgroundColor = resColor;
            }
        }
    }
};
