import network from '$lib/stores/wallet/network';
import { SiweMessage } from 'siwe';
import { rpgfServerCall } from './rpgf';
import type { Signer } from 'ethers';
import storedWritable from '@efstajas/svelte-stored-writable';
import { z } from 'zod';
import { browser } from '$app/environment';
import { jwtDecode } from 'jwt-decode';

export const rpgfJwtStore = storedWritable('rpgf-jwt', z.string().nullable(), null, !browser);

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

  const res = await rpgfServerCall('/auth/verify', 'POST', {
    message,
    signature,
  });

  if (res.ok) {
    const resBody = z.object({ token: z.string() }).parse(await res.json());

    rpgfJwtStore.set(resBody.token);
  }
}
