const maxWeight = 1000000; // get from sdk/contract?

export function getSplitPercent(
  weight: number | bigint = BigInt('0'),
  format: 'default' | 'pretty' = 'default',
): string {
  const w = typeof weight === 'bigint' ? Number(weight) : weight;
  const percent = (Number((w * maxWeight) / maxWeight) / maxWeight) * 100;

  switch (format) {
    case 'pretty': {
      const roundedPercent = Math.round(percent * 100) / 100;

      // Return with decimals if necessary
      return roundedPercent === Math.floor(roundedPercent)
        ? `${Math.floor(roundedPercent)}%`
        : `${roundedPercent}%`;
    }
    default: {
      return percent.toFixed(2);
    }
  }
}
