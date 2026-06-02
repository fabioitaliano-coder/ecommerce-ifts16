// Reutilizamos la conexión principal creada en src/config/database.js.
// Esta constante representa la puerta de entrada al motor de base.
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Category, Product, Client y Discount son modelos Sequelize.
// Cada uno representa una tabla concreta de la base.
const Category = require('./Category');
const Product = require('./Product');
const Client = require('./Client');
const Discount = require('./Discount');
const User = require('./User');
const { seedDatabase } = require('./seed');

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

async function ensureProductValidityColumns() {
  // Qué hace:
  // garantiza que existan las columnas validFrom y validTo en products.
  //
  // Por qué existe:
  // en bases creadas antes de agregar vigencia, esas columnas no están.
  // sync() crea tablas faltantes, pero no siempre resuelve este caso legado.
  //
  // Qué recibe:
  // no recibe parámetros; usa la conexión sequelize ya cargada en este módulo.
  //
  // Qué devuelve:
  // Promise<void>. Aplica cambios estructurales solo si faltan columnas.

  const queryInterface = sequelize.getQueryInterface();

  // describeTable devuelve el esquema actual de la tabla products.
  // Ejemplo: table.id, table.name, table.price, etc.
  const table = await queryInterface.describeTable('products');

  // Si validFrom no existe, se crea.
  // defaultValue se usa para que productos existentes no queden null
  // y sigan vigentes al migrar esta funcionalidad.
  if (!table.validFrom) {
    await queryInterface.addColumn('products', 'validFrom', {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: '2000-01-01'
    });
  }

  // Si validTo no existe, se crea.
  // Se usa una fecha de cierre lejana para no vencer productos viejos
  // automáticamente al actualizar el proyecto.
  if (!table.validTo) {
    await queryInterface.addColumn('products', 'validTo', {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: '2099-12-31'
    });
  }
}

async function initializeDatabase() {
  // PASO 3:
  // sync() compara modelos contra la base y crea tablas faltantes.
  await sequelize.sync();

  // PASO 4:
  // garantizamos vigencia en products para bases que vienen de clases previas.
  await ensureProductValidityColumns();

  // PASO 5:
  // cargamos seed inicial (si corresponde) desde módulo separado.
  await seedDatabase({ Category, Product, Client, Discount, User });
}

// module.exports devuelve un objeto con varias piezas del módulo:
// - sequelize: la conexión
// - Category, Product, Client, Discount: los modelos ya cargados
// - initializeDatabase: la función de arranque
module.exports = {
  sequelize,
  Category,
  Product,
  Client,
  Discount,
  User,
  initializeDatabase
};
