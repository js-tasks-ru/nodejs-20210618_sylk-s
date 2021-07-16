const Product = require('../models/Product');

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  if (ctx.query.subcategory) {
    const products = (await Product.find({subcategory: ctx.query.subcategory}))
        .map((product) => product.toDTO());
    ctx.body = {products};
  } else {
    return next();
  }
};

module.exports.productList = async function productList(ctx, next) {
  const products = (await Product.find()).map((product) => product.toDTO());
  ctx.body = {products};
};

module.exports.productById = async function productById(ctx, next) {
  try {
    const product = await Product.findById(ctx.params.id);
    if (product) {
      ctx.body = {product: product.toDTO()};
    } else {
      ctx.body = {error: 'Not found'};
      ctx.status = 404;
    }
  } catch (e) {
    if (e.value !== 'invalid-id') throw e;

    ctx.body = {error: 'Id is invalid'};
    ctx.status = 400;
  }
};

