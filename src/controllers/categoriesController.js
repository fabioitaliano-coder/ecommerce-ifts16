// Category y Product vienen de src/models/index.js.
// Category resuelve el CRUD de categorías.
// Product se usa para incluir productos relacionados o contar dependencias.
const { Category, Product } = require('../models');
const { Op } = require('sequelize');
const { parsePagination, buildPaginationMeta, sendCsv } = require('../utils/pagination');
const { sendSuccess, sendPaginated, sendError } = require('../utils/apiResponse');
const { validateCategoryPayload } = require('../utils/validation');

const categoriesController = {
  async getAll(req, res) {
    // req llega desde Express aunque en esta acción no necesitemos leerlo.
    // res se usa para responder la lista final en formato JSON.
    const wantsCsv = req.query.format === 'csv';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const filterName = typeof req.query.filterName === 'string' ? req.query.filterName.trim() : '';
    const sortBy = ['id', 'name', 'description'].includes(req.query.sortBy)
      ? req.query.sortBy
      : 'id';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';
    const where = {};

    if (search) {
      where.name = {
        [Op.like]: `%${search}%`
      };
    }

    if (filterName) {
      where.name = {
        [Op.like]: `%${filterName}%`
      };
    }

    if (wantsCsv) {
      // Exportacion:
      // - buscamos todo
      // - aplanamos la informacion asociada
      // - devolvemos CSV, que luego puede abrirse en Excel
      const categories = await Category.findAll({
        where,
        include: [{ model: Product, as: 'products' }],
        order: [[sortBy, sortOrder]]
      });

      return sendCsv(
        res,
        'categorias.csv',
        ['id', 'name', 'description', 'productsCount'],
        categories.map(category => [
          category.id,
          category.name,
          category.description || '',
          category.products?.length || 0
        ])
      );
    }

    // Buenas practicas:
    // este listado siempre pagina.
    // Asi evitamos enviar toda la tabla de una sola vez.
    const { page, limit, offset } = parsePagination(req.query, 10, 50);

    const result = await Category.findAndCountAll({
      where,
      include: [{ model: Product, as: 'products' }],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      distinct: true
    });

    return sendPaginated(res, result.rows, buildPaginationMeta(page, limit, result.count));
  },

  async getById(req, res) {
    // req.params.id sale de la URL /api/categorias/:id.
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product, as: 'products' }]
    });

    if (!category) {
      return sendError(res, 404, 'Categoría no encontrada');
    }

    return sendSuccess(res, category);
  },

  async create(req, res) {
    // name y description salen del cuerpo JSON enviado por el cliente.
    const { errors, normalized } = validateCategoryPayload(req.body);

    if (errors.length > 0) {
      return sendError(res, 422, 'Datos inválidos para categoría.', errors);
    }

    const category = await Category.create(normalized);
    return sendSuccess(res, category, 201);
  },

  async update(req, res) {
    // req.params.id señala qué categoría editar.
    // req.body trae los nuevos valores a aplicar.
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return sendError(res, 404, 'Categoría no encontrada');
    }

    const { errors, normalized } = validateCategoryPayload(req.body, { partial: true });

    if (errors.length > 0) {
      return sendError(res, 422, 'Datos inválidos para categoría.', errors);
    }

    if (normalized.name !== undefined) category.name = normalized.name;
    if (normalized.description !== undefined) category.description = normalized.description;

    await category.save();
    return sendSuccess(res, category);
  },

  async remove(req, res) {
    // Antes de borrar, revisamos si la categoría sigue siendo usada
    // por productos existentes para evitar inconsistencia lógica.
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return sendError(res, 404, 'Categoría no encontrada');
    }

    const productsCount = await Product.count({
      where: { categoryId: category.id }
    });

    if (productsCount > 0) {
      return sendError(res, 409, 'No se puede eliminar una categoría con productos asociados.');
    }

    await category.destroy();
    return res.status(204).end();
  }
};

// module.exports expone el controller completo.
// src/routes/categories.js lo recibe y conecta cada método con una ruta HTTP.
module.exports = categoriesController;
