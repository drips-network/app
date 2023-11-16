const maxWeight = 1000000; // get from sdk/contract?

export function getSplitPercent(weight: number | bigint = BigInt('0'), format = 'default'): string {
  const w = typeof weight === 'bigint' ? Number(weight) : weight;

  const percent = (Number((w * maxWeight) / maxWeight) / maxWeight) * 100;

  switch (format) {
    case 'pretty': {
      const integer = Math.round((percent + Number.EPSILON) * 100) / 100;

      return !integer && percent > 0
        ? '<1%'
        : integer === 99 && percent > integer
        ? '>99%'
        : `${integer}%`;
    }
    default: {
      return percent.toString();
    }
  }
}
