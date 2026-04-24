import { authenticatedCall } from './call';

export async function unlinkPhoneVerification(f = fetch, userId: string) {
  await authenticatedCall(f, `/api/admin/phone-verifications/${userId}`, {
    method: 'DELETE',
  });
}
