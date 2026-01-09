import { authenticatedCall } from './call';
import { newsletterSubscriptionStatusDtoSchema, waveOwnProfileUserDataSchema } from './types/user';
import parseRes from './utils/parse-res';

export async function patchProfile(
  f = fetch,
  profileData: {
    payoutAddresses: {
      stellar: string | null;
    };
  },
) {
  return parseRes(
    waveOwnProfileUserDataSchema,
    await authenticatedCall(f, `/api/user`, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    }),
  );
}

export async function getNewsletterSubscriptionStatus(f = fetch) {
  return parseRes(
    newsletterSubscriptionStatusDtoSchema,
    await authenticatedCall(f, '/api/user/newsletter/status'),
  );
}

export async function setNewsletterSubscription(isSubscribed: boolean) {
  if (isSubscribed) {
    return authenticatedCall(undefined, '/api/user/newsletter/subscribe', {
      method: 'POST',
    });
  } else {
    return authenticatedCall(undefined, '/api/user/newsletter/unsubscribe', {
      method: 'POST',
    });
  }
}
