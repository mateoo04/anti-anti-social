const { Router } = require('express');
const { requireNotRestricted} = require('../middleware/requireNotRestricted');
const {
  addComment,
  deleteComment,
  getComments,
  likeComment,
  unlikeComment,
} = require('../controllers/commentsController');

const commentsRouter = Router({ mergeParams: true });

commentsRouter.get('/', getComments);

commentsRouter.post('/',requireNotRestricted,  addComment);

commentsRouter.post('/:commentId/like',requireNotRestricted,  likeComment);
commentsRouter.post('/:commentId/unlike',requireNotRestricted,  unlikeComment);

commentsRouter.delete('/:commentId',requireNotRestricted,  deleteComment);

module.exports = commentsRouter;
