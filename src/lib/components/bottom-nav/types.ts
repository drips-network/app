import type { ComponentType } from 'svelte';

export interface BottomNavItem {
  label: string;
  icon: ComponentType;
  href: string;
}

export type BottomNavItems = BottomNavItem[];
