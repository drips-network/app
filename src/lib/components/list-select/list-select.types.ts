/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Component, ComponentProps } from 'svelte';

interface ComponentAndProps {
  component: Component<any>;
  props: ComponentProps<Component<any>>;
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
        component: Component<any>;
        props: ComponentProps<Component<any>>;
      };
}

export type ListItem = SelectableItem | ActionItem | InterstitialItem;

export type Items = { [slug: string]: ListItem };
