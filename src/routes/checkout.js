// express permite declarar rutas HTTP.
const express = require('express');

// router reúne las rutas del proceso de checkout.
const router = express.Router();

// controller contiene la lógica de compra.
const controller = require('../controllers/checkoutController');

// asyncHandler evita repetir try/catch solo para reenviar errores a Express.
const asyncHandler = require('../utils/asyncHandler');

// El POST recibe req.body con clientId, items y discountCode.
// El router no los manipula: se los pasa al controller.
router.post('/', asyncHandler(controller.create));

// module.exports devuelve el router preparado.
// server.js lo monta con app.use('/api/checkout', checkoutRouter).
module.exports = router;
