import type { VoteReceiver } from './schemas';

export const START_VOTING_ROUND_MESSAGE_TEMPLATE = (
  currentTime: Date,
  chainId: number,
  publisherAddress: string,
  dripListId: string,
) => {
  return `Create a new voting round for the Drip List with ID ${dripListId}, owned by ${publisherAddress}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}.`;
};

export const CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE = (
  currentTime: Date,
  chainId: number,
  publisherAddress: string,
) => {
  return `Create a new collaborative Drip List owned by ${publisherAddress}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}.`;
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
  receivers: VoteReceiver[],
) => {
  const sortedReceivers = receivers
    .map((r) => {
      switch (r.type) {
        case 'project':
          return ['project', r.url, r.weight];
        case 'address':
          return ['address', r.address, r.weight];
        case 'dripList':
          return ['drip-list', r.accountId, r.weight];
      }
    })
    .sort();

  return `Submit the vote for address ${voterAddress}, for the voting round with ID ${votingRoundId}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}. The receivers for this vote are: ${JSON.stringify(
    sortedReceivers,
  )}`;
};

export const REVEAL_VOTES_MESSAGE_TEMPLATE = (
  currentTime: Date,
  chainId: number,
  publisherAddress: string,
  votingRoundId: string,
) =>
  `Reveal the votes for voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}.`;

export const REVEAL_MY_VOTE_MESSAGE_TEMPLATE = (
  currentTime: Date,
  chainId: number,
  votingRoundId: string,
) =>
  `Reveal my vote for the voting round with ID ${votingRoundId}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}.`;
