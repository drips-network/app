import network from '$lib/stores/wallet/network';
import { SiweMessage } from 'siwe';
import { rpgfServerCall } from './rpgf';
import type { Signer } from 'ethers';
import storedWritable from '@efstajas/svelte-stored-writable';
import { z } from 'zod';
import { browser } from '$app/environment';
import { jwtDecode } from 'jwt-decode';

export const rpgfAccessJwtStore = storedWritable('rpgf-jwt', z.string().nullable(), null, !browser);

const jwtContentSchema = z.object({
  userId: z.string(),
  walletAddress: z.string(),
  exp: z.number(),
});
export type RpgfUserData = z.infer<typeof jwtContentSchema>;

export function getUserData(jwt: string | null): RpgfUserData | null {
  if (!jwt) {
    return null;
  }

  const content = jwtContentSchema.parse(jwtDecode(jwt));

  return content;
}

async function createSiweMessage(address: string) {
  const res = await rpgfServerCall('/auth/nonce');

  const resBody = await res.json();
  const message = new SiweMessage({
    scheme: window.location.protocol.slice(0, -1),
    domain: window.location.host,
    address,
    statement:
      'Sign into Drips RPGF to manage your rounds. This is not a transaction, and no gas is required.',
    uri: window.location.origin,
    version: '1',
    chainId: network.chainId,
    nonce: resBody.nonce,
  });
  return message.prepareMessage();
}

export async function signInWithEthereum(signer: Signer) {
  const address = await signer.getAddress();

  const message = await createSiweMessage(address);
  const signature = await signer.signMessage(message);

  // Also sets httponly refresh token cookie
  const { accessToken } = await (
    await rpgfServerCall('/auth/login', 'POST', {
      message,
      signature,
    })
  ).json();
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('Failed to retrieve access token');
  }

  rpgfAccessJwtStore.set(accessToken);
}

export async function refreshAccessToken(): Promise<{ success: boolean }> {
  rpgfAccessJwtStore.set(null);

  const res = await rpgfServerCall('/auth/refresh-access-token', 'POST');

  if (!res.ok) {
    return { success: false };
  }

  const { accessToken } = await res.json();
  if (!accessToken || typeof accessToken !== 'string') {
    return { success: false };
  }

  rpgfAccessJwtStore.set(accessToken);
  return { success: true };
}

export async function logOut() {
  await rpgfServerCall('/auth/logout', 'POST');
  rpgfAccessJwtStore.set(null);
}
