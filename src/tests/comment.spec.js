import { expect } from 'chai';

import api from './api';

const userApi = api.userApi;
const commentApi = api.commentApi;

describe('comment', () => {
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
