const store = require('../data/store');

function calculateCartTotal(items) {
  let total = 0;
  for (const it of items) {
    const product = store.products.find(p => p.id === it.productId);
    if (!product) throw new Error(`Producto ${it.productId} no encontrado`);
    if (product.stock < it.quantity) throw new Error(`Stock insuficiente para producto ${product.id}`);
    total += product.price * it.quantity;
  }
  return total;
}

function applyDiscount(total, code) {
  if (!code) return { total, discount: 0, appliedCode: null };
  const disc = store.discounts.find(d => d.code === code);
  if (!disc) return { total, discount: 0, appliedCode: null };
  if (!disc.appliesTo(total)) return { total, discount: 0, appliedCode: null };
  const discountAmount = (total * disc.percent) / 100;
  return { total: +(total - discountAmount).toFixed(2), discount: +discountAmount.toFixed(2), appliedCode: disc.code };
}

function commitPurchase(items) {
  // reduce stock
  for (const it of items) {
    const product = store.products.find(p => p.id === it.productId);
    product.stock -= it.quantity;
  }
}

module.exports = { calculateCartTotal, applyDiscount, commitPurchase };
