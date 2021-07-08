const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

// request marker middleware (for stack)
app.use(async (ctx, next) => {
  ctx.state.requestId = ctx.request.query && ctx.request.query['r'] || Math.random();
  await next();
});

const Router = require('koa-router');
const router = new Router();

const stack = {
  _store: [],
  _getRequestId: (ctx) => ctx.state.requestId,

  add: function({ctx, resolve}) {
    this._store[this._getRequestId(ctx)] = {ctx, resolve};
  },
  delete: function(ctx) {
    delete this._store[this._getRequestId(ctx)];
  },
  get: function() {
    return Object.values(this._store);
  },
};

router.get('/subscribe', async (ctx, next) => {
  ctx.req.on('aborted', () => {
    stack.delete(ctx);
  });

  await new Promise((resolve) => {
    stack.add({ctx, resolve});
  });

  stack.delete(ctx);
});

router.post('/publish', async (ctx, next) => {
  ctx.status = 200;

  if (!ctx.request.body.message) {
    return;
  }

  for (const stackitem of stack.get()) {
    stackitem.ctx.status = 200;
    stackitem.ctx.body = ctx.request.body.message;
    stackitem.resolve();
  }
});

app.use(router.routes());

module.exports = app;
