// Discount es el modelo que representa la tabla discounts.
const { Discount } = require('../models');
const { Op } = require('sequelize');
const { parsePagination, buildPaginationMeta, sendCsv } = require('../utils/pagination');
const { sendSuccess, sendPaginated, sendError } = require('../utils/apiResponse');
const { validateDiscountPayload } = require('../utils/validation');

const discountsController = {
  async getAll(req, res) {
    // req y res los entrega Express automáticamente a cada handler.
    const wantsCsv = req.query.format === 'csv';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const filterCode = typeof req.query.filterCode === 'string' ? req.query.filterCode.trim() : '';
    const filterPercent = typeof req.query.filterPercent === 'string' ? req.query.filterPercent.trim() : '';
    const sortBy = ['id', 'code', 'percent', 'minTotal'].includes(req.query.sortBy)
      ? req.query.sortBy
      : 'id';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';
    const where = {};

    if (search) {
      where.code = {
        [Op.like]: `%${search}%`
      };
    }

    if (filterCode) {
      where.code = {
        [Op.like]: `%${filterCode}%`
      };
    }

    if (filterPercent) {
      const parsedPercent = Number(filterPercent);
      if (!Number.isNaN(parsedPercent)) {
        where.percent = parsedPercent;
      }
    }

    if (wantsCsv) {
      const discounts = await Discount.findAll({ where, order: [[sortBy, sortOrder]] });

      return sendCsv(
        res,
        'descuentos.csv',
        ['id', 'code', 'percent', 'minTotal'],
        discounts.map(discount => [
          discount.id,
          discount.code,
          discount.percent,
          discount.minTotal
        ])
      );
    }

    // La paginacion evita traer toda la tabla de una sola vez.
    // Eso vuelve la interfaz mas clara y ademas abre la puerta
    // a escalar el proyecto si la tabla crece.
    const { page, limit, offset } = parsePagination(req.query, 10, 50);

    const result = await Discount.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset
    });

    return sendPaginated(res, result.rows, buildPaginationMeta(page, limit, result.count));
  },

  async getById(req, res) {
    // req.params.id sale del parámetro dinámico de la URL.
    const discount = await Discount.findByPk(req.params.id);

    if (!discount) {
      return sendError(res, 404, 'Descuento no encontrado');
    }

    return sendSuccess(res, discount);
  },

  async create(req, res) {
    // code, percent y minTotal llegan en el cuerpo JSON del POST.
    const { errors, normalized } = validateDiscountPayload(req.body);

    if (errors.length > 0) {
      return sendError(res, 422, 'Datos inválidos para descuento.', errors);
    }

    const discount = await Discount.create(normalized);
    return sendSuccess(res, discount, 201);
  },

  async update(req, res) {
    // req.params.id marca qué descuento editar.
    // req.body trae los nuevos valores opcionales.
    const discount = await Discount.findByPk(req.params.id);

    if (!discount) {
      return sendError(res, 404, 'Descuento no encontrado');
    }

    const { errors, normalized } = validateDiscountPayload(req.body, { partial: true });

    if (errors.length > 0) {
      return sendError(res, 422, 'Datos inválidos para descuento.', errors);
    }

    if (normalized.code !== undefined) discount.code = normalized.code;
    if (normalized.percent !== undefined) discount.percent = normalized.percent;
    if (normalized.minTotal !== undefined) discount.minTotal = normalized.minTotal;

    await discount.save();
    return sendSuccess(res, discount);
  },

  async remove(req, res) {
    // req.params.id señala qué registro se intenta borrar.
    const discount = await Discount.findByPk(req.params.id);

    if (!discount) {
      return sendError(res, 404, 'Descuento no encontrado');
    }

    await discount.destroy();
    return res.status(204).end();
  }
};

// module.exports expone discountsController para que el router pueda usarlo.
module.exports = discountsController;
