import { error } from '@sveltejs/kit';
import { ShareImageType, type VisualBadge } from './types.js';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL.js';
import network from '$lib/stores/wallet/network.js';
import isClaimed from '$lib/utils/project/is-claimed.js';
import type {
  DripListQuery,
  DripListQueryVariables,
  ProjectQuery,
  ProjectQueryVariables,
  OrcidQuery,
  OrcidQueryVariables,
} from './__generated__/gql.generated.js';
import type { AddressDriverAccount } from '$lib/graphql/__generated__/base-types';
import { DRIP_LIST_BADGE_FRAGMENT } from '$lib/components/drip-list-badge/drip-list-badge.svelte';
import { ECOSYSTEM_BADGE_FRAGMENT } from '$lib/components/ecosystem-badge/ecosystem-badge.svelte';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data.js';
import { fetchEcosystem } from '../../../../../(pages)/app/(app)/ecosystems/[ecosystemId]/fetch-ecosystem.js';
import getOrcidDisplayName from '$lib/utils/orcids/display-name.js';
import { getRound } from '$lib/utils/rpgf/rpgf.js';
import { getWaveProgram } from '$lib/utils/wave/wavePrograms.js';
import makeStreamId, { decodeStreamId } from '$lib/utils/streams/make-stream-id.js';
import formatTokenAmount from '$lib/utils/format-token-amount.js';
import { DRIPS_DEFAULT_TOKEN_LIST } from '$lib/stores/tokens/token-list.js';

function isShareImageType(value: string): value is ShareImageType {
  return Object.values(ShareImageType).includes(value as ShareImageType);
}

async function loadWaveProgramData(f: typeof fetch, id: string) {
  const wave = await getWaveProgram(f, id);
  if (!wave) return null;

  return {
    bgColor: '#5555FF',
    type: 'Wave Program',
    headline: wave.name,
    avatarSrc: wave.avatarUrl,
    stats: [],
  };
}

async function loadProjectData(f: typeof fetch, projectUrl: string) {
  const projectQuery = gql`
    query Project($url: String!, $chains: [SupportedChain!]) {
      projectByUrl(url: $url, chains: $chains) {
        source {
          ownerName
          repoName
        }
        chainData {
          ... on UnClaimedProjectData {
            chain
          }
          ... on ClaimedProjectData {
            chain
            avatar {
              ... on ImageAvatar {
                cid
              }
              ... on EmojiAvatar {
                emoji
              }
            }
            color
            splits {
              dependencies {
                __typename
              }
            }
          }
        }
      }
    }
  `;

  const res = await query<ProjectQuery, ProjectQueryVariables>(
    projectQuery,
    { url: projectUrl, chains: [network.gqlName] },
    fetch,
  );
  const { projectByUrl: project } = res;

  if (!project) {
    return null;
  }

  const chainData = filterCurrentChainData(project.chainData);
  const claimed = isClaimed(chainData);

  let avatarSrc: string | null;

  if (claimed) {
    avatarSrc =
      chainData.avatar.__typename === 'EmojiAvatar'
        ? `/api/twemoji-avatar.png?emoji=${chainData.avatar.emoji}&bgColor=FFFFFF`
        : `/api/custom-avatars/${chainData.avatar.cid}`;
  } else {
    avatarSrc = null;
  }

  return {
    bgColor: claimed ? chainData.color : '#5555FF',
    type: 'Project',
    headline: `${project.source.repoName}`,
    stats: claimed
      ? [
          {
            icons: ['DripList'],
            label: `${chainData.splits.dependencies.length} dependencie${chainData.splits.dependencies.length === 1 ? '' : 's'}`,
          },
        ]
      : [],
    avatarSrc,
  };
}

async function loadDripListData(f: typeof fetch, id: string) {
  const dripListQuery = gql`
    query DripList($listId: ID!, $chain: SupportedChain!) {
      dripList(id: $listId, chain: $chain) {
        name
        splits {
          __typename
        }
      }
    }
  `;

  const res = await query<DripListQuery, DripListQueryVariables>(
    dripListQuery,
    { listId: id, chain: network.gqlName },
    fetch,
  );
  const { dripList } = res;

  if (!dripList) {
    return null;
  }

  return {
    bgColor: '#5555FF',
    type: 'Drip List',
    headline: dripList.name,
    avatarSrc: null,
    stats: [
      {
        icons: ['DripList'],
        label: `${dripList.splits.length} recipient${dripList.splits.length === 1 ? '' : 's'}`,
      },
    ],
  };
}

async function loadEcosystemData(f: typeof fetch, id: string) {
  const ecosystem = await fetchEcosystem(id, f);

  if (!ecosystem) {
    return null;
  }

  return {
    bgColor: ecosystem.color,
    type: 'Ecosystem',
    headline: ecosystem.name,
    avatarSrc: null,
    stats: [
      {
        icons: ['DripList'],
        label: `${ecosystem.graph.nodes.length - 1} recipient${ecosystem.graph.nodes.length - 2 === 1 ? '' : 's'}`,
      },
    ],
  };
}

async function loadOrcidData(f: typeof fetch, id: string) {
  const orcidQuery = gql`
    query Orcid($orcid: String!, $chain: SupportedChain!) {
      orcidLinkedIdentityByOrcid(orcid: $orcid, chain: $chain) {
        chain
        areSplitsValid
        isClaimed
        orcid
        orcidMetadata {
          givenName
          familyName
        }
        support {
          __typename
        }
      }
    }
  `;

  const res = await query<OrcidQuery, OrcidQueryVariables>(
    orcidQuery,
    { orcid: id, chain: network.gqlName },
    fetch,
  );

  const { orcidLinkedIdentityByOrcid: orcidAccount } = res;

  if (!orcidAccount) {
    return null;
  }

  const orcidName = getOrcidDisplayName(orcidAccount);

  return {
    bgColor: '#5555FF',
    type: 'ORCID',
    headline: orcidName,
    avatarSrc: null,
    stats: [],
  };
}

async function loadRpgfRoundData(f: typeof fetch, id: string) {
  const round = await getRound(f, id);

  if (!round) {
    return null;
  }

  const avatarSrc = round.customAvatarCid
    ? `https://drips.network/api/custom-avatars/${round.customAvatarCid}`
    : `/api/twemoji-avatar.png?emoji=${encodeURIComponent(round.emoji)}&bgColor=FFFFFF`;

  return {
    bgColor: round.color,
    type: 'RetroPGF Round',
    headline: round.name,
    avatarSrc,
    stats: [],
  };
}

async function loadStreamData(f: typeof fetch, id: string) {
  try {
    const { senderAccountId, tokenAddress, dripId } = decodeStreamId(id);

    const streamQuery = gql`
      query StreamShareImage($senderAccountId: ID!, $chains: [SupportedChain!]) {
        ${DRIP_LIST_BADGE_FRAGMENT}
        ${ECOSYSTEM_BADGE_FRAGMENT}
        streams(chains: $chains, where: { senderId: $senderAccountId }) {
          id
          name
          sender {
            account {
              accountId
              driver
              address
            }
            chainData {
              chain
            }
          }
          receiver {
            __typename
            ... on User {
              account {
                accountId
                driver
                address
              }
            }
            ...DripListBadge
            ...EcosystemBadge
          }
          config {
            amountPerSecond {
              amount
              tokenAddress
            }
          }
        }
      }
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await query<any, any>(
      streamQuery,
      { senderAccountId, chains: [network.gqlName] },
      f,
    );

    const expectedStreamId = makeStreamId(senderAccountId, tokenAddress, dripId);

    const stream = res.streams.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.id.toLowerCase() === expectedStreamId.toLowerCase(),
    );

    if (!stream) return null;

    const token = DRIPS_DEFAULT_TOKEN_LIST.find(
      (t) =>
        t.address.toLowerCase() === tokenAddress.toLowerCase() && t.chainId === network.chainId,
    );

    const decimals = token?.decimals ?? 18;
    const symbol = token?.symbol ?? 'Tokens';

    const formattedAmount = formatTokenAmount(
      {
        amount: BigInt(stream.config.amountPerSecond.amount),
        tokenAddress: stream.config.amountPerSecond.tokenAddress,
      },
      decimals,
      undefined,
      false,
    );

    // Construct visuals
    const senderDriverId = stream.sender.account.driver;
    let senderVisual: VisualBadge = {
      type: 'identity',
      data: '0x0000000000000000000000000000000000000000',
    };

    // If sender is AddressDriver (standard user), convert ID to address
    if (senderDriverId === network.contracts.ADDRESS_DRIVER) {
      const senderAddress = (stream.sender.account as AddressDriverAccount).address;
      senderVisual = { type: 'identity', data: senderAddress };
    } else {
      // TODO: Handle other drivers (e.g. NFT driver) if needed.
      // For now fallback to a placeholder or maybe try to treat as address if possible.
      // But usually stream sender is a user.
    }

    const tokenIcon = 'CoinFlying';

    let receiverVisual: VisualBadge;

    switch (stream.receiver.__typename) {
      case 'DripList':
        receiverVisual = { type: 'drip-list', data: stream.receiver };
        break;
      case 'EcosystemMainAccount':
        receiverVisual = { type: 'ecosystem', data: stream.receiver };
        break;
      case 'User': {
        const receiverDriverId = stream.receiver.account.driver;

        if (receiverDriverId === network.contracts.ADDRESS_DRIVER) {
          const receiverAddress = (stream.receiver.account as AddressDriverAccount).address;
          receiverVisual = { type: 'identity', data: receiverAddress };
        } else {
          // Fallback
          receiverVisual = {
            type: 'identity',
            data: '0x0000000000000000000000000000000000000000',
          };
        }
        break;
      }
      default:
        // Fallback for unknown
        receiverVisual = { type: 'identity', data: '0x0000000000000000000000000000000000000000' };
        break;
    }

    return {
      bgColor: '#5555FF', // Default stream color
      type: 'Continuous Donation',
      headline:
        stream.name ||
        (stream.receiver.__typename === 'DripList' ||
        stream.receiver.__typename === 'EcosystemMainAccount'
          ? stream.receiver.name
          : 'Unnamed stream'),
      avatarSrc: null,
      stats: [
        {
          icons: [senderVisual, tokenIcon, receiverVisual],
          label: `${formattedAmount} ${symbol} / month`,
        },
      ],
    };
  } catch (_) {
    return null;
  }
}

const LOAD_FNS = {
  [ShareImageType.WAVE_PROGRAM]: loadWaveProgramData,
  [ShareImageType.PROJECT]: loadProjectData,
  [ShareImageType.DRIP_LIST]: loadDripListData,
  [ShareImageType.ECOSYSTEM]: loadEcosystemData,
  [ShareImageType.ORCID]: loadOrcidData,
  [ShareImageType.RPGF_ROUND]: loadRpgfRoundData,
  [ShareImageType.STREAM]: loadStreamData,
} as const;

export const load = async ({ params }) => {
  const { type, id } = params;

  if (!isShareImageType(type)) {
    throw error(404);
  }

  const data = await LOAD_FNS[type](fetch, id);

  if (!data) {
    throw error(404, 'Not found');
  }

  return {
    ...data,
  };
};
