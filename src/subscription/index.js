import { PubSub } from 'apollo-server';

import * as MESSAGE_EVENTS from './message';
import * as COMMENT_EVENTS from './comment'

export const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
  COMMENT: COMMENT_EVENTS,
};

export default new PubSub();
