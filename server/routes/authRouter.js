const { Router, response } = require('express');

const {
  signUp,
  logIn,
  logOut,
  validateCredentials,
  authenticateJwt,
  guestLogIn,
  gitHubLogIn,
} = require('../controllers/authController');
const { validateSignUp, validateLogIn } = require('../lib/validators');
const { passport } = require('../config/passport');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authRouter = Router();

authRouter.post('/sign-up', validateSignUp, signUp);

authRouter.post('/log-in', validateLogIn, logIn);

authRouter.post('/guest-login', guestLogIn);

authRouter.post('/validate-credentials', authenticateJwt, validateCredentials);

authRouter.post(
  '/log-out',
  passport.authenticate('jwt', { session: false }),
  logOut
);

authRouter.get('/github', passport.authenticate('github'));

authRouter.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/log-in',
  }),
  gitHubLogIn
);

module.exports = authRouter;
