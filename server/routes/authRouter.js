const { Router } = require('express');

const { signUp, logIn, logOut } = require('../controllers/authController');
const { validateSignUp, validateLogIn } = require('../lib/validators');
const { passport } = require('../config/passport');

const authRouter = Router();

authRouter.post('/sign-up', validateSignUp, signUp);

authRouter.post('/log-in', validateLogIn, logIn);

authRouter.post(
  '/validate-credentials',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    return res.json({
      success: true,
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username,
      },
    });
  }
);

authRouter.post(
  '/log-out',
  passport.authenticate('jwt', { session: false }),
  logOut
);

module.exports = authRouter;
