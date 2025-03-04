import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Manually hardcoded short URL redirects for campaigns.
// We want to move to a dynamic ENS-based solution long-term
const SHORT_URLS: Record<string, string> = {
  privacyproof24:
    'https://optimism.drips.network/app/drip-lists/46441013481627019632859175771245733399752255312769848791334977723541',
};

export const load: PageLoad = ({ params }) => {
  if (params.path in SHORT_URLS) {
    return redirect(301, SHORT_URLS[params.path]);
  }

  redirect(308, `/app/${params.path}`);
};
