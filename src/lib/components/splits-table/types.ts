export interface SplitsTableRow {
  text: string;
  percent: string;
}

export interface SplitsTable {
  splits: SplitsTableRow[];
  splitsTotalPercent: string;
  remainderPercent: string;
  remainderReceiver: string;
}
