import { isAuthenticated, isCommentOwner, viewerHasLikedComment } from './authorization';
import { combineResolvers } from 'graphql-resolvers';
import pubsub, { EVENTS } from '../subscription';
import Sequelize from 'sequelize';

const toCursorHash =
  string => Buffer.from(string).toString('base64');

const fromCursorHash =
  string => Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
    comment: async (parent, { id }, { models }) => {
      return await models.Comment.findByPk(id);
    },
    comments: async (parent, { limit = 100, cursor, messageId }, { models }) => {
      const comments = await models.Comment.findAll({
        limit: limit + 1,
        order: [['createdAt', 'DESC']],
        where: cursor ? {
          messageId: messageId,
          createdAt: {
            [Sequelize.Op.lt]: fromCursorHash(cursor),
          },
        } : { messageId: messageId },
      });

      const hasNextPage = comments.length > limit;
      const edges = hasNextPage ? comments.slice(0,-1) : comments;

      return {
        edges: edges,
        pageInfo: {
          hasNextPage: hasNextPage,
          endCursor: (edges.length !== 0) ? toCursorHash(
            edges[edges.length - 1].createdAt.toString(),
          ) : null,
        },
      };
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
    viewerHasLikedComment,
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

  Subscription: {
    commentCreated: {
      subscribe:() => pubsub.asyncIterator(EVENTS.COMMENT.CREATED),
    },
  },
};
