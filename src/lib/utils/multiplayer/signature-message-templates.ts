import type { AddressVoteReceiver, DripListVoteReceiver, ProjectVoteReceiver } from './schemas';

export const START_VOTING_ROUND_MESSAGE_TEMPLATE = (
  currentTime: Date,
  chainId: number,
  publisherAddress: string,
  dripListId: string,
  collaborators: string[],
) => {
  const sortedCollaborators = collaborators.sort((a, b) => Number(a) - Number(b));

  return `Create a new voting round for the Drip List with ID ${dripListId}, owned by ${publisherAddress}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}. The voters for this round are: ${JSON.stringify(
    sortedCollaborators,
  )}`;
};

export const CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE = (
  currentTime: Date,
  chainId: number,
  publisherAddress: string,
  collaborators: string[],
) => {
  const sortedCollaborators = collaborators.sort((a, b) => Number(a) - Number(b));

  return `Create a new collaborative Drip List owned by ${publisherAddress}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}. The voters for this list are: ${JSON.stringify(
    sortedCollaborators,
  )}`;
};

export const DELETE_VOTING_ROUND_MESSAGE_TEMPLATE = (
  currentTime: Date,
  chainId: number,
  publisherAddress: string,
  votingRoundId: string,
) =>
  `Delete the voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}.`;

export const VOTE_MESSAGE_TEMPLATE = (
  currentTime: Date,
  chainId: number,
  voterAddress: string,
  votingRoundId: string,
  // TODO: Real type
  receivers: (
    | Omit<ProjectVoteReceiver, 'accountId'>
    | Omit<AddressVoteReceiver, 'accountId'>
    | DripListVoteReceiver
  )[],
) => {
  const sortedReceivers = receivers
    .map((r) => {
      switch (r.type) {
        case 'project':
          return ['project', r.url, r.weight];
        case 'address':
          return ['address', r.address, r.weight];
        case 'drip-list':
          return ['drip-list', r.accountId, r.weight];
      }
    })
    .sort((a, b) => Number(a[1]) - Number(b[1]));

  return `Submit the vote for address ${voterAddress}, for the voting round with ID ${votingRoundId}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}. The receivers for this vote are: ${JSON.stringify(
    sortedReceivers,
  )}`;
};
