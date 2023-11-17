import 'dotenv/config';
import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  "overwrite": true,
  "config": {
    "nonOptionalTypename": true,
    "dedupeFragments": true,

  },
  "schema": [
    {
      [process.env.GQL_URL]: {
        "headers": {
          "Authorization": `Bearer ${process.env.GQL_ACCESS_TOKEN}`
        }
      }
    }
  ],
  "generates": {
    "./src/lib/graphql/__generated__/base-types.ts": {
      "plugins": [
        "typescript"
      ]
    },
    "./src/": {
      "preset": "near-operation-file",
      "documents": [
        "src/**/!(*.generated).{ts,graphql,svelte}"
      ],
      "presetConfig": {
        "folder": "__generated__",
        "extension": ".generated.ts",
        "gqlTagName": "gql",
        "fileName": "gql",
        "pruneGeneratedFiles": true,
        "baseTypesPath": "lib/graphql/__generated__/base-types.ts",
      },
      "plugins": [
        "typescript-operations"
      ],
      "config": {
        "dedupeFragments": true,
        "namingConvention": {
          "enumValues": "keep"
        },
        "useTypeImports": true
      }
    }
  },
  "hooks": {
    "afterAllFileWrite": [
      "prettier --write"
    ]
  }
}
 
export default config;
