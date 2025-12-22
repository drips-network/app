import { error } from '@sveltejs/kit';
import { ShareImageType } from './types.js';
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
  ProfileQuery,
} from './__generated__/gql.generated.js';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data.js';
import { fetchEcosystem } from '../../../../../(pages)/app/(app)/ecosystems/[ecosystemId]/fetch-ecosystem.js';
import getOrcidDisplayName from '$lib/utils/orcids/display-name.js';
import { getRound } from '$lib/utils/rpgf/rpgf.js';
import { getWaveProgram } from '$lib/utils/wave/wavePrograms.js';
import { resolveAccountIdToAddress } from '$lib/utils/sdk/utils/resolve-account-id-to-address';
import formatAddress from '$lib/utils/format-address';
import { JsonRpcProvider } from 'ethers';
import { getMainnetProvider, resolveEnsProfile } from '$lib/stores/ens/ens';

const currentNetworkProvider = new JsonRpcProvider(network.rpcUrl);
const mainnetProvider = network.enableEns ? getMainnetProvider() : null;

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
            icon: 'DripList',
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
        icon: 'DripList',
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
        icon: 'DripList',
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

async function loadProfileData(f: typeof fetch, universalAccountId: string) {
  const resolution = await resolveAccountIdToAddress(
    universalAccountId,
    currentNetworkProvider,
    mainnetProvider,
    network.chainId,
  );

  let address: string;

  switch (resolution.type) {
    case 'success':
      address = resolution.address;
      break;
    case 'driver-account':
      if (resolution.driver === 'nft' || resolution.driver === 'repo') {
        throw error(404, 'Use the Drip List share image for this account type');
      }
      throw error(404, 'Not Found');
    case 'ens-not-resolved':
      throw error(404, 'ENS not resolvable');
    case 'not-found':
    default:
      throw error(404, 'Not Found');
  }

  const profileQuery = gql`
    query Profile($address: String!, $chains: [SupportedChain!]) {
      userByAddress(address: $address, chains: $chains) {
        account {
          driver
          address
          accountId
        }
        chainData {
          chain
          support {
            __typename
          }
        }
      }
    }
  `;

  const [userRes, ensProfile] = await Promise.all([
    query(profileQuery, { address, chains: [network.gqlName] }, fetch),
    resolveEnsProfile(address, currentNetworkProvider, mainnetProvider, network.chainId),
  ]);

  const { userByAddress } = userRes as ProfileQuery;

  if (!userByAddress) {
    return null;
  }

  const chainData = filterCurrentChainData(userByAddress.chainData);

  return {
    bgColor: '#5555FF',
    type: '',
    headline: ensProfile?.ensName ?? formatAddress(address),
    avatarSrc: ensProfile?.avatarUrl ?? null,
    stats: [
      {
        icon: 'Ethereum',
        label: formatAddress(address),
      },
      {
        icon: 'Heart',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        label: `${(chainData as any)?.support?.length ?? 0} Supporters`,
      },
    ],
  };
}

const LOAD_FNS = {
  [ShareImageType.WAVE_PROGRAM]: loadWaveProgramData,
  [ShareImageType.PROJECT]: loadProjectData,
  [ShareImageType.DRIP_LIST]: loadDripListData,
  [ShareImageType.ECOSYSTEM]: loadEcosystemData,
  [ShareImageType.ORCID]: loadOrcidData,
  [ShareImageType.RPGF_ROUND]: loadRpgfRoundData,
  [ShareImageType.PROFILE]: loadProfileData,
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
