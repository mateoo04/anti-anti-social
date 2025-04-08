const { Router } = require('express');
const {
  getPostById,
  createNewPost,
  getPosts,
  likePost,
  unlikePost,
} = require('../controllers/postsController');

const postsRouter = Router();

postsRouter.get('/', getPosts);

postsRouter.get('/:postId', getPostById);

postsRouter.post('/new', createNewPost);

postsRouter.post('/:postId/like', likePost);
postsRouter.post('/:postId/unlike', unlikePost);

module.exports = postsRouter;
