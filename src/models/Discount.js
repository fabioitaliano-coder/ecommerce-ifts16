class Discount {
  constructor({ id, code, percent, minTotal = 0 }) {
    this.id = id;
    this.code = code;
    this.percent = percent; // e.g., 10 means 10%
    this.minTotal = minTotal;
  }

  appliesTo(total) {
    return total >= this.minTotal;
  }
}

module.exports = { Discount };
