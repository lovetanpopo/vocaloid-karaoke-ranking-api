const { AuthenticationError } = require('apollo-server-errors');
const { ApolloServer, gql } = require('apollo-server-express');
const osmosis = require('osmosis');
const express = require("express");
require('dotenv').config();

(async function() {

const typeDefs = gql`
  type Info {
    title: String
    author: String
    rank: String
  }

  type Query {
    ranking: [Info]
  }
`;

const getKaratetsuRanking = () => {
  return new Promise(resolve => {
    const results = [];
    osmosis
      .get('https://www.karatetsu.com/vocala/pickup/ranking.php')
      .find('.pickuplist > tbody > tr')
      .set({
        title: 'td[2] > a',
        author: 'td[3] > span',
        rank: 'td[1]'
      })
      .data(item => results.push(item))
      .done(() => resolve(results));
  })
};

const resolvers = {
  Query: {
    ranking: async () => await getKaratetsuRanking()
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const env = process.env.AUTHORIZATION;
    const token = req.headers.authorization || '';
    if (env !== token) throw new AuthenticationError('authentication failed');
  }
});

const app = express();
await server.start();
server.applyMiddleware({ app });

app.listen({ port: process.env.PORT || 4000 }, () => {
  console.log(`🚀  Server ready at ${server.graphqlPath}`);
  console.log(process.env);
});

})();