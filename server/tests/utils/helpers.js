require('dotenv').config({ path: '.env.test' });

const authRouter = require('../../routes/authRouter');
const cookieParser = require('cookie-parser');
const { passport } = require('../../config/passport');
const request = require('supertest');
const express = require('express');

let app;

function getApp() {
  app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(passport.initialize());
  app.use(cookieParser());

  app.use('/api/auth', authRouter);

  return app;
}

async function createUser() {
  const response = await request(app)
    .post('/api/auth/sign-up')
    .set('Content-Type', 'application/json')
    .send({
      firstName: 'test',
      lastName: 'test',
      username: `test_user_${Math.random().toString(36).substring(2, 8)}`,
      password: 'Test1234',
      confirmPassword: 'Test1234',
    });

  const cookies = response.headers['set-cookie'];

  const authTokenCookie = cookies
    .find((cookie) => cookie.startsWith('authToken='))
    .split(';')[0];

  return { user: response.body.user, authTokenCookie };
}

module.exports = {
  getApp,
  createUser,
};
