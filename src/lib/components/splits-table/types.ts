import type { SvelteComponent } from 'svelte';

export interface SplitsTableRow {
  subject:
    | string
    | {
        component: typeof SvelteComponent;
        props: { [propName: string]: unknown };
      };
  percent: string | boolean;
}

export interface SplitsTable {
  user: string;
  incoming: {
    splits: SplitsTableRow[];
  };
  outgoing: {
    splits: SplitsTableRow[];
    splitsTotalPercent: string;
  };
}
