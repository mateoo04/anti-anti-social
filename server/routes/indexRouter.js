const { Router } = require('express');
const authRouter = require('../routes/authRouter');

const indexRouter = Router();

indexRouter.use('/auth', authRouter);

indexRouter.get('/', (req, res) =>
  res.json({ message: 'Welcome to the Anti-anti social API!' })
);

module.exports = indexRouter;
