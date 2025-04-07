const { Router } = require('express');
const { passport } = require('../config/passport');
const authRouter = require('../routes/authRouter');
const usersRouter = require('./usersRouter');
const postsRouter = require('./postsRouter');

const indexRouter = Router();

indexRouter.use('/auth', authRouter);

indexRouter.use(
  '/users',
  passport.authenticate('jwt', { session: false }),
  usersRouter
);

indexRouter.use(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  postsRouter
);

indexRouter.get('/', (req, res) =>
  res.json({ message: 'Welcome to the Anti-anti social API!' })
);

module.exports = indexRouter;
