import { fetchOrcid } from './fetch-orcid';

export function getClaimingUrlAddress(claimingUrl: string) {
  let claimingUrlParsed;
  try {
    claimingUrlParsed = new URL(claimingUrl);
  } catch {
    return null;
  }

  return claimingUrlParsed.searchParams.get('ethereum_owned_by') ?? '';
}

export default async function verifyOrcidClaim(orcidId: string, expectedAddress: string) {
  const orcidProfile = await fetchOrcid(orcidId, fetch);
  if (!orcidProfile) {
    throw new Error('Unable to find ORCID profile. Is it public?');
  }

  if (!orcidProfile.claimingUrl) {
    throw new Error(
      'Unable to find link. If you just added it, it may take a few moments for ORCID to process your changes, so please try again in a minute.',
    );
  }

  const urlAddress = getClaimingUrlAddress(orcidProfile.claimingUrl);
  if (urlAddress === null) {
    // TODO: refine
    throw new Error(
      'The link in your ORCID profile is invalid. Ensure that it matches http://0.0.0.0/?ethereum_owned_by={eth address}&orcid={ORCID iD}',
    );
  }

  if (urlAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
    throw new Error(
      'Expected Ethereum address not found in link. If you just edited the file, it may take a few moments for GitHub to process your changes, so please try again in a minute.',
    );
  }
}
