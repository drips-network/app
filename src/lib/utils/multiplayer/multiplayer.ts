import type { HttpMethod } from '@sveltejs/kit';
import { z, type ZodSchema } from 'zod';
import {
  startVotingRoundResponseSchema,
  getVotingRoundResponseSchema,
  type VotingRound,
  getVotingRoundVotesResponseSchema,
  getVotingRoundResultsResponseSchema,
  type ProjectVoteReceiver,
  type AddressVoteReceiver,
} from './schemas';
import type { ethers } from 'ethers';
import {
  CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE,
  DELETE_VOTING_ROUND_MESSAGE_TEMPLATE,
  START_VOTING_ROUND_MESSAGE_TEMPLATE,
  VOTE_MESSAGE_TEMPLATE,
} from './signature-message-templates';
import type { Items, Percentages } from '$lib/components/list-editor/list-editor.svelte';
import { readable, type Readable } from 'svelte/store';
import { onDestroy } from 'svelte';

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

  if (response.headers.get('Content-Type') === null) {
    if (!response.ok) throw new Error('Server error');
    if (responseSchema) throw new Error('Unexpected empty body');

    return;
  }

  const parsed = await response.json();

  if (!response.ok) throw new Error(parsed.error);

  if (!responseSchema) throw new Error('Missing zod schema for response');
  return responseSchema.parse(parsed);
}

export async function signVotingRound(
  signer: ethers.Signer,
  currentTime: Date,
  publisherAddress: string,
  collaborators: string[],
  dripListId?: string,
) {
  const chainId = await signer.getChainId();

  const message = dripListId
    ? START_VOTING_ROUND_MESSAGE_TEMPLATE(
        currentTime,
        chainId,
        publisherAddress,
        dripListId,
        collaborators,
      )
    : CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE(
        currentTime,
        chainId,
        publisherAddress,
        collaborators,
      );

  return signer.signMessage(message);
}

export function startVotingRound(
  config: {
    endsAt: Date;
    publisherAddress: string;
    date: Date;
    collaborators: string[];
    signature: string;
    privateVotes: boolean;
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

export async function signDeleteVotingRound(
  currentTime: Date,
  publisherAddress: string,
  votingRoundId: string,
  signer: ethers.Signer,
) {
  const chainId = await signer.getChainId();

  const message = DELETE_VOTING_ROUND_MESSAGE_TEMPLATE(
    currentTime,
    chainId,
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
    undefined,
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
      getVotingRoundResultsResponseSchema,
      undefined,
      fetch,
    )
  ).result;
}

export async function signVote(
  signer: ethers.Signer,
  currentTime: Date,
  collaboratorAddress: string,
  votingRoundId: string,
  receivers: (ProjectVoteReceiver | AddressVoteReceiver)[],
) {
  const chainId = await signer.getChainId();
  const message = VOTE_MESSAGE_TEMPLATE(
    currentTime,
    chainId,
    collaboratorAddress,
    votingRoundId,
    receivers,
  );

  return signer.signMessage(message);
}

export async function vote(
  votingRoundId: string,
  ballot: {
    signature: string;
    date: Date;
    collaboratorAddress: string;
    receivers: (ProjectVoteReceiver | AddressVoteReceiver)[];
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

export async function linkVotingRoundToDripList(
  votingRoundId: string,
  dripListId: string,
  fetch = window.fetch,
) {
  return _authenticatedCall(
    'POST',
    `/votingRounds/${votingRoundId}/link`,
    undefined,
    {
      dripListId,
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

export function mapListEditorStateToVoteReceivers(
  items: Items,
  percentages: Percentages,
): (ProjectVoteReceiver | AddressVoteReceiver)[] {
  const result: (ProjectVoteReceiver | AddressVoteReceiver)[] = [];

  for (const [key, item] of Object.entries(items)) {
    const weight = Math.floor((Number(percentages[key]) / 100) * 1000000);

    switch (item.type) {
      case 'project':
        result.push({
          // TODO: Server should work with weights instead of percentages
          weight,
          url: item.project.source.url,
          type: 'project',
        });
        break;
      case 'address':
        result.push({
          weight,
          address: item.address,
          type: 'address',
        });
        break;
      default:
        throw new Error(`Unknown item type: ${item.type}`);
    }
  }

  return result;
}

export function getVotingRoundStatusReadable(
  votingRound: VotingRound,
): Readable<VotingRound['status']> {
  if (['completed', 'linked'].includes(votingRound.status)) return readable(votingRound.status);

  let interval: NodeJS.Timeout;

  const statusReadable = readable(votingRound.status, (set) => {
    interval = setInterval(() => {
      if (new Date(votingRound.endsAt) < new Date()) {
        set('completed');
        clearInterval(interval);
      }
    }, 1000);
  });

  onDestroy(() => clearInterval(interval));

  return statusReadable;
}
