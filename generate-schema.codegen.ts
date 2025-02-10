import 'dotenv/config';
import type { CodegenConfig } from '@graphql-codegen/cli';

if (!(process.env.GQL_URL || process.env.CODEGEN_GQL_URL) || !process.env.GQL_ACCESS_TOKEN) {
  throw new Error(
    `In order to build GraphQL types, you must provide GQL_URL and GQL_ACCESS_TOKEN env vars for the Drips GraphQL API.
     Default values are included in .env.template.`,
  );
}

const config: CodegenConfig = {
  schema: [
    {
      [process.env.CODEGEN_GQL_URL ?? process.env.GQL_URL]: {
        headers: {
          Authorization: `Bearer ${process.env.GQL_ACCESS_TOKEN}`,
        },
      },
    },
  ],
  generates: {
    './schema.graphql': {
      plugins: ['schema-ast'],
    },
  },
};

export default config;
