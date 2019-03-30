const { GraphQLServer } = require('graphql-yoga')

const typeDefs = `
  interface Character {
    name: String
  }

  type Droid implements Character {
    name: String
    primaryFunction: String
  }

  type Human implements Character {
    name: String
    height: Float
  }

  type Query {
    characters: [Character]
  }
`

const resolvers = {
  Query: {
    characters: () => {
      return [
        {
          primaryFunction: `Astromech`,
        },
        {
          height: `1.8`,
        },
      ];
    },
  },
  Character: {
    __resolveType: obj => obj.primaryFunction ? 'Droid' : 'Human',
  },
}

const server = new GraphQLServer({ typeDefs, resolvers })
server.start(() => console.log(`Server is running at http://localhost:4000`))
