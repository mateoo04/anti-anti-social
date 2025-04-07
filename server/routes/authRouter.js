const { Router } = require('express');

const {
  signUp,
  logIn,
  logOut,
  validateCredentials,
  authenticateJwt,
} = require('../controllers/authController');
const { validateSignUp, validateLogIn } = require('../lib/validators');
const { passport } = require('../config/passport');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authRouter = Router();

authRouter.post('/sign-up', validateSignUp, signUp);

authRouter.post('/log-in', validateLogIn, logIn);

authRouter.post('/validate-credentials', authenticateJwt, validateCredentials);

authRouter.post(
  '/log-out',
  passport.authenticate('jwt', { session: false }),
  logOut
);

module.exports = authRouter;
