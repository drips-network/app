type Amount = {
  amount: bigint;
  tokenAddress: string;
};

/**
 * Take any number of arrays of amounts, and merge them into a single array of amounts,
 * where each particular tokenAddress appears once.
 * @param args The arrays of amounts to add together.
 */
export default function mergeAmounts(...args: Amount[][]) {
  const amounts = new Map<string, Amount>();

  args.forEach((amountsArray) => {
    amountsArray.forEach((amount) => {
      const existingAmount = amounts.get(amount.tokenAddress);
      if (existingAmount) {
        amounts.set(amount.tokenAddress, {
          amount: existingAmount.amount + amount.amount,
          tokenAddress: amount.tokenAddress,
        });
      } else {
        amounts.set(amount.tokenAddress, amount);
      }
    });
  });

  return Array.from(amounts.values());
}
