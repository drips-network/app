import type { SvelteComponent } from 'svelte';

export interface SelectableItem {
  type: 'selectable';
  label: string;
  text: string;
  image?: typeof SvelteComponent | string;
}

export interface ActionItem {
  type: 'action';
  label: string;
  handler: () => void;
  image?: typeof SvelteComponent | string;
}

export type ListItem = SelectableItem | ActionItem;

export type Items = { [slug: string]: ListItem };
