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

export async function getKycStatus(f = fetch) {
  return parseRes(
    z.object({
      hasKyc: z.boolean(),
      kycProcessId: z.string().nullable(),
      status: z
        .enum([
          'pending',
          'applicantCreated',
          'applicantPending',
          'applicantReviewed',
          'applicantOnHold',
          'applicantReset',
        ])
        .nullable(),
      reviewAnswer: z.enum(['GREEN', 'RED']).nullable(),
      canRetry: z.boolean().nullable(),
    }),
    await authenticatedCall(f, `/api/kyc/status`, {
      method: 'GET',
    }),
  );
}
