import z from 'zod';
import { authenticatedCall } from './call';
import parseRes from './utils/parse-res';

export async function getSumsubSessionToken(f = fetch) {
  return parseRes(
    z.object({
      accessToken: z.string(),
      kycProcessId: z.uuid(),
    }),
    await authenticatedCall(f, `/api/kyc/session`, {
      method: 'POST',
    }),
  );
}
