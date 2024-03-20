export const START_VOTING_ROUND_MESSAGE_TEMPLATE = (
  currentTime: Date,
  publisherAddress: string,
  dripListId: string,
  collaborators: string[],
) => {
  const sortedCollaborators = collaborators.sort((a, b) => Number(a) - Number(b));

  return `Create a new voting round for the Drip List with ID ${dripListId}, owned by ${publisherAddress}. The current time is ${currentTime.toISOString()}. The voters for this round are: ${JSON.stringify(
    sortedCollaborators,
  )}`;
};

export const CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE = (
  currentTime: Date,
  publisherAddress: string,
  collaborators: string[],
) => {
  const sortedCollaborators = collaborators.sort((a, b) => Number(a) - Number(b));

  return `Create a new collaborative Drip List owned by ${publisherAddress}. The current time is ${currentTime.toISOString()}. The voters for this list are: ${JSON.stringify(
    sortedCollaborators,
  )}`;
};

export const DELETE_VOTING_ROUND_MESSAGE_TEMPLATE = (
  currentTime: Date,
  publisherAddress: string,
  votingRoundId: string,
) =>
  `Delete the voting round with ID ${votingRoundId}, owned by ${publisherAddress}. The current time is ${currentTime.toISOString()}.`;

export const VOTE_MESSAGE_TEMPLATE = (
  currentTime: Date,
  voterAddress: string,
  votingRoundId: string,
  // TODO: Real type
  receivers: Record<string, unknown>[],
) => {
  const sortedReceivers = receivers.sort((a, b) => Number(a) - Number(b));

  return `Submit the vote for address ${voterAddress}, for the voting round with ID ${votingRoundId}. The current time is ${currentTime.toISOString()}. The receivers for this vote are: ${JSON.stringify(
    sortedReceivers,
  )}`;
};
