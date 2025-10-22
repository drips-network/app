import type { OrcidLinkedIdentity } from '$lib/graphql/__generated__/base-types';

export default function getOrcidDisplayName(
  orcidAccount: Pick<OrcidLinkedIdentity, 'orcid'> & {
    orcidMetadata?: Omit<NonNullable<OrcidLinkedIdentity['orcidMetadata']>, '__typename'> | null;
  },
) {
  const firstName = orcidAccount.orcidMetadata?.givenName ?? '';
  const lastName = orcidAccount.orcidMetadata?.familyName ?? '';

  const fullName = `${firstName} ${lastName}`;
  return !fullName.trim() ? orcidAccount.orcid : fullName;
}
