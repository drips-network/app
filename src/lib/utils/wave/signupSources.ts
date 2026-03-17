import z from 'zod';
import { authenticatedCall } from './call';
import parseRes from './utils/parse-res';
import {
  paginatedResponseSchema,
  type PaginationInput,
  toPaginationParams,
} from './types/pagination';

export const signupSourceSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  signupCount: z.number().int(),
  createdBy: z.object({
    id: z.string(),
    gitHubUsername: z.string(),
  }),
  createdAt: z.coerce.date(),
  deactivatedAt: z.coerce.date().nullable(),
});

export type SignupSource = z.infer<typeof signupSourceSchema>;

export async function listSignupSources(
  f = fetch,
  pagination?: PaginationInput,
  includeDeactivated = false,
) {
  const params = new URLSearchParams(toPaginationParams(pagination));

  if (includeDeactivated) {
    params.append('includeDeactivated', 'true');
  }

  const queryString = params.toString();
  const path = `/api/admin/signup-sources${queryString ? `?${queryString}` : ''}`;

  const res = await authenticatedCall(f, path);

  return parseRes(paginatedResponseSchema(signupSourceSchema), res);
}

export async function createSignupSource(f = fetch, data: { code: string; name: string }) {
  await authenticatedCall(f, '/api/admin/signup-sources', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
