import type { ComponentType } from 'svelte';

interface ComponentAndProps {
  component: ComponentType;
  props: { [propName: string]: unknown };
}

type SearchString = string | string[];

export interface SelectableItem {
  type: 'selectable';
  label: string | ComponentAndProps;
  searchString?: SearchString;
  text?: string | ComponentAndProps;
  disabled?: boolean;
  image?: string | ComponentAndProps;
  editablePercentage?: true;
}

export interface InterstitialItem {
  type: 'interstitial';
  label: string;
  description: string;
}

export interface ActionItem {
  type: 'action';
  label: string;
  searchString?: SearchString;
  handler: () => void;
  disabled?: boolean;
  image?:
    | string
    | {
        component: ComponentType;
        props: { [propName: string]: unknown };
      };
}

export type ListItem = SelectableItem | ActionItem | InterstitialItem;

export type Items = { [slug: string]: ListItem };
