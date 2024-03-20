import { providers } from 'ethers';
import { env } from '$env/dynamic/public';

const NETWORK = {
  chainId: 5,
  name: 'goerli',
};

class MockProvider extends providers.StaticJsonRpcProvider {
  address = '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc';

  setAddress(to: string) {
    this.address = to;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async request(request: any) {
    if (request.method === 'eth_requestAccounts') {
      return [this.address];
    }
    // eslint-disable-next-line no-console
    console.log('UNIMPLEMENTED METHOD', request);
  }

  getSigner(): providers.JsonRpcSigner {
    const tempProvider = new providers.StaticJsonRpcProvider(
      {
        url: `http://${env?.PUBLIC_TESTNET_MOCK_PROVIDER_HOST ?? '127.0.0.1'}:8545`,
        skipFetchSetup: true,
      },
      NETWORK,
    );

    return tempProvider.getSigner(this.address);
  }

  isWeb3 = true;
}

export default (address: string) => {
  // eslint-disable-next-line no-console
  console.log(
    'Using mock provider',
    `http://${env?.PUBLIC_TESTNET_MOCK_PROVIDER_HOST ?? '127.0.0.1'}:8545`,
  );

  const provider = new MockProvider(
    {
      url: `http://${env?.PUBLIC_TESTNET_MOCK_PROVIDER_HOST ?? '127.0.0.1'}:8545`,
      skipFetchSetup: true,
    },
    NETWORK,
  );
  provider.setAddress(address);

  return provider;
};
