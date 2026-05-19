// DataTypes indica cómo se tipa cada columna de la tabla clients.
const { DataTypes } = require('sequelize');

// sequelize conecta este modelo con la base configurada para la app.
const sequelize = require('../config/database');

// Client representa la tabla clients.
// Cada fila de esa tabla podrá mapearse a una instancia del modelo.
const Client = sequelize.define(
  'Client',
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    }
  },
  {
    tableName: 'clients'
  }
);

// module.exports devuelve el modelo Client.
// Los controladores lo importan para crear, listar, actualizar y borrar clientes.
module.exports = Client;
