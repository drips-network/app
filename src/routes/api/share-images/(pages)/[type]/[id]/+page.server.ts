import { getWave } from '$lib/utils/wave/waves.js';
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
} from './__generated__/gql.generated.js';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data.js';
import { fetchEcosystem } from '../../../../../(pages)/app/(app)/ecosystems/[ecosystemId]/fetch-ecosystem.js';
import getOrcidDisplayName from '$lib/utils/orcids/display-name.js';
import { getRound } from '$lib/utils/rpgf/rpgf.js';

function isShareImageType(value: string): value is ShareImageType {
  return Object.values(ShareImageType).includes(value as ShareImageType);
}

async function loadWaveData(f: typeof fetch, id: string) {
  const wave = await getWave(f, id);
  if (!wave) return null;

  return {
    bgColor: '#5555FF',
    type: 'Wave',
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

const LOAD_FNS = {
  [ShareImageType.WAVE]: loadWaveData,
  [ShareImageType.PROJECT]: loadProjectData,
  [ShareImageType.DRIP_LIST]: loadDripListData,
  [ShareImageType.ECOSYSTEM]: loadEcosystemData,
  [ShareImageType.ORCID]: loadOrcidData,
  [ShareImageType.RPGF_ROUND]: loadRpgfRoundData,
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
