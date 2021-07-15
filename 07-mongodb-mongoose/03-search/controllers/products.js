const Product = require('../models/Product');

module.exports.productsByQuery = async function productsByQuery(ctx, next) {
  try {
    const products = (await Product.find({$text: {$search: ctx.query.query}}))
        .map((product) => product.toDTO());
    ctx.body = {products};
  } catch (e) {
    if (e.codeName !== 'TypeMismatch') throw e;

    ctx.status = 400;
    ctx.body = {error: 'Query is required'};
  }
};
