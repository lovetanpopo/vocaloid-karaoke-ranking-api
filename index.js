import { AuthenticationError } from 'apollo-server-errors';
import { ApolloServer, gql } from 'apollo-server-express';
import got from 'got';
import cheerio from "cheerio";
import express from "express";
import dotenv from 'dotenv';
dotenv.config();

/*
curl --request POST \
    --header 'Authorization: hogehoge' \
    --header 'content-type: application/json' \
    --url http://localhost:4000/graphql \
    --data '{"query":"query ranking {\n  ranking {\n    author\n    title\n    rank\n  }\n}"}'
 */


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
  return new Promise(async resolve => {
    const results = [];
    const response = await got('https://www.karatetsu.com/vocala/pickup/ranking.php');
    const $ = cheerio.load(response.body);
    $('.pickuplist > tbody > tr').each(
      (i, elem) => {
        const td = $(elem).find('td');
        results.push({
          rank: td[0].children[0].data,
          title: $(td[1]).find('a')[0].children[0].data,
          author: $(td[2]).find('span')[0].children[0].data
        });
      }
    );
    resolve(results);
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