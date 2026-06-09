// express es el paquete que expone Router y la API del servidor.
const express = require('express');

// router servirá como contenedor de endpoints de descuentos.
const router = express.Router();

// controller resuelve el trabajo de cada endpoint.
const controller = require('../controllers/discountsController');

// asyncHandler conecta handlers async con el flujo de errores de Express 4.
const asyncHandler = require('../utils/asyncHandler');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, isAdmin, asyncHandler(controller.getAll));
router.get('/:id', authenticateToken, isAdmin, asyncHandler(controller.getById));
router.post('/', authenticateToken, isAdmin, asyncHandler(controller.create));
router.put('/:id', authenticateToken, isAdmin, asyncHandler(controller.update));
router.delete('/:id', authenticateToken, isAdmin, asyncHandler(controller.remove));

// module.exports expone el router para que server.js lo monte en /api/descuentos.
module.exports = router;
