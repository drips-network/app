const maxWeight = 1000000; // get from sdk/contract?

export function getSplitPercent(weight = BigInt('0'), format = 'default') {
  const decimal = Number((weight * BigInt(maxWeight)) / BigInt(maxWeight)) / maxWeight;

  switch (format) {
    case 'pretty':
      {
        const integer = Math.floor(decimal * 100);

        if (!integer && decimal > 0) {
          return '<1%';
        } else if (integer === 99 && decimal * 100 > integer) {
          return '>99%';
        } else {
          return `${integer}%`;
        }
      }
      break;
    default: {
      return decimal;
    }
  }
}
