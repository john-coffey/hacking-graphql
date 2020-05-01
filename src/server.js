const { ApolloServer, gql } = require('apollo-server');
const { Client } = require('@elastic/elasticsearch');
import GraphQLJSON from 'graphql-type-json';

import resolvers from './resolvers';
import typeDefs from './schema';

const esHost = process.env.ESHOST || 'http://localhost:9200';
const esUser = process.env.ESUSER || 'elastic';
const esPassword = process.env.ESPASSWORD || 'changeme';

const client = new Client({
  node: esHost,
  auth: {
    username: esUser,
    password: esPassword,
  },
})

const resolveFunctions = {
  JSON: GraphQLJSON,
  ...resolvers,
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers: resolveFunctions,
  context: async () => ({
    es: client,
  })
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
