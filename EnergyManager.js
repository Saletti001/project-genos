window.isGenoHappy = function(geno) {
    if (!geno) return false;
    const hambre = geno.hambre !== undefined ? geno.hambre : 100;
    const diversion = geno.diversion !== undefined ? geno.diversion : 100;
    const higiene = geno.higiene !== undefined ? geno.higiene : 100;
    const resistencia = geno.resistencia !== undefined ? geno.resistencia : 100;
    return hambre >= 80 && diversion >= 80 && higiene >= 80 && resistencia >= 80;
};

window.isGenoNeglected = function(geno) {
    if (!geno) return false;
    const hambre = geno.hambre !== undefined ? geno.hambre : 100;
    const diversion = geno.diversion !== undefined ? geno.diversion : 100;
    const higiene = geno.higiene !== undefined ? geno.higiene : 100;
    const resistencia = geno.resistencia !== undefined ? geno.resistencia : 100;
    return hambre < 20 || diversion < 20 || higiene < 20 || resistencia < 20;
};

window.NexoEnergyManager = {
    energiaMax: 100,

    iniciar: function() {
        if (window.nexoEnergy === undefined) {
            window.nexoEnergy = 100;
        }

        // Loop de recuperación activa cada 10 segundos (calculando delta real de performance.now)
        let ultimaVezTick = performance.now();
        setInterval(() => {
            const ahora = performance.now();
            const deltaSegundos = Math.max(0, (ahora - ultimaVezTick) / 1000);
            ultimaVezTick = ahora;
            this.recuperar(deltaSegundos);
        }, 10000);

        // Click en la barra de energía para mostrar info
        const hudEnergy = document.getElementById("hud-energy-container");
        const infoModal = document.getElementById("hud-energy-info-modal");
        const closeBtn = document.getElementById("close-energy-info");
        const confirmBtn = document.getElementById("btn-close-energy-info-confirm");

        if (hudEnergy && infoModal) {
            hudEnergy.style.cursor = "pointer";
            hudEnergy.addEventListener("click", () => {
                infoModal.classList.remove("hidden");
                if (window.Sonidos) window.Sonidos.play("click");
            });
        }

        if (infoModal) {
            if (closeBtn) {
                closeBtn.addEventListener("click", (e) => {
                    if (e && typeof e.stopPropagation === 'function') {
                        e.stopPropagation();
                    }
                    infoModal.classList.add("hidden");
                    if (window.Sonidos) window.Sonidos.play("click");
                });
            }
            if (confirmBtn) {
                confirmBtn.addEventListener("click", (e) => {
                    if (e && typeof e.stopPropagation === 'function') {
                        e.stopPropagation();
                    }
                    infoModal.classList.add("hidden");
                    if (window.Sonidos) window.Sonidos.play("click");
                });
            }
        }

        this.actualizarUI();
    },

    recuperar: function(segundosTranscurridos) {
        // 1 de energía cada 12 minutos = 1 / (12 * 60) por segundo = 1 / 720 por segundo
        const recuperacionEnergia = segundosTranscurridos / 720;
        window.nexoEnergy = Math.min(this.energiaMax, (window.nexoEnergy || 100) + recuperacionEnergia);

        const hoy = new Date().toDateString();

        if (window.misGenos) {
            // Contar genes de conexion_empatica
            let countEmpatica = 0;
            window.misGenos.forEach(g => {
                if (window.tieneGenActivoV9 && window.tieneGenActivoV9(g, "conexion_empatica")) {
                    countEmpatica++;
                }
            });
            const hasEmpaticaSynergy = countEmpatica >= 2;

            const isRationAutoActive = window.rationAutoActiveUntil && window.rationAutoActiveUntil > Date.now();

            window.misGenos.forEach(geno => {
                if (geno.isEgg) {
                    geno.resistencia = 100;
                    geno.hambre = 100;
                    geno.diversion = 100;
                    geno.higiene = 100;
                    geno.amistad = 0;
                    geno.evAcumulada = 0;
                    return;
                }

                if (geno.resistencia === undefined) geno.resistencia = 100;
                if (geno.hambre === undefined) geno.hambre = 100;
                if (geno.diversion === undefined) geno.diversion = 100;
                if (geno.higiene === undefined) geno.higiene = 100;
                if (geno.amistad === undefined) geno.amistad = 0;
                if (geno.evAcumulada === undefined) geno.evAcumulada = 0;

                // Compañero activo principal o reserva (5 veces más lento)
                const isActive = window.miMascota && String(window.miMascota.id) === String(geno.id);
                const drainMultiplier = isActive ? 1.0 : 0.2;

                // Consumo de Hambre (12 horas completo)
                let hungerRate = (100 / 43200) * drainMultiplier;
                if (window.tieneGenActivoV9 && window.tieneGenActivoV9(geno, "reactor_instintivo")) {
                    hungerRate *= 0.7; // Reducción del 30%
                }
                if (!isActive && isRationAutoActive) {
                    hungerRate = 0;
                    geno.hambre = 100;
                }
                geno.hambre = Math.max(0, geno.hambre - hungerRate * segundosTranscurridos);

                // Consumo de Diversión (16 horas completo)
                let funRate = (100 / 57600) * drainMultiplier;
                if (hasEmpaticaSynergy && window.tieneGenActivoV9 && window.tieneGenActivoV9(geno, "conexion_empatica")) {
                    funRate = 0; // Inmunidad
                }
                geno.diversion = Math.max(0, geno.diversion - funRate * segundosTranscurridos);

                // Consumo de Higiene (24 horas completo)
                const hygieneRate = (100 / 86400) * drainMultiplier;
                geno.higiene = Math.max(0, geno.higiene - hygieneRate * segundosTranscurridos);

                // Recuperación de Resistencia (solo cuando el descanso está activo)
                if (geno.descansandoDesde) {
                    const tasaRecuperacion = 25; // 25 puntos/hora
                    const recuperacionResistencia = (tasaRecuperacion / 3600) * segundosTranscurridos;
                    geno.resistencia = Math.min(100, geno.resistencia + recuperacionResistencia);
                    // Si completa la recuperación, limpiar el estado
                    if (geno.resistencia >= 100) {
                        geno.resistencia = 100;
                        geno.descansandoDesde = null;
                        // Notificar en la UI si es el Geno activo
                        if (window.miMascota && String(window.miMascota.id) === String(geno.id)) {
                            if (typeof window.actualizarBotonDescansar === 'function') window.actualizarBotonDescansar();
                            if (typeof window.actualizarAnimacionDescanso === 'function') window.actualizarAnimacionDescanso();
                        }
                    }
                }

                // Generación de Esencia Pasiva
                if (window.isGenoHappy && window.isGenoHappy(geno)) {
                    const baseEvRate = 0.1 / 3600; // 0.1 EV/h en segundos
                    const essCMultiplier = (window.tieneGenActivoV9 && window.tieneGenActivoV9(geno, "esencia_concentrada")) ? 2.0 : 1.0;
                    const friendshipMultiplier = 1.0 + ((geno.amistad || 0) / 100.0);
                    const happyMultiplier = 2.0;
                    const evRate = baseEvRate * happyMultiplier * essCMultiplier * friendshipMultiplier;
                    
                    geno.evAcumulada = Math.min(10.0, (geno.evAcumulada || 0) + evRate * segundosTranscurridos);
                }

                // Decaimiento de amistad por negligencia (más de 24 horas desatendido)
                const isNeglected = window.isGenoNeglected && window.isGenoNeglected(geno);
                if (isNeglected) {
                    geno.neglectedTime = (geno.neglectedTime || 0) + segundosTranscurridos;
                    const secondsInGrace = 86400; // 24 horas de gracia
                    if (geno.neglectedTime > secondsInGrace) {
                        const decaySeconds = Math.min(segundosTranscurridos, geno.neglectedTime - secondsInGrace);
                        const pointsLost = (1.0 / 3600) * decaySeconds; // 1 punto por hora
                        geno.amistad = Math.max(0, (geno.amistad || 0) - pointsLost);
                    }
                } else {
                    geno.neglectedTime = 0; // Restaurar al salir del estado de descuido/huelga
                }
            });
        }

        // Sincronizar el Geno activo
        if (window.miMascota && window.miMascota.id !== "temp" && window.misGenos) {
            const activoOriginal = window.misGenos.find(g => String(g.id) === String(window.miMascota.id));
            if (activoOriginal) {
                window.miMascota.resistencia = activoOriginal.resistencia;
                window.miMascota.hambre = activoOriginal.hambre;
                window.miMascota.diversion = activoOriginal.diversion;
                window.miMascota.higiene = activoOriginal.higiene;
                window.miMascota.amistad = activoOriginal.amistad;
                window.miMascota.evAcumulada = activoOriginal.evAcumulada;
            }
        }

        this.actualizarUI();
    },

    aplicarRecuperacionPasiva: function(timestampUltimaVez) {
        const tiempoActual = typeof window.obtenerTiempoSeguro === 'function' ? window.obtenerTiempoSeguro() : Date.now();
        const segundosTranscurridos = Math.max(0, (tiempoActual - timestampUltimaVez) / 1000);
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

        // Actualizar la resistencia en el panel RPG
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

        // Actualizar el HUD de Cuidado del Geno activo
        const needsHud = document.getElementById("needs-hud");
        if (needsHud) {
            if (window.miMascota && window.miMascota.id && window.miMascota.id !== "temp") {
                needsHud.classList.add("hidden");
                
                const hambre = Math.floor(window.miMascota.hambre !== undefined ? window.miMascota.hambre : 100);
                const diversion = Math.floor(window.miMascota.diversion !== undefined ? window.miMascota.diversion : 100);
                const higiene = Math.floor(window.miMascota.higiene !== undefined ? window.miMascota.higiene : 100);
                const resistencia = Math.floor(window.miMascota.resistencia !== undefined ? window.miMascota.resistencia : 100);
                const amistad = Math.floor(window.miMascota.amistad !== undefined ? window.miMascota.amistad : 0);

                const hungerVal = document.getElementById("needs-hunger-val");
                const funVal = document.getElementById("needs-fun-val");
                const hygieneVal = document.getElementById("needs-hygiene-val");
                const energyVal = document.getElementById("needs-energy-val");
                const friendshipVal = document.getElementById("needs-friendship-val");

                if (hungerVal) hungerVal.innerText = `${hambre}%`;
                if (funVal) funVal.innerText = `${diversion}%`;
                if (hygieneVal) hygieneVal.innerText = `${higiene}%`;
                if (energyVal) energyVal.innerText = `${resistencia}%`;
                if (friendshipVal) friendshipVal.innerText = `${amistad}%`;

                const hungerFill = document.getElementById("needs-hunger-fill");
                const funFill = document.getElementById("needs-fun-fill");
                const hygieneFill = document.getElementById("needs-hygiene-fill");
                const energyFill = document.getElementById("needs-energy-fill");

                if (hungerFill) hungerFill.style.width = `${hambre}%`;
                if (funFill) funFill.style.width = `${diversion}%`;
                if (hygieneFill) hygieneFill.style.width = `${higiene}%`;
                if (energyFill) energyFill.style.width = `${resistencia}%`;

                // Actualizar burbuja de alerta flotante sobre el Geno
                const alertBubble = document.getElementById("geno-alert-bubble");
                if (alertBubble) {
                    let alertText = "";
                    let alertColor = "#ff7043";

                    if (hambre < 20) {
                        alertText = "Tengo Hambre";
                        alertColor = "#ff7043";
                    } else if (diversion < 20) {
                        alertText = "Quiero Jugar";
                        alertColor = "#29b6f6";
                    } else if (higiene < 20) {
                        alertText = "Necesito un Baño";
                        alertColor = "#ab47bc";
                    } else if (resistencia < 20) {
                        alertText = "Estoy Cansado";
                        alertColor = "#4CAF50";
                    }

                    if (alertText) {
                        alertBubble.classList.remove("hidden");
                        const alertTextEl = document.getElementById("geno-alert-text");
                        if (alertTextEl) alertTextEl.innerText = alertText;
                        alertBubble.style.borderColor = alertColor;
                        alertBubble.style.boxShadow = `0 0 8px ${alertColor}`;
                        
                        const arrow = typeof alertBubble.querySelector === 'function' ? alertBubble.querySelector(".bubble-arrow") : null;
                        if (arrow) arrow.style.borderTopColor = alertColor;
                        
                        const svg = typeof alertBubble.querySelector === 'function' ? alertBubble.querySelector(".alert-icon") : null;
                        if (svg) svg.setAttribute("stroke", alertColor);
                    } else {
                        alertBubble.classList.add("hidden");
                    }
                }
            } else {
                needsHud.classList.add("hidden");
            }
        }

        // Actualizar el modal de stats si está abierto
        if (window.miMascota && window.miMascota.id !== "temp") {
            const hambre = Math.floor(window.miMascota.hambre !== undefined ? window.miMascota.hambre : 100);
            const diversion = Math.floor(window.miMascota.diversion !== undefined ? window.miMascota.diversion : 100);
            const higiene = Math.floor(window.miMascota.higiene !== undefined ? window.miMascota.higiene : 100);
            const amistad = Math.floor(window.miMascota.amistad !== undefined ? window.miMascota.amistad : 0);
            const evAcumulada = window.miMascota.evAcumulada !== undefined ? window.miMascota.evAcumulada : 0;

            const gHunger = document.getElementById("geno-hunger");
            const gHungerFill = document.getElementById("geno-hunger-fill");
            const gFun = document.getElementById("geno-fun");
            const gFunFill = document.getElementById("geno-fun-fill");
            const gHygiene = document.getElementById("geno-hygiene");
            const gHygieneFill = document.getElementById("geno-hygiene-fill");
            const gFriendship = document.getElementById("geno-friendship");
            const gFriendshipFill = document.getElementById("geno-friendship-fill");
            const gEvAccum = document.getElementById("geno-ev-accumulated");

            if (gHunger) gHunger.innerText = `${hambre}/100`;
            if (gHungerFill) gHungerFill.style.width = `${hambre}%`;
            if (gFun) gFun.innerText = `${diversion}/100`;
            if (gFunFill) gFunFill.style.width = `${diversion}%`;
            if (gHygiene) gHygiene.innerText = `${higiene}/100`;
            if (gHygieneFill) gHygieneFill.style.width = `${higiene}%`;
            if (gFriendship) gFriendship.innerText = `${amistad}/100`;
            if (gFriendshipFill) gFriendshipFill.style.width = `${amistad}%`;
            if (gEvAccum) gEvAccum.innerText = `${evAcumulada.toFixed(2)} EV`;
        }

        if (typeof window.actualizarSuciedadVisual === 'function') window.actualizarSuciedadVisual();
        if (typeof window.actualizarMonedaEvFlotante === 'function') window.actualizarMonedaEvFlotante();
        if (typeof window.actualizarBotonDescansar === 'function') window.actualizarBotonDescansar();
        if (typeof window.actualizarAnimacionDescanso === 'function') window.actualizarAnimacionDescanso();

        // Actualizar indicador de Felicidad
        if (window.miMascota && window.miMascota.id !== "temp") {
            const hb = Math.floor(window.miMascota.hambre !== undefined ? window.miMascota.hambre : 100);
            const db = Math.floor(window.miMascota.diversion !== undefined ? window.miMascota.diversion : 100);
            const ib = Math.floor(window.miMascota.higiene !== undefined ? window.miMascota.higiene : 100);
            const rb = Math.floor(window.miMascota.resistencia !== undefined ? window.miMascota.resistencia : 100);
            const happiness = Math.floor((hb + db + ib + rb) / 4);

            const hText  = document.getElementById("happiness-text");
            const hFill  = document.getElementById("happiness-fill");
            const hPct   = document.getElementById("happiness-percent");
            const hIcon  = document.getElementById("happiness-icon");

            if (hText || hFill) {
                let text, color, strokeColor;
                if (happiness >= 80)      { text = "Muy Feliz"; color = "#81c784"; strokeColor = "#4CAF50"; }
                else if (happiness >= 60) { text = "Contento";  color = "#a5d6a7"; strokeColor = "#81c784"; }
                else if (happiness >= 40) { text = "Neutral";   color = "#ffeb3b"; strokeColor = "#fbc02d"; }
                else if (happiness >= 20) { text = "Triste";    color = "#ffb74d"; strokeColor = "#ffa726"; }
                else                      { text = "Muy Triste"; color = "#ef9a9a"; strokeColor = "#e57373"; }

                if (hText) {
                    hText.innerText = text;
                    hText.style.color = color;
                }
                if (hPct) {
                    hPct.innerText = `${happiness}%`;
                    hPct.style.color = color;
                }
                if (hFill) {
                    hFill.style.width = `${happiness}%`;
                    hFill.style.background = `linear-gradient(90deg, ${strokeColor}, ${color})`;
                    hFill.style.boxShadow = `0 0 6px ${color}80`;
                    hFill.parentElement.style.borderColor = `${color}33`;
                }
                if (hIcon) {
                    hIcon.setAttribute("fill", color);
                    hIcon.setAttribute("stroke", strokeColor);
                    hIcon.style.color = color;
                    hIcon.style.filter = `drop-shadow(0 0 3px ${color}80)`;
                    
                    const parentLabel = hIcon.closest("span");
                    if (parentLabel) {
                        parentLabel.style.color = color;
                    }
                }
            }
        }
    }
};
