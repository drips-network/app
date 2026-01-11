import 'dotenv/config';
import type { CodegenConfig } from '@graphql-codegen/cli';

if (!process.env.PUBLIC_GQL_URL) {
  throw new Error(
    `In order to build GraphQL types, you must provide PUBLIC_GQL_URL environment variable.
     Default values are included in .env.template.`,
  );
}

const config: CodegenConfig = {
  schema: [
    {
      [process.env.PUBLIC_GQL_URL]: {},
    },
  ],
  generates: {
    './schema.graphql': {
      plugins: ['schema-ast'],
    },
  },
};

export default config;
