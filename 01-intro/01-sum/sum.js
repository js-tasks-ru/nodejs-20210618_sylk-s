function sum(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Invalid arguments passed');
  }
  return a + b;
}

module.exports = sum;
