import type { HttpMethod } from '@sveltejs/kit';
import { z, type ZodSchema } from 'zod';
import {
  startVotingRoundResponseSchema,
  getVotingRoundResponseSchema,
  type VotingRound,
  getVotingRoundVotesResponseSchema,
} from './schemas';
import type { ethers } from 'ethers';
import {
  CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE,
  DELETE_VOTING_ROUND_MESSAGE_TEMPLATE,
  START_VOTING_ROUND_MESSAGE_TEMPLATE,
  VOTE_MESSAGE_TEMPLATE,
} from './signature-message-templates';
import type { Items, Percentages } from '$lib/components/list-editor/list-editor.svelte';
import { getAddressDriverClient, getRepoDriverClient } from '../get-drips-clients';

async function _authenticatedCall<ST extends ZodSchema>(
  method: HttpMethod,
  path: string,
  responseSchema: ST | undefined,
  body?: Record<string, unknown>,
  fetch = window.fetch,
): Promise<z.infer<ST>> {
  const response = await fetch(`/api/multiplayer${path}`, {
    method,
    body: body && JSON.stringify(body),
  });

  if (response.body === null) {
    if (!response.ok) throw new Error('Server error');
    if (responseSchema) throw new Error('Unexpected empty body');

    return;
  }

  const parsed = await response.json();

  if (!response.ok) throw new Error(parsed.error);

  if (!responseSchema) throw new Error('Missing zod schema for response');
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

export async function getVotingRoundVotes(votingRoundId: string, fetch = window.fetch) {
  return (
    await _authenticatedCall(
      'GET',
      `/votingRounds/${votingRoundId}/votes`,
      getVotingRoundVotesResponseSchema,
      undefined,
      fetch,
    )
  ).votes;
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

type ProjectReceiver = {
  weight: number;
  url: string;
  accountId: string;
  type: 'project';
};

type AddressReceiver = {
  weight: number;
  address: string;
  accountId: string;
  type: 'address';
};

export function signVote(
  signer: ethers.Signer,
  currentTime: Date,
  collaboratorAddress: string,
  votingRoundId: string,
  receivers: (ProjectReceiver | AddressReceiver)[],
) {
  const message = VOTE_MESSAGE_TEMPLATE(currentTime, collaboratorAddress, votingRoundId, receivers);

  return signer.signMessage(message);
}

export async function vote(
  votingRoundId: string,
  ballot: {
    signature: string;
    date: Date;
    collaboratorAddress: string;
    receivers: (
      | {
          weight: number;
          url: string;
          accountId: string;
          type: 'project';
        }
      | {
          weight: number;
          address: string;
          type: 'address';
        }
    )[];
  },
  fetch = window.fetch,
) {
  return _authenticatedCall(
    'POST',
    `/votingRounds/${votingRoundId}/votes`,
    undefined,
    {
      ...ballot,
      date: ballot.date.toISOString(),
    },
    fetch,
  );
}

export function matchVotingRoundToDripList(
  votingRounds: VotingRound[],
  dripListId: string,
): VotingRound | undefined {
  return votingRounds.filter((vr) => vr.dripListId === dripListId && vr.status === 'started')[0];
}

export async function mapListEditorStateToVoteReceivers(
  items: Items,
  percentages: Percentages,
): Promise<(ProjectReceiver | AddressReceiver)[]> {
  const repoDriverClient = await getRepoDriverClient();
  const addressDriverClient = await getAddressDriverClient();

  const result: (ProjectReceiver | AddressReceiver)[] = [];

  for (const [key, item] of Object.entries(items)) {
    const percentage = percentages[key];

    switch (item.type) {
      case 'project':
        result.push({
          // TODO: Server should work with weights instead of percentages
          weight: percentage,
          url: item.project.source.url,
          // TODO: Server should calculate the ID.
          accountId: await repoDriverClient.getAccountId(
            1,
            `${item.project.source.ownerName}/${item.project.source.repoName}`,
          ),
          type: 'project',
        });
        break;
      case 'address':
        result.push({
          weight: percentage,
          address: item.address,
          accountId: await addressDriverClient.getAccountIdByAddress(item.address),
          type: 'address',
        });
        break;
      default:
        throw new Error(`Unknown item type: ${item.type}`);
    }
  }

  return result;
}
