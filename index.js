const { ApolloServer, gql } = require('apollo-server');

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

const sample = [
  {
    title: 'シャルル',
    author: 'バルーン',
    rank: '1位'
  },
  {
    title: 'ロキ',
    author: 'みきとP',
    rank: '2位'
  }
];

const resolvers = {
  Query: {
    ranking: () => sample,
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
