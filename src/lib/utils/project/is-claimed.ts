import type { Project } from "$lib/graphql/__generated__/base-types"
import type { PickGQLF } from "$lib/graphql/utils/pick-gql-fields"

export default function isClaimed<T extends PickGQLF<Project>>(project: T): project is Extract<T, { __typename: 'ClaimedProject' }> {
  return project.__typename === 'ClaimedProject'
}
