import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    likes(id: ID!, type: String!): Likes!
  }

  type Likes {
    count: Int!
    viewerHasLiked: Boolean!
  }
`;
