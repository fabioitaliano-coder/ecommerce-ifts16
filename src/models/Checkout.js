// Traemos varias piezas exportadas por ./index:
// - sequelize: para abrir transacciones
// - Product: para validar stock y precio
// - Discount: para buscar descuentos por código
const { sequelize, Product, Discount } = require('./index');

// items llega desde el controller de checkout.
// Es un array de objetos enviado por el cliente en req.body.items.
// Cada item debería tener al menos productId y quantity.
async function calculateCartTotal(items) {
  let total = 0;

  for (const item of items) {
    // Buscamos cada producto en la base real, no en memoria.
    const product = await Product.findByPk(item.productId);

    if (!product) {
      throw new Error(`Producto ${item.productId} no encontrado`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Stock insuficiente para producto ${product.id}`);
    }

    total += product.price * item.quantity;
  }

  return total;
}

// total llega ya calculado por calculateCartTotal().
// code llega desde req.body.discountCode y puede venir vacío.
async function applyDiscount(total, code) {
  if (!code) {
    return { total, discount: 0, appliedCode: null };
  }

  const discount = await Discount.findOne({ where: { code } });

  if (!discount || total < discount.minTotal) {
    return { total, discount: 0, appliedCode: null };
  }

  const discountAmount = (total * discount.percent) / 100;

  return {
    total: +(total - discountAmount).toFixed(2),
    discount: +discountAmount.toFixed(2),
    appliedCode: discount.code
  };
}

// items vuelve a ser el array del carrito enviado por el cliente.
// Lo recorremos dentro de una transacción para que todos los cambios
// de stock se confirmen juntos o se reviertan juntos.
async function commitPurchase(items) {
  // PASO 4:
  // Usamos una transacción para que el descuento de stock sea atómico.
  // Si algo falla a mitad de camino, Sequelize revierte todo.
  //
  // Referencia:
  // https://sequelize.org/docs/v6/other-topics/transactions/
  return sequelize.transaction(async transaction => {
    // transaction es un objeto que Sequelize entrega automáticamente.
    // Se inyecta como parámetro del callback y representa la operación atómica.
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });

      if (!product) {
        throw new Error(`Producto ${item.productId} no encontrado`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para producto ${product.id}`);
      }

      product.stock -= item.quantity;
      await product.save({ transaction });
    }
  });
}

// module.exports devuelve un objeto con funciones de negocio reutilizables.
// checkoutController las importa con destructuring para ejecutar el flujo
// de cálculo, descuento y descuento de stock.
module.exports = { calculateCartTotal, applyDiscount, commitPurchase };
