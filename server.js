// require(...) significa "traer" o "importar" código de otro módulo.
// const guarda ese módulo en una variable para poder usarlo después.
//
// Si la ruta NO tiene ./ o ../, Node busca un paquete instalado.
// Ejemplo: 'express' sale de node_modules.
const express = require('express');
const cors = require('cors');

// Si la ruta tiene ./ o ../, Node busca un archivo de nuestro proyecto.
// ./ significa "desde la carpeta actual".
//
// Estos routers contienen las rutas de cada recurso.
const productsRouter = require('./src/routes/products');
const clientsRouter = require('./src/routes/clients');
const discountsRouter = require('./src/routes/discounts');
const checkoutRouter = require('./src/routes/checkout');
const categoriesRouter = require('./src/routes/categories');
const authRouter = require('./src/routes/auth');

// initializeDatabase sale de src/models/index.js.
// Es la función que sincroniza tablas y ejecuta el seed inicial.
const { initializeDatabase } = require('./src/models');

// app es la aplicación principal de Express.
// Sobre esta constante registramos middlewares, rutas y manejo de errores.
const app = express();

// PASO 1:
// Express prepara la app para poder leer JSON enviado por el cliente.
// Esto será útil en POST y PUT.
app.use(express.json());

// CORS habilita comunicación entre orígenes distintos.
// En esta cursada sirve como base para una futura separación de frontend/backend.
app.use(cors());

// PASO 2:
// Esta línea sirve el frontend desde la carpeta public.
// Si el navegador entra a "/", Express responderá con public/index.html.
app.use(express.static('public'));

// PASO 3:
// Si llega una petición a /api/productos, server.js NO resuelve la lógica.
// Solamente la deriva al router de productos.
// Archivo siguiente para mirar en clase:
// ./src/routes/products.js
app.use('/api/productos', productsRouter);
app.use('/api/categorias', categoriesRouter);
app.use('/api/clientes', clientsRouter);
app.use('/api/descuentos', discountsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/auth', authRouter);

// Ruta auxiliar para mostrar qué recursos existen en la API.
app.get('/api', (req, res) => {
  // req y res los crea Express.
  // En esta ruta no necesitamos leer req, pero sí usamos res para devolver
  // un mapa simple de recursos disponibles.
  res.json({
    ok: true,
    recursos: ['/api/productos', '/api/categorias', '/api/clientes', '/api/descuentos', '/api/checkout', '/api/auth/login']
  });
});

// Middleware final de errores:
// cualquier excepción que venga desde una ruta termina acá.
app.use((error, req, res, next) => {
  // error llega desde next(error) o desde asyncHandler.
  // req y res son los objetos estándar de Express para esa petición.
  // next existe por contrato de middleware, aunque acá no lo usemos.
  console.error(error);

  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Datos invalidos',
      detail: error.errors.map(item => item.message)
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'El valor ya existe y debe ser unico',
      detail: error.errors.map(item => item.message)
    });
  }

  return res.status(500).json({
    error: 'Ocurrio un error interno',
    detail: error.message
  });
});

// Puerto por defecto para la cursada:
// si no hay variable de entorno PORT, Express levanta en 3000.
// Si un alumno ya tiene ocupado ese puerto, puede ejecutar:
// PORT=3001 npm start (Linux/Mac) o $env:PORT=3001; npm start (PowerShell).
const PORT = process.env.PORT || 3000;

// PASO 4:
// Antes de aceptar peticiones, sincronizamos la base.
// Recién después dejamos el servidor escuchando.
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(error => {
    console.error('No se pudo inicializar la base de datos:', error);
    process.exit(1);
  });

// Este archivo no usa module.exports porque es el punto de arranque.
// Se ejecuta directamente con node server.js y su trabajo es iniciar la app.
