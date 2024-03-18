import type { HttpMethod } from '@sveltejs/kit';
import { z, type ZodSchema } from 'zod';
import {
  startVotingRoundResponseSchema,
  getVotingRoundResponseSchema,
  type VotingRound,
} from './schemas';
import type { ethers } from 'ethers';
import {
  CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE,
  DELETE_VOTING_ROUND_MESSAGE_TEMPLATE,
  START_VOTING_ROUND_MESSAGE_TEMPLATE,
} from './signature-message-templates';

async function _authenticatedCall<ST extends ZodSchema>(
  method: HttpMethod,
  path: string,
  responseSchema: ST,
  body?: Record<string, unknown>,
  fetch = window.fetch,
): Promise<z.infer<ST>> {
  const response = await fetch(`/api/multiplayer${path}`, {
    method,
    body: body && JSON.stringify(body),
  });

  const parsed = await response.json();

  if (!response.ok) throw new Error(parsed.error);

  return responseSchema.parse(parsed);
}

export function signVotingRound(
  signer: ethers.Signer,
  currentTime: Date,
  publisherAddress: string,
  collaborators: string[],
  dripListId?: string,
) {
  const message = dripListId
    ? START_VOTING_ROUND_MESSAGE_TEMPLATE(currentTime, publisherAddress, dripListId, collaborators)
    : CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE(currentTime, publisherAddress, collaborators);

  return signer.signMessage(message);
}

export function startVotingRound(
  config: {
    endsAt: Date;
    publisherAddress: string;
    date: Date;
    collaborators: string[];
    signature: string;
    isPrivate: boolean;
  } & ({ dripListId: string } | { name: string; description?: string }),
  fetch = window.fetch,
) {
  return _authenticatedCall(
    'POST',
    '/votingRounds',
    startVotingRoundResponseSchema,
    {
      ...config,
      endsAt: config.endsAt.toISOString(),
      date: config.date.toISOString(),
    },
    fetch,
  );
}

export function signDeleteVotingRound(
  currentTime: Date,
  publisherAddress: string,
  votingRoundId: string,
  signer: ethers.Signer,
) {
  const message = DELETE_VOTING_ROUND_MESSAGE_TEMPLATE(
    currentTime,
    publisherAddress,
    votingRoundId,
  );

  return signer.signMessage(message);
}

export function deleteVotingRound(
  signature: string,
  date: Date,
  publisherAddress: string,
  votingRoundId: string,
) {
  return _authenticatedCall(
    'DELETE',
    `/votingRounds/${votingRoundId}`,
    z.any(),
    {
      signature,
      date: date.toISOString(),
      publisherAddress,
    },
    fetch,
  );
}

export function getVotingRound(id: string, fetch = window.fetch) {
  return _authenticatedCall(
    'GET',
    `/votingRounds/${id}`,
    getVotingRoundResponseSchema.optional(),
    undefined,
    fetch,
  );
}

export async function getVotingRounds(
  filter: { dripListId?: string; publisherAddress?: string },
  fetch = window.fetch,
) {
  const params = new URLSearchParams(filter).toString();

  return (
    await _authenticatedCall(
      'GET',
      `/votingRounds?${params}`,
      z.object({ votingRounds: z.array(getVotingRoundResponseSchema) }),
      undefined,
      fetch,
    )
  ).votingRounds;
}

export function getVotingRoundVotes(votingRoundId: string, fetch = window.fetch) {
  return _authenticatedCall(
    'GET',
    `/votingRounds/${votingRoundId}/votes`,
    z.any(),
    undefined,
    fetch,
  );
}

export async function getVotingRoundResult(votingRoundId: string, fetch = window.fetch) {
  return (
    await _authenticatedCall(
      'GET',
      `/votingRounds/${votingRoundId}/result`,
      z.object({ result: z.array(z.any()) }),
      undefined,
      fetch,
    )
  ).result;
}

export function matchVotingRoundToDripList(
  votingRounds: VotingRound[],
  dripListId: string,
): VotingRound | undefined {
  return votingRounds.filter((vr) => vr.dripListId === dripListId && vr.status === 'started')[0];
}
