// DataTypes trae los tipos de datos que Sequelize entiende:
// STRING, INTEGER, FLOAT, etc.
const { DataTypes } = require('sequelize');

// sequelize es la conexión compartida.
// Sobre esta conexión declaramos el modelo Product.
const sequelize = require('../config/database');

// Este modelo ahora representa la tabla "products".
// categoryId funcionará como clave foránea hacia categories.id.
//
// Referencia:
// https://sequelize.org/docs/v6/core-concepts/assocs/
const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    validFrom: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: '2000-01-01'
    },
    validTo: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: '2099-12-31'
    }
  },
  {
    tableName: 'products'
  }
);

// module.exports devuelve el modelo Product.
// Otros archivos lo usan para consultar o modificar la tabla products.
// Ejemplo: Product.findAll(), Product.create(...), Product.findByPk(...).
module.exports = Product;
