const Order = require('../models/Order');
const Product = require('../models/Product');
const sendMail = require('../libs/sendMail');

module.exports.checkout = async function checkout(ctx, next) {
  const user = ctx.user;
  const {product, phone, address} = ctx.request.body;

  const order = await Order.create({user, product, phone, address});
  const productData = await Product.findById(product);

  await sendMail({
    to: user.email,
    subject: 'Заказ',
    template: 'order-confirmation',
    locals: {id: order.id, product: productData},
  });

  ctx.body = {order: order.id};
  ctx.status = 200;
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
  const user = ctx.user;
  const orders = await Order.find({user}).populate('Product');

  ctx.body = {orders};
};
