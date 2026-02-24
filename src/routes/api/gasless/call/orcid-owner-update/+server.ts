import { z } from 'zod';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import network from '$lib/stores/wallet/network';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type {
  IsOrcidUnclaimedQuery,
  IsOrcidUnclaimedQueryVariables,
} from './__generated__/gql.generated';
import isClaimed from '$lib/utils/orcids/is-claimed';
import { fetchOrcid, orcidIdToSandoxOrcidId } from '$lib/utils/orcids/fetch-orcid';
import { getClaimingUrlAddress } from '$lib/utils/orcids/verify-orcid';
import { Forge } from '$lib/utils/sdk/sdk-types';
import { relayOwnerUpdateTx } from '../relay-owner-update';

const payloadSchema = z.object({
  orcid: z.string(),
  chainId: z.number(),
});

const orcidUnclaimedQuery = gql`
  query isOrcidUnclaimed($orcid: String!, $chain: SupportedChain!) {
    orcidLinkedIdentityByOrcid(orcid: $orcid, chain: $chain) {
      chain
      isClaimed
      areSplitsValid
      owner {
        address
      }
    }
  }
`;

export const POST: RequestHandler = async ({ request, fetch }) => {
  if (!network.orcids) {
    return error(404, 'ORCID functionality is not enabled on this network');
  }
  if (!network.gaslessTransactions) {
    return error(404, 'Gasless transactions are not enabled on this network');
  }

  let payload: z.infer<typeof payloadSchema>;

  try {
    const body = await request.text();
    payload = payloadSchema.parse(JSON.parse(body));
  } catch {
    error(400, 'Invalid payload');
  }

  const { orcid, chainId } = payload;

  if (network.chainId !== chainId) {
    throw error(400, 'Unsupported chain id');
  }

  const isOrcidUnclaimedQueryResponse = await query<
    IsOrcidUnclaimedQuery,
    IsOrcidUnclaimedQueryVariables
  >(
    orcidUnclaimedQuery,
    {
      orcid: orcid,
      chain: network.gqlName,
    },
    fetch,
  );

  const orcidAccount = isOrcidUnclaimedQueryResponse.orcidLinkedIdentityByOrcid;
  if (!orcidAccount) {
    return error(404, 'ORCID account not found');
  }

  if (isClaimed(orcidAccount)) {
    return error(400, 'ORCID iD already claimed');
  }

  const orcidProfile = await fetchOrcid(orcid, fetch);
  if (!orcidProfile) {
    return error(500, 'Cannot fetch ORCID profile to validate claiming URL.');
  }

  const urlAddress = getClaimingUrlAddress(orcidProfile.claimingUrl);
  if (
    orcidAccount.owner?.address &&
    orcidAccount.owner.address.toLowerCase() === urlAddress?.toLowerCase()
  ) {
    return new Response('{ "taskId": null }');
  }

  const blockKey = `${network.name}-ownerUpdateRequest-${orcid}`;
  return relayOwnerUpdateTx(blockKey, Forge.orcidId, orcidIdToSandoxOrcidId(orcid), chainId);
};
