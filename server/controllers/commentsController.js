const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getComments(req, res, next) {
  try {
    const postId = req.params.postId;

    const comments = await prisma.comment.findMany({
      where: {
        postId,
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
    });

    return res.json(comments);
  } catch (err) {
    next(err);
  }
}

async function addComment(req, res, next) {
  try {
    const postId = req.params.postId;
    const content = req.body.content;

    const comment = await prisma.comment.create({
      data: {
        postId,
        content,
        authorId: req.user.id,
      },
    });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const id = req.params.commentId;

    const comment = await prisma.comment.delete({
      where: {
        id,
      },
    });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getComments, addComment, deleteComment };
