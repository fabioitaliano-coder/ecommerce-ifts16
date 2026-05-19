// path es un módulo nativo de Node.
// Se usa para construir rutas de archivos de forma segura y portable.
// Acá nos sirve para armar la ruta hacia database.sqlite.
const path = require('path');

// Sequelize es la clase principal del ORM.
// Desde esta clase creamos la conexión a la base de datos.
const { Sequelize } = require('sequelize');

// dotenv lee el archivo .env y copia sus valores dentro de process.env.
// No guardamos el resultado en una constante porque acá solo nos interesa
// ejecutar su efecto secundario: cargar variables de entorno.
require('dotenv').config();

// PASO 1:
// Creamos la conexión principal de Sequelize.
// Usamos SQLite porque guarda todo en un archivo local y no exige instalar
// un servidor aparte como MySQL o PostgreSQL.
// Los datos de conexión salen del archivo .env para no hardcodearlos.
//
// Referencia oficial:
// https://sequelize.org/docs/v6/getting-started/
// https://www.npmjs.com/package/dotenv
// dialect guarda el motor de base configurado en .env.
// Ejemplo: sqlite, mysql, postgres o mssql.
const dialect = process.env.DB_DIALECT || 'sqlite';

// storage guarda la ruta del archivo SQLite.
// Si DB_STORAGE no existe en .env, usamos una ruta por defecto del proyecto.
const storage = process.env.DB_STORAGE || path.join(__dirname, '..', '..', 'database.sqlite');

// loggingEnabled transforma el texto de .env en un booleano real.
// process.env siempre entrega strings, por eso comparamos con 'true'.
const loggingEnabled = process.env.DB_LOGGING === 'true';

// sequelize es la instancia de conexión compartida por toda la app.
// Los modelos la van a reutilizar para definir tablas y ejecutar consultas.
const sequelize = new Sequelize({
  dialect,
  storage,
  logging: loggingEnabled
});

// module.exports publica esta instancia para que otros archivos puedan hacer:
// const sequelize = require('../config/database');
// Lo que "devuelve" este módulo es exactamente la conexión configurada.
module.exports = sequelize;
