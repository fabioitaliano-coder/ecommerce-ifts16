// Traemos dos modelos desde src/models/index.js:
// - Product: para operar sobre la tabla products
// - Category: para validar y cargar la categoría relacionada
const { Product, Category } = require('../models');

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
    const products = await Product.findAll({
      include: [{ model: Category, as: 'category' }],
      order: [['id', 'ASC']]
    });

    return res.json(products);
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
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.json(product);
  },

  async create(req, res) {
    // req.body llega desde express.json().
    // Ese middleware toma el JSON enviado por el cliente y lo convierte
    // en un objeto JavaScript disponible acá.
    // req.body trae los datos enviados por el cliente en formato JSON.
    const { name, price, stock, photoURL,categoryId } = req.body;

    // Verificamos primero que exista la categoría elegida.
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
    // req.params.id indica qué producto modificar.
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
    // req.params.id vuelve a salir del segmento dinámico "/:id" de la ruta.
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
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
