const { issueJWT } = require('../lib/utils');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

async function respond(res, successStatusCode, user) {
  const tokenObj = issueJWT(user);

  res.cookie('authToken', tokenObj.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: tokenObj.expiresAt,
    sameSite: 'Strict',
  });
  res.cookie('username', user.username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: tokenObj.expiresAt,
    sameSite: 'Strict',
  });

  res.status(successStatusCode).json({
    success: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
    },
  });
}

async function signUp(req, res, next) {
  const errors = validationResult(req)
    .array()
    .map((error) => ({ field: error.path, message: error.msg }));

  if (errors.length != 0) {
    return res.status(400).json(errors);
  }

  try {
    const userWithEnteredUsername = await prisma.user.findFirst({
      where: {
        username: req.body.username,
      },
    });

    if (userWithEnteredUsername) {
      return res
        .status(409)
        .json({ message: 'User with that username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
      },
    });

    respond(res, 201, user);
  } catch (err) {
    next(err);
  }
}

async function logIn(req, res, next) {
  const errors = validationResult(req)
    .array()
    .map((error) => ({ field: error.path, message: error.msg }));
  if (errors.length != 0) {
    return res.status(400).json(errors);
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: req.body.username,
      },
    });

    if (!user) {
      return res.status(401).json('Invalid credentials');
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (match) {
      respond(res, 200, user);
    } else res.status(401).json('Invalid credentials');
  } catch (err) {
    next(err);
  }
}

async function logOut(req, res, next) {
  res.clearCookie('authToken', { httpOnly: true });
  res.clearCookie('username', { httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out' });
}

module.exports = { signUp, logIn, logOut };
