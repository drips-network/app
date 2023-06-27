import { Utils } from 'radicle-drips';
import { getSubgraphClient } from '$lib/utils/get-drips-clients';

/**
 * Fetches all funds previously split to this project.
 * @param projectUserId The project's user ID.
 * @returns An array of amount objects, one for each previously-split token.
 */
export default async function fetchEarnedFunds(projectUserId: string) {
  const subgraphClient = getSubgraphClient();
  const incomingSplitEvents = await subgraphClient.getSplitEventsByReceiverUserId(projectUserId);

  return incomingSplitEvents.reduce<{ tokenAddress: string; amount: bigint }[]>((acc, curr) => {
    const address = Utils.Asset.getAddressFromId(curr.assetId);

    const existingAmount = acc.find((a) => a.tokenAddress === address);
    const existingAmountIndex = existingAmount ? acc.indexOf(existingAmount) : undefined;

    if (existingAmountIndex) {
      acc[existingAmountIndex] = {
        tokenAddress: address,
        amount: acc[existingAmountIndex].amount + curr.amount,
      };
    } else {
      acc.push({
        tokenAddress: address,
        amount: curr.amount,
      });
    }

    return acc;
  }, []);
}
