// jsonwebtoken firma y verifica JWT.
// "Firmar" significa crear un token cuyo contenido no está cifrado,
// pero sí protegido contra modificaciones gracias a una clave secreta.
const jwt = require('jsonwebtoken');

// User es el modelo que representa a los usuarios autenticables.
const { User } = require('../models');

const authController = {
  async login(req, res) {
    // req.body llega desde el JSON enviado por el formulario de login.
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    // comparePassword delega la comparación a bcrypt.
    const passwordOk = await user.comparePassword(password);

    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    // El payload contiene solo información pública y útil para autorización.
    // Payload = datos que viajan dentro del token.
    // No conviene guardar secretos ahí porque JWT no cifra por defecto.
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // jwt.sign(...) toma:
    // 1. el payload
    // 2. la clave secreta
    // 3. opciones como expiración
    //
    // Qué devuelve:
    // un string largo que el frontend luego guarda y reenvía.
    //
    // Por qué se usa:
    // para que el servidor no necesite guardar una sesión en memoria.
    // El cliente lleva el token y el backend verifica su firma en cada pedido.
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '2h'
    });

    return res.json({
      success: true,
      token,
      user: payload
    });
  },

  async me(req, res) {
    // req.user lo inyecta authenticateToken si el JWT fue válido.
    //
    // Qué significa eso:
    // el middleware corrió ANTES que este controller y dejó listo en req.user
    // el contenido decodificado del token.
    //
    // Entonces este endpoint no necesita volver a verificar el JWT:
    // solo aprovecha el resultado que dejó el middleware.
    return res.json({
      authenticated: true,
      user: req.user
    });
  }
};

// module.exports expone el controller para que el router auth lo conecte.
module.exports = authController;
