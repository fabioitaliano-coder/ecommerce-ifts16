// Seed pedagógico separado del index:
// este archivo concentra solo datos iniciales de prueba.
//
// Ventaja:
// - index.js queda enfocado en inicialización de Sequelize
// - el seed se puede mantener/evolucionar sin mezclar responsabilidades

async function ensureCategory(Category, payload) {
  const existingCategory = await Category.findOne({
    where: { name: payload.name }
  });

  if (existingCategory) {
    return existingCategory;
  }

  return Category.create(payload);
}

async function ensureProduct(Product, payload) {
  const existingProduct = await Product.findOne({
    where: { name: payload.name }
  });

  if (existingProduct) {
    return existingProduct;
  }

  return Product.create(payload);
}

async function seedDatabase({ Category, Product, Client, Discount, User }) {
  // Este módulo ya no depende de una sola tabla.
  // Cada bloque revisa su propia colección para que una migración nueva
  // pueda agregar datos faltantes aunque la base ya exista desde clases previas.
  const ropa = await ensureCategory(Category, {
    name: 'Ropa',
    description: 'Indumentaria de ejemplo para la clase'
  });

  const accesorios = await ensureCategory(Category, {
    name: 'Accesorios',
    description: 'Complementos y accesorios'
  });

  const calzado = await ensureCategory(Category, {
    name: 'Calzado',
    description: 'Zapatillas, botas y sandalias'
  });

  const tecnologia = await ensureCategory(Category, {
    name: 'Tecnologia',
    description: 'Accesorios y dispositivos'
  });

  const hogar = await ensureCategory(Category, {
    name: 'Hogar',
    description: 'Objetos útiles para la casa'
  });

  // En lugar de depender de "tabla vacía", aseguramos producto por producto.
  // Esto deja un seed más robusto para bases que ya tienen algunos datos
  // pero todavía no incorporaron todas las categorías o productos de la clase.
  await ensureProduct(Product, {
    name: 'Camisa',
    price: 25,
    stock: 10,
    categoryId: ropa.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Pantalon',
    price: 40,
    stock: 5,
    categoryId: ropa.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Campera',
    price: 65,
    stock: 6,
    categoryId: ropa.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Cinturon',
    price: 15,
    stock: 8,
    categoryId: accesorios.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Bufanda',
    price: 18.5,
    stock: 7,
    categoryId: accesorios.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Mochila urbana',
    price: 39.9,
    stock: 9,
    categoryId: accesorios.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Zapatilla urbana',
    price: 59.9,
    stock: 12,
    categoryId: calzado.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Bota de cuero',
    price: 89.5,
    stock: 4,
    categoryId: calzado.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Pantuflas',
    price: 14.9,
    stock: 15,
    categoryId: calzado.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Mouse Gamer',
    price: 89.9,
    stock: 12,
    categoryId: tecnologia.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Teclado mecanico',
    price: 120,
    stock: 7,
    categoryId: tecnologia.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Auriculares bluetooth',
    price: 74.5,
    stock: 11,
    categoryId: tecnologia.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Lampara de escritorio',
    price: 28,
    stock: 10,
    categoryId: hogar.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Almohadon decorativo',
    price: 22,
    stock: 13,
    categoryId: hogar.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  await ensureProduct(Product, {
    name: 'Set de tazas',
    price: 31.5,
    stock: 8,
    categoryId: hogar.id,
    validFrom: '2024-01-01',
    validTo: '2099-12-31'
  });

  if (await Client.count() === 0) {
    await Client.create({
      name: 'Juan Perez',
      email: 'juan@example.com'
    });
  }

  if (await Discount.count() === 0) {
    await Discount.create({
      code: 'ALUMNO10',
      percent: 10,
      minTotal: 0
    });
  }

  // Usuarios semilla para la clase 10:
  // uno administrador y uno cliente común.
  if (await User.count() === 0) {
    await User.bulkCreate([
      {
        name: 'Administrador Demo',
        email: 'admin@example.com',
        password: '123456',
        role: 'admin'
      },
      {
        name: 'Cliente Demo',
        email: 'cliente@example.com',
        password: '123456',
        role: 'client'
      }
    ], { individualHooks: true });
  }
}

module.exports = { seedDatabase };
