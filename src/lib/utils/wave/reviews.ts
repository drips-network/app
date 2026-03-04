import z from 'zod';
import { authenticatedCall } from './call';
import { reviewDtoSchema, type ReviewDto, type ReviewPayload } from './types/review';
import parseRes from './utils/parse-res';

export async function submitReview(
  f = fetch,
  waveProgramId: string,
  issueId: string,
  payload: ReviewPayload,
) {
  return authenticatedCall(f, `/api/wave-programs/${waveProgramId}/issues/${issueId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getReview(
  f = fetch,
  waveProgramId: string,
  issueId: string,
): Promise<ReviewDto | null> {
  const res = await parseRes(
    z.object({ review: reviewDtoSchema.nullable() }),
    await authenticatedCall(f, `/api/wave-programs/${waveProgramId}/issues/${issueId}/reviews`, {
      method: 'GET',
    }),
  );

  return res.review;
}
