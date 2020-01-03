import { expect } from 'chai';

import api from './api';

const userApi = api.userApi;
const commentApi = api.commentApi;

describe('comment', () => {
  describe('comments(cursor, limit, messageId): CommentConnection!', () => {
    it('should return an empty array for edges when there are no comments', async () => {
      const {
        data: {
          data: {
            signIn: {token}
          },
        },
      } = await userApi.signIn({
        login: 'ddavids',
        password: 'ddavids',
      });

      const result = await commentApi.comments({messageId: 1});
      const edges = result.data.data.comments.edges;
      expect(edges).to.eql([]);
    });

    it('should return comments when there are comments to return', async () => {
      const {
        data: {
          data: {
            signIn: {token}
          },
        },
      } = await userApi.signIn({
        login: 'ddavids',
        password: 'ddavids',
      });

      const result = await commentApi.createComment({
        text: 'Hello world! One more time!',
        messageId: 1,
      }, token);

      const {
        data: {
          data: {
            comments: {
              edges: edges
            }
          }
        }
      } = await commentApi.comments({messageId: 1});

      const expectedResult = {
        id: edges[0].id,
        text: 'Hello world! One more time!',
      };

      expect(edges[0]).to.eql(expectedResult);
    });

    it('should return non null pageInfo, endCursor, and hasNextPage value', async() => {
      const {
        data: {
          data: {
            comments: {
              pageInfo: {
                hasNextPage,
                endCursor,
              }
            }
          }
        }
      } = await commentApi.comments({messageId: 1});

      expect(hasNextPage).to.eql(false);
      expect(endCursor).to.not.eql(null);
    });
  });

  describe('createComment(text: String!, messageId: ID!) Comment!', () => {
    it('should create and return the comment if message exists', async() => {
      const {
        data: {
          data: {
            signIn: {token}
          },
        },
      } = await userApi.signIn({
        login: 'ddavids',
        password: 'ddavids',
      });

      const result = await commentApi.createComment({
        text: 'Hello world! One more time!',
        messageId: 1,
      }, token);

      const expectedResult = {
          data: {
            createComment: {
              id: result.data.data.createComment.id,
              text: "Hello world! One more time!",
              message: {
                id: "1",
              },
            },
          },
      };

      expect(result.data).to.eql(expectedResult);
    });
  });

  describe('comment(id: ID!): Comment!', () => {
    it('should return correct comment when queried', async() => {
      const {
        data: {
          data: {
            signIn: {token}
          },
        },
      } = await userApi.signIn({
        login: 'ddavids',
        password: 'ddavids',
      });

      const {
        data: {
          data: {
            createComment: {
              id: commentId,
            },
          },
        },
      } = await commentApi.createComment({
        text: 'Hello world!',
        messageId: 1,
      }, token);

      const result = await commentApi.comment({id: commentId});

      const expectedResult = {
          data: {
            comment: {
              id: commentId,
              text: "Hello world!",
              message: {
                id: "1",
              },
            },
          },
      };

      expect(result.data).to.eql(expectedResult);
    });
  });
});
