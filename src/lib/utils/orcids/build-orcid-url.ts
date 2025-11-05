import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
import network from '$lib/stores/wallet/network';
import assert from '$lib/utils/assert';

const PUBLIC_ORCID_API_URL = getOptionalEnvVar(
  'PUBLIC_ORCID_API_URL',
  network.orcids,
  'PUBLIC_ORCID_API_URL is required when orcids are enabled on the current network',
);

export default function buildOrcidUrl(
  orcidId: string,
  { absolute = false, external = false }: { absolute?: boolean; external?: boolean } = {},
): string {
  if (external) {
    assert(
      PUBLIC_ORCID_API_URL,
      'PUBLIC_ORCID_API_URL is required when requesting external ORCID URLs',
    );
    const webDomain = PUBLIC_ORCID_API_URL.replace('pub.', '');
    return `${webDomain}/${orcidId}`;
  }

  let origin = '';
  if (absolute && typeof window !== 'undefined' && window) {
    origin = window.location.origin;
  }

  return `${origin}/app/orcids/${orcidId}`;
}
