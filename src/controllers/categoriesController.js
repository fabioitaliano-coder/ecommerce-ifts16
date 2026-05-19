// Category y Product vienen de src/models/index.js.
// Category resuelve el CRUD de categorías.
// Product se usa para incluir productos relacionados o contar dependencias.
const { Category, Product } = require('../models');

const categoriesController = {
  async getAll(req, res) {
    // req llega desde Express aunque en esta acción no necesitemos leerlo.
    // res se usa para responder la lista final en formato JSON.
    const categories = await Category.findAll({
      include: [{ model: Product, as: 'products' }],
      order: [['id', 'ASC']]
    });

    return res.json(categories);
  },

  async getById(req, res) {
    // req.params.id sale de la URL /api/categorias/:id.
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product, as: 'products' }]
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoria no encontrada' });
    }

    return res.json(category);
  },

  async create(req, res) {
    // name y description salen del cuerpo JSON enviado por el cliente.
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    return res.status(201).json(category);
  },

  async update(req, res) {
    // req.params.id señala qué categoría editar.
    // req.body trae los nuevos valores a aplicar.
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Categoria no encontrada' });
    }

    const { name, description } = req.body;
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;

    await category.save();
    return res.json(category);
  },

  async remove(req, res) {
    // Antes de borrar, revisamos si la categoría sigue siendo usada
    // por productos existentes para evitar inconsistencia lógica.
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Categoria no encontrada' });
    }

    const productsCount = await Product.count({
      where: { categoryId: category.id }
    });

    if (productsCount > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar una categoria con productos asociados'
      });
    }

    await category.destroy();
    return res.status(204).end();
  }
};

// module.exports expone el controller completo.
// src/routes/categories.js lo recibe y conecta cada método con una ruta HTTP.
module.exports = categoriesController;
