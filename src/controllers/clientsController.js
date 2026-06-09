// Client es el modelo Sequelize asociado a la tabla clients.
const { Client } = require('../models');
const { Op } = require('sequelize');
const { parsePagination, buildPaginationMeta, sendCsv } = require('../utils/pagination');
const { sendSuccess, sendPaginated, sendError } = require('../utils/apiResponse');
const { validateClientPayload } = require('../utils/validation');

const clientsController = {
  async getAll(req, res) {
    // req es la petición entrante; res es la respuesta saliente.
    const wantsCsv = req.query.format === 'csv';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const filterName = typeof req.query.filterName === 'string' ? req.query.filterName.trim() : '';
    const filterEmail = typeof req.query.filterEmail === 'string' ? req.query.filterEmail.trim() : '';
    const sortBy = ['id', 'name', 'email'].includes(req.query.sortBy)
      ? req.query.sortBy
      : 'id';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';
    const where = {};
    const andFilters = [];

    if (search) {
      andFilters.push({
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ]
      });
    }

    if (filterName) {
      andFilters.push({
        name: { [Op.like]: `%${filterName}%` }
      });
    }

    if (filterEmail) {
      andFilters.push({
        email: { [Op.like]: `%${filterEmail}%` }
      });
    }

    if (andFilters.length > 0) {
      where[Op.and] = andFilters;
    }

    if (wantsCsv) {
      // Excel puede abrir CSV sin necesidad de una libreria extra.
      // Para una clase inicial, esto mantiene el foco en el flujo HTTP
      // y no en una dependencia adicional de exportacion.
      const clients = await Client.findAll({ where, order: [[sortBy, sortOrder]] });

      return sendCsv(
        res,
        'clientes.csv',
        ['id', 'name', 'email'],
        clients.map(client => [client.id, client.name, client.email])
      );
    }

    const { page, limit, offset } = parsePagination(req.query, 10, 50);

    const result = await Client.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset
    });

    return sendPaginated(res, result.rows, buildPaginationMeta(page, limit, result.count));
  },

  async getById(req, res) {
    // req.params.id viene de la ruta GET /api/clientes/:id.
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return sendError(res, 404, 'Cliente no encontrado');
    }

    return sendSuccess(res, client);
  },

  async create(req, res) {
    // req.body trae name y email enviados como JSON por el cliente HTTP.
    const { errors, normalized } = validateClientPayload(req.body);

    if (errors.length > 0) {
      return sendError(res, 422, 'Datos inválidos para cliente.', errors);
    }

    const client = await Client.create(normalized);
    return sendSuccess(res, client, 201);
  },

  async update(req, res) {
    // req.params.id identifica el registro.
    // req.body trae los campos a modificar.
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return sendError(res, 404, 'Cliente no encontrado');
    }

    const { errors, normalized } = validateClientPayload(req.body, { partial: true });

    if (errors.length > 0) {
      return sendError(res, 422, 'Datos inválidos para cliente.', errors);
    }

    if (normalized.name !== undefined) client.name = normalized.name;
    if (normalized.email !== undefined) client.email = normalized.email;

    await client.save();
    return sendSuccess(res, client);
  },

  async remove(req, res) {
    // req.params.id indica qué cliente eliminar.
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return sendError(res, 404, 'Cliente no encontrado');
    }

    await client.destroy();
    return res.status(204).end();
  }
};

// module.exports devuelve el objeto clientsController.
// El router lo importa para registrar sus métodos como handlers.
module.exports = clientsController;
