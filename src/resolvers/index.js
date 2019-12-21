import userResolvers from './user';
import { GraphQLDateTime } from 'graphql-iso-date';
import messageResolvers from './message';

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [
  customScalarResolver,
  userResolvers,
  messageResolvers,
];
