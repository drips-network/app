import { Utils } from 'radicle-drips';
import { getSubgraphClient } from '../get-drips-clients';

/**
 * Fetches the total amounts given to a particular account.
 * @param accountId The account to fetch totals for.
 * @returns An array containing amount objects of the total amounts given to the account.
 */
export default async function getIncomingGivesTotal(accountId: string) {
  const subgraph = getSubgraphClient();

  const incomingGiveEvents = await subgraph.getGivenEventsByReceiverAccountId(accountId);

  return incomingGiveEvents.reduce<
    {
      tokenAddress: string;
      amount: bigint;
    }[]
  >((acc, curr) => {
    const currTokenAddress = Utils.Asset.getAddressFromId(curr.assetId);
    const existing = acc.find((e) => e.tokenAddress === currTokenAddress);

    if (existing) {
      existing.amount += curr.amount;
    } else {
      acc.push({
        tokenAddress: currTokenAddress,
        amount: curr.amount,
      });
    }

    return acc;
  }, []);
}
