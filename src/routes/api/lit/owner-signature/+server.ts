import { z } from 'zod';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { Signature } from 'ethers';
import { createLitClient } from '@lit-protocol/lit-client';
import { getIpfsId } from '@lit-protocol/lit-client/ipfs';
import { nagaDev, nagaTest, naga as nagaMainnet } from '@lit-protocol/networks';
import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { LitActionResource } from '@lit-protocol/auth-helpers';
import { LIT_ABILITY } from '@lit-protocol/constants';
import { privateKeyToAccount } from 'viem/accounts';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';
import { dev } from '$app/environment';

const LIT_ETHEREUM_PRIVATE_KEY = getOptionalEnvVar(
  'LIT_ETHEREUM_PRIVATE_KEY',
  true,
  'Lit-based owner updates will not work.',
);

const LIT_NETWORK = getOptionalEnvVar('LIT_NETWORK', false, null);

const payloadSchema = z.object({
  repoName: z.string(),
  chainName: z.string(),
});

function getLitNetworkName() {
  return LIT_NETWORK ?? (dev ? 'dev' : 'naga');
}

function getLitNetwork() {
  const networkName = getLitNetworkName();
  switch (networkName) {
    case 'dev':
      return nagaDev;
    case 'test':
      return nagaTest;
    case 'naga':
      return nagaMainnet;
    default:
      throw new Error(`Unknown LIT_NETWORK: ${networkName}`);
  }
}

function readLitActionCode(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const litActionPath = join(currentDir, '../../../../lib/utils/lit/litAction.js');
  return readFileSync(litActionPath, 'utf-8');
}

export const POST: RequestHandler = async ({ request }) => {
  if (!LIT_ETHEREUM_PRIVATE_KEY) {
    return error(500, 'LIT_ETHEREUM_PRIVATE_KEY is not configured.');
  }

  let payload: z.infer<typeof payloadSchema>;
  try {
    const body = await request.text();
    payload = payloadSchema.parse(JSON.parse(body));
  } catch {
    return error(400, 'Invalid payload');
  }

  const { repoName, chainName } = payload;

  let litClient;

  try {
    const litActionCode = readLitActionCode();
    const litNetwork = getLitNetwork();

    litClient = await createLitClient({ network: litNetwork });

    const account = privateKeyToAccount(LIT_ETHEREUM_PRIVATE_KEY as `0x${string}`);
    const ipfsCid = await getIpfsId(litActionCode);

    const storage = storagePlugins.localStorageNode({
      appName: 'drips-app',
      networkName: getLitNetworkName(),
      storagePath: join(dirname(fileURLToPath(import.meta.url)), '.lit-auth-storage'),
    });
    const authManager = createAuthManager({ storage });

    const authContext = await authManager.createEoaAuthContext({
      litClient,
      config: { account },
      authConfig: {
        resources: [
          {
            resource: new LitActionResource(ipfsCid),
            ability: LIT_ABILITY.LitActionExecution,
          },
        ],
      },
    });

    const result = await litClient.executeJs({
      code: litActionCode,
      jsParams: {
        source: { kind: 'gitHub', name: repoName },
        chains: [chainName],
      },
      authContext,
    });

    const rawResponse =
      typeof result.response === 'string' ? JSON.parse(result.response) : result.response;

    const chainSignatureSchema = z.object({
      signature: z.string(),
      recoveryId: z.number(),
    });

    const litResponseSchema = z.object({
      sourceId: z.number(),
      name: z.string(),
      owner: z.string(),
      timestamp: z.number(),
      signatures: z.record(z.string(), chainSignatureSchema),
    });

    const response = litResponseSchema.parse(rawResponse);

    const chainSig = response.signatures[chainName];
    if (!chainSig) {
      return error(400, `No owner found for chain '${chainName}' in FUNDING.json`);
    }

    const { sourceId, name, owner, timestamp } = response;

    // Convert signature to EIP-2098 compact format
    const sig = Signature.from(chainSig.signature + '0' + chainSig.recoveryId);
    const r = sig.r;
    const vs = sig.yParityAndS;

    return new Response(JSON.stringify({ sourceId, name, owner, timestamp, r, vs }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Lit owner signature error:', e);
    if (e && typeof e === 'object' && 'status' in e) {
      throw e; // Re-throw SvelteKit error responses
    }
    return error(500, e instanceof Error ? e.message : 'Failed to get owner signature from Lit');
  } finally {
    litClient?.disconnect();
  }
};
