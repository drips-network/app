import type { SvelteComponent } from 'svelte';

export interface BottomNavItem {
  label: string;
  icon: typeof SvelteComponent;
  href: string;
}

export type BottomNavItems = BottomNavItem[];
