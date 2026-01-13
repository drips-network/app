import type { Component } from 'svelte';

export interface BottomNavItem {
  label: string;
  description?: string;
  icon: Component<{ style: string }>;
  external?: boolean;
  href: string;
}

export type BottomNavItems = BottomNavItem[];
