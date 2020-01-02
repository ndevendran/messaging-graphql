import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    comment(id: ID!): Comment
    comments(messageId: ID!): [Comment!]
  }

  extend type Mutation {
    createComment(text: String!, messageId: ID!): Comment!
    deleteComment(id: ID!): Boolean!
  }

  extend type Subscription {
    commentCreated: CommentCreated!
  }

  type Comment {
    id: ID!
    text: String!
    createdAt: Date!
    user: User!
    message: Message!
  }

  type CommentCreated {
    comment: Comment!
  }
`;
