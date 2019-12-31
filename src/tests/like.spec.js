import { expect } from 'chai';

import api from './api';
import promiseHelper, { waitForPromise } from '../utils/promiseHelper.js';

const messageApi = api.messageApi;
const userApi = api.userApi;
const commentApi = api.commentApi;

describe('Likes', () => {
  let token;

  const promise = userApi.signIn({
      login: 'rwieruch',
      password: 'rwieruch',
    });

  const getToken = function(v) {
    const {
      data: {
        data: {
          signIn: {token},
        },
      },
    } = v;
    return {token: token};
  }

  var myPromise = promiseHelper(promise, getToken);

  myPromise.then(function(data) {
    token = data.token;
  });

  waitForPromise(myPromise);

  describe('Likes for messages', () => {
    it('User should be able to query likes for messages', async () => {
      const result = await messageApi.messageWithLikes({id: 1});

      const expectedResult = {
          data: {
            message: {
              id: "1",
              text: "Published the Road to learn React",
              likes: {
                count: result.data.data.message.likes.count,
                viewerHasLiked: false,
              },
              user: {
                id: "1",
                username: "rwieruch",
              }
            },
          },
      };

      expect(result.data).to.eql(expectedResult);
    });

    it('User should be able to like a message', async () => {
      const {
        data: {
          data: {
            message: {
              likes: {
                count: startingCount
              },
            },
          },
        } } = await messageApi.messageWithLikes({id: 1});

      const result = await messageApi.likeMessage({id: 1}, token);

      const expectedMutationResult = {
        data: {
          likeMessage: true,
        },
      };

      expect(result.data).to.eql(expectedMutationResult);

      const {
        data: {
          data: {
            message: {
              likes: {
                count: endingCount
              },
            },
          },
        }} = await messageApi.messageWithLikes({id: 1});

        const difference = endingCount - startingCount;
        expect(difference).to.eql(1);
    });
  });

  describe('Likes for Comments', () => {
    it('User should be able to like a comment', async () => {
      const {
        data: {
          data: {
            createComment: {
              id: commentId
            }
          }
        }
      } = await commentApi.createComment({
        text: 'Another comment!',
        messageId: 1,
      }, token);

      const {
        data: {
          data: {
            comment: {
              likes: {
                count: startingCount
              }
            }
          }
        }
      } = await commentApi.commentWithLikes({id: commentId});

      console.log(`This is the starting count: ${startingCount}`);

      const result = await commentApi.likeComment({id: commentId}, token);
      console.log(result.data);
      expect(result.data.data.likeComment).to.eql(true);

      const {
        data: {
          data: {
            comment: {
              likes: {
                count: endingCount
              }
            }
          }
        }
      } = await commentApi.commentWithLikes({id: commentId});

      console.log(`This is the ending count: ${endingCount}`);

      const difference = endingCount - startingCount;
      expect(difference).to.eql(1);
    });
  });
});
