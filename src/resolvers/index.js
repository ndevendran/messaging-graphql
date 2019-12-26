import userResolvers from './user';
import { GraphQLDateTime } from 'graphql-iso-date';
import messageResolvers from './message';
import commentResolvers from './comment';

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [
  customScalarResolver,
  userResolvers,
  messageResolvers,
  commentResolvers,
];
