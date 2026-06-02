const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const controller = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// POST /api/auth/login recibe email y password y devuelve token + user.
router.post('/login', asyncHandler(controller.login));

// GET /api/auth/me sirve para comprobar si un token sigue siendo válido.
// Orden del pipeline en esta ruta:
// 1. authenticateToken
// 2. asyncHandler(controller.me)
//
// O sea:
// si el token falla, controller.me ni siquiera llega a ejecutarse.
router.get('/me', authenticateToken, asyncHandler(controller.me));

// module.exports entrega el router auth para server.js.
module.exports = router;
