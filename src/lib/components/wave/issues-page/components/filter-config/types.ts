export type SingleSelectConfig<OT extends { label: string; value: string }[]> = {
  type: 'single-select';
  label: string;
  options: OT;
};

export type FilterConfig = SingleSelectConfig<{ label: string; value: string }[]>;
