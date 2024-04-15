import type { HttpMethod } from '@sveltejs/kit';
import { z, type ZodSchema } from 'zod';
import {
  startVotingRoundResponseSchema,
  getVotingRoundResponseSchema,
  type VotingRound,
  getVotingRoundVotesResponseSchema,
  getVotingRoundResultsResponseSchema,
  type VoteReceiver,
  getCollaboratorResponseSchema,
  type ProjectVoteReceiver,
  type DripListVoteReceiver,
} from './schemas';
import type { ethers } from 'ethers';
import {
  CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE,
  DELETE_VOTING_ROUND_MESSAGE_TEMPLATE,
  REVEAL_MY_VOTE_MESSAGE_TEMPLATE,
  REVEAL_VOTES_MESSAGE_TEMPLATE,
  START_VOTING_ROUND_MESSAGE_TEMPLATE,
  VOTE_MESSAGE_TEMPLATE,
} from './signature-message-templates';
import {
  LIST_EDITOR_PROJECT_FRAGMENT,
  type Items,
  type Weights,
  LIST_EDITOR_DRIP_LIST_FRAGMENT,
} from '$lib/components/list-editor/types';
import { readable, type Readable } from 'svelte/store';
import { onDestroy } from 'svelte';
import mapFilterUndefined from '../map-filter-undefined';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type {
  DripListForVoteReceiverQuery,
  DripListForVoteReceiverQueryVariables,
  ProjectForVoteReceiverQuery,
  ProjectForVoteReceiverQueryVariables,
} from './__generated__/gql.generated';
import { getAddressDriverClient } from '../get-drips-clients';

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
    schedule: {
      voting: {
        endsAt: Date;
      };
    };
    publisherAddress: string;
    date: Date;
    collaborators: string[];
    signature: string;
    areVotesPrivate: boolean;
  } & ({ dripListId: string } | { name: string; description?: string }),
  fetch = window.fetch,
) {
  return _authenticatedCall(
    'POST',
    '/votingRounds',
    startVotingRoundResponseSchema,
    {
      ...config,
      schedule: {
        voting: {
          endsAt: config.schedule.voting.endsAt.toISOString(),
        },
      },
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

/** If votes are set to private, an admin signature is required to get votes. */
export async function signGetVotingRoundVotes(
  signer: ethers.Signer,
  currentTime: Date,
  publisherAddress: string,
  votingRoundId: string,
) {
  const chainId = await signer.getChainId();

  const message = REVEAL_VOTES_MESSAGE_TEMPLATE(
    currentTime,
    chainId,
    publisherAddress,
    votingRoundId,
  );

  return signer.signMessage(message);
}

export async function getVotingRoundVotes(
  votingRoundId: string,
  adminSignature?: { signature: string; date: Date },
  fetch = window.fetch,
) {
  return (
    await _authenticatedCall(
      'GET',
      `/votingRounds/${votingRoundId}/votes` +
        (adminSignature
          ? `?signature=${adminSignature.signature}&date=${adminSignature.date.toISOString()}`
          : ''),
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
  receivers: VoteReceiver[],
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
    receivers: VoteReceiver[];
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

export async function signGetCollaborator(
  signer: ethers.Signer,
  currentTime: Date,
  votingRoundId: string,
) {
  const chainId = await signer.getChainId();

  const message = REVEAL_MY_VOTE_MESSAGE_TEMPLATE(currentTime, chainId, votingRoundId);

  return signer.signMessage(message);
}

export async function getCollaborator(
  votingRoundId: string,
  address: string,
  collaboratorSignature?: { signature: string; date: Date },
) {
  return _authenticatedCall(
    'GET',
    `/votingRounds/${votingRoundId}/collaborators/${address}` +
      (collaboratorSignature
        ? `?signature=${
            collaboratorSignature.signature
          }&date=${collaboratorSignature.date.toISOString()}`
        : ''),
    getCollaboratorResponseSchema,
  );
}

export function matchVotingRoundToDripList(
  votingRounds: VotingRound[],
  dripListId: string,
): VotingRound | undefined {
  return votingRounds.filter((vr) => vr.dripListId === dripListId && vr.status === 'started')[0];
}

export function mapListEditorStateToVoteReceivers(items: Items, weights: Weights): VoteReceiver[] {
  const result: VoteReceiver[] = [];

  for (const [accountId, item] of Object.entries(items)) {
    const weight = weights[accountId];

    switch (item.type) {
      case 'project':
        result.push({
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
      case 'drip-list':
        result.push({
          weight,
          type: 'dripList',
          accountId,
        });
        break;
    }
  }

  return result;
}

export async function mapVoteReceiversToListEditorConfig(receivers: VoteReceiver[]) {
  const items: Items = {};
  const weights: Weights = {};

  const receiversToFetchDataFor = receivers.filter(
    (v): v is ProjectVoteReceiver | DripListVoteReceiver => {
      return 'type' in v && (v.type === 'project' || v.type === 'dripList');
    },
  );

  const receiversData = mapFilterUndefined(
    await Promise.all(
      receiversToFetchDataFor.map(async (v) => {
        const projectQuery = gql`
          ${LIST_EDITOR_PROJECT_FRAGMENT}
          query ProjectForVoteReceiver($url: String!) {
            projectByUrl(url: $url) {
              ...ListEditorProject
              ... on ClaimedProject {
                account {
                  accountId
                }
              }
              ... on UnclaimedProject {
                account {
                  accountId
                }
              }
            }
          }
        `;

        const dripListQuery = gql`
          ${LIST_EDITOR_DRIP_LIST_FRAGMENT}
          query DripListForVoteReceiver($id: ID!) {
            dripList(id: $id) {
              ...ListEditorDripList
              account {
                accountId
              }
            }
          }
        `;

        if (v.type === 'dripList') {
          return (
            await query<DripListForVoteReceiverQuery, DripListForVoteReceiverQueryVariables>(
              dripListQuery,
              {
                id: v.accountId,
              },
            )
          ).dripList;
        } else {
          return (
            await query<ProjectForVoteReceiverQuery, ProjectForVoteReceiverQueryVariables>(
              projectQuery,
              { url: v.url },
            )
          ).projectByUrl;
        }
      }),
    ),
    (v) => (v ? v : undefined),
  );

  const addressDriverClient = await getAddressDriverClient();

  for (const receiver of receivers) {
    switch (receiver.type) {
      case 'project': {
        const project = receiversData.find(
          (p): p is Extract<(typeof receiversData)[number], { __typename: 'ClaimedProject' }> =>
            p.__typename !== 'DripList' && p.source.url === receiver.url,
        );
        if (!project) throw new Error(`Project not found for url: ${receiver.url}`);

        const { accountId } = project.account;
        items[accountId] = { type: 'project', project };
        weights[accountId] = receiver.weight;
        break;
      }
      case 'address': {
        const accountId = await addressDriverClient.getAccountIdByAddress(receiver.address);

        items[accountId] = { type: 'address', address: receiver.address };
        weights[accountId] = receiver.weight;

        break;
      }
      case 'dripList': {
        const dripList = receiversData.find(
          (p): p is Extract<typeof receiversData, { __typename: 'DripList' }> =>
            p.__typename === 'DripList' && p.account.accountId === receiver.accountId,
        );
        if (!dripList) throw new Error(`DripList not found for ID: ${receiver.accountId}`);

        items[receiver.accountId] = { type: 'drip-list', dripList: dripList };
        weights[receiver.accountId] = receiver.weight;

        break;
      }
      default:
        throw new Error('Unknown receiver type');
    }
  }

  return {
    items,
    weights,
  };
}

export function getVotingRoundStatusReadable(
  votingRound: VotingRound,
): Readable<VotingRound['status']> {
  if (['completed', 'linked'].includes(votingRound.status)) return readable(votingRound.status);

  let interval: NodeJS.Timeout;

  const statusReadable = readable(votingRound.status, (set) => {
    interval = setInterval(() => {
      if (new Date(votingRound.schedule.voting.endsAt) < new Date()) {
        set('completed');
        clearInterval(interval);
      }
    }, 1000);
  });

  onDestroy(() => clearInterval(interval));

  return statusReadable;
}

export function isVotingRoundId(listId: string) {
  // If the ID is a UUID, we can assume it's a voting round ID
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(listId);
}
