/**
 * Pick fields of a GQL type, and always require the __typename field.
 */
export type PickGQLF<T extends { __typename: string }, K extends keyof T | never = never> = {
  [P in K]: T[P];
} & Pick<T, '__typename'>;
