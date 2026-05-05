const store = require('../data/store');
const { Discount } = require('../models/Discount');

const discountsController = {
  getAll(req, res) {
    res.json(store.discounts);
  },

  getById(req, res) {
    const id = Number(req.params.id);
    const discount = store.discounts.find(item => item.id === id);

    if (!discount) {
      return res.status(404).json({ error: 'Descuento no encontrado' });
    }

    return res.json(discount);
  },

  create(req, res) {
    const { code, percent, minTotal } = req.body;
    const id = store.nextIds.discounts++;
    const discount = new Discount({ id, code, percent, minTotal });

    store.discounts.push(discount);
    return res.status(201).json(discount);
  },

  update(req, res) {
    const id = Number(req.params.id);
    const discount = store.discounts.find(item => item.id === id);

    if (!discount) {
      return res.status(404).json({ error: 'Descuento no encontrado' });
    }

    const { code, percent, minTotal } = req.body;
    if (code !== undefined) discount.code = code;
    if (percent !== undefined) discount.percent = percent;
    if (minTotal !== undefined) discount.minTotal = minTotal;

    return res.json(discount);
  },

  remove(req, res) {
    const id = Number(req.params.id);
    const index = store.discounts.findIndex(item => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Descuento no encontrado' });
    }

    store.discounts.splice(index, 1);
    return res.status(204).end();
  }
};

module.exports = discountsController;
