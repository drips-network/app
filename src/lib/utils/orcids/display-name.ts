type orcidWithMetadata = {
  orcid: string;
  orcidMetadata?: {
    givenName?: string | null;
    familyName?: string | null;
  } | null;
};

export default function getOrcidDisplayName(orcidAccount: orcidWithMetadata) {
  const firstName = orcidAccount.orcidMetadata?.givenName ?? '';
  const lastName = orcidAccount.orcidMetadata?.familyName ?? '';

  const fullName = `${firstName} ${lastName}`;
  return !fullName.trim() ? orcidAccount.orcid : fullName;
}
