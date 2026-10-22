import { gql } from 'graphql-request';
import { PROJECT_BADGE_FRAGMENT } from '../project-badge/project-badge.svelte';
import { DRIP_LIST_BADGE_FRAGMENT } from '../drip-list-badge/drip-list-badge.svelte';
import type {
  ListEditorDripListFragment,
  ListEditorProjectFragment,
  ListEditorOrcidFragment,
} from './__generated__/gql.generated';
import type { Component } from 'svelte';
import { ORCID_BADGE_FRAGMENT } from '../../../routes/(pages)/app/(app)/orcids/[orcidId]/components/orcid-badge.svelte';
import type { AccountId } from '$lib/utils/common-types';

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

export const LIST_EDITOR_ORCID_FRAGMENT = gql`
  ${ORCID_BADGE_FRAGMENT}
  fragment ListEditorOrcid on OrcidLinkedIdentity {
    ...OrcidBadge
  }
`;

type BaseItem = {
  rightComponent?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: Component<any>;
    props: Record<string, unknown>;
  };
};

type ProjectItem = BaseItem & {
  type: 'project';
  project: ListEditorProjectFragment;
};

export type DripListItem = BaseItem & {
  type: 'drip-list';
  dripList: ListEditorDripListFragment;
};

type EthAddressItem = BaseItem & {
  type: 'address';
  address: string;
};

type OrcidItem = BaseItem & {
  type: 'orcid';
  orcid: ListEditorOrcidFragment;
};

export type ListEditorItem = ProjectItem | DripListItem | EthAddressItem | OrcidItem;

export type Items = Record<AccountId, ListEditorItem>;
export type Weights = Record<AccountId, number>;

export const WEIGHT_FACTOR = 10_000;

export type RecipientResult = {
  accountId: string;
  dripList?: ListEditorDripListFragment;
  project?: ListEditorProjectFragment;
  orcid?: ListEditorOrcidFragment;
  address?: string;
} | null;

export type RecipientClassification = {
  type: 'project' | 'address' | 'drip-list' | 'orcid';
  value: string;
  resolvedAddress?: string | undefined;
  validate: () => Promise<boolean | string | undefined>;
  fetch: () => Promise<RecipientResult>;
} | null;

export interface ListEditorConfig {
  items: Items;
  weights: Weights;
}
