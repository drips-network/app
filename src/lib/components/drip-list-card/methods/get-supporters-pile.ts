import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
import ProjectAvatar, {
  PROJECT_AVATAR_FRAGMENT,
} from '$lib/components/project-avatar/project-avatar.svelte';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { gql } from 'graphql-request';
import type { SupporterPileFragment } from './__generated__/gql.generated';
import type { ComponentProps } from 'svelte';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data';

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

type SupporterPileItem =
  | {
      component: typeof IdentityBadge;
      props: ComponentProps<IdentityBadge>;
    }
  | {
      component: typeof ProjectAvatar;
      props: ComponentProps<ProjectAvatar>;
    };

export default function getSupportersPile(
  support: SupporterPileFragment[],
  size: 'tiny' | 'normal' = 'normal',
): SupporterPileItem[] {
  let result: SupporterPileItem[] = [];

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
    ...mapFilterUndefined(support, (s): SupporterPileItem | undefined => {
      switch (s.__typename) {
        case 'DripListSupport':
          return {
            component: IdentityBadge,
            props: {
              address: s.dripList.owner.address,
              showIdentity: false,
              size: COMPONENT_SIZES[size]['IdentityBadge'] as ComponentProps<IdentityBadge>['size'],
              disableTooltip: true,
              disableLink: true,
            },
          };
        case 'ProjectSupport':
          return {
            component: ProjectAvatar,
            props: {
              project: filterCurrentChainData(s.project.chainData),
              size: COMPONENT_SIZES[size]['ProjectAvatar'] as ComponentProps<ProjectAvatar>['size'],
            },
          };
        case 'OneTimeDonationSupport':
          return {
            component: IdentityBadge,
            props: {
              address: s.account.address,
              showIdentity: false,
              size: COMPONENT_SIZES[size]['IdentityBadge'] as ComponentProps<IdentityBadge>['size'],
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
              size: COMPONENT_SIZES[size]['IdentityBadge'] as ComponentProps<IdentityBadge>['size'],
              disableTooltip: true,
              disableLink: true,
            },
          };
      }
    }),
  );

  // Dedupe identity badges based on address prop (only for IdentityBadge components)
  result = result.filter(
    (item, index, self) =>
      self.findIndex((i) => {
        if (!i || !item) return false;
        // Only dedupe IdentityBadge components by address
        if (item.component === IdentityBadge && i.component === IdentityBadge) {
          return (
            (i.props as ComponentProps<IdentityBadge>).address ===
            (item.props as ComponentProps<IdentityBadge>).address
          );
        }
        // For different component types or ProjectAvatar, don't dedupe
        return i === item;
      }) === index,
  );

  return result.flat();
}
