require('dotenv').config({ path: '.env.test' });

const { passport } = require('../config/passport');
const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { getApp, createUser } = require('./utils/helpers');
const postsRouter = require('../routes/postsRouter');

const prisma = new PrismaClient();

const app = getApp();

app.use(
  '/api/posts',
  passport.authenticate('jwt', { session: false }),
  postsRouter
);

let userA, userB;

beforeAll(async () => {
  userA = await createUser();
  userB = await createUser();
});

describe('Post tests', () => {
  test('User A posts a new post', async () => {
    const response = await request(app)
      .post(`/api/posts/new`)
      .set('Content-Type', 'application/json')
      .set('Cookie', userA.authTokenCookie)
      .send({ content: 'Test post' });

    expect(response.status).toBe(201);

    const userAPosts = await prisma.post.findMany({
      where: {
        authorId: userA.user.id,
      },
    });

    expect(userAPosts).toHaveLength(1);
    expect(userAPosts.at(0).content).toBe('Test post');
  });

  test(`User B gets posts by people they follow`, async () => {
    const follow = await prisma.follows.create({
      data: {
        followerId: userB.user.id,
        followingId: userA.user.id,
      },
    });

    const response = await request(app)
      .get(`/api/posts/`)
      .set('Cookie', userB.authTokenCookie)
      .send();

    expect(response.status).toBe(200);

    const posts = response.body;

    expect(posts).toHaveLength(1);
    expect(posts.at(0).content).toBe('Test post');
  });
});
