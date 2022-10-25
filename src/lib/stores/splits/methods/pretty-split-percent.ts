const maxWeight = 1000000; // get from sdk/contract?

export function prettySplitPercent(weight = BigInt('0')) {
  const decimal = Number((weight * BigInt(maxWeight)) / BigInt(maxWeight)) / maxWeight;
  const percent = Math.floor(decimal * 100); // integer

  if (!percent && decimal > 0) {
    return '<1%';
  } else if (percent === 99 && decimal * 100 > percent) {
    return '>99%';
  } else {
    return `${percent}%`;
  }
}
