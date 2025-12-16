import { authenticatedCall } from './call';
import { waveUserDtoSchema } from './types/user';
import parseRes from './utils/parse-res';

export default async function getUser(f = fetch, userId: string) {
  return parseRes(waveUserDtoSchema, await authenticatedCall(f, `/api/users/${userId}`), {
    expect404: true,
  });
}
