import { redeemDiscordLink } from '$lib/utils/wave/discord';

class LinkingError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = 'LinkingError';
  }
}

export default async function performLinking(url: URL) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  if (errorParam === 'access_denied') {
    throw new LinkingError('Discord authorization was cancelled.', 'cancelled');
  }

  if (!code || !state) {
    throw new LinkingError('Missing code or state in callback URL', 'invalid');
  }

  try {
    const { linkedAccount } = await redeemDiscordLink(code, state);
    return { linkedAccount };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);

    if (
      errorMessage.includes('409') ||
      errorMessage.includes('already linked to another Wave account')
    ) {
      throw new LinkingError(
        'This Discord account is already linked to a different Drips Wave account.',
        'conflict',
      );
    }

    if (errorMessage.includes('400')) {
      throw new LinkingError('The link request expired. Please try again.', 'expired');
    }

    throw new LinkingError('Failed to link Discord. Please try again.', 'default');
  }
}
