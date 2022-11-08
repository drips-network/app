const maxWeight = 1000000; // get from sdk/contract?

export function getSplitPercent(weight = BigInt('0'), format = 'default'): string {
  const percent = (Number((weight * BigInt(maxWeight)) / BigInt(maxWeight)) / maxWeight) * 100;

  switch (format) {
    case 'pretty': {
      const integer = Math.floor(percent);

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
