import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
import type { Stream } from '$lib/stores/streams/types';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { gql } from 'graphql-request';
import type { DripListCardSupporterPileFragment } from './__generated__/gql.generated';

export const DRIP_LIST_CARD_SUPPORTER_PILE_FRAGMENT = gql`
  fragment DripListCardSupporterPile on DripList {
    support {
      ... on DripListSupport {
        dripList {
          owner {
            address
          }
        }
      }
      ... on ProjectSupport {
        project {
          ...ProjectAvatar
        }
      }
      ... on OneTimeDonationSupport {
        account {
          address
        }
      }
    }
  }
`;

export default function getSupportersPile(
  streams: Stream[],
  support: DripListCardSupporterPileFragment['support'],
) {
  let result = [];

  result.push(
    ...mapFilterUndefined(support, (s) => {
      switch (s.__typename) {
        case 'DripListSupport':
          return {
            component: IdentityBadge,
            props: {
              address: s.dripList.owner.address,
              showIdentity: false,
              size: 'normal',
              disableTooltip: true,
            },
          };
        case 'ProjectSupport':
          return {
            component: ProjectAvatar,
            props: {
              project: s.project,
              outline: true,
              size: 'tiny',
            },
          };
        case 'OneTimeDonationSupport':
          return {
            component: IdentityBadge,
            props: {
              address: s.account.address,
              showIdentity: false,
              size: 'normal',
              disableTooltip: true,
            },
          };
      }
    }),
  );

  // If the owner is streaming to the list, we only want to show them once in the pile.
  if (streams.length > 0) {
    result.push({
      component: IdentityBadge,
      props: {
        address: streams[0].sender.address,
        showIdentity: false,
        size: 'normal',
        disableTooltip: true,
      },
    });
  }

  // Dedupe identity badges based on address prop
  result = result.filter(
    (item, index, self) =>
      self.findIndex((i) => i && item && i.props.address === item.props.address) === index,
  );

  return result.flat();
}
