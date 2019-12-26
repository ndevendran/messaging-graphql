import { expect } from 'chai';

import api from './api';

const messageApi = api.messageApi;
const userApi = api.userApi;

describe('messages', () => {
  describe('message(id: ID!) Message', () => {
    it('returns message when message can be found', async () => {
      const expectedResult = {
        data: {
          "message": {
            "id": "1",
            "text": "Published the Road to learn React",
            "user": {
              "id": "1",
              "username": "rwieruch"
            }
          }
        }
      };

      const result = await messageApi.message({ id: 1});
      expect(result.data).to.eql(expectedResult);
    });

  });

  describe('createMessage(text: String!) Message', () => {
    it('creates a message for signed in user', async () => {
      const {
        data: {
          data: {
            signIn: {token},
          },
        },
      } = await userApi.signIn({
        login: 'rwieruch',
        password: 'rwieruch',
      });

      const {
        data: {
          data: result
        },
      } = await messageApi.createMessage({text: "Another one"}, token);

      const expectedResult = {
        "createMessage": {
          "id": result.createMessage.id,
          "text": "Another one",
          "user": {
            "id": "1",
            "username": "rwieruch"
          }
        }
      };

      expect(result).to.eql(expectedResult);
    });
  });

  describe('deleteMessage(id: $id): Boolean', async () => {
    it('deletes created message for signed in user', async() => {
      const {
        data: {
          data: {
            signIn: {token},
          },
        },
      } = await userApi.signIn({
        login: 'rwieruch',
        password: 'rwieruch',
      });

      const {
        data: {
          data: {
            createMessage: {
              id: messageId,
            },
          },
        },
      } = await messageApi.createMessage(
        {text: "Yet another one."},
        token
      );

      const expectedResult = {
        data: {
          deleteMessage: true
        }
      };

      const result = await messageApi.deleteMessage(
        {id: messageId},
        token
      );

      expect(result.data).to.eql(expectedResult);

    });

    it("doesn't delete the message if signed in user and message creator are different", async() => {
        const {
          data: {
            data: {
              signIn: {token: creatorToken},
            },
          },
        } = await userApi.signIn({
          login: 'ddavids',
          password: 'ddavids',
        });

        const {
          data: {
            data: {
              signIn: {token: deleterToken}
            }
          }
        } = await userApi.signIn({
          login: 'rwieruch',
          password: 'rwieruch',
        });

        const {
          data: {
            data: {
              createMessage: {
                id: messageId
              }
            }
          }
        } = await messageApi.createMessage({
          text: "Can't delete this",
        }, creatorToken);

        const {
          data: { errors }
        } = await messageApi.deleteMessage({
          id: messageId
        }, deleterToken);

        expect(errors[0].message).to.eql("Not authenticated as owner.");
    });
  });

});
