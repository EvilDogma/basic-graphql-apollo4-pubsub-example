import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'http';
import express from 'express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import cors from 'cors';
import resolvers from './schema/resolvers.js';
import typeDefs from './schema/typeDefs.js';
import 'dotenv/config'
import client from './config/client.js';
import Message from './models/Message.js';
import { PubSub } from 'graphql-subscriptions';
const pubsub = new PubSub();

// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server.
const app = express();
const httpServer = createServer(app);

// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});
// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer({ schema }, wsServer);

async function startServer() {


    // Set up ApolloServer.
    const server = new ApolloServer({
      schema,
      plugins: [
        // Proper shutdown for the HTTP server.
        ApolloServerPluginDrainHttpServer({ httpServer }),
    
        // Proper shutdown for the WebSocket server.
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
      ],
    });
    await server.start();
    app.use('/graphql', cors(), express.json(), expressMiddleware(server));
    
    const PORT = 4000;
    // Now that our HTTP server is fully set up, we can listen to it.
    httpServer.listen(PORT, () => {
      console.log(`Server is now running on http://localhost:${PORT}/graphql`);
    });
}

async function delay(time){
    return new Promise(res=>setTimeout(res,time))
} 
    

async function newMessage(){
    await Message.create({
      text:'hi'
    })
    pubsub.publish('NEW_MESSAGE', { newMessage: {text:'hi'} });
    await delay(3000)
};


client.once('open', () => {
    startServer()
    .then(

        // setInterval(newMessage, 5000)


    )



  })


