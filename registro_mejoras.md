# 📝 Registro de Mejoras y Ajustes del Servidor — Proyecto Genos

Este documento sirve como bitácora de todas las modificaciones y restauraciones realizadas que no están descritas en el Documento Maestro ni registradas directamente en los comentarios del código de producción, para mantener un registro histórico y evitar que se olviden.

---

## 🛠️ Modificaciones de Base de Datos y Servidor (Supabase)

### 1. Creación de Columnas Dedicadas en Tabla `jugadores` (06/06/2026)
* **Descripción**: Se agregaron tres columnas dedicadas a la tabla `jugadores` en la base de datos de producción para alinearse con las consultas y guardados del cliente, evitando errores de solicitud errónea (`HTTP 400 Bad Request`).
* **Acción SQL DDL**:
  ```sql
  ALTER TABLE jugadores 
  ADD COLUMN IF NOT EXISTS lab_level integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS lab_xp integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comercio_desbloqueado boolean DEFAULT false;
  ```
* **Migración de Datos (Backfill)**: Se ejecutó un query de actualización masiva para rellenar estas nuevas columnas con los datos históricos existentes dentro del campo JSONB `datos_juego` de todos los usuarios:
  ```sql
  UPDATE jugadores
  SET 
    lab_level = COALESCE((datos_juego->>'labLevel')::integer, 1),
    lab_xp = COALESCE((datos_juego->>'labXP')::integer, 0),
    comercio_desbloqueado = COALESCE((datos_juego->>'comercioDesbloqueado')::boolean, false);
  ```

### 2. Restauración Manual del Progreso del Administrador (06/06/2026)
* **Cuenta afectada**: `saletti001@gmail.com` (UUID: `9814f37b-df28-458e-8fa0-73a09aa8100b`).
* **Problema**: El progreso se corrompió al inicializarse un estado por defecto de Nivel 1 en el cliente por caché vacía, y luego la amistad de los Genos se redujo a 0 debido al bug del decaimiento offline.
* **Solución**: Se ejecutó una consulta SQL para fusionar (merge) el objeto `datos_juego` actual del jugador con los datos correctos de la copia de seguridad no corrompida del Paso 10611 (eliminando los SVGs dinámicos para optimizar espacio).
* **Valores restaurados**:
  * Nivel de Laboratorio: **2** (con 219 XP).
  * Monedero: **103.51 $POL** y **0.79 de Bóveda**.
  * Mascota Activa: **Neo-Prime** (ID: 000005, Amistad: **4.80**).
  * Puntos de Amistad originales de Genos: BIO-742 (**6.43**), Mutcore (**6.44**), Neo-Prime (**4.80**), Nexomorph (**3.86**).

---

## ⚙️ Correcciones y Ajustes de Integración (Frontend)

### 1. Fix del Decaimiento de Amistad Offline (`EnergyManager.js`)
* **Descripción**: Se añadió inmunidad al decaimiento de amistad durante la desconexión del jugador.
* **Implementación**:
  * Se modificó la firma de `NexoEnergyManager.recuperar(segundosTranscurridos, isOffline)` para incluir el parámetro booleano `isOffline`.
  * La lógica que descuenta amistad por descuido/negligencia se protegió dentro de un bloque `if (!isOffline)`.
  * El método `aplicarRecuperacionPasiva` invoca `this.recuperar(segundosTranscurridos, true)`. Esto preserva las amistades mientras el usuario está desconectado y solo aplica el decaimiento por tiempo de juego activo en los ticks normales.

### 2. Corrección del Reloj de Red Nexo y CORS (`CloudManager.js`)
* **Descripción**: Se eliminaron los errores en la consola del navegador (`401 Unauthorized` / `405 Method Not Allowed`) provocados por la consulta del desfase horario con el servidor de Supabase.
* **Implementación**:
  * Se modificó `window.obtenerHoraServidor` para realizar una solicitud de tipo `GET` (en lugar de `HEAD`) apuntando a la ruta pública de salud del servicio de autenticación: `supabaseUrl + '/auth/v1/health'`.
  * Se inyectó la cabecera `apikey: supabaseKey` para pasar de forma segura a través de la pasarela de enlace API (Kong Gateway).
  * Esto permite obtener el encabezado `Date` del servidor de forma limpia, cumpliendo con la política de CORS y sin arrojar logs de error en rojo.
