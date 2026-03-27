import { authenticatedCall } from './call';
import { paginatedResponseSchema, toPaginationParams } from './types/pagination';
import {
  waveUserDetailDtoSchema,
  userCodeMetricsDtoSchema,
  userPublicOrgDtoSchema,
  phoneVerificationStatusResponseSchema,
  phoneVerificationRequiredResponseSchema,
  initiatePhoneVerificationResponseSchema,
  confirmPhoneVerificationResponseSchema,
} from './types/user';
import { getAllPaginated } from './getAllPaginated';
import parseRes from './utils/parse-res';

export async function getUser(f = fetch, userIdOrUsername: string) {
  return parseRes(
    waveUserDetailDtoSchema,
    await authenticatedCall(f, `/api/users/${userIdOrUsername}`),
    {
      expect404: true,
    },
  );
}

export async function getUserOrgs(f = fetch, userId: string) {
  return getAllPaginated(async (page, limit) =>
    parseRes(
      paginatedResponseSchema(userPublicOrgDtoSchema),
      await authenticatedCall(
        f,
        `/api/users/${userId}/orgs?${toPaginationParams({ page, limit })}`,
      ),
    ),
  );
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

export async function getPhoneVerificationRequired(f = fetch) {
  return parseRes(
    phoneVerificationRequiredResponseSchema,
    await authenticatedCall(f, `/api/phone/verification-required`),
  );
}

export async function getPhoneVerificationStatus(f = fetch) {
  return parseRes(
    phoneVerificationStatusResponseSchema,
    await authenticatedCall(f, `/api/phone/status`),
  );
}

export async function requestPhoneVerification(f = fetch, phoneNumber: string, dispatchId: string) {
  const res = await authenticatedCall(f, `/api/phone/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, dispatchId }),
  });

  if (!res.ok && res.status === 409) {
    throw new Error('This phone number is already in use on another account.');
  }

  if (!res.ok && res.status === 429) {
    throw new Error("You're doing this too much. Please try again later.");
  }

  return parseRes(initiatePhoneVerificationResponseSchema, res);
}

export async function confirmPhoneVerification(f = fetch, phoneNumber: string, code: string) {
  const res = await authenticatedCall(f, `/api/phone/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, code }),
  });

  if (!res.ok && res.status === 429) {
    throw new Error("You're doing this too much. Please try again later.");
  }

  return parseRes(confirmPhoneVerificationResponseSchema, res);
}
