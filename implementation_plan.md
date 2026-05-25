# Hito B: Panel IFTTT Individual para Combate Offline

Implementación de la inteligencia artificial programable (sistema IFTTT: *If This Then That*) para la defensa offline de los Genos de acuerdo con el documento maestro **V10.2 (Coliseo)**. Esto permite a los jugadores programar de forma táctica cómo actuará su Geno en combates asíncronos y probar sus configuraciones en un simulador integrado.

## Proposed Changes

---

### 1. Estructura de Datos (Esquema de Reglas)
Cada Geno guardará sus reglas en una propiedad persistente `iftttRules` dentro de su objeto principal. De esta forma, el progreso se almacena localmente y en la nube de forma transparente sin modificar la base de datos externa.

#### Esquema de regla individual:
```json
{
  "condition": "hp_under_30",
  "action": "use_definitivo"
}
```

*Por defecto, si un Geno no tiene reglas configuradas, se inicializará con:*
`[ { "condition": "always", "action": "use_ataque" } ]` (Usar ataque básico siempre).

---

### 2. Motor de Resolución IFTTT
Modificaremos [ColiseumLogic.js](file:///c:/Users/STT/Documents/GitHub/Mascotas/ColiseumLogic.js) y [ColiseumManager.js](file:///c:/Users/STT/Documents/GitHub/Mascotas/ColiseumManager.js) para integrar el motor de evaluación de reglas.

#### Condiciones Disponibles:
1. `always`: Siempre (Por defecto)
2. `turn_1`: En el Turno 1
3. `hp_under_30`: Mi HP < 30%
4. `hp_under_50`: Mi HP < 50%
5. `hp_under_80`: Mi HP < 80%
6. `rival_element_[Elemento]`: El elemento del rival es `Biomutante`, `Viral`, `Cibernético`, `Radiactivo`, `Tóxico` o `Sintético`.
7. `rival_infected`: El rival tiene el estado *Infección* activo.
8. `rival_buffed_atk`: El rival tiene un aumento de daño (ATK) activo.
9. `self_buffed_spd`: Tengo un aumento de velocidad (SPD) activo.

#### Acciones Disponibles:
- `use_ataque`: Usar Ataque Básico (Slot 1)
- `use_especial`: Usar Ataque Especial (Slot 2)
- `use_tactica`: Usar Ataque Táctico (Slot 3)
- `use_definitivo`: Usar Ataque Definitivo (Slot 4)

#### Flujo de Resolución del Turno:
El motor evalúa las reglas en orden de prioridad (1 a 5). Ejecuta la **primera regla** cuya condición sea verdadera **y cuyo ataque no esté en cooldown**. Si la acción está en cooldown, pasa a la siguiente regla. Si ninguna regla se cumple o todas sus acciones están bloqueadas por cooldown, ejecuta el ataque básico por defecto.

---

### 3. Interfaz de Configuración IFTTT (UI sin código)
Crearemos un panel de programación visual neon-cyberpunk dentro de la vista de estadísticas de los Genos ([RPGManager.js](file:///c:/Users/STT/Documents/GitHub/Mascotas/RPGManager.js)).

- **Botón de Acceso:** Añadir `🤖 CONFIGURAR TÁCTICA IFTTT` en el modal de estadísticas.
- **Formulario Dinámico:**
  - Selector de condiciones con nombres explicativos en español.
  - Selector de acciones que muestra dinámicamente los ataques equipados en ese slot (ej. *Usar Especial [Espinas Óseas]*).
  - Controles para ordenar la prioridad de las reglas (flechas 🔼 y 🔽).
  - Botón de guardado rápido con feedback visual.

---

### 4. Integración y Pruebas en el Coliseo (Simulador de Práctica)
Para verificar la efectividad estratégica del IFTTT, añadiremos una nueva sección en el Coliseo Nexo:

- **Modo Práctica:** Permitirá simular un combate contra:
  1. **Tu propio clon:** Un clon de tu Geno controlado por las reglas IFTTT que acabas de configurar (ideal para depurar tu propia estrategia).
  2. **Rival Pre-configurado (IFTTT):** NPCs con tácticas preprogramadas (ej. un cyborg defensivo que cura bajo 35% o un atacante radiactivo que inicia con veneno).

---

## Verification Plan

### Automated Tests
- Crear un script `test_ifttt.js` para simular turnos de combate e inyectar configuraciones IFTTT específicas (ej: asegurar que si se cumple `hp_under_30` se ejecuta `use_definitivo` en lugar del básico, y que respeta el cooldown de 5 turnos).

### Manual Verification
- Configurar una regla en el nuevo panel visual del Geno.
- Iniciar un combate de práctica contra tu Clon en el Coliseo y comprobar mediante el Log de combate que el oponente ejecuta los ataques siguiendo al pie de la letra las reglas lógicas programadas.
