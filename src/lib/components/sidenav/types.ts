import type { SvelteComponent } from 'svelte';

export interface SidenavItem {
  label: string;
  icon: typeof SvelteComponent;
  href: string;
  external?: boolean;
}

export type SidenavItems = SidenavItem[];
