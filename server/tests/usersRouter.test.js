require('dotenv').config({ path: '.env.test' });

const usersRouter = require('../routes/usersRouter');
const { passport } = require('../config/passport');
const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { getApp, createUser } = require('./utils/helpers');

const prisma = new PrismaClient();

const app = getApp();

app.use(
  '/api/users',
  passport.authenticate('jwt', { session: false }),
  usersRouter
);

let userA, userB;

beforeAll(async () => {
  userA = await createUser();
  userB = await createUser();
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
