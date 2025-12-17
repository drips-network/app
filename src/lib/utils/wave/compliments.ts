import z from 'zod';
import { authenticatedCall } from './call';
import { issueComplimentDtoSchema, type ComplimentType } from './types/compliment';
import parseRes from './utils/parse-res';

export async function makeCompliment(
  f = fetch,
  waveProgramId: string,
  issueId: string,
  compliments: {
    type: ComplimentType;
  }[],
) {
  return authenticatedCall(f, `/api/wave-programs/${waveProgramId}/compliments`, {
    method: 'POST',
    body: JSON.stringify(
      compliments.map((v) => ({
        issueId,
        complimentType: v.type,
      })),
    ),
  });
}

export async function getComplimentsForIssue(f = fetch, waveProgramId: string, issueId: string) {
  return parseRes(
    z.object({
      compliments: z.array(issueComplimentDtoSchema),
    }),
    await authenticatedCall(
      f,
      `/api/wave-programs/${waveProgramId}/issues/${issueId}/compliments`,
      {
        method: 'GET',
      },
    ),
  );
}
