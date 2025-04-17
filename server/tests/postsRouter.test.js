require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { getApp, createUser } = require('./utils/helpers');

const prisma = new PrismaClient();

const app = getApp();

let userA, userB, userC;
let userAPost;
let userCComment;

beforeAll(async () => {
  userA = await createUser();
  userB = await createUser();
  userC = await createUser();
});

describe('Post tests', () => {
  test('User A posts a new post', async () => {
    const response = await request(app)
      .post(`/api/posts/new`)
      .set('Content-Type', 'application/json')
      .set('Cookie', userA.authTokenCookie)
      .send({ content: 'Test post' });

    expect(response.statusCode).toBe(201);

    const userAPosts = await prisma.post.findMany({
      where: {
        authorId: userA.user.id,
      },
    });

    userAPost = userAPosts.at(0);

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

    expect(response.statusCode).toBe(200);

    const body = response.body;

    expect(body.posts).toHaveLength(1);
    expect(body.posts.at(0).content).toBe('Test post');
  });

  test('User C gets explore posts', async () => {
    const response = await request(app)
      .get(`/api/posts/explore`)
      .set('Cookie', userC.authTokenCookie)
      .send();

    expect(response.statusCode).toBe(200);

    const body = response.body;

    expect(body.posts).toHaveLength(1);
    expect(body.posts.at(0).content).toBe('Test post');
  });
});

describe('Liking a post', () => {
  test('User B likes the post', async () => {
    const response = await request(app)
      .post(`/api/posts/${userAPost.id}/like`)
      .set('Cookie', userB.authTokenCookie)
      .send();

    expect(response.statusCode).toBe(204);

    const post = await prisma.post.findUnique({
      where: {
        id: userAPost.id,
      },
      include: {
        likedBy: true,
      },
    });

    expect(post.likedBy.length).toBe(1);
  });

  test('User C likes the post', async () => {
    const response = await request(app)
      .post(`/api/posts/${userAPost.id}/like`)
      .set('Cookie', userC.authTokenCookie)
      .send();

    expect(response.statusCode).toBe(204);

    const post = await prisma.post.findUnique({
      where: {
        id: userAPost.id,
      },
      include: {
        likedBy: true,
      },
    });

    expect(post.likedBy.length).toBe(2);
  });

  test('User C unlikes the post', async () => {
    const response = await request(app)
      .post(`/api/posts/${userAPost.id}/unlike`)
      .set('Cookie', userC.authTokenCookie)
      .send();

    expect(response.statusCode).toBe(204);

    const post = await prisma.post.findUnique({
      where: {
        id: userAPost.id,
      },
      include: {
        likedBy: true,
      },
    });

    expect(post.likedBy.length).toBe(1);
  });
});

describe('Commenting the post', () => {
  test('User C comments on the post', async () => {
    const response = await request(app)
      .post(`/api/posts/${userAPost.id}/comments`)
      .set('Cookie', userB.authTokenCookie)
      .send({ content: 'Test comment' });

    expect(response.statusCode).toBe(201);

    const commentsOnUserAPost = await prisma.comment.findMany({
      where: {
        postId: userAPost.id,
      },
    });

    expect(commentsOnUserAPost.length).toBe(1);
    expect(commentsOnUserAPost.at(0).content).toBe('Test comment');
  });

  test('Returns the comments for the post', async () => {
    const response = await request(app)
      .get(`/api/posts/${userAPost.id}/comments`)
      .set('Cookie', userB.authTokenCookie)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);

    userCComment = response.body.at(0);
  });
});

describe('Liking a comment', () => {
  test("User B likes User C's comment", async () => {
    const response = await request(app)
      .post(`/api/posts/${userAPost.id}/comments/${userCComment.id}/like`)
      .set('Cookie', userB.authTokenCookie)
      .send();

    expect(response.statusCode).toBe(204);

    const comment = await prisma.comment.findUnique({
      where: {
        id: userCComment.id,
      },
      include: {
        likedBy: true,
      },
    });

    expect(comment.likedBy.length).toBe(1);
  });

  test("User B unlikes User C's comment", async () => {
    const response = await request(app)
      .post(`/api/posts/${userAPost.id}/comments/${userCComment.id}/unlike`)
      .set('Cookie', userB.authTokenCookie)
      .send();

    expect(response.statusCode).toBe(204);

    const comment = await prisma.comment.findUnique({
      where: {
        id: userCComment.id,
      },
      include: {
        likedBy: true,
      },
    });

    expect(comment.likedBy.length).toBe(0);
  });
});

describe('Post actions', () => {
  test('User A updates their post', async () => {
    const response = await request(app)
      .put(`/api/posts/${userAPost.id}`)
      .set('Cookie', userA.authTokenCookie)
      .send({ content: 'Updated' });

    expect(response.statusCode).toBe(200);

    const post = await prisma.post.findUnique({
      where: {
        id: userAPost.id,
      },
    });

    expect(post.content).toBe('Updated');
  });

  test('User A deletes their post', async () => {
    const response = await request(app)
      .delete(`/api/posts/${userAPost.id}`)
      .set('Cookie', userA.authTokenCookie)
      .send();

    expect(response.statusCode).toBe(200);

    const post = await prisma.post.findFirst({
      where: {
        id: userAPost.id,
      },
    });

    expect(post).toBe(null);
  });
});

describe('Notifications', () => {
  test("returns User a's notifications", async () => {
    const response = await request(app)
      .get(`/api/notifications`)
      .set('Cookie', userA.authTokenCookie)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(3);
  });
});
