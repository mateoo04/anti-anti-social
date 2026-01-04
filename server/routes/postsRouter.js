const { Router } = require('express');
const { requireNotRestricted} = require('../middleware/requireNotRestricted');
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

postsRouter.post('/new',requireNotRestricted,  createNewPost);
postsRouter.put('/:postId',requireNotRestricted,  updatePost);
postsRouter.delete('/:postId',requireNotRestricted,  deletePost);

postsRouter.post('/:postId/like', requireNotRestricted, likePost);
postsRouter.post('/:postId/unlike',requireNotRestricted,  unlikePost);

postsRouter.use('/:postId/comments', commentsRouter);

module.exports = postsRouter;
