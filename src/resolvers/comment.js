import { isAuthenticated, isCommentOwner } from './authorization';
import { combineResolvers } from 'graphql-resolvers';
import pubsub, { EVENTS } from '../subscription';

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
    createComment: combineResolvers(
      isAuthenticated,
      async (parent, { text, messageId }, { me, models}) => {
      const messageExists = await models.Message.findByPk(messageId);
      if(messageExists) {
        try {
          const comment = await models.Comment.create({
            text: text,
            userId: me.id,
            messageId: messageId,
          });

          pubsub.publish(EVENTS.COMMENT.CREATED,
          {
            commentCreated: { comment },
          });

          return comment;
        } catch (error) {
          throw new Error(error);
        }
      } else {
        throw new Error("Cannot create comment. Message doesn't exist");
      }
    },
  ),
    deleteComment: combineResolvers(
      isAuthenticated,
      isCommentOwner,
      async (parent, { id }, { models }) => {
      return await models.Comment.destroy({where: { id }});
    },
  ),
  likeComment: combineResolvers(
    isAuthenticated,
    async (parent, { id }, { models, me }) => {
      await models.Like.create({
        userId: me.id,
        commentId: id,
      });

      return true;
    }
  ),
  },

  Comment: {
    user: async (comment, args, { models }) => {
      return await models.User.findByPk(comment.userId);
    },

    message: async (comment, args, { models }) => {
      return await models.Message.findByPk(comment.messageId);
    },

    likes: async (comment, args, { me, models }) => {
      const count =  await models.Like.count({
        where: {
          commentId: comment.id
        },
      });

      const userHasLiked = me ? await models.Like.findOne({
        where: {
          commentId: comment.id,
          userId: me.id,
        }
      }) : null;

      return { count, viewerHasLiked: !!userHasLiked };
    }
  },
<<<<<<< HEAD

  Subscription: {
    commentCreated: {
      subscribe:() => pubsub.asyncIterator(EVENTS.COMMENT.CREATED),
    },
  },
};
=======
}
>>>>>>> Added likes for comments
