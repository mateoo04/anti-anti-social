const { Router } = require('express');
const {
  addComment,
  deleteComment,
  getComments,
  likeComment,
  unlikeComment,
} = require('../controllers/commentsController');

const commentsRouter = Router({ mergeParams: true });

commentsRouter.get('/', getComments);

commentsRouter.post('/', addComment);

commentsRouter.post('/:commentId/like', likeComment);
commentsRouter.post('/:commentId/unlike', unlikeComment);

commentsRouter.delete('/:commentId', deleteComment);

module.exports = commentsRouter;
