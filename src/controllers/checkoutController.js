// Client se usa para verificar que el cliente comprador exista.
const { Client } = require('../models');

// Estas tres funciones salen del módulo de negocio Checkout.
// Se importan con destructuring porque module.exports devuelve un objeto
// con varias utilidades y acá solo queremos esas tres.
const { calculateCartTotal, applyDiscount, commitPurchase } = require('../models/Checkout');

const checkoutController = {
  async create(req, res) {
    try {
      // req.body viene del JSON enviado por el frontend o por Postman.
      // clientId identifica al cliente.
      // items representa el carrito.
      // discountCode es opcional.
      const { clientId, items, discountCode } = req.body;
      const client = await Client.findByPk(clientId);

      if (!client) {
        return res.status(400).json({ error: 'Cliente inválido' });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Carrito vacío' });
      }

      const subtotal = await calculateCartTotal(items);
      const discountResult = await applyDiscount(subtotal, discountCode);

      await commitPurchase(items);

      const order = {
        // Date.now() se usa como identificador simple en memoria para la respuesta.
        // No se persiste todavía porque esta app aún no tiene tabla orders.
        id: Date.now(),
        clientId,
        items,
        subtotal,
        discount: discountResult.discount,
        total: discountResult.total,
        discountCode: discountResult.appliedCode
      };

      return res.status(201).json({ order });
    } catch (error) {
      // error nace en cualquier await interno que lance una excepción.
      // Acá respondemos 400 porque el problema suele estar en datos inválidos
      // del carrito, cliente o descuento.
      return res.status(400).json({ error: error.message });
    }
  }
};

// module.exports devuelve checkoutController para que el router POST /api/checkout
// pueda usar su método create como punto de entrada del proceso de compra.
module.exports = checkoutController;
