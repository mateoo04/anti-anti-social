const usersRouter = require('../routes/usersRouter');
const authRouter = require('../routes/authRouter');
const { passport } = require('../config/passport');
const cookieParser = require('cookie-parser');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use(
  '/api/users',
  passport.authenticate('jwt', { session: false }),
  usersRouter
);

const createUser = async (username) => {
  const response = await request(app)
    .post('/api/auth/sign-up')
    .set('Content-Type', 'application/json')
    .send({
      firstName: 'test',
      lastName: 'test',
      username,
      password: 'Test1234',
      confirmPassword: 'Test1234',
    });

  const cookies = response.headers['set-cookie'];

  const authTokenCookie = cookies
    .find((cookie) => cookie.startsWith('authToken='))
    .split(';')[0];

  return { user: response.body.user, authTokenCookie };
};

const deleteTestUsers = async () => {
  await prisma.follows.deleteMany({
    where: {
      OR: [
        {
          follower: {
            username: {
              in: ['test_user_a', 'test_user_b'],
            },
          },
        },
        {
          following: {
            username: {
              in: ['test_user_a', 'test_user_b'],
            },
          },
        },
      ],
    },
  });

  await prisma.user.deleteMany({
    where: {
      username: {
        in: ['test_user_a', 'test_user_b'],
      },
    },
  });
};

let userA, userB;

beforeAll(async () => {
  await deleteTestUsers();
  userA = await createUser('test_user_a');
  userB = await createUser('test_user_b');
});

afterAll(async () => {
  deleteTestUsers();
});

describe('Following tests', () => {
  test('User A follows User B', async () => {
    const response = await request(app)
      .post(`/api/users/${userB.user.id}/follow`)
      .set('Content-Type', 'application/json')
      .set('Cookie', userA.authTokenCookie)
      .send();

    expect(response.status).toBe(201);

    const updatedUserB = await prisma.user.findUnique({
      where: {
        id: userB.user.id,
      },
      select: {
        followers: true,
      },
    });

    expect(updatedUserB.followers).toHaveLength(1);
    expect(updatedUserB.followers[0].followerId).toBe(userA.user.id);
  });

  test('User A unfollows User B', async () => {
    console.log(userA, userB);
    const response = await request(app)
      .delete(`/api/users/${userB.user.id}/unfollow`)
      .set('Content-Type', 'application/json')
      .set('Cookie', userA.authTokenCookie)
      .send();

    expect(response.status).toBe(200);

    const updatedUserB = await prisma.user.findUnique({
      where: {
        id: userB.user.id,
      },
      select: {
        followers: true,
      },
    });

    expect(updatedUserB.followers).toHaveLength(0);
  });

  test('User B follows User A', async () => {
    const response = await request(app)
      .post(`/api/users/${userA.user.id}/follow`)
      .set('Content-Type', 'application/json')
      .set('Cookie', userB.authTokenCookie)
      .send();

    expect(response.status).toBe(201);

    const updatedUserA = await prisma.user.findUnique({
      where: {
        id: userA.user.id,
      },
      select: {
        followers: true,
      },
    });

    expect(updatedUserA.followers).toHaveLength(1);
    expect(updatedUserA.followers[0].followerId).toBe(userB.user.id);
  });

  test('User A removes User B from followers', async () => {
    console.log(userA, userB);
    const response = await request(app)
      .delete(`/api/users/${userB.user.id}/remove-follower`)
      .set('Content-Type', 'application/json')
      .set('Cookie', userA.authTokenCookie)
      .send();

    expect(response.status).toBe(200);

    const updatedUserB = await prisma.user.findUnique({
      where: {
        id: userB.user.id,
      },
      select: {
        followers: true,
      },
    });

    expect(updatedUserB.followers).toHaveLength(0);
  });
});
