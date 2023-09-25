import { Utils } from 'radicle-drips';
import { getSubgraphClient } from '../get-drips-clients';

/**
 * Fetches the total amounts split to a particular account.
 * @param accountId The account to fetch totals for.
 * @returns An array containing amount objects of the total amounts split to the account.
 */
export default async function getIncomingSplitTotal(accountId: string) {
  const subgraph = getSubgraphClient();

  const incomingSplitEvents = await subgraph.getSplitEventsByReceiverAccountId(accountId);

  return incomingSplitEvents.reduce<
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
