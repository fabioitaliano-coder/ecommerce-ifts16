// DataTypes sirve para declarar el tipo de cada atributo del descuento.
const { DataTypes } = require('sequelize');

// sequelize es la conexión base que comparte toda la aplicación.
const sequelize = require('../config/database');

// Discount representa la tabla discounts.
// Sus validaciones viven cerca de la definición de la tabla.
const Discount = sequelize.define(
  'Discount',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    percent: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    minTotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  },
  {
    tableName: 'discounts'
  }
);

// module.exports publica el modelo Discount.
// Checkout y el controller de descuentos lo usan para consultar promociones.
module.exports = Discount;
