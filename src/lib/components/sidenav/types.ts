import type { Component } from 'svelte';

export interface SidenavItem {
  label: string;
  icon: Component<{ style: string }>;
  href: string;
  external?: boolean;
}

export type SidenavItems = SidenavItem[];
