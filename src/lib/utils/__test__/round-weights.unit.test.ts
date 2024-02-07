import { constants } from 'radicle-drips';
import roundWeights, { type TypedReceiver } from '../round-weights';

describe('roundWeights', () => {
  it('should return the same receivers if total weight is already equal to TOTAL_SPLITS_WEIGHT', () => {
    const receivers: TypedReceiver[] = [
      { accountId: '1', weight: constants.TOTAL_SPLITS_WEIGHT / 2, typeOfReceiver: 'Maintainer' },
      { accountId: '2', weight: constants.TOTAL_SPLITS_WEIGHT / 2, typeOfReceiver: 'Maintainer' },
    ];
    const result = roundWeights(receivers);
    expect(result).toEqual(receivers);
  });

  it('should distribute weights equally if all weights are equal and total weight is less than TOTAL_SPLITS_WEIGHT', () => {
    const receivers: TypedReceiver[] = [
      { accountId: '1', weight: 333_331, typeOfReceiver: 'Maintainer' },
      { accountId: '2', weight: 333_331, typeOfReceiver: 'Maintainer' },
      { accountId: '3', weight: 333_331, typeOfReceiver: 'Maintainer' },
    ];

    const result = roundWeights(receivers);

    expect(result).toEqual([
      { accountId: '1', weight: 333_334, typeOfReceiver: 'Maintainer' },
      { accountId: '2', weight: 333_333, typeOfReceiver: 'Maintainer' },
      { accountId: '3', weight: 333_333, typeOfReceiver: 'Maintainer' },
    ]);
  });

  it('should increase the weight of the receiver with the highest weight if weights are unequal and total weight is less than TOTAL_SPLITS_WEIGHT', () => {
    const receivers: TypedReceiver[] = [
      { accountId: '1', weight: 333_331, typeOfReceiver: 'Maintainer' },
      { accountId: '2', weight: 333_332, typeOfReceiver: 'Maintainer' },
      { accountId: '3', weight: 333_333, typeOfReceiver: 'Maintainer' },
    ];

    const result = roundWeights(receivers);

    expect(result).toEqual([
      { accountId: '1', weight: 333_331, typeOfReceiver: 'Maintainer' },
      { accountId: '2', weight: 333_332, typeOfReceiver: 'Maintainer' },
      { accountId: '3', weight: 333_337, typeOfReceiver: 'Maintainer' },
    ]);
  });

  it('should throw an error if total weight exceeds TOTAL_SPLITS_WEIGHT', () => {
    const receivers: TypedReceiver[] = [
      { accountId: '1', weight: 333_331, typeOfReceiver: 'Maintainer' },
      { accountId: '2', weight: 333_332, typeOfReceiver: 'Maintainer' },
      { accountId: '3', weight: 333_338, typeOfReceiver: 'Maintainer' },
    ];

    expect(() => roundWeights(receivers)).toThrowError(
      `Total weight of receivers exceeds ${constants.TOTAL_SPLITS_WEIGHT}.`,
    );
  });

  it('should return the same receivers if total weight is already equal to TOTAL_SPLITS_WEIGHT', () => {
    const receivers: TypedReceiver[] = [
      { accountId: '1', weight: 333_334, typeOfReceiver: 'Maintainer' },
      { accountId: '2', weight: 333_333, typeOfReceiver: 'Maintainer' },
      { accountId: '3', weight: 333_333, typeOfReceiver: 'Maintainer' },
    ];

    const result = roundWeights(receivers);

    expect(result).toEqual(receivers);
  });
});
