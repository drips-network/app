export interface NetworkMeta {
  name: string;
  logoUrl: string;
  chainId: number;
}

export const NETWORK_META: { [chainId: number]: NetworkMeta } = {
  5: {
    name: 'Goerli',
    logoUrl: 'https://unlock-protocol.com/images/blog/goerli/goerli-logo.png',
    chainId: 5,
  },
  80001: {
    name: 'Mumbai',
    logoUrl: 'https://pbs.twimg.com/profile_images/1477910624055095297/GzREeHeN_400x400.jpg',
    chainId: 80001,
  },
};
