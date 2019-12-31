import { gql } from 'apollo-server-express';
import userSchema from './user';
import messageSchema from './message';
import commentSchema from './comment';
import likeSchema from './likes';

const linkSchema = gql`
  scalar Date

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

export default [linkSchema, userSchema, messageSchema, commentSchema, likeSchema];
