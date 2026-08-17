import 'dotenv/config';
import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  config: {
    nonOptionalTypename: true,
    dedupeFragments: true,
    // Codegen v7 defaults unmapped scalars (i.e. Date) to `unknown` rather than
    // `any`. Keep the old behaviour so the generated types stay compatible.
    defaultScalarType: 'any',
  },
  schema: './schema.graphql',
  generates: {
    './src/lib/graphql/__generated__/base-types.ts': {
      plugins: ['typescript'],
    },
    './src/': {
      preset: 'near-operation-file',
      documents: ['src/**/!(*.generated).{ts,graphql,svelte}'],
      presetConfig: {
        folder: '__generated__',
        extension: '.generated.ts',
        gqlTagName: 'gql',
        fileName: 'gql',
        pruneGeneratedFiles: true,
        baseTypesPath: 'lib/graphql/__generated__/base-types.ts',
      },
      plugins: ['typescript-operations'],
      config: {
        dedupeFragments: true,
        namingConvention: {
          enumValues: 'keep',
        },
        useTypeImports: true,
      },
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
};

export default config;
