import { authenticatedCall } from './call';
import { waveOwnProfileUserDataSchema } from './types/user';
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
