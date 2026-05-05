// Este archivo funciona como una "base de datos falsa".
// Guarda la información en memoria mientras el servidor está encendido.
// Si reiniciamos Node, los datos vuelven al estado inicial.
//
// En el flujo de GET /api/productos, este es el último lugar
// donde el controller va a buscar la lista real de productos.

// Dejamos las colecciones hardcodeadas para que el ejemplo sea más simple
// y más parecido a lo que la mayoría ya viene trabajando.
const products = [
  { id: 1, name: 'Camisa', price: 25, stock: 10 },
  { id: 2, name: 'Pantalón', price: 40, stock: 5 }
];

const clients = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com' }
];

const discounts = [
  { id: 1, code: 'ALUMNO10', percent: 10, minTotal: 0 }
];

// nextIds guarda el próximo ID disponible para cada recurso.
// Debe ser mutable para poder usar store.nextIds.products++.
const nextIds = { products: 3, clients: 2, discounts: 2 };

module.exports = {
  products,
  clients,
  discounts,
  nextIds
};
