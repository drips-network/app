import type { SvelteComponent } from 'svelte';

export interface SplitsTableRow {
  subject:
    | string
    | {
        component: typeof SvelteComponent;
        props: { [propName: string]: unknown };
      };
  percent: string;
}

export interface SplitsTable {
  splits: SplitsTableRow[];
  splitsTotalPercent: string;
  remainderPercent: string;
  remainderReceiver: string;
}

export interface SplitsTableFull {
  user: string;
  incoming: {
    splits: SplitsTableRow[];
  };
  outgoing: {
    splits: SplitsTableRow[];
    splitsTotalPercent: string;
  };
}
