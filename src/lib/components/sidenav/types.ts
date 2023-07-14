import type { ComponentType } from 'svelte';

export interface SidenavItem {
  label: string;
  icon: ComponentType;
  href: string;
  external?: boolean;
}

export type SidenavItems = SidenavItem[];
