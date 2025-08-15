import type { ComponentType } from 'svelte';

export interface BottomNavItem {
  label: string;
  description?: string;
  icon: ComponentType;
  href: string;
}

export type BottomNavItems = BottomNavItem[];
