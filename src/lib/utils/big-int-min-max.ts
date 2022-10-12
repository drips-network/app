export function bigIntMin(...args: bigint[]) {
  if (args.length < 1) {
    throw 'Min of empty list';
  }
  let m = args[0];
  args.forEach((a) => {
    if (a < m) {
      m = a;
    }
  });
  return m;
}

export function bigIntMax(...args: bigint[]) {
  if (args.length < 1) {
    throw 'Max of empty list';
  }
  let m = args[0];
  args.forEach((a) => {
    if (a > m) {
      m = a;
    }
  });
  return m;
}
