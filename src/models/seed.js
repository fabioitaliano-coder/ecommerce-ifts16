// Seed pedagógico separado del index:
// este archivo concentra solo datos iniciales de prueba.
//
// Ventaja:
// - index.js queda enfocado en inicialización de Sequelize
// - el seed se puede mantener/evolucionar sin mezclar responsabilidades

async function seedDatabase({ Category, Product, Client, Discount, User }) {
  // Este módulo ya no depende de una sola tabla.
  // Cada bloque revisa su propia colección para que una migración nueva
  // pueda agregar datos faltantes aunque la base ya exista desde clases previas.
  const categoriesCount = await Category.count();
  if (categoriesCount === 0) {
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
  }

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
