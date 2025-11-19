import network from '$lib/stores/wallet/network';
import { fetchOrcid } from './fetch-orcid';

export function getNetworkLinkName() {
  return encodeURIComponent(network.name);
}

export function getClaimingUrlAddress(claimingUrl: string) {
  let claimingUrlParsed;
  try {
    claimingUrlParsed = new URL(claimingUrl);
  } catch {
    return null;
  }

  return claimingUrlParsed.searchParams.get(getNetworkLinkName()) ?? '';
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
    throw new Error(
      `The link in your ORCID profile is invalid. Ensure that it matches http://0.0.0.0/?${getNetworkLinkName()}={${network.label} address}&orcid={ORCID iD}`,
    );
  }

  if (urlAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
    throw new Error(
      `Expected ${network.label} address not found in link. If you just edited the file, it may take a few moments for GitHub to process your changes, so please try again in a minute.`,
    );
  }
}
