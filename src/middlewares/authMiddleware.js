const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');

// authenticateToken valida identidad:
// - lee el header Authorization
// - extrae el token Bearer
// - verifica firma y expiración
// - inyecta req.user si todo salió bien
//
// Por qué este es el "primer middleware" importante de seguridad:
// porque se ejecuta ANTES del controller real.
//
// Flujo mental:
// 1. llega la petición HTTP
// 2. pasa por authenticateToken
// 3. si no hay token válido, la petición muere acá
// 4. si el token es correcto, recién ahí sigue al próximo paso
//
// Ventaja:
// el controller de negocio no tiene que repetir en cada archivo
// "verificá token, verificá token, verificá token...".
// Se centraliza la validación en una sola función reutilizable.
function authenticateToken(req, res, next) {
  // req.headers contiene las cabeceras HTTP enviadas por el cliente.
  // authorization suele venir con este formato:
  // "Bearer TOKEN_LARGO_AQUI"
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return sendError(res, 401, 'Acceso denegado. Token no provisto.');
  }

  try {
    // jwt.verify(...) hace el camino inverso de jwt.sign(...):
    // - recibe el token enviado por el cliente
    // - comprueba si fue firmado con la misma clave secreta
    // - verifica además si expiró
    //
    // Si todo está bien, devuelve el payload decodificado.
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);

    // req.user no existe por defecto en Express.
    // Lo creamos nosotros para "pasar" la identidad del usuario
    // al resto de la cadena (otros middlewares o el controller).
    req.user = decodedUser;

    // next() significa:
    // "esta parte salió bien, seguí con la próxima función del pipeline".
    return next();
  } catch (error) {
    return sendError(res, 403, 'Token inválido o expirado.');
  }
}

// isAdmin valida privilegios.
// Requiere que authenticateToken haya corrido antes y haya dejado req.user.
//
// Idea clave:
// authenticateToken responde "quién sos".
// isAdmin responde "qué te dejo hacer".
function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 403, 'Acceso restringido. Se requieren permisos de administrador.');
  }

  return next();
}

// module.exports devuelve ambas funciones middleware.
module.exports = { authenticateToken, isAdmin };
