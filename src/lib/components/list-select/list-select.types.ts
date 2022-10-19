import type { SvelteComponent } from 'svelte';

export interface SelectableItem {
  type: 'selectable';
  label: string;
  text: string;
  image?:
    | string
    | {
        component: typeof SvelteComponent;
        props: { [propName: string]: unknown };
      };
}

export interface ActionItem {
  type: 'action';
  label: string;
  handler: () => void;
  image?:
    | string
    | {
        component: typeof SvelteComponent;
        props: { [propName: string]: unknown };
      };
}

export type ListItem = SelectableItem | ActionItem;

export type Items = { [slug: string]: ListItem };
