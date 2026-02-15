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
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { Octokit } from '@octokit/rest';
import GitHub from '$lib/utils/github/GitHub';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';
import { dev } from '$app/environment';
import { redis } from '../../redis';

const LIT_ETHEREUM_PRIVATE_KEY = getOptionalEnvVar(
  'LIT_ETHEREUM_PRIVATE_KEY',
  false,
  'Lit-based owner updates will not work on non-dev networks without this.',
);

const LIT_NETWORK = getOptionalEnvVar('LIT_NETWORK', false, null);

const GITHUB_PERSONAL_ACCESS_TOKEN = getOptionalEnvVar(
  'GITHUB_PERSONAL_ACCESS_TOKEN',
  true,
  'Lit owner-signature endpoint may fail due to severe GitHub API rate limits.',
);

const octokit = new Octokit({ auth: GITHUB_PERSONAL_ACCESS_TOKEN });
const github = new GitHub(octokit);

const VALID_CHAIN_NAMES = [
  'ethereum',
  'filecoin',
  'optimism',
  'metis',
  'sepolia',
  'baseSepolia',
  'optimismSepolia',
  'amoy',
  'localtestnet',
];

/** Cooldown in seconds before the same repo+chain can be queried again. */
const RATE_LIMIT_COOLDOWN_SECONDS = 60;

const chainNameSchema = z.enum(VALID_CHAIN_NAMES as [string, ...string[]]);

const gitHubPayloadSchema = z.object({
  sourceKind: z.literal('gitHub'),
  name: z
    .string()
    .regex(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/, 'name must be in "owner/repo" format'),
  chainName: chainNameSchema,
});

const orcidPayloadSchema = z.object({
  sourceKind: z.enum(['orcid', 'orcidSandbox']),
  name: z
    .string()
    .regex(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, 'name must be a valid ORCID iD'),
  chainName: chainNameSchema,
});

const payloadSchema = z.discriminatedUnion('sourceKind', [
  gitHubPayloadSchema,
  orcidPayloadSchema,
]);

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

// --- Module-level singletons (reused across requests) ---

const currentDir = dirname(fileURLToPath(import.meta.url));
const litActionCode = readFileSync(join(currentDir, 'oracle-code.txt'), 'utf-8');

let cachedIpfsCid: string | undefined;
async function getLitActionIpfsCid(): Promise<string> {
  if (!cachedIpfsCid) {
    cachedIpfsCid = await getIpfsId(litActionCode);
  }
  return cachedIpfsCid;
}

let cachedPrivateKey: `0x${string}` | undefined;
function getPrivateKey(): `0x${string}` {
  if (cachedPrivateKey) return cachedPrivateKey;

  if (LIT_ETHEREUM_PRIVATE_KEY) {
    cachedPrivateKey = LIT_ETHEREUM_PRIVATE_KEY as `0x${string}`;
    return cachedPrivateKey;
  }

  const litNetwork = getLitNetworkName();
  if (litNetwork !== 'dev') {
    throw new Error(
      `LIT_ETHEREUM_PRIVATE_KEY is required for Lit network '${litNetwork}'. It is only optional on 'dev'.`,
    );
  }

  // On nagaDev, no payment is needed, so we can use a stable ephemeral key for auth.
  cachedPrivateKey = generatePrivateKey();
  return cachedPrivateKey;
}

const storage = storagePlugins.localStorageNode({
  appName: 'drips-app',
  networkName: getLitNetworkName(),
  storagePath: join(currentDir, '.lit-auth-storage'),
});
const authManager = createAuthManager({ storage });

/** Timeout for the entire Lit interaction (connect + auth + execute) in ms. */
const LIT_TIMEOUT_MS = 60_000;

/** Max retry attempts for transient Lit failures. */
const LIT_MAX_RETRIES = 2;

/** Base delay for exponential backoff in ms. */
const LIT_RETRY_BASE_DELAY_MS = 2_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

async function executeLitAction(source: { kind: string; name: string }, chainName: string) {
  let litClient;

  try {
    litClient = await createLitClient({ network: getLitNetwork() });

    const account = privateKeyToAccount(getPrivateKey());
    const ipfsCid = await getLitActionIpfsCid();

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

    return await litClient.executeJs({
      code: litActionCode,
      jsParams: {
        source,
        chains: [chainName],
      },
      authContext,
    });
  } finally {
    litClient?.disconnect();
  }
}

async function executeLitActionWithRetry(source: { kind: string; name: string }, chainName: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= LIT_MAX_RETRIES; attempt++) {
    try {
      return await withTimeout(
        executeLitAction(source, chainName),
        LIT_TIMEOUT_MS,
        'Lit Action execution',
      );
    } catch (e) {
      lastError = e;

      // eslint-disable-next-line no-console
      console.error(`Lit attempt ${attempt + 1}/${LIT_MAX_RETRIES + 1} failed:`, e);

      if (attempt < LIT_MAX_RETRIES) {
        const delay = LIT_RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export const POST: RequestHandler = async ({ request }) => {
  let payload: z.infer<typeof payloadSchema>;
  try {
    const body = await request.text();
    payload = payloadSchema.parse(JSON.parse(body));
  } catch {
    return error(400, 'Invalid payload');
  }

  const { sourceKind, name, chainName } = payload;

  // Rate limit: prevent the same source+chain from being queried within the cooldown window.
  if (redis) {
    const rateLimitKey = `lit-owner-sig:${sourceKind}:${name}:${chainName}`;
    const existing = await redis.get(rateLimitKey);

    if (existing) {
      return error(
        429,
        'A signature was recently requested for this source and chain. Please wait before trying again.',
      );
    }

    await redis.set(rateLimitKey, '1', { EX: RATE_LIMIT_COOLDOWN_SECONDS });
  }

  // Pre-validate: verify the source has valid ownership claim data.
  // This is much cheaper than calling Lit and prevents wasting credits on invalid requests.
  if (sourceKind === 'gitHub') {
    const [repoOwner, repo] = name.split('/');
    try {
      const fundingJson = await github.fetchFundingJson(repoOwner, repo);
      const ownedBy = fundingJson.drips?.[chainName]?.ownedBy;

      if (!ownedBy) {
        return error(
          400,
          `FUNDING.json does not contain an ownedBy entry for chain '${chainName}'.`,
        );
      }
    } catch {
      return error(400, 'Unable to fetch or parse FUNDING.json from the repository.');
    }
  } else if (sourceKind === 'orcid' || sourceKind === 'orcidSandbox') {
    const subdomain = sourceKind === 'orcidSandbox' ? 'sandbox.' : '';
    const orcidApiUrl = `https://pub.${subdomain}orcid.org/v3.0/${name}/researcher-urls`;

    try {
      const res = await fetch(orcidApiUrl, { headers: { Accept: 'application/json' } });
      if (!res.ok) return error(400, 'Unable to fetch ORCID profile.');

      const data = await res.json();
      const urls: string[] = (data?.['researcher-url'] ?? [])
        .map((ru: { url?: { value?: string } }) => ru?.url?.value)
        .filter(Boolean);

      const hasValidClaim = urls.some((url) => {
        try {
          const parsed = new URL(url);
          return (
            parsed.origin === 'http://0.0.0.0' &&
            parsed.pathname === '/DRIPS_OWNERSHIP_CLAIM' &&
            parsed.searchParams.has(chainName)
          );
        } catch {
          return false;
        }
      });

      if (!hasValidClaim) {
        return error(
          400,
          `ORCID profile does not contain a valid DRIPS_OWNERSHIP_CLAIM URL for chain '${chainName}'.`,
        );
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'status' in e) throw e;
      return error(400, 'Unable to fetch or validate ORCID profile.');
    }
  }

  try {
    const result = await executeLitActionWithRetry({ kind: sourceKind, name }, chainName);

    const rawResponse =
      typeof result.response === 'string' ? JSON.parse(result.response) : result.response;

    const litResponseSchema = z.object({
      sourceId: z.number(),
      name: z.string(),
      owners: z.record(z.string(), z.string()),
      timestamp: z.number(),
    });

    const response = litResponseSchema.parse(rawResponse);

    const owner = response.owners[chainName];
    if (!owner) {
      return error(400, `No owner found for chain '${chainName}'`);
    }

    // Signatures are returned separately by the Lit SDK, not in the response body
    const chainSig = result.signatures?.[chainName];
    if (!chainSig) {
      return error(500, `No signature returned by Lit for chain '${chainName}'`);
    }

    const { sourceId, name: responseName, timestamp } = response;

    // Convert signature to EIP-2098 compact format
    const sig = Signature.from(chainSig.signature + '0' + chainSig.recoveryId);
    const r = sig.r;
    const vs = sig.yParityAndS;

    return new Response(
      JSON.stringify({ sourceId, name: responseName, owner, timestamp, r, vs }),
      { headers: { 'content-type': 'application/json' } },
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Lit owner signature error (all retries exhausted):', e);
    if (e && typeof e === 'object' && 'status' in e) {
      throw e; // Re-throw SvelteKit error responses
    }
    return error(500, e instanceof Error ? e.message : 'Failed to get owner signature from Lit');
  }
};
