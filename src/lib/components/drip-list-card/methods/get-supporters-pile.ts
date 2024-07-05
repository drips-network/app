import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
import ProjectAvatar, {
  PROJECT_AVATAR_FRAGMENT,
} from '$lib/components/project-avatar/project-avatar.svelte';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { gql } from 'graphql-request';
import type { SupporterPileFragment } from './__generated__/gql.generated';

export const SUPPORTER_PILE_FRAGMENT = gql`
  ${PROJECT_AVATAR_FRAGMENT}
  fragment SupporterPile on Support {
    ... on DripListSupport {
      dripList {
        owner {
          address
        }
      }
    }
    ... on ProjectSupport {
      project {
        chainData {
          ...ProjectAvatar
        }
      }
    }
    ... on OneTimeDonationSupport {
      account {
        address
      }
    }
    ... on StreamSupport {
      stream {
        sender {
          account {
            address
          }
        }
      }
    }
  }
`;

export default function getSupportersPile(
  support: SupporterPileFragment[],
  size: 'tiny' | 'normal' = 'normal',
) {
  let result = [];

  // Component sizes are unfortunately a mess so we need to do this
  const COMPONENT_SIZES = {
    tiny: {
      IdentityBadge: 'normal',
      ProjectAvatar: 'tiny',
    },
    normal: {
      IdentityBadge: 'medium',
      ProjectAvatar: 'normal',
    },
  };

  result.push(
    ...mapFilterUndefined(support, (s) => {
      switch (s.__typename) {
        case 'DripListSupport':
          return {
            component: IdentityBadge,
            props: {
              address: s.dripList.owner.address,
              showIdentity: false,
              size: COMPONENT_SIZES[size]['IdentityBadge'],
              disableTooltip: true,
              disableLink: true,
            },
          };
        case 'ProjectSupport':
          return {
            component: ProjectAvatar,
            props: {
              project: s.project,
              outline: true,
              size: COMPONENT_SIZES[size]['ProjectAvatar'],
            },
          };
        case 'OneTimeDonationSupport':
          return {
            component: IdentityBadge,
            props: {
              address: s.account.address,
              showIdentity: false,
              size: COMPONENT_SIZES[size]['IdentityBadge'],
              disableTooltip: true,
              disableLink: true,
            },
          };
        case 'StreamSupport':
          return {
            component: IdentityBadge,
            props: {
              address: s.stream.sender.account.address,
              showIdentity: false,
              size: COMPONENT_SIZES[size]['IdentityBadge'],
              disableTooltip: true,
              disableLink: true,
            },
          };
      }
    }),
  );

  // Dedupe identity badges based on address prop
  result = result.filter(
    (item, index, self) =>
      self.findIndex((i) => i && item && i.props.address === item.props.address) === index,
  );

  return result.flat();
}
