const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getPosts(req, res, next) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        author: {
          followers: {
            some: {
              followerId: req.user.id,
            },
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: {
        dateTime: 'desc',
      },
    });

    return res.json(posts);
  } catch (err) {
    next(err);
  }
}

async function getPostById(req, res, next) {
  try {
    const postId = req.params.postId;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    return res.json(post);
  } catch (err) {
    next(err);
  }
}

async function createNewPost(req, res, next) {
  try {
    const { content } = req.body;

    const post = await prisma.post.create({
      data: {
        content,
        authorId: req.user.id,
      },
    });

    return res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

module.exports = { createNewPost, getPostById, getPosts };
