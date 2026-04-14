import z from 'zod';
import { authenticatedCall } from './call';
import { stellarMemoTypeSchema } from './types/grant';
import parseRes from './utils/parse-res';

const kybStatusSchema = z.object({
  hasKyb: z.boolean(),
  authorized: z.boolean(),
  stellarAddress: z.string().nullable(),
  memoType: stellarMemoTypeSchema.nullable(),
  memoValue: z.string().nullable(),
});

export type KybStatus = z.infer<typeof kybStatusSchema>;

export async function getKybStatus(f = fetch, orgId: string) {
  return parseRes(kybStatusSchema, await authenticatedCall(f, `/api/orgs/${orgId}/kyb`));
}
