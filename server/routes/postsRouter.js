const { Router } = require('express');
const {
  getPostById,
  createNewPost,
  getPosts,
  likePost,
  unlikePost,
} = require('../controllers/postsController');
const commentsRouter = require('./commentsRouter');

const postsRouter = Router();

postsRouter.get('/', getPosts);

postsRouter.get('/:postId', getPostById);

postsRouter.post('/new', createNewPost);

postsRouter.post('/:postId/like', likePost);
postsRouter.post('/:postId/unlike', unlikePost);

postsRouter.use('/:postId/comments', commentsRouter);

module.exports = postsRouter;
