import type { OrcidLinkedIdentity } from '$lib/graphql/__generated__/base-types';

export default function isClaimed(
  orcidAccount: Pick<OrcidLinkedIdentity, 'isClaimed' | 'areSplitsValid'>,
) {
  return orcidAccount.isClaimed && orcidAccount.areSplitsValid;
}
