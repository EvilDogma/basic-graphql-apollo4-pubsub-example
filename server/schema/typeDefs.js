
const typeDefs = `#graphql
type Message {
    text: String
  }

type Query {
    messages: [Message]
  }

type Mutation {
    sendMessage(text: String!): Message!
}

type Subscription {
    newMessage: Message
  }

`

export default typeDefs