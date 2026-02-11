import { authenticatedCall } from './call';
import {
  paginatedResponseSchema,
  toPaginationParams,
  type PaginationInput,
} from './types/pagination';
import { grantDetailDtoSchema, grantDtoSchema, type StellarMemoType } from './types/grant';
import parseRes from './utils/parse-res';

export async function getGrants(f = fetch, pagination?: PaginationInput) {
  return parseRes(
    paginatedResponseSchema(grantDtoSchema),
    await authenticatedCall(f, `/api/grants?${toPaginationParams(pagination)}`),
  );
}

export async function getGrant(f = fetch, grantId: string) {
  return parseRes(grantDetailDtoSchema, await authenticatedCall(f, `/api/grants/${grantId}`), {
    expect404: true,
  });
}

export async function requestTestTransaction(
  f = fetch,
  grantId: string,
  stellarAddress: string,
  memoType?: StellarMemoType,
  memoValue?: string,
) {
  return await authenticatedCall(f, `/api/grants/${grantId}/test-transaction`, {
    method: 'POST',
    body: JSON.stringify({
      stellarAddress,
      ...(memoType && memoValue ? { memoType, memoValue } : {}),
    }),
  });
}

export async function requestWithdrawal(
  f = fetch,
  grantId: string,
  stellarAddress: string,
  memoType?: StellarMemoType,
  memoValue?: string,
) {
  return await authenticatedCall(f, `/api/grants/${grantId}/withdraw`, {
    method: 'POST',
    body: JSON.stringify({
      stellarAddress,
      ...(memoType && memoValue ? { memoType, memoValue } : {}),
    }),
  });
}
