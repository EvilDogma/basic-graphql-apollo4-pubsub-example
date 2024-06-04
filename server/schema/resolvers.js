import  Message  from '../models/Message.js'
import 'dotenv/config'

import { PubSub } from 'graphql-subscriptions';
const pubsub = new PubSub();
// import {MongoClient} from 'mongodb'
// const mongo = new MongoClient(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`)
// import client from '../config/client.js';
// import { MongodbPubSub } from 'graphql-mongodb-subscriptions';

// const pubsub = new MongodbPubSub(mongo.db);

const resolvers = {
    Query: {
        messages: () => Message.find().exec()
    },
    Mutation: {
        sendMessage: async (_, {text}) => {
            const message = new Message({ text });
            // setTimeout(()=>{ pubsub.publish('NEW_MESSAGE', { newMessage: {text} })},3000)
            pubsub.publish('NEW_MESSAGE', { newMessage: {text} });
            await message.save();
            return message;
        },
    },
    Subscription: {
        newMessage: {
          // More on pubsub below
          subscribe: () => pubsub.asyncIterator(['NEW_MESSAGE']),
        },
      }

}

export default resolvers