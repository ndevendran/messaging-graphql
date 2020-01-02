import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';

export const isAuthenticated = (parent, args, { me }) =>
  me ? skip: new ForbiddenError('Not authenticated as user.');

export const isAdmin =
combineResolvers(
  isAuthenticated,
  (parent, args, { me: { role } }) =>
    role === 'ADMIN'
      ? skip
      : new ForbiddenError('Not authorized as admin.')
);

export const isMessageOwner = async (
  parent,
  { id },
  { models, me },
) => {
  const message = await models.Message.findByPk(id, { raw: true });
  if (message.userId !== me.id) {
    throw new ForbiddenError('Not authenticated as owner.');
  }

  return skip;
};

export const isCommentOwner = async (
  parent,
  { id },
  { models, me },
) => {
  const comment = await models.Comment.findByPk(id, { raw: true });
  if (comment.userId !== me.id) {
    throw new ForbiddenError('Not authenticated as owner.');
  }

  return skip;
};

export const viewerHasLikedMessage = async (
  parent,
  { id },
  { models, me },
) => {
  const result = await models.Like.count({
    where: {
      userId: me.id,
      messageId: id
    }
  });

  if(result > 0) {
    throw new ForbiddenError('Viewer Has Already Liked This Message');
  }

  return skip;
};

export const viewerHasLikedComment = async (
  parent,
  { id },
  { models, me },
) => {
  const result = await models.Like.count({
    where: {
      userId: me.id,
      commentId: id
    }
  });

  if(result > 0) {
    throw new ForbiddenError('Viewer Has Already Liked This Comment');
  }
};
