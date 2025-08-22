export default function isClaimed<
  IT extends
    | {
        __typename: 'ClaimedOrcidAccountData';
      }
    | {
        __typename: 'UnClaimedOrcidAccountData';
      },
>(chainData: IT): chainData is IT & { __typename: 'ClaimedOrcidAccountData' } {
  return chainData.__typename === 'ClaimedOrcidAccountData';
}

export function isUnclaimed(
  chainData:
    | {
        __typename: 'ClaimedOrcidAccountData';
      }
    | {
        __typename: 'UnClaimedOrcidAccountData';
      },
): chainData is { __typename: 'UnClaimedOrcidAccountData' } {
  return chainData.__typename === 'UnClaimedOrcidAccountData';
}
