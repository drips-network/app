import network from '$lib/stores/wallet/network';
import type { Forge } from '$lib/utils/sdk/sdk-types';
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

/**
 * Builds an unsigned transaction to request an owner update for a project on the Drips RepoDriver contract.
 *
 * This function creates a populated transaction that calls the `requestUpdateOwner` function on the
 * RepoDriver smart contract. This is typically used as part of a gasless transaction flow where users
 * can claim ownership of projects (GitHub/GitLab repositories or ORCID profiles) without needing to
 * pay for gas fees themselves.
 *
 * @param forge - The forge type identifier:
 *   - `0` for GitHub repositories (Forge.gitHub)
 *   - `1` for GitLab repositories (Forge.gitLab)
 *   - `2` for ORCID profiles (Forge.orcidId)
 *
 * @param name - The project identifier as a string:
 *   - For GitHub/GitLab: The full repository name (e.g., "owner/repo-name")
 *   - For ORCID: The ORCID identifier (e.g., "0000-0002-1234-5678")
 *
 * @returns A Promise that resolves to a populated transaction object that can be signed and submitted
 *   to the blockchain.
 */
export const buildRequestOwnerUpdateTx = (forge: Forge, name: string) => {
  const provider = new JsonRpcProvider(network.rpcUrl);
  const contract = new ethers.Contract(network.contracts.REPO_DRIVER, REPO_DRIVER_ABI, provider);
  return contract.requestUpdateOwner.populateTransaction(
    forge,
    ethers.hexlify(ethers.toUtf8Bytes(name)),
  );
};
