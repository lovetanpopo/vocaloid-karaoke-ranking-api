const {AuthenticationError} = require("apollo-server-errors");
const {ApolloServer, gql} = require('apollo-server');
const osmosis = require('osmosis');
require('dotenv').config();

const typeDefs = gql`
  type Info {
    title: String
    author: String
    rank: String
  }

  type Query {
    ranking(dataSource: DataSource): [Info]
  }

  enum DataSource {
    KARATETSU
    DAM
  }
`;

const settings = {
  KARATETSU: {
    url: 'https://www.karatetsu.com/vocala/pickup/ranking.php',
    find: '.pickuplist > tbody > tr',
    set: {
      title: 'td[2] > a',
      author: 'td[3] > span',
      rank: 'td[1]'
    }
  },
  DAM: {
    url: 'https://www.clubdam.com/app/dam/ranking/vocaloid-monthly.html',
    find: '.ranking-item',
    set: {
      title: '.title > p > span',
      author: '.artist > p',
      rank: '.rank > span'
    }
  }
};

const getRanking = (setting) => {
  return new Promise(resolve => {
    const results = [];
    osmosis
      .get(setting.url)
      .find(setting.find)
      .set({
        title: setting.set.title,
        author: setting.set.author,
        rank: setting.set.rank
      })
      .data(item => results.push(item))
      .done(() => resolve(results));
  })
};

const resolvers = {
  Query: {
    ranking: async (parent, args, _context, _info) =>
      await getRanking(settings[args.dataSource ? args.dataSource : 'KARATETSU'])
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => {
    if (process.env.NODE_ENV !== 'development') {
      const env = process.env.AUTHORIZATION;
      const token = req.headers.authorization || '';
      if (env !== token) throw new AuthenticationError('authentication failed');
    }
  }
});

server.listen({port: process.env.PORT || 4000}).then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
