// express permite crear rutas HTTP.
const express = require('express');

// router concentra únicamente las rutas del recurso clientes.
const router = express.Router();

// controller agrupa la lógica de negocio del recurso.
const controller = require('../controllers/clientsController');

// asyncHandler asegura que errores async lleguen al middleware global.
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(controller.getAll));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

// module.exports devuelve este router para ser usado por server.js.
module.exports = router;
