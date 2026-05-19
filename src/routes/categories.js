// express es la librería base de HTTP para esta app.
const express = require('express');

// router agrupa todas las rutas de categorías.
const router = express.Router();

// controller contiene la lógica real; el router solo deriva.
const controller = require('../controllers/categoriesController');

// asyncHandler captura errores de funciones async y los envía a next(error).
const asyncHandler = require('../utils/asyncHandler');

// Esta ruta nueva permite gestionar la tabla categories.
// El parámetro :id, cuando existe, viaja en req.params.id hacia el controller.
router.get('/', asyncHandler(controller.getAll));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

// module.exports entrega el router terminado para que server.js lo monte.
module.exports = router;
