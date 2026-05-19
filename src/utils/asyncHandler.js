// Express 4 no captura automáticamente todos los errores de funciones async.
// Este wrapper centraliza ese trabajo para no repetir try/catch en cada ruta.
//
// Referencia:
// https://expressjs.com/en/guide/error-handling.html

// handler es la función async original del controller.
// wrappedHandler es la nueva función que sí entregaremos a Express.
// req, res y next los inyecta Express cada vez que entra una petición.
function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

// module.exports devuelve la función asyncHandler.
// Los routers la usan para envolver cada controller async.
module.exports = asyncHandler;
