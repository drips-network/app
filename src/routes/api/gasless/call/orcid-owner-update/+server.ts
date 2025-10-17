import { z } from 'zod';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import unreachable from '$lib/utils/unreachable';
import { GelatoRelay, type SponsoredCallRequest } from '@gelatonetwork/relay-sdk';
import assert from '$lib/utils/assert';
import network from '$lib/stores/wallet/network';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type {
  IsOrcidUnclaimedQuery,
  IsOrcidUnclaimedQueryVariables,
} from './__generated__/gql.generated';
import { redis } from '../../../redis';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';
import isClaimed from '$lib/utils/orcids/is-claimed';
import { fetchOrcid } from '$lib/utils/orcids/fetch-orcid';
import { getClaimingUrlAddress } from '$lib/utils/orcids/verify-orcid';
import { Forge } from '$lib/utils/sdk/sdk-types';
import { buildRequestOwnerUpdateTx } from '../build-txs';

const GELATO_API_KEY = getOptionalEnvVar(
  'GELATO_API_KEY',
  true,
  "Gasless transactions won't work." +
    "This means that claiming a project won't and collecting funds (on networks supporting gasless TXs and with gasless TXs enabled in settings) won't work.",
);

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
  assert(
    GELATO_API_KEY,
    'GELATO_API_KEY is required. Gasless transactions will not work without it.',
  );

  assert(
    redis,
    'This endpoint requires a connected Redis instance. Ensure CACHE_REDIS_CONNECTION_STRING is set in env',
  );

  let payload: z.infer<typeof payloadSchema>;

  try {
    const body = await request.text();
    payload = payloadSchema.parse(JSON.parse(body));
  } catch {
    error(400, 'Invalid payload');
  }

  // eslint-disable-next-line no-console
  console.log('REPO_OWNER_UPDATE', payload);

  const { orcid, chainId } = payload;

  assert(network.chainId === chainId, 'Unsupported chain id');

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
  const blockRecordTaskId = await redis.get(blockKey);

  if (blockRecordTaskId) {
    const taskStatusRes = await fetch(`/api/gasless/track/${blockRecordTaskId}`);
    if (!taskStatusRes.ok)
      throw new Error(`Failed to fetch task status: ${await taskStatusRes.text()}`);

    const { task } = await taskStatusRes.json();
    assert(typeof task === 'object', 'Invalid task');
    const { taskState } = task;
    assert(typeof taskState === 'string', 'Invalid task state');

    if (['CheckPending', 'ExecPending', 'WaitingForConfirmation'].includes(taskState)) {
      // A request is already in-flight
      return new Response(JSON.stringify({ taskId: blockRecordTaskId }));
    } else {
      await redis.del(blockKey);
    }
  }

  const claimOrcidTx = await buildRequestOwnerUpdateTx(Forge.orcidId, orcid);

  const relayRequest: SponsoredCallRequest = {
    chainId: BigInt(chainId),
    target: claimOrcidTx.to ?? unreachable(),
    data: claimOrcidTx.data ?? unreachable(),
  };

  const relay = new GelatoRelay();

  try {
    const relayResponse = await relay.sponsoredCall(relayRequest, GELATO_API_KEY);
    const { taskId } = relayResponse;

    // eslint-disable-next-line no-console
    console.log('RELAY_RESPONSE', payload, relayResponse);

    redis.set(blockKey, taskId, {
      // 4 hours
      EX: 4 * 60 * 60,
    });

    return new Response(JSON.stringify(relayResponse));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return error(500, e instanceof Error ? e : 'Unknown error');
  }
};
