import { providers } from 'ethers';

const NETWORK = {
  chainId: 5,
  name: 'Goerli',
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
        url: 'http://127.0.0.1:8545',
        skipFetchSetup: true,
      },
      NETWORK,
    );

    return tempProvider.getSigner(this.address);
  }

  isWeb3 = true;
}

export default (address: string) => {
  const provider = new MockProvider(
    {
      url: 'http://127.0.0.1:8545',
      skipFetchSetup: true,
    },
    NETWORK,
  );
  provider.setAddress(address);

  return provider;
};
