const STREAMS = [
  // Radworks USDC
  {
    token: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    started: new Date('September 4, 2023, 12:50 AM').getTime(),
    amtPerSec: '15854895991882',
  },
  // Radworks RAD
  {
    token: {
      address: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
    },
    started: new Date('September 4, 2023, 12:50 AM').getTime(),
    amtPerSec: '11832001522070015220700152',
  },
  // Octant WETH
  // https://drips.network/app/174487241669176381847575438324427367088538936996/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/streams/3580043985
  {
    token: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    started: new Date('January 20, 2024, 5:26 PM').getTime(),
    amtPerSec: '4375000000000000000000',
  },
];

const GIVES = [
  // Octant https://drips.network/app/drip-lists/30178668158349445547603108732480118476541651095408979232800331391215
  {
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    amount: BigInt('9380000000000000000'),
  },
];

export default function totalDrippedApproximation() {
  const streamedAmounts = STREAMS.map((stream) => {
    const duration = (Date.now() - stream.started) / 1000;
    return {
      tokenAddress: stream.token.address,
      amount: BigInt(Math.floor(Number(BigInt(stream.amtPerSec) / BigInt(1e9)) * duration)),
    };
  });

  return [...GIVES, ...streamedAmounts];
}
