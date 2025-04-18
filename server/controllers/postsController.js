const { PrismaClient } = require('@prisma/client');
const { events } = require('../config/events');

const prisma = new PrismaClient();

async function getFollowingsPosts(req, res, next) {
  const where = {
    author: {
      followers: {
        some: {
          followerId: req.user.id,
        },
      },
    },
  };

  const orderBy = [
    {
      dateTime: 'desc',
    },
    { author: { username: 'asc' } },
  ];

  return getPosts(req, res, next, where, orderBy);
}

async function getExplorePosts(req, res, next) {
  const where = {
    AND: [
      {
        author: {
          followers: {
            none: {
              followerId: req.user.id,
            },
          },
        },
      },
      {
        author: {
          NOT: {
            id: req.user.id,
          },
        },
      },
    ],
  };

  const orderBy = [
    {
      likedBy: {
        _count: 'desc',
      },
    },
    {
      dateTime: 'desc',
    },
    { author: { username: 'asc' } },
  ];

  return getPosts(req, res, next, where, orderBy);
}

async function getPosts(req, res, next, where, orderBy) {
  try {
    const { cursor, limit = 10 } = req.query;

    const [posts, likedBy] = await Promise.all([
      prisma.post.findMany({
        where,
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
          _count: {
            select: {
              likedBy: true,
            },
          },
        },
        orderBy,
        take: Number(limit) + 1,
        ...(cursor && {
          cursor: { id: cursor },
        }),
      }),
      prisma.post.findMany({
        where: {
          author: {
            followers: {
              some: {
                followerId: req.user.id,
              },
            },
          },
          likedBy: {
            some: {
              id: req.user.id,
            },
          },
        },
      }),
    ]);

    let nextCursor = null;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem.id;
    }

    const likedByAuthUser = likedBy.map((likedByItem) => likedByItem.id);

    return res.json({
      posts: posts.map((post) => {
        if (likedByAuthUser.includes(post.id))
          return { ...post, likedByAuthUser: true };
        else return { ...post, likedByAuthUser: false };
      }),
      nextCursor,
    });
  } catch (err) {
    next(err);
  }
}

async function getPostById(req, res, next) {
  try {
    const postId = req.params.postId;

    const [post, liked] = await Promise.all([
      prisma.post.findUnique({
        where: {
          id: postId,
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
          _count: {
            select: {
              likedBy: true,
            },
          },
        },
      }),
      prisma.post.findFirst({
        where: {
          id: postId,
          likedBy: {
            some: {
              id: req.user.id,
            },
          },
        },
        select: {
          id: true,
        },
      }),
    ]);

    return res.json({
      ...post,
      likedByAuthUser: Boolean(liked),
    });
  } catch (err) {
    next(err);
  }
}

async function createNewPost(req, res, next) {
  try {
    const post = await prisma.post.create({
      data: {
        content: req.body.content || undefined,
        photoUrl: req.body.photoUrl || undefined,
        authorId: req.user.id,
      },
    });

    return res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

async function likePost(req, res, next) {
  try {
    const postId = req.params.postId;

    const likedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        likedBy: {
          connect: {
            id: req.user.id,
          },
        },
      },
      select: {
        authorId: true,
        id: true,
      },
    });

    const exists = await prisma.notification.findFirst({
      where: {
        type: 'LIKE',
        fromUserId: req.user.id,
        toUserId: likedPost.authorId,
        postId: likedPost.id,
      },
    });

    if (!exists && req.user.id !== likedPost.authorId) {
      const notification = await prisma.notification.create({
        data: {
          type: 'LIKE',
          fromUserId: req.user.id,
          toUserId: likedPost.authorId,
          postId: likedPost.id,
        },
        include: {
          toUser: true,
          fromUser: true,
          post: true,
        },
      });

      events.emit('newNotification', { notification });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function unlikePost(req, res, next) {
  try {
    const postId = req.params.postId;

    const unlikedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        likedBy: {
          disconnect: {
            id: req.user.id,
          },
        },
      },
    });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const postId = req.params.postId;

    validatePostAuthor(req, res, postId);

    await prisma.comment.deleteMany({
      where: {
        postId,
      },
    });

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
}

async function updatePost(req, res, next) {
  try {
    const postId = req.params.postId;

    validatePostAuthor(req, res, postId);

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        content: req.body.content || undefined,
        photoUrl: req.body.photoUrl || undefined,
      },
    });

    return res.json(updatedPost);
  } catch (err) {
    next(err);
  }
}

async function validatePostAuthor(req, res, postId) {
  const isAuthor = await prisma.post.findFirst({
    where: {
      id: postId,
      authorId: req.user.id,
    },
  });

  if (!isAuthor) res.status(403);
}

module.exports = {
  createNewPost,
  getPostById,
  getFollowingsPosts,
  getExplorePosts,
  likePost,
  unlikePost,
  deletePost,
  updatePost,
};
