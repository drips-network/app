// Shared placeholder data used across the Wave LP mocks.
// All names/repos/numbers here are illustrative — not real applicants or issues.

// All names below are fully fictional placeholders — do not use real GitHub usernames
// or real people's avatars in marketing mocks. Avatars are AI-generated illustrations
// from DiceBear's `notionists` style, pre-downloaded under /assets/wave/mock-avatars/.
export const MOCK_CONTRIBUTORS = [
  { name: 'meridian-dev', avatarUrl: '/assets/wave/mock-avatars/meridian-dev.svg', verified: true },
  { name: 'horizon42', avatarUrl: '/assets/wave/mock-avatars/horizon42.svg', verified: false },
  { name: 'mira-codes', avatarUrl: '/assets/wave/mock-avatars/mira-codes.svg', verified: true },
  { name: 'kovri-h', avatarUrl: '/assets/wave/mock-avatars/kovri-h.svg', verified: true },
  { name: 'orbit-jay', avatarUrl: '/assets/wave/mock-avatars/orbit-jay.svg', verified: true },
  {
    name: 'pasta-stream',
    avatarUrl: '/assets/wave/mock-avatars/pasta-stream.svg',
    verified: false,
  },
];

// Fully fictional ecosystem projects building ON Stellar — never use the real
// stellar/* org repos here; Wave is for third-party projects, not foundation
// infrastructure.
export const MOCK_REPOS = [
  { name: 'lumenflow/amm-contracts' },
  { name: 'lumenflow/sdk-js' },
  { name: 'stelka-wallet/app' },
  { name: 'horizonpath/indexer' },
  { name: 'novamint/soroban-mint' },
  { name: 'kelpie-finance/lending' },
];

export const STELLAR_WAVE_PROGRAM = {
  name: 'Stellar Wave',
  slug: 'stellar',
  avatarUrl: '/assets/wave/stellar-wave-logo.png',
};
