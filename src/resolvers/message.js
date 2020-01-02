import { ForbiddenError } from 'apollo-server';
import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isMessageOwner, viewerHasLikedMessage } from './authorization';
import Sequelize from 'sequelize';
import pubsub, { EVENTS } from '../subscription';

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string => Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
    messages: async (parent, {cursor, limit = 100}, { models }) => {
        const cursorOptions = cursor ? {
          where: {
            createdAt: {
              [Sequelize.Op.lt]: fromCursorHash(cursor),
            },
          },
        } : {};

        const messages = await models.Message.findAll({
          order: [['createdAt', 'DESC']],
          limit: limit + 1,
          ...cursorOptions,
        });

        const hasNextPage = messages.length > limit;
        const edges = hasNextPage ? messages.slice(0,-1) : messages;
        return {
          edges,
          pageInfo: {
            hasNextPage: hasNextPage,
            endCursor: toCursorHash(
              edges[edges.length-1].createdAt.toString(),
            ),
          },
        };
      },
      message: async (parent, { id }, { models }) => {
        return await models.Message.findByPk(id);
      },
  },

  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, { text }, {
        me, models }) => {
          const message = await models.Message.create({
            text,
            userId: me.id,
          });

          pubsub.publish(EVENTS.MESSAGE.CREATED,
          {
            messageCreated: { message },
          });

          return message;
        },
    ),

    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, { id }, { models }) => {
      return await models.Message.destroy({ where: { id }});
      },
    ),

    likeMessage: combineResolvers(
      isAuthenticated,
      viewerHasLikedMessage,
      async (parent, { id }, { models, me }) => {
        await models.Like.create({
          userId: me.id,
          messageId: id,
        });

        return true;
      }
    )
  },

  Message: {
    user: async (message, args, { loaders }) => {
      return await loaders.user.load(message.userId);
    },
    comments: async(message, args, { models }) => {
      return await models.Comment.findAll({
        where: {
          messageId: message.id,
        }
      });
    },
    likes:  async(message, args, { me, models }) => {
      const count = await models.Like.count({
        where: {
          messageId: message.id,
        }
      });

      const userHasLiked = me ? await models.Like.findOne({
        where: {
          messageId: message.id,
          userId: me.id,
        }
      }) : null;


      return { count, viewerHasLiked: !!userHasLiked };
    }
  },

  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED),
    },
  },
}
