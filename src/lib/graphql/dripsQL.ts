import { GraphQLClient, type RequestDocument, type Variables } from 'graphql-request';

const client = new GraphQLClient('https://drips-api.ey.r.appspot.com/');

export default async function query<TResponse, TVariables extends Variables = Variables>(
  query: RequestDocument,
  variables?: TVariables,
): Promise<TResponse> {
  const data = await client.request<TResponse>(query, variables);

  return data;
}
