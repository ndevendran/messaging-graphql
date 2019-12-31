import axios from 'axios';

const API_URL = 'http://localhost:8000/graphql';

export const user = async variables =>
  axios.post(API_URL, {
    query: `
      query ($id: ID!) {
        user(id: $id) {
          id
          username
          email
          role
        }
      }
    `,
    variables,
  });

export const signIn = async variables =>
  await axios.post(API_URL, {
    query: `
      mutation($login: String!, $password: String!) {
        signIn(login: $login, password: $password) {
          token
        }
      }
    `,
    variables,
  });

export const deleteUser = async (variables, token) =>
  axios.post(
    API_URL,
    {
      query: `
        mutation ($id: ID!) {
          deleteUser(id: $id)
        }
      `,
      variables,
    },
    {
      headers: {
        'x-token': token,
      },
    },
  );

export const message = async (variables) =>
  axios.post(
    API_URL,
    {
      query: `
        query($id: ID!) {
          message(id: $id) {
            id
            text
            user {
              id
              username
            }
          }
        }
      `,
      variables,
    });

export const messageWithLikes = async (variables) =>
  axios.post(
    API_URL,
    {
      query: `
        query($id: ID!) {
          message(id: $id) {
            id
            text
            likes {
              count
              viewerHasLiked
            }
            user {
              id
              username
            }
          }
        }
      `,
      variables
    });

export const createMessage = async (variables, token) =>
  await axios.post(
    API_URL,
    {
      query: `
        mutation ($text: String!) {
          createMessage(text: $text) {
            id
            text
            user {
              id
              username
            }
          }
        }
      `,
      variables,
    },
    {
      headers: {
        'x-token': token,
      },
    },
  );

export const deleteMessage = async (variables, token) =>
  axios.post(
    API_URL,
    {
      query: `
        mutation ($id: ID!) {
          deleteMessage(id: $id)
        }
      `,
      variables,
    },
    {
      headers: {
        'x-token': token,
      },
    },
  );

  export const likeMessage = async (variables, token) =>
    axios.post(
      API_URL,
      {
        query: `
          mutation ($id: ID!) {
            likeMessage(id: $id)
          }
        `,
        variables,
      },
      {
        headers: {
          'x-token': token,
        },
      },
    );

  export const createComment = async (variables, token) =>
    await axios.post(
      API_URL,
      {
        query: `
          mutation ($text: String!, $messageId: ID!) {
            createComment(text: $text, messageId: $messageId) {
              id
              text
              message {
                id
              }
            }
          }
        `,
        variables
      },
      {
        headers: {
          'x-token': token,
        },
      },
    );

  export const comment = async (variables) =>
    axios.post(
      API_URL,
      {
        query: `
          query($id: ID!) {
            comment(id: $id) {
              id
              text
              message {
                id
              }
            }
          }
        `,
        variables
      },
    );

  export const commentWithLikes = async (variables) =>
    axios.post(
      API_URL,
      {
        query: `
          query($id: ID!) {
            comment(id: $id) {
              id
              text
              likes {
                count
                viewerHasLiked
              }
              message {
                id
              }
            }
          }
        `,
        variables
      },
    );

export const likeComment = async (variables, token) =>
  axios.post(
    API_URL,
    {
      query: `
        mutation($id: ID!) {
          likeComment(id: $id)
        }
      `,
      variables
    },
    {
      headers: {
        'x-token': token
      },
    },
  );


  const userApi = {user, signIn, deleteUser};
  const messageApi = {message, createMessage, deleteMessage, messageWithLikes, likeMessage};
  const commentApi = {createComment, comment, commentWithLikes, likeComment}
  const api = {userApi, messageApi, commentApi};

  export default api;
