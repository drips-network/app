import { BigNumber } from 'ethers';
import { constants } from 'radicle-drips';

export interface TypedReceiver {
  typeOfReceiver: 'Dependency' | 'Maintainer';
  accountId: string;
  weight: number;
}

/**
 * Ensures the total weight of receivers in a `DripList` or `Project` equals `constants.TOTAL_SPLITS_WEIGHT`.
 * On-chain, weights are stored as integers, but they're represented as numbers in the application.
 * Due to the conversion of percentages (decimals) to integers, the total weight might not equal `constants.TOTAL_SPLITS_WEIGHT`.
 * This function adjusts the weights to ensure the total equals `constants.TOTAL_SPLITS_WEIGHT` using the following logic:
 * - If all weights are equal, it rounds each weight to `Math.floor(constants.TOTAL_SPLITS_WEIGHT / receivers.length)`.
 *   Any remainder from this division is distributed among the receivers, one additional weight unit at a time, until exhausted.
 * - If weights are unequal, it increases the weight of the receiver with the highest weight by the amount needed to achieve `constants.TOTAL_SPLITS_WEIGHT`.
 *
 * @param {SplitsReceiverStruct[]} receivers - The list of receivers whose weights need to be adjusted.
 * @returns {SplitsReceiverStruct[]} The adjusted list of receivers with their weights ensuring the sum equals `constants.TOTAL_SPLITS_WEIGHT`.
 */
export default function roundWeights(receivers: TypedReceiver[]): TypedReceiver[] {
  const totalWeight = receivers.reduce<number>((sum, receiver) => sum + receiver.weight, 0);
  const totalRequired = BigNumber.from(constants.TOTAL_SPLITS_WEIGHT).toNumber();

  if (totalWeight === totalRequired) {
    return receivers;
  }

  if (totalWeight > totalRequired) {
    throw new Error(`Total weight of receivers exceeds ${constants.TOTAL_SPLITS_WEIGHT}.`);
  }

  const allEqual = receivers.every((r) => r.weight === receivers[0].weight);

  if (allEqual) {
    const equalWeight = Math.floor(totalRequired / receivers.length);
    let roundingRemainder = totalRequired - equalWeight * receivers.length;

    return receivers.map((r) => {
      const additionalWeight = roundingRemainder > 0 ? 1 : 0;
      roundingRemainder -= additionalWeight;
      return {
        ...r,
        weight: equalWeight + additionalWeight,
        typeOfReceiver: r.typeOfReceiver,
      };
    });
  } else {
    const weightToAdjust = totalRequired - totalWeight;
    let maxWeightIndex = 0;

    receivers.forEach((r, index) => {
      if (r.weight > receivers[maxWeightIndex].weight) {
        maxWeightIndex = index;
      }
    });

    receivers[maxWeightIndex].weight += weightToAdjust;

    return receivers;
  }
}
