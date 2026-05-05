const store = require('../data/store');
const { calculateCartTotal, applyDiscount, commitPurchase } = require('../models/Checkout');

const checkoutController = {
  create(req, res) {
    try {
      const { clientId, items, discountCode } = req.body;
      const client = store.clients.find(item => item.id === clientId);

      if (!client) {
        return res.status(400).json({ error: 'Cliente inválido' });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Carrito vacío' });
      }

      const subtotal = calculateCartTotal(items);
      const discountResult = applyDiscount(subtotal, discountCode);

      commitPurchase(items);

      const order = {
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
      return res.status(400).json({ error: error.message });
    }
  }
};

module.exports = checkoutController;
