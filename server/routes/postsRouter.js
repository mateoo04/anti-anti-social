const { Router } = require('express');
const {
  getPostById,
  createNewPost,
  getFollowingsPosts,
  likePost,
  unlikePost,
  deletePost,
  updatePost,
  getExplorePosts,
} = require('../controllers/postsController');
const commentsRouter = require('./commentsRouter');

const postsRouter = Router();

postsRouter.get('/', getFollowingsPosts);
postsRouter.get('/explore', getExplorePosts);
postsRouter.get('/:postId', getPostById);

postsRouter.post('/new', createNewPost);
postsRouter.put('/:postId', updatePost);
postsRouter.delete('/:postId', deletePost);

postsRouter.post('/:postId/like', likePost);
postsRouter.post('/:postId/unlike', unlikePost);

postsRouter.use('/:postId/comments', commentsRouter);

module.exports = postsRouter;
