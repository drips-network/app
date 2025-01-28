import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import expect from './expect';
import filterCurrentChainData from './filter-current-chain-data';
import unreachable from './unreachable';
import network from '$lib/stores/wallet/network';
import type {
  DripListLastProcessedIpfsHashQuery,
  DripListLastProcessedIpfsHashQueryVariables,
  ProjectLastProcessedIpfsHashQuery,
  ProjectLastProcessedIpfsHashQueryVariables,
  LatestAccountMetadataHashQuery,
  LatestAccountMetadataHashQueryVariables,
} from './__generated__/gql.generated';
import stripTrailingSlash from './strip-trailing-slash';
import getOptionalEnvVar from './get-optional-env-var/public';

const PINATA_GATEWAY_URL =
  getOptionalEnvVar('PUBLIC_IPFS_GATEWAY_URL', false, undefined) ?? 'https://drips.mypinata.cloud';

/**
 * Fetch the given hash from IPFS.
 * @param hash The hash to fetch.
 * @returns The raw `Response` of fetching the given hash from our Pinata
 * gateway.
 */
export async function fetchIpfs(hash: string, f = fetch) {
  return f(`${stripTrailingSlash(PINATA_GATEWAY_URL)}/ipfs/${hash}`);
}

/**
 * Convert `ipfs://` protocol URIs to a Pinata gateway link. Returns the
 * original URI if it isnʼt an ipfs URI.
 * @param uri The URI to convert.
 * @returns The converted URI, or the original URI if it's not an IPFS URI.
 */
export function convertIpfsUri(uri: string) {
  if (!uri.startsWith('ipfs://')) return uri;

  const hash = uri.replace('ipfs://', '');

  return `${PINATA_GATEWAY_URL}/ipfs/${hash}`;
}

/**
 * Pin the given data to IPFS.
 * @param data The data to pin.
 * @returns The hash of the pinned data.
 */
export async function pin(data: Record<string, unknown>, f = fetch) {
  const res = await f('/api/ipfs/pin', {
    method: 'POST',
    body: JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
  });

  if (!res.ok) {
    throw new Error(`Pinning account metadata failed: ${await res.text()}`);
  }

  return res.text();
}

export async function waitForAccountMetadata(
  accountId: string,
  expectedIpfsHash: string,
  entityType: 'project' | 'dripList' | 'address',
  f = fetch,
) {
  await expect(
    async () => {
      if (entityType === 'project') {
        const projectLastProcessedIpfsHashQuery = gql`
          query ProjectLastProcessedIpfsHash($projectId: ID!, $chains: [SupportedChain!]) {
            projectById(id: $projectId, chains: $chains) {
              chainData {
                ... on ClaimedProjectData {
                  chain
                  lastProcessedIpfsHash
                }
                ... on UnClaimedProjectData {
                  chain
                }
              }
            }
          }
        `;

        const res = await query<
          ProjectLastProcessedIpfsHashQuery,
          ProjectLastProcessedIpfsHashQueryVariables
        >(
          projectLastProcessedIpfsHashQuery,
          { projectId: accountId, chains: [network.gqlName] },
          f,
        );

        const chainData = filterCurrentChainData(res.projectById?.chainData || unreachable());

        return 'lastProcessedIpfsHash' in chainData ? chainData.lastProcessedIpfsHash : null;
      } else if (entityType === 'dripList') {
        const dripListLastProcessedIpfsHashQuery = gql`
          query DripListLastProcessedIpfsHash($dripListId: ID!, $chain: SupportedChain!) {
            dripList(id: $dripListId, chain: $chain) {
              chain
              lastProcessedIpfsHash
            }
          }
        `;

        const res = await query<
          DripListLastProcessedIpfsHashQuery,
          DripListLastProcessedIpfsHashQueryVariables
        >(dripListLastProcessedIpfsHashQuery, { dripListId: accountId, chain: network.gqlName }, f);

        return res.dripList?.lastProcessedIpfsHash;
      } else {
        const res = await query<
          LatestAccountMetadataHashQuery,
          LatestAccountMetadataHashQueryVariables
        >(
          gql`
            query LatestAccountMetadataHash($accountId: ID!, $chains: [SupportedChain!]) {
              userById(accountId: $accountId, chains: $chains) {
                chainData {
                  chain
                  latestMetadataIpfsHash
                }
              }
            }
          `,
          { accountId, chains: [network.gqlName] },
          f,
        );

        const chainData = filterCurrentChainData(res.userById?.chainData || unreachable());

        return chainData.latestMetadataIpfsHash;
      }
    },

    (result) => expectedIpfsHash === result,
  );
}
