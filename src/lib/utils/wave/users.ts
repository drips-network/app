import { authenticatedCall } from './call';
import { waveUserDetailDtoSchema, userCodeMetricsDtoSchema } from './types/user';
import parseRes from './utils/parse-res';

export async function getUser(f = fetch, userId: string) {
  return parseRes(waveUserDetailDtoSchema, await authenticatedCall(f, `/api/users/${userId}`), {
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
