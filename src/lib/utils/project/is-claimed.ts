export default function isClaimed(
  chainData:
    | {
        __typename: 'ClaimedProjectData';
      }
    | {
        __typename: 'UnClaimedProjectData';
      },
): chainData is { __typename: 'ClaimedProjectData' } {
  return chainData.__typename === 'ClaimedProjectData';
}
