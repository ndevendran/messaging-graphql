import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    comment(id: ID!): Comment
    comments(cursor: String, limit: Int, messageId: ID!): CommentConnection!
  }

  extend type Mutation {
    createComment(text: String!, messageId: ID!): Comment!
    deleteComment(id: ID!): Boolean!
    likeComment(id: ID!): Boolean!
  }

  extend type Subscription {
    commentCreated: CommentCreated!
  }

  type Comment {
    id: ID!
    text: String!
    createdAt: Date!
    user: User!
    likes: Likes!
    message: Message!
  }

  type CommentConnection {
    edges: [Comment!]
    pageInfo: PageInfo!
  }

  type CommentCreated {
    comment: Comment!
  }
`;
