// DataTypes define los tipos de columnas que Sequelize sabe traducir a la base.
const { DataTypes } = require('sequelize');

// bcryptjs se usa para hashear contraseñas antes de guardarlas.
// Nunca conviene persistir passwords en texto plano.
const bcrypt = require('bcryptjs');

// Reutilizamos la conexión central de Sequelize.
const sequelize = require('../config/database');

// User representa la tabla users.
// En esta clase trabajamos con un campo role simple para no introducir
// todavía una tabla Roles separada.
const User = sequelize.define(
  'User',
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
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'client',
      validate: {
        isIn: [['admin', 'client']]
      }
    }
  },
  {
    tableName: 'users',
    hooks: {
      // Qué es un hook:
      // un hook de Sequelize es una función que corre automáticamente
      // antes o después de ciertos eventos del modelo.
      //
      // En este caso lo usamos para no depender de que el controller
      // recuerde hashear la password manualmente cada vez.
      //
      // Ventaja pedagógica:
      // la regla de seguridad queda pegada al modelo User, no dispersa
      // por varios archivos.
      //
      // Idea mental:
      // "cada vez que se cree un usuario, antes de grabarlo, corré esto".
      // beforeCreate corre justo antes de insertar un usuario nuevo.
      // Recibe la instancia user y nos deja transformar su password.
      async beforeCreate(user) {
        user.password = await bcrypt.hash(user.password, 10);
      },

      // beforeUpdate se ejecuta cuando un usuario cambia.
      // Solo rehasheamos si la password realmente fue modificada.
      //
      // changed('password') pregunta si ese campo fue alterado.
      // Si el alumno modifica solo el nombre o el email, no tiene sentido
      // volver a hashear una contraseña que no cambió.
      async beforeUpdate(user) {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  }
);

// Este método de instancia encapsula la comparación segura de contraseñas.
// Qué recibe:
// - plainPassword: la contraseña en texto plano enviada por el usuario al loguearse.
//
// Qué devuelve:
// - Promise<boolean>: true si coincide con el hash guardado, false si no.
//
// Por qué usamos User.prototype:
// - User es el modelo general, o sea, el "molde" de los usuarios.
// - User.prototype es el lugar donde se agregan métodos compartidos por
//   todas las instancias concretas creadas a partir de ese modelo.
// - Gracias a esto, cuando Sequelize devuelve un usuario real desde la base,
//   ese objeto puede hacer user.comparePassword(...).
//
// Ejemplo mental:
// - User = la clase/molde
// - user = un usuario concreto traído con findOne o findByPk
//
// Entonces después podemos escribir:
// const user = await User.findOne({ where: { email } });
// const passwordOk = await user.comparePassword(passwordIngresada);
//
// Dentro de este método, "this" apunta a ese usuario concreto.
// Por eso this.password representa el hash guardado en esa fila de la base.
User.prototype.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// module.exports devuelve el modelo User.
// Otras capas lo usarán para login, seed y validación de roles.
module.exports = User;
