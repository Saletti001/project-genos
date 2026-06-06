// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GenosPlazaComercio
 * @dev Contrato de liquidación de compras P2P de Genos en Polygon.
 * Las comisiones se desvían de forma automática e inmediata a la tesorería multisig Safe.
 */
contract GenosPlazaComercio {
    address public owner;
    address payable public walletTesoreriaSafe;
    uint256 public porcentajeComision = 350; // 3.50% expresado en puntos básicos (basis points)

    event CompraGeno(
        uint256 indexed compraId,
        address indexed comprador,
        address indexed vendedor,
        uint256 genoId,
        uint256 precio
    );

    event ActualizacionTesoreria(address indexed antiguaTesoreria, address indexed nuevaTesoreria);
    event ActualizacionComision(uint256 antiguaComision, uint256 nuevaComision);
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
     * @dev Modifica la dirección de la tesorería multisig.
     */
    function setWalletTesoreriaSafe(address payable _nuevaWallet) external onlyOwner {
        require(_nuevaWallet != address(0), "Direccion de tesoreria invalida");
        emit ActualizacionTesoreria(walletTesoreriaSafe, _nuevaWallet);
        walletTesoreriaSafe = _nuevaWallet;
    }

    /**
     * @dev Modifica el porcentaje de comisión. Máximo 10% (1000 basis points) para proteger al jugador.
     */
    function setPorcentajeComision(uint256 _nuevoPorcentaje) external onlyOwner {
        require(_nuevoPorcentaje <= 1000, "La comision no puede superar el 10%");
        emit ActualizacionComision(porcentajeComision, _nuevoPorcentaje);
        porcentajeComision = _nuevoPorcentaje;
    }

    /**
     * @dev Procesa el pago de un Geno.
     * @param _compraId Identificador de la compra (de Supabase).
     * @param _genoId Identificador único del Geno.
     * @param _vendedor Dirección de la wallet del vendedor.
     * @param _montoTotal Importe total de la venta en Wei (POL).
     */
    function procesarPagoGeno(
        uint256 _compraId,
        uint256 _genoId,
        address payable _vendedor,
        uint256 _montoTotal
    ) external payable {
        require(_vendedor != address(0), "Direccion de vendedor invalida");
        require(msg.value == _montoTotal, "El valor enviado no coincide con el monto total");
        require(_montoTotal > 0, "El monto debe ser mayor a cero");

        uint256 montoComision = (_montoTotal * porcentajeComision) / 10000;
        uint256 montoNetoVendedor = _montoTotal - montoComision;

        // Desvío de la comisión a la tesorería multisig
        if (montoComision > 0) {
            (bool exitoComision, ) = walletTesoreriaSafe.call{value: montoComision}("");
            require(exitoComision, "Fallo el envio de comision a la tesoreria");
        }

        // Envío del neto al vendedor
        (bool exitoVendedor, ) = _vendedor.call{value: montoNetoVendedor}("");
        require(exitoVendedor, "Fallo el envio de fondos al vendedor");

        emit CompraGeno(_compraId, msg.sender, _vendedor, _genoId, _montoTotal);
    }
}
