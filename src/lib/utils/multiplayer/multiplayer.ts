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
  addressSchema,
  projectSchema,
  dripListSchema,
  voteReceiverSchema,
  revealResultsResponseSchema,
} from './schemas';
import type { ethers } from 'ethers';
import {
  CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE,
  DELETE_VOTING_ROUND_MESSAGE_TEMPLATE,
  REVEAL_MY_VOTE_MESSAGE_TEMPLATE,
  REVEAL_RESULT_MESSAGE_TEMPLATE,
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
import mapFilterUndefined from '../map-filter-undefined';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type {
  DripListForVoteReceiverQuery,
  DripListForVoteReceiverQueryVariables,
  ProjectForVoteReceiverQuery,
  ProjectForVoteReceiverQueryVariables,
} from './__generated__/gql.generated';
import unreachable from '../unreachable';
import { executeAddressDriverReadMethod } from '../sdk/address-driver/address-driver';
import type { OxString } from '../sdk/sdk-types';
import network, { type ChainId } from '$lib/stores/wallet/network';

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

/**
 * Sign a message to start a voting round.
 * @param signer The signer to use.
 * @param currentTime The current timestamp, used to prevent replay attacks. Must match the timestamp later passed to the `startVotingRound` function.
 * @param publisherAddress The address of the publisher.
 * @param collaborators The addresses of the collaborators, which will be able to vote on the voting round later.
 * @param dripListId If voting round is for an existing Drip List, ID of that list. If not provided, returns message for creating a new collaborative list.
 * @returns The signature.
 */
export async function signVotingRound(
  signer: ethers.Signer,
  currentTime: Date,
  publisherAddress: string,
  dripListId?: string,
) {
  const chainId = Number((await signer.provider?.getNetwork())?.chainId ?? unreachable());

  const message = dripListId
    ? START_VOTING_ROUND_MESSAGE_TEMPLATE(currentTime, chainId, publisherAddress, dripListId)
    : CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE(currentTime, chainId, publisherAddress);

  return signer.signMessage(message);
}

/**
 * Start a voting round.
 * @param config The configuration for the voting round.
 * @param fetch The fetch function to use.
 * @returns The request response.
 */
export function startVotingRound(
  config: {
    schedule: {
      voting: {
        endsAt: Date;
      };
    };
    chainId: ChainId;
    publisherAddress: string;
    /** Timestamp for replay prevention. Must match timestamp in `signature`. */
    date: Date;
    collaborators: string[];
    /** Signature previously created with `signVotingRound` */
    signature: string;
    areVotesPrivate: boolean;
    allowedReceivers?: z.infer<
      typeof addressSchema | typeof projectSchema | typeof dripListSchema
    >[];
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

/**
 * Sign a message to delete a voting round.
 * @param currentTime The current timestamp, used to prevent replay attacks. Must match the timestamp later passed to the `deleteVotingRound` function.
 * @param publisherAddress The address of the publisher.
 * @param votingRoundId The ID of the voting round to delete.
 * @param signer The signer to use.
 * @returns The signature.
 */
export async function signDeleteVotingRound(
  currentTime: Date,
  publisherAddress: string,
  votingRoundId: string,
  signer: ethers.Signer,
) {
  const chainId = Number((await signer.provider?.getNetwork())?.chainId ?? unreachable());

  const message = DELETE_VOTING_ROUND_MESSAGE_TEMPLATE(
    currentTime,
    chainId,
    publisherAddress,
    votingRoundId,
  );

  return signer.signMessage(message);
}

/**
 * Delete a voting round.
 * @param signature The signature created with `signDeleteVotingRound`.
 * @param date The timestamp used to create the signature.
 * @param publisherAddress The address of the publisher.
 * @param votingRoundId The ID of the voting round to delete.
 * @param fetch The fetch function to use.
 * @returns The request response.
 */
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

/**
 * Get a voting round.
 * @param id The ID of the voting round.
 * @param fetch The fetch function to use.
 * @returns The voting round.
 */
export function getVotingRound(id: string, fetch = window.fetch) {
  return _authenticatedCall(
    'GET',
    `/votingRounds/${id}`,
    getVotingRoundResponseSchema.optional(),
    undefined,
    fetch,
  );
}

/**
 * Get voting rounds.
 * @param filter The filter to apply.
 * @param fetch The fetch function to use.
 * @returns The voting rounds.
 */
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

/**
 * Sign a message to get voting round votes. This is only needed if the votes are private. In this case, only a signature by the publisher is accepted.
 * @param signer The signer to use.
 * @param currentTime The current timestamp, used to prevent replay attacks. Must match the timestamp later passed to the `getVotingRoundVotes` function.
 * @param publisherAddress The address of the publisher.
 * @param votingRoundId The ID of the voting round.
 * @returns The signature.
 */
export async function signGetVotingRoundVotes(
  signer: ethers.Signer,
  currentTime: Date,
  publisherAddress: string,
  votingRoundId: string,
) {
  const chainId = (await signer.provider?.getNetwork())?.chainId ?? unreachable();

  const message = REVEAL_VOTES_MESSAGE_TEMPLATE(
    currentTime,
    Number(chainId),
    publisherAddress,
    votingRoundId,
  );

  return signer.signMessage(message);
}

/**
 * Get voting round votes.
 * @param votingRoundId The ID of the voting round.
 * @param adminSignature The signature created with `signGetVotingRoundVotes`.
 * @param fetch The fetch function to use.
 * @returns The votes.
 */
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

/**
 * Get voting round results, or preview of results if voting is still ongoing.
 * @param votingRoundId The ID of the voting round.
 * @param fetch The fetch function to use.
 * @returns The results.
 */
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

/**
 * Sign a message for submitting a vote. Must be signed by a collaborator for the given voting round.
 * @param signer The signer to use.
 * @param currentTime The current timestamp, used to prevent replay attacks. Must match the timestamp later passed to the `vote` function.
 * @param collaboratorAddress The address of the collaborator.
 * @param votingRoundId The ID of the voting round.
 * @param receivers The receivers of the vote.
 * @returns The signature.
 */
export async function signVote(
  signer: ethers.Signer,
  currentTime: Date,
  collaboratorAddress: string,
  votingRoundId: string,
  receivers: VoteReceiver[],
) {
  const chainId = (await signer.provider?.getNetwork())?.chainId ?? unreachable();
  const message = VOTE_MESSAGE_TEMPLATE(
    currentTime,
    Number(chainId),
    collaboratorAddress,
    votingRoundId,
    receivers,
  );

  return signer.signMessage(message);
}

/**
 * Submit a vote.
 * @param votingRoundId The ID of the voting round.
 * @param ballot The ballot to submit.
 * @param fetch The fetch function to use.
 * @returns The request response.
 */
export async function vote(
  votingRoundId: string,
  ballot: {
    /** Signature previously created with `signVote` */
    signature: string;
    /** Timestamp for replay prevention. Must match timestamp in `signature`. */
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

/**
 * Link a voting round to a Drip List.
 * @param votingRoundId The ID of the voting round.
 * @param dripListId The ID of the Drip List.
 * @param safeTransactionHash If the link transaction was NOT yet submitted, but only proposed to a safe, the hash of that safe transaction.
 * @param fetch The fetch function to use.
 * @returns The request response.
 */
export async function linkVotingRoundToDripList(
  votingRoundId: string,
  dripListId: string,
  safeTransactionHash?: string,
  fetch = window.fetch,
) {
  return _authenticatedCall(
    'POST',
    `/votingRounds/${votingRoundId}/link`,
    undefined,
    {
      dripListId,
      safeTransactionHash,
    },
    fetch,
  );
}

/**
 * Sign a message to get a collaborator. Only needed if votes are private and the collaborator wants to see their own vote.
 * @param signer The signer to use.
 * @param currentTime The current timestamp, used to prevent replay attacks. Must match the timestamp later passed to the `getCollaborator` function.
 * @param votingRoundId The ID of the voting round.
 * @returns The signature.
 */
export async function signGetCollaborator(
  signer: ethers.Signer,
  currentTime: Date,
  votingRoundId: string,
) {
  const chainId = (await signer.provider?.getNetwork())?.chainId ?? unreachable();

  const message = REVEAL_MY_VOTE_MESSAGE_TEMPLATE(currentTime, Number(chainId), votingRoundId);

  return signer.signMessage(message);
}

/**
 * Get a collaborator.
 * @param votingRoundId The ID of the voting round.
 * @param address The address of the collaborator.
 * @param collaboratorSignature The signature created with `signGetCollaborator`, only needed if votes are private and the collaborator wants to see their own vote.
 * @returns The collaborator.
 */
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

export async function signRevealResults(
  signer: ethers.Signer,
  currentTime: Date,
  publisherAddress: string,
  votingRoundId: string,
) {
  const chainId = (await signer.provider?.getNetwork())?.chainId ?? unreachable();

  const message = REVEAL_RESULT_MESSAGE_TEMPLATE(
    publisherAddress,
    votingRoundId,
    Number(chainId),
    currentTime,
  );

  return signer.signMessage(message);
}

export async function revealResults(
  votingRoundId: string,
  adminSignature?: { signature: string; date: Date },
) {
  return _authenticatedCall(
    'GET',
    `/votingRounds/${votingRoundId}/result` +
      (adminSignature
        ? `?signature=${adminSignature.signature}&date=${adminSignature.date.toISOString()}`
        : ''),
    revealResultsResponseSchema,
  );
}

/**
 * In an array of voting rounds, find the one that is associated with a given dripListId.
 * @param votingRounds The voting rounds to search in.
 * @param dripListId The ID of the Drip List.
 * @returns The voting round.
 */
export function matchVotingRoundToDripList(
  votingRounds: VotingRound[],
  dripListId: string,
): VotingRound | undefined {
  return votingRounds.filter((vr) => vr.dripListId === dripListId && vr.status === 'Started')[0];
}

/**
 * Map a list editor state to vote receivers. Needed e.g. when submitting a vote, where we take a list editor state and convert it to a list of receivers to submit.
 * @param items The items in the list editor.
 * @param weights The weights of the items.
 * @returns The vote receivers.
 */
export function mapListEditorStateToVoteReceivers(items: Items, weights: Weights): VoteReceiver[] {
  const result: VoteReceiver[] = [];

  for (const [accountId, item] of Object.entries(items)) {
    const weight = weights[accountId];

    if (weight === 0) continue;

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

/**
 * Map vote receivers to a list editor configuration. Fetches all necessary data for projects & lists. Needed e.g. when showing a list of receivers in a list editor.
 * @param receivers The vote receivers.
 * @returns The list editor configuration.
 */
export async function mapVoteReceiversToListEditorConfig(
  receivers: z.infer<
    typeof addressSchema | typeof projectSchema | typeof dripListSchema | typeof voteReceiverSchema
  >[],
) {
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
          query ProjectForVoteReceiver($url: String!, $chains: [SupportedChain!]!) {
            projectByUrl(url: $url, chains: $chains) {
              ...ListEditorProject
              account {
                accountId
              }
            }
          }
        `;

        const dripListQuery = gql`
          ${LIST_EDITOR_DRIP_LIST_FRAGMENT}
          query DripListForVoteReceiver($id: ID!, $chain: SupportedChain!) {
            dripList(id: $id, chain: $chain) {
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
                chain: network.gqlName,
              },
            )
          ).dripList;
        } else {
          return (
            await query<ProjectForVoteReceiverQuery, ProjectForVoteReceiverQueryVariables>(
              projectQuery,
              { url: v.url, chains: [network.gqlName] },
            )
          ).projectByUrl;
        }
      }),
    ),
    (v) => (v ? v : undefined),
  );

  for (const receiver of receivers) {
    switch (receiver.type) {
      case 'project': {
        const project = receiversData.find(
          (p): p is Extract<(typeof receiversData)[number], { __typename: 'Project' }> =>
            p.__typename !== 'DripList' && p.source.url === receiver.url,
        );
        if (!project) throw new Error(`Project not found for url: ${receiver.url}`);

        const { accountId } = project.account;
        items[accountId] = { type: 'project', project };
        weights[accountId] = 'weight' in receiver ? receiver.weight : 0;
        break;
      }
      case 'address': {
        const accountId = (
          await executeAddressDriverReadMethod({
            functionName: 'calcAccountId',
            args: [receiver.address as OxString],
          })
        ).toString();

        items[accountId] = { type: 'address', address: receiver.address };
        weights[accountId] = 'weight' in receiver ? receiver.weight : 0;

        break;
      }
      case 'dripList': {
        const dripList = receiversData.find(
          (p): p is Extract<typeof receiversData, { __typename: 'DripList' }> =>
            p.__typename === 'DripList' && p.account.accountId === receiver.accountId,
        );
        if (!dripList) throw new Error(`DripList not found for ID: ${receiver.accountId}`);

        items[receiver.accountId] = { type: 'drip-list', dripList: dripList };
        weights[receiver.accountId] = 'weight' in receiver ? receiver.weight : 0;

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

/**
 * Check if a given string is a Voting Round ID.
 * Drip Lists use numeric strings, while Voting Rounds use UUIDs.
 * Since those are the only two options, we can safely assume that if the string is a UUID, it's a Voting Round ID.
 * @param listId The list ID.
 * @returns Whether the ID is a voting round ID.
 */
export function isVotingRoundId(listId: string) {
  // If the ID is a UUID, we can assume it's a voting round ID
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(listId);
}
