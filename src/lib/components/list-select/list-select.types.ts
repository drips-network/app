import type { ComponentType } from 'svelte';

interface ComponentAndProps {
  component: ComponentType;
  props: { [propName: string]: unknown };
}

export interface SelectableItem {
  type: 'selectable';
  label: string | ComponentAndProps;
  searchString?: string;
  text?: string;
  disabled?: boolean;
  image?: string | ComponentAndProps;
  rightSlotProps?: ComponentAndProps;
  editablePercentage?: {
    initialWeight: number;
  };
}

export interface InterstitialItem {
  type: 'interstitial';
  label: string;
  description: string;
}

export interface ActionItem {
  type: 'action';
  label: string;
  searchString?: string;
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
