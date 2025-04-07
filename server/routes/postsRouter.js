const { Router } = require('express');
const {
  getPostById,
  createNewPost,
  getPosts,
} = require('../controllers/postsController');

const postsRouter = Router();

postsRouter.get('/', getPosts);

postsRouter.get('/:postId', getPostById);

postsRouter.post('/new', createNewPost);

module.exports = postsRouter;
