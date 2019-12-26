export default {
  Query: {
    comment: async (parent, { id }, { models }) => {
      return await models.Comment.findByPk(id);
    },
    comments: async (parent, { messageId }, { models }) => {
      return await models.Comment.findAll({
        where: {
          messageId: messageId,
        },
      });
    },
  },

  Mutation: {
    createComment: async (parent, { text, messageId }, { me, models}) => {
      const messageExists = await models.Message.findByPk(messageId);
      if(messageExists) {
        try {
          const comment = await models.Comment.create({
            text: text,
            userId: 1,
            messageId: messageId,
          });

          return comment;
        } catch (error) {
          throw new Error(error);
        }
      } else {
        throw new Error("Cannot create comment. Message doesn't exist");
      }
    },
    deleteComment: async (parent, { id }, { models }) => {
      return await models.Comment.destroy({where: { id }});
    }
  },

  Comment: {
    user: async (comment, args, { models }) => {
      return await models.User.findByPk(comment.userId);
    },

    message: async (comment, args, { models }) => {
      return await models.Message.findByPk(comment.messageId);
    }
  }
}
