// Traemos dos modelos desde src/models/index.js:
// - Product: para operar sobre la tabla products
// - Category: para validar y cargar la categoría relacionada
const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const { parsePagination, buildPaginationMeta, sendCsv } = require('../utils/pagination');
const { sendSuccess, sendPaginated, sendError } = require('../utils/apiResponse');
const { validateProductPayload } = require('../utils/validation');

// Este archivo cumple el rol de CONTROLLER.
// En MVC, el controller es el "cocinero":
// recibe el pedido desde el router, hace la lógica necesaria
// y devuelve la respuesta al cliente.

const productsController = {
  async getAll(req, res) {
    // req es el objeto Request que Express crea por cada petición.
    // Acá no usamos datos de req, pero igualmente Express lo envía.
    // res es el objeto Response que usamos para devolver JSON.
    // RECORRIDO COMPLETO DE GET /api/productos:
    // 1. server.js recibe la petición y la manda al router.
    // 2. src/routes/products.js llama a controller.getAll.
    // 3. El controller busca los datos usando Sequelize.
    // 4. Finalmente responde con JSON.
    //
    // Archivo siguiente para mirar en clase:
    // ../models/index.js
    const categoryId = req.query.categoryId || req.query.categoria;
    const wantsCsv = req.query.format === 'csv';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const filterName = typeof req.query.filterName === 'string' ? req.query.filterName.trim() : '';
    const filterCategory = typeof req.query.filterCategory === 'string' ? req.query.filterCategory.trim() : '';
    const filterStock = typeof req.query.filterStock === 'string' ? req.query.filterStock.trim() : '';
    const sortBy = ['id', 'name', 'price', 'stock', 'validFrom', 'validTo'].includes(req.query.sortBy)
      ? req.query.sortBy
      : 'id';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';
    const where = {};
    const categoryWhere = {};

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

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

    if (filterStock) {
      const parsedStock = Number(filterStock);
      if (!Number.isNaN(parsedStock)) {
        where.stock = parsedStock;
      }
    }

    if (filterCategory) {
      categoryWhere.name = {
        [Op.like]: `%${filterCategory}%`
      };
    }

    if (wantsCsv) {
      // Paso a paso:
      // 1. consultamos los datos completos sin paginar
      // 2. los transformamos a filas planas
      // 3. devolvemos un CSV que Excel puede abrir sin problema
      const products = await Product.findAll({
        where,
        include: [{
          model: Category,
          as: 'category',
          ...(Object.keys(categoryWhere).length > 0 ? { where: categoryWhere } : {})
        }],
        order: [[sortBy, sortOrder]]
      });

      return sendCsv(
        res,
        'productos.csv',
        ['id', 'name', 'price', 'stock', 'category', 'validFrom', 'validTo'],
        products.map(product => [
          product.id,
          product.name,
          product.price,
          product.stock,
          product.category?.name || '',
          product.validFrom,
          product.validTo
        ])
      );
    }

    // Convencion API:
    // los listados ya no devuelven todos los registros de una sola vez.
    // Siempre responden con:
    // - items
    // - pagination
    //
    // page indica "que pagina quiero"
    // limit indica "cuantos registros por pagina"
    // offset calcula desde que fila empezar
    //
    // Ejemplo:
    // page = 2, limit = 5
    // offset = (2 - 1) * 5 = 5
    // Sequelize trae desde el sexto registro en adelante.
    const { page, limit, offset } = parsePagination(req.query, 8, 50);

    const result = await Product.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        ...(Object.keys(categoryWhere).length > 0 ? { where: categoryWhere } : {})
      }],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      distinct: true
    });

    return sendPaginated(res, result.rows, buildPaginationMeta(page, limit, result.count));
  },

  async getById(req, res) {
    // req.params.id llega desde la ruta "/:id" declarada en el router.
    // Express extrae ese fragmento dinámico de la URL y lo guarda en params.
    // req.params guarda los parámetros que vienen desde la URL.
    // Si la URL es /api/productos/2, entonces req.params.id vale "2".
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });

    if (!product) {
      return sendError(res, 404, 'Producto no encontrado');
    }

    return sendSuccess(res, product);
  },

  async create(req, res) {
    // req.body llega desde express.json().
    // Ese middleware toma el JSON enviado por el cliente y lo convierte
    // en un objeto JavaScript disponible acá.
    // req.body trae los datos enviados por el cliente en formato JSON.
    const payload = {
      ...req.body,
      validFrom: req.body.validFrom || '2000-01-01',
      validTo: req.body.validTo || '2099-12-31'
    };
    const { errors, normalized } = validateProductPayload(payload);

    if (errors.length > 0) {
      return sendError(res, 422, 'Datos inválidos para producto.', errors);
    }

    // Verificamos primero que exista la categoría elegida.
    const category = await Category.findByPk(normalized.categoryId);
    if (!category) {
      return sendError(res, 422, 'Categoría inválida.');
    }

    // create() inserta una fila en la tabla products.
    const product = await Product.create({
      ...normalized
    });

    const createdProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }]
    });

    return sendSuccess(res, createdProduct, 201);
  },

  async update(req, res) {
    // req.params.id indica qué producto modificar.
    // req.body trae solo los campos que el cliente desea cambiar.
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return sendError(res, 404, 'Producto no encontrado');
    }

    // Solo actualizamos los campos que efectivamente llegaron.
    // Esto evita pisar datos por error.
    const { errors, normalized } = validateProductPayload(req.body, { partial: true });

    if (errors.length > 0) {
      return sendError(res, 422, 'Datos inválidos para producto.', errors);
    }

    if (normalized.name !== undefined) product.name = normalized.name;
    if (normalized.price !== undefined) product.price = normalized.price;
    if (normalized.stock !== undefined) product.stock = normalized.stock;
    if (normalized.categoryId !== undefined) {
      const category = await Category.findByPk(normalized.categoryId);
      if (!category) {
        return sendError(res, 422, 'Categoría inválida.');
      }
      product.categoryId = normalized.categoryId;
    }
    if (normalized.validFrom !== undefined) product.validFrom = normalized.validFrom;
    if (normalized.validTo !== undefined) product.validTo = normalized.validTo;

    await product.save();

    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }]
    });

    return sendSuccess(res, updatedProduct);
  },

  async remove(req, res) {
    // req.params.id vuelve a salir del segmento dinámico "/:id" de la ruta.
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return sendError(res, 404, 'Producto no encontrado');
    }

    // destroy() elimina el registro persistido en la base.
    await product.destroy();

    // 204 significa: "salió bien, pero no tengo contenido para devolver".
    return res.status(204).end();
  }
};

// module.exports devuelve el objeto productsController completo.
// El router de productos lo importa y usa cada método como callback de ruta.
module.exports = productsController;
