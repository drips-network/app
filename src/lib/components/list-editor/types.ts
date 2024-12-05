import { gql } from 'graphql-request';
import { PROJECT_BADGE_FRAGMENT } from '../project-badge/project-badge.svelte';
import { DRIP_LIST_BADGE_FRAGMENT } from '../drip-list-badge/drip-list-badge.svelte';
import type {
  ListEditorDripListFragment,
  ListEditorProjectFragment,
} from './__generated__/gql.generated';
import type { ComponentType } from 'svelte';

export const LIST_EDITOR_PROJECT_FRAGMENT = gql`
  ${PROJECT_BADGE_FRAGMENT}
  fragment ListEditorProject on Project {
    ...ProjectBadge
    isVisible
  }
`;

export const LIST_EDITOR_DRIP_LIST_FRAGMENT = gql`
  ${DRIP_LIST_BADGE_FRAGMENT}
  fragment ListEditorDripList on DripList {
    ...DripListBadge
    isVisible
  }
`;

type BaseItem = {
  rightComponent?: {
    component: ComponentType;
    props: Record<string, unknown>;
  };
};

type ProjectItem = BaseItem & {
  type: 'project';
  project: ListEditorProjectFragment;
};

type DripListItem = BaseItem & {
  type: 'drip-list';
  dripList: ListEditorDripListFragment;
};

type EthAddressItem = BaseItem & {
  type: 'address';
  address: string;
};

export type ListEditorItem = ProjectItem | DripListItem | EthAddressItem;

export type AccountId = string;

export type Items = Record<AccountId, ListEditorItem>;
export type Weights = Record<AccountId, number>;

export type RecipientResult = {
  accountId: string;
  dripList?: ListEditorDripListFragment;
  project?: ListEditorProjectFragment;
  address?: string;
} | null;

export type RecipientClassification = {
  type: 'project' | 'address' | 'drip-list';
  value: string;
  resolvedAddress?: string | undefined;
  validate: () => Promise<boolean | string | undefined>;
  fetch: () => Promise<RecipientResult>;
} | null;
