const { issueJWT } = require('../lib/utils');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const { passport } = require('../config/passport');
const { createGuestIfNotExists } = require('../lib/guestCreate');

const prisma = new PrismaClient();

async function respond(res, successStatusCode, user, isGitHubOauth) {
  const tokenObj = issueJWT(user);

  res.cookie('authToken', tokenObj.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: tokenObj.expiresAt,
    sameSite: 'Strict',
  });
  res.cookie('username', user.username, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    expires: tokenObj.expiresAt,
    sameSite: 'Strict',
  });

  if (isGitHubOauth && process.env.NODE_ENV === 'production') res.redirect('/');
  else if (isGitHubOauth && process.env.NODE_ENV === 'development')
    res.redirect(process.env.FRONTEND_URL);
  else
    res.status(successStatusCode).json({
      success: true,
      user,
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

    if (userWithEnteredUsername || req.body.username === 'jan_rolf') {
      return res
        .status(409)
        .json({ message: 'User with that username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        profileImageUrl: true,
        followers: true,
        following: true,
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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        password: true,
        profileImageUrl: true,
        followers: {
          select: {
            followerId: true,
          },
        },
        following: {
          select: {
            followingId: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json('Invalid credentials');
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (match) {
      delete user['password'];

      respond(res, 200, {
        ...user,
        following: user.following.map(
          (followingUser) => followingUser.followingId
        ),
        followers: user.followers.map(
          (followerUser) => followerUser.followerId
        ),
      });
    } else res.status(401).json('Invalid credentials');
  } catch (err) {
    next(err);
  }
}

async function gitHubLogIn(req, res) {
  respond(
    res,
    200,
    {
      ...req.user,
      following: req.user.following.map(
        (followingUser) => followingUser.followingId
      ),
      followers: req.user.followers.map(
        (followerUser) => followerUser.followerId
      ),
    },
    true
  );
}

async function guestLogIn(req, res, next) {
  try {
    const user = await createGuestIfNotExists();

    respond(res, 200, {
      ...user,
      following: user.following?.map(
        (followingUser) => followingUser.followingId
      ),
      followers: user.followers?.map((followerUser) => followerUser.followerId),
    });
  } catch (err) {
    next(err);
  }
}

async function logOut(req, res, next) {
  res.clearCookie('authToken', { httpOnly: true });
  res.clearCookie('username', { httpOnly: false });
  res.status(200).json({ success: true, message: 'Logged out' });
}

function authenticateJwt(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      res.clearCookie('authToken', { httpOnly: true });
      res.clearCookie('username', { httpOnly: false });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.user = user;
    next();
  })(req, res, next);
}

async function validateCredentials(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        username: true,
        profileImageUrl: true,
        followers: {
          select: {
            followerId: true,
          },
        },
        following: {
          select: {
            followingId: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      user: {
        ...user,
        following: user.following.map(
          (followingUser) => followingUser.followingId
        ),
        followers: user.followers.map(
          (followerUser) => followerUser.followerId
        ),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signUp,
  logIn,
  logOut,
  authenticateJwt,
  validateCredentials,
  guestLogIn,
  gitHubLogIn,
};
