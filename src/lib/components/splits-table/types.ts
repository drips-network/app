import type { ComponentType } from 'svelte';

export interface SplitsTableRow {
  subject:
    | string
    | {
        component: ComponentType;
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
