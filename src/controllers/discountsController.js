// Discount es el modelo que representa la tabla discounts.
const { Discount } = require('../models');

const discountsController = {
  async getAll(req, res) {
    // req y res los entrega Express automáticamente a cada handler.
    const discounts = await Discount.findAll({ order: [['id', 'ASC']] });
    return res.json(discounts);
  },

  async getById(req, res) {
    // req.params.id sale del parámetro dinámico de la URL.
    const discount = await Discount.findByPk(req.params.id);

    if (!discount) {
      return res.status(404).json({ error: 'Descuento no encontrado' });
    }

    return res.json(discount);
  },

  async create(req, res) {
    // code, percent y minTotal llegan en el cuerpo JSON del POST.
    const { code, percent, minTotal } = req.body;
    const discount = await Discount.create({ code, percent, minTotal });
    return res.status(201).json(discount);
  },

  async update(req, res) {
    // req.params.id marca qué descuento editar.
    // req.body trae los nuevos valores opcionales.
    const discount = await Discount.findByPk(req.params.id);

    if (!discount) {
      return res.status(404).json({ error: 'Descuento no encontrado' });
    }

    const { code, percent, minTotal } = req.body;
    if (code !== undefined) discount.code = code;
    if (percent !== undefined) discount.percent = percent;
    if (minTotal !== undefined) discount.minTotal = minTotal;

    await discount.save();
    return res.json(discount);
  },

  async remove(req, res) {
    // req.params.id señala qué registro se intenta borrar.
    const discount = await Discount.findByPk(req.params.id);

    if (!discount) {
      return res.status(404).json({ error: 'Descuento no encontrado' });
    }

    await discount.destroy();
    return res.status(204).end();
  }
};

// module.exports expone discountsController para que el router pueda usarlo.
module.exports = discountsController;
