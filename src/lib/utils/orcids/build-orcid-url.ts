import { PUBLIC_ORCID_API_URL } from '$env/static/public';

export default function buildOrcidUrl(
  orcidId: string,
  { absolute = false, external = false }: { absolute?: boolean; external?: boolean } = {},
): string {
  if (external) {
    const webDomain = PUBLIC_ORCID_API_URL.replace('pub.', '');
    return `${webDomain}/${orcidId}`;
  }

  let origin = '';
  if (absolute && typeof window !== 'undefined' && window) {
    origin = window.location.origin;
  }

  return `${origin}/app/orcids/${orcidId}`;
}
