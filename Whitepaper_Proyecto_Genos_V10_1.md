# Proyecto Genos - Whitepaper Técnico-Económico (V10.1)
*Crianza Genética, Combate Estratégico y Sostenibilidad Financiera Web3*

---

## 1. Resumen Ejecutivo
Proyecto Genos es una aplicación web progresiva (PWA) de crianza de criaturas virtuales ("Genos") impulsada por genética procedural y un ecosistema económico dual (off-chain/on-chain). La visión central es ofrecer una experiencia de juego profunda, accesible directamente desde cualquier navegador web y optimizada para dispositivos móviles, eliminando las barreras tradicionales de los juegos de descarga y las complejidades iniciales de Web3.

El juego adopta un modelo híbrido estructurado de forma que la experiencia interactiva, el progreso de las criaturas y el combate asíncrono se procesen en una infraestructura off-chain rápida y sin comisiones de red (gas fees), mientras que la propiedad de las criaturas, el mercado abierto P2P y las becas (scholarships) se asienten de forma segura sobre la red Polygon ($POL). 

La premisa del diseño de juego es la primacía de la estrategia sobre el pago: a través del sistema de calificación genética **S-D** y la configuración táctica de IFTTT, un espécimen Común bien entrenado y configurado puede derrotar a especímenes de mayor rareza.

---

## 2. Arquitectura de Seguridad y Estados (Híbrido Off-chain/On-chain)

Para garantizar un rendimiento fluido, mitigar la fricción para el usuario y blindar la integridad del juego, la arquitectura separa de forma estricta el estado del juego de la capa financiera.

```mermaid
graph TD
    subgraph Cliente (PWA Navegador)
        UI[Interfaz PWA HTML/JS/CSS]
        SVG[Motor SVG Dinámico - 7 Capas]
    end

    subgraph Capa Off-chain (Seguridad y Estado)
        DB[(Supabase DB)]
        RLS[Reglas Row Level Security]
        JS[Motor de Combate & Lógica]
        EV[Esencia Vital - Base de Datos]
    end

    subgraph Capa On-chain ( Polygon Blockchain)
        POL[$POL Gas/Pagos]
        NFT[Contratos de Genos NFT]
        Lineage[Libro de Linaje On-chain]
        Market[Plaza de Comercio P2P]
        Scholar[Smart Contract de Becas]
    end

    UI --> JS
    JS --> RLS
    RLS --> DB
    DB --> EV
    UI -.->|Acuñación & Comercio| Market
    Market --> NFT
    NFT --> Lineage
    Scholar --> POL
```

### 2.1 Almacenamiento y Protección Off-chain (Supabase)
Todo el estado mutable de la progresión de los jugadores residirá en Supabase:
- **Estadísticas, experiencia y niveles:** Almacenados de forma centralizada bajo reglas estrictas de **Row Level Security (RLS)** que previenen cualquier inyección de datos o modificación de estadísticas desde la consola del cliente.
- **Esencia Vital (EV):** La moneda del juego se gestiona de manera puramente interna. Al ser off-chain, no es transaccionable externamente ni listada en exchanges descentralizados, anulando cualquier incentivo para ataques de bots económicos directos en el servidor.

### 2.2 Capa Financiera On-chain (Polygon)
La blockchain de Polygon se utiliza exclusivamente para:
- **Acuñación de NFTs (Minting):** Convertir una criatura en un token ERC-721 en blockchain a bajo coste (<$3 USD).
- **El Libro de Linaje:** Registro permanente en cadena que verifica los linajes de crianza de los Genos de mayor valor.
- **Plaza de Comercio P2P:** Transacciones directas entre carteras utilizando **$POL** como token nativo.
- **Smart Contract de Becas (Scholarships):** División automatizada del rendimiento económico entre el propietario y el jugador sin intermediación manual.

---

## 3. Mecánicas Nucleares de Juego

### 3.1 Motor Visual SVG Dinámico
La representación visual de los Genos se genera proceduralmente en tiempo real a través de un motor SVG compuesto por 7 capas estructuradas de forma estricta:
1. **Sombra:** Posicionamiento y perspectiva del suelo.
2. **Cuerpo:** Define la estructura física (formas Gen 0: *Gota, Frijol, Estrella, Círculo, Cuadrado Redondeado y Triángulo Redondeado*).
3. **Color:** Tintado reactivo basado en la genética.
4. **Patrón:** Marcas de textura o diseños de piel.
5. **Ojos:** Expresiones de combate y descanso.
6. **Brillo Premium:** Capa superior de pulido visual.
7. **Aura de Rareza:** Resplandor de fondo que indica visualmente la rareza de la criatura.

### 3.2 Los 5 Stats de Combate y Calificación S-D
Cada Geno posee cinco estadísticas fundamentales cuyos rangos están condicionados por su rareza:

| Rareza | HP (Vitalidad) | ATK (Fuerza) | SPD (Agilidad) | LUK (Suerte) | DEF (Defensa) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Común** | 35 - 55 | 10 - 22 | 8 - 25 | 5 - 15 | 6 - 14 |
| **Raro** | 50 - 75 | 18 - 35 | 15 - 40 | 10 - 25 | 12 - 22 |
| **Épico** | 70 - 100 | 28 - 50 | 25 - 55 | 20 - 35 | 18 - 32 |
| **Legendario** | 95 - 130 | 40 - 70 | 35 - 80 | 30 - 50 | 26 - 45 |
| **Mítico** | 120 - 160 | 60 - 100 | 50 - 110 | 45 - 70 | 38 - 62 |

#### Calificación Genética S-D (Pureza de IVs)
El sistema calcula el porcentaje de pureza sumando los valores obtenidos en los stats individuales y comparándolos con los mínimos y máximos teóricos de su rareza:
- **Rango S (95-100%):** Perfección. Representado con un aura dorada pulsante en la interfaz. Máximo valor de reventa.
- **Rango A (80-94%):** Élite competitiva. Aura cian sutil.
- **Rango B (50-79%):** Genética estándar y saludable. Sin efectos visuales adicionales.
- **Rango C (20-49%):** Potencial bajo. Candidato óptimo para la quema en el Reactor.
- **Rango D (0-19%):** Defectuoso. Candidato ideal para liberación en el Santuario.

*Nota de asimetría comercial:* Gracias a esta escala, un Geno Común de rango S (estadísticas perfectas en su categoría) tiene un valor estratégico en el meta competitivo que puede superar al de un Geno Épico de rango D.

### 3.3 Breeding y Herencia Activa (V9.1)
La crianza permite combinar dos especímenes para transmitir sus genes a una nueva cría (límite de 7 crias por espécimen). El sistema aplica las siguientes probabilidades en los genes ocultos:
- **Transmisión base (un progenitor):** 30% de probabilidad de heredar.
- **Alelos idénticos (ambos progenitores con el mismo gen):** Eleva la probabilidad al 75%. Esto crea un mercado de pares reproductores cotizados.
- **Dominancia Genética activa:** Otorga un 70% de herencia estable.
- **Mutaciones aleatorias:** Si la herencia de los slots funcionales falla, el sistema realiza tiradas con los "dados universales" pudiendo despertar nuevos genes imprevistos.

---

## 4. Sistema de Combate V10.1 (El Coliseo)

### 4.1 Ciclo Elemental y Afinidad (STAB)
El juego implementa un ciclo circular positivo de seis elementos:
$$\text{Biomutante} \succ \text{Sintético} \succ \text{Tóxico} \succ \text{Radiactivo} \succ \text{Cibernético} \succ \text{Viral} \succ \text{Biomutante}$$

- **Multiplicadores elementales de daño:**
  - Ventaja elemental (Super efectivo): **x1.35 (+35% de daño)**.
  - Desventaja elemental (Poco efectivo): **x0.75 (-25% de daño)**.
- **STAB (Afinidad Genética):** Otorga un multiplicador de **x1.20 (+20% de daño)** cuando un Geno ejecuta un ataque Especial o Definitivo que coincide con su propio elemento nativo. El ataque básico (Slot 1) no aplica STAB.
- **Golpes Críticos:** Multiplican el daño por **x1.50**, condicionado por el stat de Suerte (LUK) de la criatura.

### 4.2 Configuración de los 4 Slots de Ataque
Cada Geno posee acceso a cuatro ranuras de habilidad en combate:
1. **Slot 1 (Ataque Básico):** Siempre disponible. Daño físico puro basado en la diferencia física. No recibe STAB ni bonus de ventaja elemental.
2. **Slot 2 (Ataque Especial):** Habilidad de daño elemental desbloqueada desde nivel 1. Consume cooldowns y aplica STAB si corresponde.
3. **Slot 3 (Soporte / Buff-Debuff):** Movimiento de control, curación o alteración de estado. Sin restricción de elemento.
4. **Slot 4 (Definitivo):** Desbloqueable a nivel 25. El jugador selecciona 1 de los 3 ataques definitivos disponibles para su elemento nativo en el **Laboratorio de Implantes** (instalando el Módulo de Técnica - MT correspondiente), creando dinámicas de juego mental (*mind games*) ya que el oponente no sabe cuál de las opciones tiene equipadas.

### 4.3 Fórmula Real de Daño Base
En el código de producción, el cálculo de daño utiliza un límite de daño mínimo controlado para garantizar el dinamismo de las rondas y evitar peleas infinitas contra defensas extremas:

$$\text{dano\_efectivo} = \max(\text{ATK\_atacante} - \text{DEF\_defensor}, \, \text{ATK\_atacante} \times \text{minDmgMultiplier})$$

*Donde:*
- **minDmgMultiplier base:** **0.25 (25%)** por defecto.
- **minDmgMultiplier con Gen Oculto (`min_dmg`):** Incrementa a **0.35 (35%)**, premiando a los Genos especializados en romper tanques mediante su genética.

### 4.4 Sistema IFTTT de Defensa Offline
Al competir en la Liga Asíncrona PvP, la inteligencia artificial del defensor se rige por un panel visual sin código configurado previamente por el jugador. Este panel permite establecer condicionales lógicos para automatizar el combate asíncrono:
- *Ejemplo:* **SI** `propio.HP < 30%` $\to$ **ENTONCES** `USAR Definitivo (Slot 4)`.
- *Ejemplo:* **SI** `rival.elemento == Cibernético` $\to$ **ENTONCES** `USAR Espinas Óseas` (para perforar su defensa).

### 4.5 Matchmaking Estricto y Jefe de Liga
El Coliseo utiliza un algoritmo de emparejamiento estricto:
- **Matchmaking Normal (85%):** El oponente será seleccionado de la misma rareza exacta del jugador, asegurando peleas justas y con un nivel calculado como `nivelJugador + 3` (máximo).
- **Evento Jefe de Liga (15%):** Existe una posibilidad del 15% de recibir una señal de alerta de Jefe de Liga. Se le presenta al jugador una interfaz cyberpunk personalizada donde puede elegir si desafiarlo o buscar un rival estándar. El Jefe de Liga siempre será de una **rareza superior**, tendrá un nivel de `nivelJugador + 5` y modificadores incrementados de estadísticas (**+15% HP y +10% ATK**). 
- **Recompensa de Victoria del Jefe:** Derrotar al Jefe de Liga otorga un bono de **+15% XP adicional** calculada al final del combate.

---

## 5. Sostenibilidad y Ecosistema Económico

Para evitar la espiral inflacionaria que ha destruido los modelos Web3 históricos, Proyecto Genos implementa la separación estricta de economías e inyecta dos sumideros permanentes (*sinks*) de quema de Esencia Vital (EV) y especímenes.

```
       [ ACTIVIDADES DIARIAS ] (Arcade, Cuidado, Misiones PvE)
                 │
                 ▼
          Genera Esencia Vital (EV) ──┐
                 │                     │
                 ▼                     ▼
          [ REACTOR GENÉTICO ]      [ SANTUARIO ]
          Consume: 5 Genos          Consume: 1 Geno
          Consume: Gran cantidad    Aplica: Cooldown 48h
                   de EV                    Límite 3/día
                 │                     │
                 ▼                     ▼
        Quema de Genos / EV    Reducción de Especímenes
        Estabiliza la Oferta   Genera EV de Consolación
```

### 5.1 Los Dos Sinks de Quema y Control Monetario
1. **El Reactor Genético:** 
   El Reactor es el principal mecanismo de actualización de rareza. Requiere depositar **5 Genos** de la misma rareza y pagar un coste sustancial en Esencia Vital. Los resultados posibles actúan como quema neta de activos:
   - **Éxito Crítico (3% en Nv.1):** Crea un Geno de dos rangos de rareza superior (de Común a Épico).
   - **Fusión Estable (35% en Nv.1):** Crea un Geno de un rango de rareza superior (de Común a Raro).
   - **Mutación Estancada (35% en Nv.1):** Destruye 4 Genos y devuelve sólo 1 Geno de su misma rareza base, pero con estadísticas y genes mutados (Común+).
   - **Colapso del Reactor (27% en Nv.1):** Destruye los 5 Genos por completas. Como mitigación de pérdida, el jugador recibe una compensación en EV equivalente a **1.5 veces el coste de la fusión** (EV de consolación).
2. **El Santuario Genético:**
   Permite a los jugadores liberar permanentemente a sus criaturas no deseadas a cambio de una recompensa fija en EV según su rareza (Común: 100 EV hasta Mítico: 15,000 EV). Para evitar el abuso mediante scripts o granjas de bots, el Santuario aplica dos límites estrictos:
   - **Freno anti-bots de liberación:** Límite máximo de **3 liberaciones diarias** por cuenta.
   - **Periodo de reposo (Cooldown):** Un Geno recién nacido no puede ser liberado hasta que transcurran **48 horas** de vida.

### 5.2 Inventario Limitado: "Bolsillos Rotos"
La mochila del jugador está limitada físicamente para fomentar la gestión estratégica de recursos:
- **Espacio Base gratuito:** 10 slots.
- **Expansiones Premium ($POL):** Mediante micropagos en Polygon, el jugador puede expandir el inventario a 20 slots ($2 POL), 30 slots ($5 POL) o 40 slots ($10 POL).
- **Límites de apilamiento por ranura:** Máximo de 99 ítems básicos / 20 consumibles / 1 pieza de equipamiento / 1 Bio-Núcleo.
- **Ranuras de Emergencia (Overflow):** 2 ranuras especiales que reciben ítems cuando la mochila está llena. Estos ítems tienen un temporizador activo de **24 horas**. Si el jugador no libera espacio en su inventario principal antes de que expire el tiempo, el ítem se destruye permanentemente.

### 5.3 Economía Web3 y Sistema de Becas (Scholarships)
- **Peg al Dólar (Precios Estables):** Todos los precios del juego Web3 se definen con base en el valor de cambio del dólar estadounidense (USD). Si el valor de $POL fluctúa, los costes en tokens se recalibran de forma automática para mantener el coste constante en dólares. Esto garantiza que las microtransacciones sigan siendo accesibles (permitiendo realizar múltiples acciones con un presupuesto de $10 USD).
- **Becas (Scholarships) Automatizadas:** La PWA permite a los propietarios de Genos NFT alquilar sus criaturas a otros jugadores. Un smart contract gestiona de forma automática la división de ingresos (**70% para el propietario / 30% para el jugador**) y establece un periodo de prueba de 7 días cancelable en cualquier momento, protegiendo a ambas partes sin costes de intermediación humana.

### 5.4 Sistema de Energía Nexo y Fatiga (Resistencia) del Geno

Para estabilizar la velocidad de generación de activos, evitar el farmeo abusivo por parte de cuentas automatizadas (bots) e incentivar la coleccionabilidad de criaturas (evitando que un solo Geno sea sobreexplotado), se introduce un doble limitador físico de acciones:

#### 1. Energía Nexo (Nivel de Jugador)
Es una barra de energía global asociada a la cuenta del jugador (máximo 100 puntos). Cada acción activa del juego consume una cantidad específica de energía:
- **Combates en el Coliseo (Liga Asíncrona):** consume **10 energía** (principal fuente de EV competitiva).
- **Partida de Torre PvE (una oleada):** consume **5 energía** (recompensa moderada).
- **Partida en el Arcade (Lluvia de Manzanas):** consume **5 energía** (actividad casual).
- **Inscripción en Torneo Temático:** consume **20 energía** (alto coste, alta recompensa).
- **Acciones Pasivas (Laboratorio, Crianza, Dojo, Tienda):** **Sin coste de energía** (no limita el juego estratégico o comercial).

*Tasa de Recuperación:* Se recupera de forma pasiva a razón de **1 energía cada 12 minutos** (5 de energía por hora), con un cap máximo de 100 que actúa como limitador de acumulación.

#### 2. Fatiga y Resistencia (Por Geno)
Cada Geno cuenta con su propia barra individual de resistencia de **0 a 100 puntos**. Combatir gasta la resistencia física de la criatura:
- **Combate en el Coliseo:** reduce **20 resistencia** del Geno.
- **Batalla en la Torre PvE:** reduce **15 resistencia** del Geno.
- **Estado de Descanso:** Cuando la resistencia de un Geno llega a 0, entra en estado de descanso y no puede ser seleccionado para combatir hasta que recupere energía.
- **Tasa de Recuperación:** Recupera **25 de resistencia por hora** de descanso completo (requiere 4 horas para regenerarse tras agotarse por completo).
- **Cuidado Diario:** Acariciar al Geno en su pedestal (cuidado diario que otorga +10 XP una vez al día) y ganar Amistad (de 1 a 3 puntos aleatorios, una vez al día). La resistencia se recupera únicamente descansando a un ritmo de 25 puntos por hora en el Centro de Cuidado.

*Efecto de Colección:* Un solo Geno puede hacer un máximo de 4 combates antes de requerir descanso. Para aprovechar al máximo las 20 acciones posibles con 100 de energía en el Coliseo, un jugador competitivo requerirá una rotación de al menos **3 a 5 Genos activos** en su cuenta. Esto incentiva de forma natural la crianza, la adquisición de nuevos especímenes en la Plaza de Comercio y la oferta de Scholarships.

---

## 6. Hoja de Ruta y Estado de Implementación V10.1

El estado actual del proyecto se encuentra estructurado en base a las siguientes fases de desarrollo:

### Fase 1: Infraestructura y Núcleo Visual (COMPLETADA)
- [x] Motor SVG dinámico implementado con las 7 capas visuales.
- [x] Formas Gen 0 operativas y el Hongo Fundador (Semilla Génesis) configurado.
- [x] Revelación y renderizado dinámico en el Laboratorio Morfológico.
- [x] Generación procedural de accesorios cosméticos PvE en base a rarezas.

### Fase 2: Economía Básica y Supervivencia (COMPLETADA)
- [x] Inventario limitado "Bolsillos Rotos" con 10 slots base y 2 ranuras de emergencia.
- [x] Modo Arcade "Lluvia de Manzanas" implementado con ratio de canje 5:1.
- [x] Gestión de Esencia Vital off-chain activa.

### Fase 3: El Santuario y el Reactor Genético (COMPLETADA & OPERATIVA EN CÓDIGO)
- [x] Santuario funcional con límite diario de 3 liberaciones y cooldown de 48h.
- [x] Reactor Genético operativo con sus tasas de Éxito Crítico, Fusión Estable, Mutación y Colapso.
- [x] Sistema de bonificaciones por genes en la probabilidad del Reactor.

### Fase 4: ADN, Asimetría de Mercado y Linaje (EN DESARROLLO)
- [/] Integración completa de los 5 stats del Geno (HP, ATK, DEF, SPD, LUK).
- [x] Lógica de cálculo de pureza genética y calificación visual S-D operativa.
- [ ] Escaneo avanzado de ADN y registro formal de crianza P2P.

### Fase 5: El Coliseo y Maestría Elemental (EN PRODUCCIÓN)
- [/] Motor de combate asíncrono 1v1 con cálculo de Defensa, ventaja/desventaja (+35% / -25%) y STAB (+20%).
- [x] Sistema de 4 slots de ataque implementado en la lógica de combate.
- [x] Lógica de Matchmaking estricto y aparición de Jefes de Liga (15% de probabilidad) con bono de +15% XP.
- [x] Implementación de la interfaz del **Laboratorio de Implantes** para equipar/desequipar Módulos de Técnica (MT) y cosméticos.
- [x] Implementación de la barra de Energía Nexo (100 Max) y barra de Resistencia por Geno (100 Max) con recuperación pasiva, offline y descanso en el Centro de Cuidado.

### Fase 6: Expansión Web3 y Becas (PLANIFICADA)
- [ ] Despliegue de contratos inteligentes de NFTs de Genos en la red Polygon.
- [ ] Integración del sistema de peg al dólar en la pasarela de pagos.
- [ ] Plaza de Comercio P2P integrada para compra/venta en $POL con comisión del 2-5%.
- [ ] Smart Contract de Scholarship automatizado (70/30).

### Fase 7: LiveOps y Torneos Temáticos (PLANIFICADA)
- [ ] Sistema de Torneos Temáticos con 12 tipos competitivos y rotación de 4 semanas.
- [ ] Modos de combate 3v3 por equipos (Asíncrono y Táctico).
- [ ] Dashboard RORS para monitoreo en vivo de la economía interna del juego.

---

## 7. Mecánicas Pendientes (Roadmap V10.1 "Hasta Dónde")
Para delimitar con precisión el estado de desarrollo actual y los objetivos inmediatos de los próximos sprints, se detallan las siguientes mecánicas pendientes:
1. **Contratos e Integración Web3 (Fase 6):** Pendiente la subida a Testnet/Mainnet de los contratos ERC-721 y el contrato de depósito en garantía para las becas de juego.
2. **Mecánica de Combate 3v3 (Fase 7):** La lógica de combate por equipos 3v3 (incluyendo el sistema de IFTTT de cambio y los relevos tácticos) está pendiente de codificación.
3. **Torneos Temáticos (Fase 7):** La lógica del calendario rotativo mensual de torneos y el cobro automatizado de entradas en EV/$POL no ha sido integrada en la interfaz de la PWA.
