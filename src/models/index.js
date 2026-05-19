// Reutilizamos la conexión principal creada en src/config/database.js.
// Esta constante representa la puerta de entrada al motor de base.
const sequelize = require('../config/database');

// Category, Product, Client y Discount son modelos Sequelize.
// Cada uno representa una tabla concreta de la base.
const Category = require('./Category');
const Product = require('./Product');
const Client = require('./Client');
const Discount = require('./Discount');

// PASO 2:
// Definimos la relación 1 a muchos.
// Una categoría puede tener muchos productos.
// Un producto pertenece a una categoría.
//
// Referencia:
// https://sequelize.org/docs/v6/core-concepts/assocs/
Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products'
});

Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

async function seedDatabase() {
  // Este seed se ejecuta solo si la tabla de categorías está vacía.
  // Sirve para que la app siga siendo fácil de probar apenas arranca.
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
    { name: 'Camisa', price: 25, stock: 10, categoryId: ropa.id },
    { name: 'Pantalon', price: 40, stock: 5, categoryId: ropa.id },
    { name: 'Cinturon', price: 15, stock: 8, categoryId: accesorios.id }
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

async function initializeDatabase() {
  // PASO 3:
  // sync() compara los modelos con la base y crea las tablas faltantes.
  // No borra datos porque usamos force: false.
  //
  // Referencia:
  // https://sequelize.org/docs/v6/core-concepts/model-basics/#model-synchronization
  await sequelize.sync();
  await seedDatabase();
}

// module.exports devuelve un objeto con varias piezas del módulo:
// - sequelize: la conexión
// - Category, Product, Client, Discount: los modelos ya cargados
// - initializeDatabase: la función de arranque
//
// Otros archivos pueden pedir solo una parte usando destructuring:
// const { Product, Category } = require('../models');
module.exports = {
  sequelize,
  Category,
  Product,
  Client,
  Discount,
  initializeDatabase
};
