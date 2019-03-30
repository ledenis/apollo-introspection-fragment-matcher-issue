import { ApolloClient } from 'apollo-client';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import gql from 'graphql-tag';
import fetch from 'node-fetch';

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    __schema: {
      types: [],
      // types: [{
      //   kind: 'INTERFACE',
      //   name: 'Character',
      //   possibleTypes: [
      //     { name: 'Droid' },
      //     { name: 'Human' },
      //   ],
      // }],
    },
  },
});

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    new HttpLink({
      uri: 'http://localhost:4000',
      fetch: fetch as any,
    })
  ]),
  cache: new InMemoryCache({ fragmentMatcher }),
});

const querySimple = gql`
  query {
    characters {
      __typename
      ... on Droid {
        primaryFunction
      }
      ... on Human {
        height
      }
    }
  } 
`;

const queryWithCharacterFieldsFragment = gql`
  fragment characterFields on Character {
    ... on Droid {
      primaryFunction
    }
    ... on Human {
      height
    }
  }

  query {
    characters {
      __typename
      ...characterFields
    }
  }
`;

client.query({
  // 1. OK:
  // query: querySimple,
  // 2. KO: Missing fields `primaryFunction` and `height` if `types` is empty:
  query: queryWithCharacterFieldsFragment,
})
.then(result => console.log('Result:', JSON.stringify(result, null, 2)))
.catch(error => console.error('Error:', error));
