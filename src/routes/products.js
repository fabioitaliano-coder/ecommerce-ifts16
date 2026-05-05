// Traemos Express, la librería que nos permite crear rutas y levantar el servidor.
const express = require('express');

// express.Router() crea un enrutador separado.
// Sirve para agrupar todas las rutas de productos en un solo lugar.
const router = express.Router();

// Traemos el controller de productos.
// El router delega la lógica en este archivo en lugar de resolverla acá.
const controller = require('../controllers/productsController');

// Este archivo cumple el rol de ROUTER.
// En MVC, el router actúa como el "mozo":
// recibe el pedido y decide a qué función del controller lo envía.
// Acá no debería vivir la lógica de negocio.

// Si el cliente hace GET /api/productos
// este router ejecuta controller.getAll.
// Archivo siguiente para mirar en clase:
// ../controllers/productsController.js
router.get('/', controller.getAll);

// Si el cliente hace GET /api/productos/5
// ":id" captura el valor dinámico que viene en la URL.
router.get('/:id', controller.getById);

// POST /api/productos crea un producto nuevo.
router.post('/', controller.create);

// PUT /api/productos/:id modifica un producto existente.
router.put('/:id', controller.update);

// DELETE /api/productos/:id elimina un producto existente.
router.delete('/:id', controller.remove);

module.exports = router;
