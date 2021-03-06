import 'dotenv/config';
import express from 'express';
import { ApolloServer, gql,
  AuthenticationError } from 'apollo-server-express';
import cors from 'cors';
import uuidv4 from 'uuid/v4';
import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';
import jwt from 'jsonwebtoken';
import http from 'http';
import DataLoader from 'dataloader';
import loaders from './loaders';



const app = express();

app.use(cors());

const port = process.env.PORT || 8000;
const eraseDatabaseOnSync = true;
const isTest = !!process.env.TEST_DATABASE;
const isProduction = !!process.env.DATABASE_URL;

const getMe = async req => {
  const token = req.headers['x-token'];
  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (e) {
      throw new AuthenticationError(
        'Your session expired. Sign in again.',
      );
    }
  }
};



const server = new ApolloServer({
  introspection: true,
  playground: true,
  typeDefs: schema,
  resolvers,
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');
      return {
        ...error,
        message,
      };
    },
  context: async ({req, connection}) => {
    if(connection) {
      return {
        models,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
        }
      };
    }

    if(req) {
      const me = await getMe(req);
      return {
        models,
        me,
        secret: process.env.SECRET,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
        },
      };
    }
  },
});

server.applyMiddleware({app, path: '/graphql'});

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

sequelize.sync({ force: isTest }).then(async () =>
{
  if (isTest) {
    createUsersWithMessages(new Date());
  }

  httpServer.listen({ port }, ()=> {
    console.log('Apollo Server on http://localhost:8000/graphql');
  });
});

const createUsersWithMessages = async date =>
{
  await models.User.create(
    {
      username: 'rwieruch',
      email: 'hello@robin.com',
      password: 'rwieruch',
      role: 'ADMIN',
      messages: [
        {
          text: 'Published the Road to learn React',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [models.Message],
    },
  );

  await models.User.create(
    {
      username: 'ddavids',
      email: 'hello@david.com',
      password: 'ddavids',
      messages: [
        {
          text: 'Happy to release ...',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
        {
          text: 'Published a complete ...',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [models.Message],
    },
  );
};


console.log('Hello Project Node.js project.');
console.log(process.env.MY_SECRET);
