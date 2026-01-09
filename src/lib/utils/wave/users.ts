import { authenticatedCall } from './call';
import { waveUserDtoSchema, userCodeMetricsDtoSchema } from './types/user';
import parseRes from './utils/parse-res';

export async function getUser(f = fetch, userId: string) {
  return parseRes(waveUserDtoSchema, await authenticatedCall(f, `/api/users/${userId}`), {
    expect404: true,
  });
}

export async function getUserCodeMetrics(f = fetch, userId: string) {
  return parseRes(
    userCodeMetricsDtoSchema,
    await authenticatedCall(f, `/api/users/${userId}/code-metrics`),
    {
      expect404: true,
    },
  );
}
