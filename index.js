const { ApolloServer, gql } = require('apollo-server');
const osmosis = require('osmosis');

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

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
