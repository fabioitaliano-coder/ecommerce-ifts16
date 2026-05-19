// express es el paquete que expone Router y la API del servidor.
const express = require('express');

// router servirá como contenedor de endpoints de descuentos.
const router = express.Router();

// controller resuelve el trabajo de cada endpoint.
const controller = require('../controllers/discountsController');

// asyncHandler conecta handlers async con el flujo de errores de Express 4.
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(controller.getAll));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

// module.exports expone el router para que server.js lo monte en /api/descuentos.
module.exports = router;
