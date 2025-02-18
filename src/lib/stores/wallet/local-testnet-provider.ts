import { JsonRpcSigner } from 'ethers';
import network from './network';
import FailoverJsonRpcProvider from '$lib/utils/FailoverJsonRpcProvider';

export const DEFAULT_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

const PROVIDER_CONFIG: ConstructorParameters<typeof FailoverJsonRpcProvider> = [
  ['http://testnet:8545', 'http://localhost:8545'],
  network,
  {
    staticNetwork: true,
  },
];

/**
 * A strange abomination that acts like a normal provider, but never asks
 * for a signature in combination with the "LocalTestnetWalletStore".
 * This is useful for E2E testing, because the Anvil testnet we use doesn't
 * verify signatures for transactions, so this essentially allows "signing" things
 * without a wallet.
 *
 * To use this, make sure you're using the local Docker env setup, and set
 * `PUBLIC_USE_LOCAL_TESTNET_WALLET_STORE to `true` in your `.env` file.
 */
class LocalTestnetProvider extends FailoverJsonRpcProvider {
  address = DEFAULT_ADDRESS;

  realProvider = new FailoverJsonRpcProvider(...PROVIDER_CONFIG);

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

  async getSigner(): Promise<JsonRpcSigner> {
    return await this.realProvider.getSigner(this.address);
  }

  isWeb3 = true;
}

export default (address: string = DEFAULT_ADDRESS) => {
  const provider = new LocalTestnetProvider(...PROVIDER_CONFIG);
  provider.setAddress(address);

  return provider;
};
