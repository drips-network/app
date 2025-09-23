import { GraphQLClient } from 'graphql-request';

export const gqlClient = new GraphQLClient('http://localhost:8080', {
  headers: { Authorization: `Bearer 123` },
});
