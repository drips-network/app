import network from '$lib/stores/wallet/network';
import { ethers, JsonRpcProvider } from 'ethers';

const REPO_DRIVER_ABI = `[
  {
    "inputs": [
      { "internalType": "enum Forge", "name": "forge", "type": "uint8" },
      { "internalType": "bytes", "name": "name", "type": "bytes" }
    ],
    "name": "requestUpdateOwner",
    "outputs": [{ "internalType": "uint256", "name": "accountId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`;

export const buildRequestOwnerUpdateTx = (forge: number, name: string) => {
  const provider = new JsonRpcProvider(network.rpcUrl);
  const contract = new ethers.Contract(network.contracts.REPO_DRIVER, REPO_DRIVER_ABI, provider);
  return contract.requestUpdateOwner.populateTransaction(
    forge,
    ethers.hexlify(ethers.toUtf8Bytes(name)),
  );
};
