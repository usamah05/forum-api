const NewComment = require('../../Domains/comments/entities/NewComment');

class NewCommentValidator {
  validate(payload) {
    // This will throw if invalid
    new NewComment(payload);
  }
}

module.exports = NewCommentValidator;
