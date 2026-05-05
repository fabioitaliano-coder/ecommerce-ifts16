// require(...) significa "traer" o "importar" código de otro módulo.
// const guarda ese módulo en una variable para poder usarlo después.
//
// Si la ruta NO tiene ./ o ../, Node busca un paquete instalado.
// Ejemplo: 'express' sale de node_modules.
const express = require('express');

// Si la ruta tiene ./ o ../, Node busca un archivo de nuestro proyecto.
// ./ significa "desde la carpeta actual".
//
// Estos routers contienen las rutas de cada recurso.
const productsRouter = require('./src/routes/products');
const clientsRouter = require('./src/routes/clients');
const discountsRouter = require('./src/routes/discounts');
const checkoutRouter = require('./src/routes/checkout');

const app = express();

// PASO 1:
// Express prepara la app para poder leer JSON enviado por el cliente.
// Esto será útil en POST y PUT.
app.use(express.json());

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
app.use('/api/clientes', clientsRouter);
app.use('/api/descuentos', discountsRouter);
app.use('/api/checkout', checkoutRouter);

// Ruta auxiliar para mostrar qué recursos existen en la API.
app.get('/api', (req, res) => {
  res.json({
    ok: true,
    recursos: ['/api/productos', '/api/clientes', '/api/descuentos', '/api/checkout']
  });
});

const PORT = process.env.PORT || 3080;

// PASO 4:
// El servidor queda "escuchando" pedidos HTTP en este puerto.
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
