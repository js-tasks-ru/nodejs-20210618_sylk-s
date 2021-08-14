const socketIO = require('socket.io');

const Session = require('./models/Session');
const Message = require('./models/Message');

function socket(server) {
  const io = socketIO(server, {
    allowEIO3: true,
  });

  io.use(async function(socket, next) {
    const token = socket.handshake.query.token;
    if (!token) {
      const err = new Error('anonymous sessions are not allowed');
      err.data = {content: err.message};
      return next(err);
    }

    const session = await Session.findOne({token}).populate('user');
    if (!session) {
      const err = new Error('wrong or expired session token');
      err.data = {content: err.message};
      return next(err);
    }

    socket.user = session.user;
    next();
  });

  io.on('connection', function(socket) {
    socket.on('message', async (msg) => {
      Message.create({
        date: new Date(),
        text: msg,
        chat: socket.user._id,
        user: socket.user.displayName,
      }).catch(console.error);
    });
  });

  return io;
}

module.exports = socket;
