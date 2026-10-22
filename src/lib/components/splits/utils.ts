import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import type { Items, Weights } from '../list-editor/types';
import type { SplitsComponentSplitsReceiver } from './types';

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
