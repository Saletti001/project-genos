// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GenosTorneos
 * @dev Contrato para la gestión de torneos, emparejamientos competitivos e inyección de NPCs.
 * Soporta reembolsos pasivos, reasignación FIFO y desvío de premios de NPCs a la tesorería Safe.
 */
contract GenosTorneos {
    address public owner;
    address payable public walletTesoreriaSafe;

    struct Torneo {
        uint256 costoEntrada;          // Costo de entrada en Wei (POL)
        uint256 maxJugadores;          // Cantidad máxima de jugadores (ej: 16)
        uint256 jugadoresInscritosCount;
        address[] jugadoresInscritos;
        bool activo;
        bool cancelado;
        bool finalizado;
    }

    // Identificador de torneo => Detalle del torneo
    mapping(uint256 => Torneo) public torneos;

    // Dirección del jugador => Saldo pendiente de retirar o reinvertir
    mapping(address => uint256) public saldosPendientes;

    event TorneoCreado(uint256 indexed torneoId, uint256 costoEntrada, uint256 maxJugadores);
    event InscripcionTorneo(uint256 indexed torneoId, address indexed jugador, uint256 montoPagado, uint256 saldoUsado);
    event ReubicacionTorneo(uint256 indexed torneoIdOrigen, uint256 indexed torneoIdDestino, address indexed jugador, uint256 saldoDevuelto);
    event TorneoCancelado(uint256 indexed torneoId, uint256 totalDevoluciones);
    event TorneoFinalizado(
        uint256 indexed torneoId,
        address primerLugar,
        address segundoLugar,
        address tercerLugar,
        uint256 premiosPagados,
        uint256 desviadoTesoreria
    );
    event RetiroSaldo(address indexed jugador, uint256 monto);
    event ActualizacionTesoreria(address indexed antiguaTesoreria, address indexed nuevaTesoreria);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede realizar esta accion");
        _;
    }

    constructor(address payable _walletSafe) {
        require(_walletSafe != address(0), "Direccion de tesoreria invalida");
        owner = msg.sender;
        walletTesoreriaSafe = _walletSafe;
    }

    /**
     * @dev Transfiere el propietario del contrato.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Nuevo propietario invalido");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @dev Modifica la dirección de la tesorería Safe.
     */
    function setWalletTesoreriaSafe(address payable _nuevaWallet) external onlyOwner {
        require(_nuevaWallet != address(0), "Direccion de tesoreria invalida");
        emit ActualizacionTesoreria(walletTesoreriaSafe, _nuevaWallet);
        walletTesoreriaSafe = _nuevaWallet;
    }

    /**
     * @dev Crea un nuevo torneo en la blockchain.
     */
    function crearTorneo(uint256 _torneoId, uint256 _costoEntrada, uint256 _maxJugadores) external onlyOwner {
        require(!torneos[_torneoId].activo && !torneos[_torneoId].finalizado, "El torneo ya existe o fue finalizado");
        require(_maxJugadores > 0, "Debe permitir al menos 1 jugador");

        torneos[_torneoId].costoEntrada = _costoEntrada;
        torneos[_torneoId].maxJugadores = _maxJugadores;
        torneos[_torneoId].activo = true;

        emit TorneoCreado(_torneoId, _costoEntrada, _maxJugadores);
    }

    /**
     * @dev Inscribe a un jugador en un torneo.
     * Si msg.value es menor que la entrada, cubre el déficit con saldosPendientes.
     * Si msg.value es mayor que la entrada, acredita el exceso a saldosPendientes.
     */
    function inscribirseTorneo(uint256 _torneoId) external payable {
        Torneo storage t = torneos[_torneoId];
        require(t.activo, "El torneo no esta activo");
        require(!t.cancelado && !t.finalizado, "El torneo ya termino o fue cancelado");
        require(t.jugadoresInscritosCount < t.maxJugadores, "El torneo esta lleno");

        // Validar que el jugador no esté ya inscrito
        for (uint256 i = 0; i < t.jugadoresInscritos.length; i++) {
            require(t.jugadoresInscritos[i] != msg.sender, "Jugador ya inscrito");
        }

        uint256 costo = t.costoEntrada;
        uint256 saldoUsado = 0;

        if (msg.value < costo) {
            uint256 deficit = costo - msg.value;
            require(saldosPendientes[msg.sender] >= deficit, "Fondos insuficientes (POL + Saldo interno)");
            saldosPendientes[msg.sender] -= deficit;
            saldoUsado = deficit;
        } else if (msg.value > costo) {
            uint256 exceso = msg.value - costo;
            saldosPendientes[msg.sender] += exceso;
        }

        t.jugadoresInscritos.push(msg.sender);
        t.jugadoresInscritosCount++;

        emit InscripcionTorneo(_torneoId, msg.sender, msg.value, saldoUsado);
    }

    /**
     * @dev Reubica a un jugador excedente de un torneo a otro (FIFO).
     * Calcula la diferencia de costo y la acredita a saldosPendientes.
     */
    function reubicarJugador(uint256 _torneoIdOrigen, uint256 _torneoIdDestino, address _jugador) external onlyOwner {
        Torneo storage orig = torneos[_torneoIdOrigen];
        Torneo storage dest = torneos[_torneoIdDestino];

        require(dest.activo && !dest.cancelado && !dest.finalizado, "Torneo destino no disponible");
        require(dest.jugadoresInscritosCount < dest.maxJugadores, "Torneo destino esta lleno");

        // Remover de origen
        _removerJugador(_torneoIdOrigen, _jugador);

        // Inscribir en destino
        dest.jugadoresInscritos.push(_jugador);
        dest.jugadoresInscritosCount++;

        // Devolución de diferencia
        uint256 devuelto = 0;
        if (orig.costoEntrada > dest.costoEntrada) {
            devuelto = orig.costoEntrada - dest.costoEntrada;
            saldosPendientes[_jugador] += devuelto;
        }

        emit ReubicacionTorneo(_torneoIdOrigen, _torneoIdDestino, _jugador, devuelto);
    }

    /**
     * @dev Cancela un torneo y reembolsa el costo de entrada a saldosPendientes de los jugadores.
     */
    function cancelarTorneo(uint256 _torneoId) external onlyOwner {
        Torneo storage t = torneos[_torneoId];
        require(t.activo, "El torneo no esta activo");
        require(!t.finalizado, "El torneo ya esta finalizado");

        t.activo = false;
        t.cancelado = true;

        uint256 count = t.jugadoresInscritos.length;
        uint256 costo = t.costoEntrada;

        for (uint256 i = 0; i < count; i++) {
            saldosPendientes[t.jugadoresInscritos[i]] += costo;
        }

        emit TorneoCancelado(_torneoId, count * costo);
    }

    /**
     * @dev Finaliza un torneo, distribuye los premios al Top 3 (humano o NPC) y envía la comisión de la casa.
     * @param _torneoId ID del torneo.
     * @param _ganadores Arreglo con las 3 direcciones ganadoras (índice 0: 1er lugar, 1: 2do lugar, 2: 3er lugar).
     * @param _esNPC Arreglo indicando si cada ganador es NPC (índice 0: 1er lugar, 1: 2do lugar, 2: 3er lugar).
     */
    function finalizarTorneo(
        uint256 _torneoId,
        address[] calldata _ganadores,
        bool[] calldata _esNPC
    ) external onlyOwner {
        require(_ganadores.length == 3 && _esNPC.length == 3, "Debe proveer exactamente 3 ganadores");
        Torneo storage t = torneos[_torneoId];
        require(t.activo, "El torneo no esta activo");
        require(!t.cancelado && !t.finalizado, "El torneo ya fue cancelado o finalizado");

        t.activo = false;
        t.finalizado = true;

        // Pozo de premios calculado sobre torneo lleno (maxJugadores)
        uint256 pozoPremios = (t.costoEntrada * t.maxJugadores * 90) / 100; // 90% a premios
        uint256 pagadoAHumanos = 0;

        // Distribución Primer Lugar (50% del pozo de premios)
        if (!_esNPC[0] && _ganadores[0] != address(0)) {
            uint256 premio = (pozoPremios * 50) / 100;
            _pagarPremio(_ganadores[0], premio);
            pagadoAHumanos += premio;
        }

        // Distribución Segundo Lugar (30% del pozo de premios)
        if (!_esNPC[1] && _ganadores[1] != address(0)) {
            uint256 premio = (pozoPremios * 30) / 100;
            _pagarPremio(_ganadores[1], premio);
            pagadoAHumanos += premio;
        }

        // Distribución Tercer Lugar (20% del pozo de premios)
        if (!_esNPC[2] && _ganadores[2] != address(0)) {
            uint256 premio = (pozoPremios * 20) / 100;
            _pagarPremio(_ganadores[2], premio);
            pagadoAHumanos += premio;
        }

        // Liquidación final a tesorería Safe (Comisión + Premios de NPCs)
        uint256 totalColectado = t.jugadoresInscritosCount * t.costoEntrada;
        uint256 enviadoTesoreria = 0;
        if (totalColectado >= pagadoAHumanos) {
            uint256 leftover = totalColectado - pagadoAHumanos;
            if (leftover > 0) {
                (bool exito, ) = walletTesoreriaSafe.call{value: leftover}("");
                require(exito, "Fallo transferencia de comision a tesoreria");
                enviadoTesoreria = leftover;
            }
        } else {
            uint256 deficit = pagadoAHumanos - totalColectado;
            require(address(this).balance >= deficit, "Reserva del contrato insuficiente para cubrir deficit");
        }

        emit TorneoFinalizado(
            _torneoId,
            _ganadores[0],
            _ganadores[1],
            _ganadores[2],
            pagadoAHumanos,
            enviadoTesoreria
        );
    }

    /**
     * @dev Permite a un jugador retirar su saldo acumulado en el contrato.
     */
    function retirarSaldo() external {
        uint256 monto = saldosPendientes[msg.sender];
        require(monto > 0, "No tienes saldo disponible para retirar");

        saldosPendientes[msg.sender] = 0;

        (bool exito, ) = msg.sender.call{value: monto}("");
        require(exito, "Fallo la transferencia del retiro");

        emit RetiroSaldo(msg.sender, monto);
    }

    /**
     * @dev Remueve internamente a un jugador de la lista de inscritos.
     */
    function _removerJugador(uint256 _torneoId, address _jugador) internal {
        Torneo storage t = torneos[_torneoId];
        uint256 len = t.jugadoresInscritos.length;
        for (uint256 i = 0; i < len; i++) {
            if (t.jugadoresInscritos[i] == _jugador) {
                t.jugadoresInscritos[i] = t.jugadoresInscritos[len - 1];
                t.jugadoresInscritos.pop();
                t.jugadoresInscritosCount--;
                return;
            }
        }
        revert("Jugador no registrado en este torneo");
    }

    /**
     * @dev Paga el premio de forma directa o lo acredita a saldosPendientes si la transferencia falla.
     */
    function _pagarPremio(address _ganador, uint256 _premio) internal {
        (bool exito, ) = _ganador.call{value: _premio}("");
        if (!exito) {
            saldosPendientes[_ganador] += _premio;
        }
    }

    // Permite recibir fondos generales para subsidios o reservas del contrato
    receive() external payable {}
}
