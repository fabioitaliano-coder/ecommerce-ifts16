// Seed pedagógico separado del index:
// este archivo concentra solo datos iniciales de prueba.
//
// Ventaja:
// - index.js queda enfocado en inicialización de Sequelize
// - el seed se puede mantener/evolucionar sin mezclar responsabilidades

async function seedDatabase({ Category, Product, Client, Discount }) {
  // Este seed se ejecuta solo si categories está vacía.
  // Así evitamos duplicar datos en cada arranque.
  const categoriesCount = await Category.count();
  if (categoriesCount > 0) {
    return;
  }

  const ropa = await Category.create({
    name: 'Ropa',
    description: 'Indumentaria de ejemplo para la clase'
  });

  const accesorios = await Category.create({
    name: 'Accesorios',
    description: 'Complementos y accesorios'
  });

  await Product.bulkCreate([
    { name: 'Camisa', price: 25, stock: 10, categoryId: ropa.id, validFrom: '2024-01-01', validTo: '2099-12-31' },
    { name: 'Pantalon', price: 40, stock: 5, categoryId: ropa.id, validFrom: '2024-01-01', validTo: '2099-12-31' },
    { name: 'Cinturon', price: 15, stock: 8, categoryId: accesorios.id, validFrom: '2024-01-01', validTo: '2099-12-31' }
  ]);

  await Client.create({
    name: 'Juan Perez',
    email: 'juan@example.com'
  });

  await Discount.create({
    code: 'ALUMNO10',
    percent: 10,
    minTotal: 0
  });
}

module.exports = { seedDatabase };
