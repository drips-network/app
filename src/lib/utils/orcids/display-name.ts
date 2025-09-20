import type { OrcidNameFragment } from '../../../routes/(pages)/app/(app)/orcids/[orcidId]/components/__generated__/gql.generated';

export default function getOrcidDisplayName(orcidAccount: OrcidNameFragment) {
  const firstName = orcidAccount.orcidMetadata?.givenName ?? '';
  const lastName = orcidAccount.orcidMetadata?.familyName ?? '';

  const fullName = `${firstName} ${lastName}`;
  return !fullName.trim() ? orcidAccount.orcid : fullName;
}
