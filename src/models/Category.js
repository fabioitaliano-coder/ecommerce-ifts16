// DataTypes aporta los tipos de columnas disponibles en Sequelize.
const { DataTypes } = require('sequelize');

// sequelize es la instancia de conexión creada una sola vez.
const sequelize = require('../config/database');

// Este archivo define la tabla "categories".
// En Sequelize, model = representación de una tabla.
//
// Referencia:
// https://sequelize.org/docs/v6/core-concepts/model-basics/
const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'categories'
  }
);

// module.exports expone el modelo Category para que otras capas lo reutilicen.
// Por ejemplo, src/models/index.js lo usa para declarar asociaciones.
module.exports = Category;
