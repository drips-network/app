import getIncomingSplitTotal from '../splits/get-incoming-split-total';
import getIncomingGivesTotal from '../gives/get-incoming-gives-total';
import mergeAmounts from '../amounts/merge-amounts';

/**
 * Fetches all funds previously split to this project.
 * @param projectAccountId The project's user ID.
 * @returns An array of amount objects, one for each previously-split token.
 */
export default async function fetchEarnedFunds(projectAccountId: string) {
  const amounts = await Promise.all([
    getIncomingSplitTotal(projectAccountId),
    getIncomingGivesTotal(projectAccountId),
  ]);

  return mergeAmounts(...amounts);
}
