import { constants, type SplitsReceiverStruct } from 'radicle-drips';

export default function roundWeights(receivers: SplitsReceiverStruct[]): SplitsReceiverStruct[] {
  const totalWeight = receivers.reduce((sum, receiver) => sum + receiver.weight, 0);
  const totalRequired = constants.TOTAL_SPLITS_WEIGHT;

  if (totalWeight === totalRequired) {
    return receivers;
  }

  const allEqual = receivers.every((r) => r.weight === receivers[0].weight);

  if (allEqual) {
    const equalWeight = Math.floor(totalRequired / receivers.length);
    let roundingRemainder = totalRequired - equalWeight * receivers.length;

    return receivers.map((r) => {
      let additionalWeight = 0;

      if (roundingRemainder > 0) {
        additionalWeight = 1;
        roundingRemainder -= 1;
      }
      return {
        ...r,
        weight: equalWeight + additionalWeight,
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

    (receivers[maxWeightIndex].weight as number) += weightToAdjust;

    return receivers;
  }
}
