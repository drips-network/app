import type { Component } from 'svelte';

export interface BottomNavItem {
  label: string;
  description?: string;
  icon: Component<{ style: string }>;
  href: string;
}

export type BottomNavItems = BottomNavItem[];
