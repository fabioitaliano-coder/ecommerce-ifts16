// Traemos dos modelos desde src/models/index.js:
// - Product: para operar sobre la tabla products
// - Category: para validar y cargar la categorÃ­a relacionada
const { Product, Category } = require('../models');
const { Op } = require('sequelize');

// Este archivo cumple el rol de CONTROLLER.
// En MVC, el controller es el "cocinero":
// recibe el pedido desde el router, hace la lÃ³gica necesaria
// y devuelve la respuesta al cliente.

const productsController = {
  async getAll(req, res) {
    // req es el objeto Request que Express crea por cada peticiÃ³n.
    // AcÃ¡ no usamos datos de req, pero igualmente Express lo envÃ­a.
    // res es el objeto Response que usamos para devolver JSON.
    // RECORRIDO COMPLETO DE GET /api/productos:
    // 1. server.js recibe la peticiÃ³n y la manda al router.
    // 2. src/routes/products.js llama a controller.getAll.
    // 3. El controller busca los datos usando Sequelize.
    // 4. Finalmente responde con JSON.
    //
    // Archivo siguiente para mirar en clase:
    // ../models/index.js
    // Clase 9:
    // req.query trae los "query parameters" que vienen en la URL.
    // Ejemplo:
    // GET /api/productos?categoria=2
    // En ese caso, req.query.categoria vale "2".
    const { categoria } = req.query;

    // where arranca vacio para soportar los dos escenarios:
    // 1) sin filtro => trae todo
    // 2) con filtro => agrega condition por categoryId
    const where = {};
    const today = new Date().toISOString().slice(0, 10);

    // Clase 9/10:
    // "vigencia" actua como baja logica por fecha.
    // Si hoy queda fuera del rango, el producto no se elimina fisicamente
    // pero deja de aparecer en listados y consultas de catalogo.
    //
    // Regla:
    // - validFrom <= hoy
    // - validTo >= hoy
    //
    // Esto modela productos temporales (promos, temporadas, etc.)
    // sin perder historial en la base.
    where.validFrom = { [Op.lte]: today };
    where.validTo = { [Op.gte]: today };

    if (categoria !== undefined && categoria !== '') {
      // Number(...) convierte el valor de texto en numero.
      // Sequelize usara este where para filtrar en SQL por FK categoryId.
      where.categoryId = Number(categoria);
    }

    const products = await Product.findAll({
      // Si where queda vacio, findAll trae todos los productos.
      // Si where tiene categoryId, trae solo esa categoria.
      where,
      // include hace eager loading de la relacion Product -> Category.
      // Asi el frontend recibe tambien product.category.name.
      include: [{ model: Category, as: 'category' }],
      order: [['id', 'ASC']]
    });

    return res.json(products);
  },

  async getById(req, res) {
    // req.params.id llega desde la ruta "/:id" declarada en el router.
    // Express extrae ese fragmento dinÃ¡mico de la URL y lo guarda en params.
    // req.params guarda los parÃ¡metros que vienen desde la URL.
    // Si la URL es /api/productos/2, entonces req.params.id vale "2".
    const today = new Date().toISOString().slice(0, 10);
    const product = await Product.findOne({
      where: {
        id: req.params.id,
        validFrom: { [Op.lte]: today },
        validTo: { [Op.gte]: today }
      },
      include: [{ model: Category, as: 'category' }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.json(product);
  },

  async create(req, res) {
    // req.body llega desde express.json().
    // Ese middleware toma el JSON enviado por el cliente y lo convierte
    // en un objeto JavaScript disponible acÃ¡.
    // req.body trae los datos enviados por el cliente en formato JSON.
    const { name, price, stock, categoryId } = req.body;

    // Verificamos primero que exista la categorÃ­a elegida.
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ error: 'Categoria invalida' });
    }

    // create() inserta una fila en la tabla products.
    const product = await Product.create({ name, price, stock, categoryId });

    const createdProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }]
    });

    return res.status(201).json(createdProduct);
  },

  async update(req, res) {
    // req.params.id indica quÃ© producto modificar.
    // req.body trae solo los campos que el cliente desea cambiar.
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Solo actualizamos los campos que efectivamente llegaron.
    // Esto evita pisar datos por error.
    const { name, price, stock, categoryId } = req.body;
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (categoryId !== undefined) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ error: 'Categoria invalida' });
      }
      product.categoryId = categoryId;
    }

    await product.save();

    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }]
    });

    return res.json(updatedProduct);
  },

  async remove(req, res) {
    // req.params.id vuelve a salir del segmento dinÃ¡mico "/:id" de la ruta.
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // destroy() elimina el registro persistido en la base.
    await product.destroy();

    // 204 significa: "saliÃ³ bien, pero no tengo contenido para devolver".
    return res.status(204).end();
  }
};

// module.exports devuelve el objeto productsController completo.
// El router de productos lo importa y usa cada mÃ©todo como callback de ruta.
module.exports = productsController;

// Ejemplo pedagogico de la regla de vigencia:
// - hoy = 2026-05-26
// - Producto A: validFrom=2026-01-01, validTo=2026-12-31 -> se muestra
// - Producto B: validFrom=2025-01-01, validTo=2025-12-31 -> no se muestra (vencido)

