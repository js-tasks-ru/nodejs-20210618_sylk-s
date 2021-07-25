const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

module.exports = new LocalStrategy(
    {usernameField: 'email', session: false},
    async function(email, password, done) {
      try {
        const user = await User.findOne({email});
        if (!user) {
          return done(null, false, 'Нет такого пользователя');
        }

        const isCorrectPassword = await user.checkPassword(password);
        if (!isCorrectPassword) {
          return done(null, false, 'Неверный пароль');
        }

        done(null, user);
      } catch (e) {
        done(e);
      }
    },
);
