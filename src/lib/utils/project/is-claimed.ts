export default function isClaimed<
  IT extends
    | {
        __typename: 'ClaimedProjectData';
      }
    | {
        __typename: 'UnClaimedProjectData';
      },
>(chainData: IT): chainData is IT & { __typename: 'ClaimedProjectData' } {
  return chainData.__typename === 'ClaimedProjectData';
}

export function isUnclaimed(
  chainData:
    | {
        __typename: 'ClaimedProjectData';
      }
    | {
        __typename: 'UnClaimedProjectData';
      },
): chainData is { __typename: 'UnClaimedProjectData' } {
  return chainData.__typename === 'UnClaimedProjectData';
}
