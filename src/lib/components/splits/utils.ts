import query from '$lib/graphql/dripsQL';
import network from '$lib/stores/wallet/network';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import type {
  VoteReceiver,
  ProjectVoteReceiver,
  DripListVoteReceiver,
} from '$lib/utils/multiplayer/schemas';
import { gql } from 'graphql-request';
import type { Items, Weights } from '../list-editor/types';
import type {
  DripListForVoteReceiverQuery,
  DripListForVoteReceiverQueryVariables,
  ProjectForVoteReceiverQuery,
  ProjectForVoteReceiverQueryVariables,
} from './__generated__/gql.generated';
import {
  SPLITS_COMPONENT_PROJECT_FRAGMENT,
  SPLITS_COMPONENT_DRIP_LIST_FRAGMENT,
  type SplitsComponentSplitsReceiver,
} from './types';

export async function mapSplitsFromMultiplayerResults(
  receivers: VoteReceiver[],
  f = fetch,
): Promise<SplitsComponentSplitsReceiver[]> {
  const receiversToFetchDataFor = receivers.filter(
    (v): v is ProjectVoteReceiver | DripListVoteReceiver => {
      return 'type' in v && (v.type === 'project' || v.type === 'dripList');
    },
  );

  const receiversData = mapFilterUndefined(
    await Promise.all(
      receiversToFetchDataFor.map(async (v) => {
        const projectQuery = gql`
          ${SPLITS_COMPONENT_PROJECT_FRAGMENT}
          query ProjectForVoteReceiver($url: String!, $chains: [SupportedChain!]) {
            projectByUrl(url: $url, chains: $chains) {
              ...SplitsComponentProject
            }
          }
        `;

        const dripListQuery = gql`
          ${SPLITS_COMPONENT_DRIP_LIST_FRAGMENT}
          query DripListForVoteReceiver($id: ID!, $chain: SupportedChain!) {
            dripList(id: $id, chain: $chain) {
              chain
              ...SplitsComponentDripList
            }
          }
        `;

        if (v.type === 'dripList') {
          return (
            await query<DripListForVoteReceiverQuery, DripListForVoteReceiverQueryVariables>(
              dripListQuery,
              {
                id: v.accountId,
                chain: network.gqlName,
              },
              f,
            )
          ).dripList;
        } else {
          return (
            await query<ProjectForVoteReceiverQuery, ProjectForVoteReceiverQueryVariables>(
              projectQuery,
              { url: v.url, chains: [network.gqlName] },
              f,
            )
          ).projectByUrl;
        }
      }),
    ),
    (v) => (v ? v : undefined),
  );

  return mapFilterUndefined(receivers, (v) => {
    switch (v.type) {
      case 'address':
        return {
          __typename: 'AddressReceiver',
          account: {
            __typename: 'AddressDriverAccount',
            address: v.address,
          },
          weight: v.weight,
        };
      case 'project': {
        const project = receiversData.find(
          (
            p,
          ): p is Extract<
            typeof p,
            { __typename: 'ClaimedProjectData' | 'UnclaimedProjectData' }
          > => p.__typename !== 'DripList' && p.source.url === v.url,
        );
        if (!project) throw new Error(`Project not found for url: ${v.url}`);

        return {
          __typename: 'ProjectReceiver',
          project: project,
          weight: v.weight,
        };
      }
      case 'dripList': {
        const dripList = receiversData.find(
          (d): d is Extract<typeof d, { __typename: 'DripList' }> =>
            d.__typename === 'DripList' && d.account.accountId === v.accountId,
        );
        if (!dripList) throw new Error(`DripList not found for accountId: ${v.accountId}`);

        return {
          __typename: 'DripListReceiver',
          dripList: dripList,
          weight: v.weight,
        };
      }
    }
  });
}

export function mapSplitsFromListEditorData(
  items: Items,
  weights: Weights,
  groupPercentage: number,
): SplitsComponentSplitsReceiver[] {
  return mapFilterUndefined(Object.keys(items), (accountId) => {
    const item = items[accountId];

    const weight = Math.floor((groupPercentage / 100) * weights[accountId]);

    switch (item.type) {
      case 'address':
        return {
          __typename: 'AddressReceiver',
          account: {
            __typename: 'AddressDriverAccount',
            address: item.address,
          },
          weight,
        };
      case 'project':
        return {
          __typename: 'ProjectReceiver',
          project: item.project,
          weight,
        };
      case 'drip-list':
        return {
          __typename: 'DripListReceiver',
          dripList: item.dripList,
          weight,
        };
    }
  });
}
