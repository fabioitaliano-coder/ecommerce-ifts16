const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

const productsController = require('../controllers/productsController');
const categoriesController = require('../controllers/categoriesController');
const clientsController = require('../controllers/clientsController');
const discountsController = require('../controllers/discountsController');

const router = express.Router();

// Este router concentra los GET administrativos.
// La idea es simple:
// - el catalogo publico sigue usando /api/productos y similares
// - el panel admin deja de leer desde endpoints publicos
// - toda lectura administrativa pasa por authenticateToken + isAdmin
router.use(authenticateToken, isAdmin);

router.get('/productos', asyncHandler(productsController.getAll));
router.get('/categorias', asyncHandler(categoriesController.getAll));
router.get('/clientes', asyncHandler(clientsController.getAll));
router.get('/descuentos', asyncHandler(discountsController.getAll));

module.exports = router;
