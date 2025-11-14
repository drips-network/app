import { browser } from '$app/environment';
import walletStore from '$lib/stores/wallet/wallet.store';
import assert from '$lib/utils/assert';
import { keccak256, toUtf8Bytes } from 'ethers';
import { get } from 'svelte/store';
import type { Ballot } from './types/ballot';

export type SignedBallotPayload = {
  signature: string;
  chainId: number;
};

export function hashBallotVotes(ballot: Ballot): string {
  // Convert ballot to a deterministic JSON string
  // Sort keys to ensure consistent hashing
  const sortedBallot = Object.keys(ballot)
    .sort()
    .reduce((acc, key) => {
      acc[key] = ballot[key];
      return acc;
    }, {} as Ballot);

  const ballotJson = JSON.stringify(sortedBallot);

  return keccak256(toUtf8Bytes(ballotJson));
}

export function createBallotTypedData(chainId: number) {
  return {
    primaryType: 'Ballot',
    domain: {
      name: 'Sign votes',
      version: '1',
      chainId,
    },
    types: {
      Ballot: [
        { name: 'total_votes', type: 'uint256' },
        { name: 'project_count', type: 'uint256' },
        { name: 'hashed_votes', type: 'string' },
      ],
    },
  };
}

export async function signBallot(ballot: Ballot): Promise<SignedBallotPayload> {
  if (!browser) {
    throw new Error('Ballot signing is only available in the browser.');
  }

  const walletState = get(walletStore);

  assert(walletState.connected, 'A connected wallet is required to sign the ballot.');
  assert(walletState.signer, 'A wallet signer is required to sign the ballot.');

  const { chainId: providerChainId } = await walletState.provider.getNetwork();
  const chainId = Number(providerChainId);

  const totalVotes = Object.values(ballot).reduce((acc, voteCount) => acc + voteCount, 0);
  const projectCount = Object.keys(ballot).length;
  const hashedVotes = hashBallotVotes(ballot);

  const typedData = createBallotTypedData(chainId);

  const signature = await walletState.signer.signTypedData(typedData.domain, typedData.types, {
    total_votes: BigInt(totalVotes),
    project_count: BigInt(projectCount),
    hashed_votes: hashedVotes,
  });

  return {
    signature,
    chainId,
  };
}
