const {v4: uuid} = require('uuid');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');

module.exports.register = async (ctx, next) => {
  const verificationToken = uuid();
  const {email, displayName, password} = ctx.request.body;

  const user = new User({email, displayName, verificationToken});
  await user.setPassword(password);
  await user.save();

  await sendMail({
    to: email,
    subject: 'Подтверждение регистрации',
    template: 'confirmation',
    locals: {token: verificationToken},
  });

  ctx.body = {status: 'ok'};
  ctx.status = 200;
};

module.exports.confirm = async (ctx, next) => {
  const {verificationToken} = ctx.request.body;
  if (!verificationToken) {
    ctx.body = {error: 'Ссылка подтверждения недействительна или устарела'};
    ctx.status = 400;
    return;
  }
  const user = await User.findOne({verificationToken});
  if (!user) {
    ctx.body = {error: 'Ссылка подтверждения недействительна или устарела'};
    ctx.status = 400;
    return;
  }

  user.verificationToken = undefined;
  await user.save();

  const token = await ctx.login(user);

  ctx.body = {token};
  ctx.status= 200;
};
