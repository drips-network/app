import type { HttpMethod } from '@sveltejs/kit';
import type { ZodSchema, z } from 'zod';
import {
  getVotingRoundsResponseSchema,
  startVotingRoundResponseSchema,
  getVotingRoundResponseSchema,
} from './schemas';

async function _authenticatedCall<ST extends ZodSchema>(
  method: HttpMethod,
  path: string,
  responseSchema: ST,
  body?: Record<string, unknown>,
): Promise<z.infer<ST>> {
  const response = await fetch(`/api/multiplayer${path}`, {
    method,
    body: body && JSON.stringify(body),
  });

  return responseSchema.parse(await response.json());
}

export function startVotingRound(
  config: {
    endsAt: Date;
    publisherAddress: string;
    collaborators: string[];
  } & ({ dripListId: string } | { name: string; description?: string }),
) {
  return _authenticatedCall('POST', '/votingRounds', startVotingRoundResponseSchema, {
    ...config,
    endsAt: config.endsAt.toISOString(),
  });
}

export function getVotingRound(id: string) {
  return _authenticatedCall('GET', `/votingRounds/${id}`, getVotingRoundResponseSchema);
}

export function getVotingRounds(filter: { dripListId?: string; publisherAddress?: string }) {
  const params = new URLSearchParams(filter).toString();

  return _authenticatedCall('GET', `/votingRounds${params}`, getVotingRoundsResponseSchema);
}
