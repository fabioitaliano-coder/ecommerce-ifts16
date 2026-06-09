function isBlank(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidDateOnly(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function validateProductPayload(payload, { partial = false } = {}) {
  const errors = [];
  const normalized = {
    name: normalizeText(payload.name),
    price: payload.price,
    stock: payload.stock,
    categoryId: payload.categoryId,
    validFrom: payload.validFrom,
    validTo: payload.validTo
  };

  if (!partial || normalized.name !== undefined) {
    if (isBlank(normalized.name)) errors.push('El nombre del producto es obligatorio.');
  }

  if (!partial || normalized.price !== undefined) {
    if (!Number.isFinite(Number(normalized.price)) || Number(normalized.price) < 0) {
      errors.push('El precio debe ser un número mayor o igual a 0.');
    } else {
      normalized.price = Number(normalized.price);
    }
  }

  if (!partial || normalized.stock !== undefined) {
    if (!Number.isInteger(Number(normalized.stock)) || Number(normalized.stock) < 0) {
      errors.push('El stock debe ser un entero mayor o igual a 0.');
    } else {
      normalized.stock = Number(normalized.stock);
    }
  }

  if (!partial || normalized.categoryId !== undefined) {
    if (!Number.isInteger(Number(normalized.categoryId)) || Number(normalized.categoryId) <= 0) {
      errors.push('La categoría debe ser un entero válido.');
    } else {
      normalized.categoryId = Number(normalized.categoryId);
    }
  }

  if (!partial || normalized.validFrom !== undefined) {
    if (!isValidDateOnly(normalized.validFrom)) {
      errors.push('La fecha válido desde debe tener formato YYYY-MM-DD.');
    }
  }

  if (!partial || normalized.validTo !== undefined) {
    if (!isValidDateOnly(normalized.validTo)) {
      errors.push('La fecha válido hasta debe tener formato YYYY-MM-DD.');
    }
  }

  if (normalized.validFrom && normalized.validTo && normalized.validFrom > normalized.validTo) {
    errors.push('La fecha válido desde no puede ser mayor que válido hasta.');
  }

  return { errors, normalized };
}

function validateCategoryPayload(payload, { partial = false } = {}) {
  const errors = [];
  const normalized = {
    name: normalizeText(payload.name),
    description: normalizeText(payload.description)
  };

  if (!partial || normalized.name !== undefined) {
    if (isBlank(normalized.name)) errors.push('El nombre de la categoría es obligatorio.');
  }

  return { errors, normalized };
}

function validateClientPayload(payload, { partial = false } = {}) {
  const errors = [];
  const normalized = {
    name: normalizeText(payload.name),
    email: normalizeText(payload.email)
  };

  if (!partial || normalized.name !== undefined) {
    if (isBlank(normalized.name)) errors.push('El nombre del cliente es obligatorio.');
  }

  if (!partial || normalized.email !== undefined) {
    if (!isValidEmail(normalized.email)) errors.push('El email del cliente no es válido.');
  }

  return { errors, normalized };
}

function validateDiscountPayload(payload, { partial = false } = {}) {
  const errors = [];
  const normalized = {
    code: normalizeText(payload.code),
    percent: payload.percent,
    minTotal: payload.minTotal
  };

  if (!partial || normalized.code !== undefined) {
    if (isBlank(normalized.code)) errors.push('El código del descuento es obligatorio.');
  }

  if (!partial || normalized.percent !== undefined) {
    if (!Number.isFinite(Number(normalized.percent)) || Number(normalized.percent) < 0 || Number(normalized.percent) > 100) {
      errors.push('El porcentaje debe estar entre 0 y 100.');
    } else {
      normalized.percent = Number(normalized.percent);
    }
  }

  if (!partial || normalized.minTotal !== undefined) {
    if (!Number.isFinite(Number(normalized.minTotal)) || Number(normalized.minTotal) < 0) {
      errors.push('El mínimo debe ser un número mayor o igual a 0.');
    } else {
      normalized.minTotal = Number(normalized.minTotal);
    }
  }

  return { errors, normalized };
}

module.exports = {
  validateProductPayload,
  validateCategoryPayload,
  validateClientPayload,
  validateDiscountPayload
};
