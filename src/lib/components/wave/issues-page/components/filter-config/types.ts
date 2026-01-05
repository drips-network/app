export type SingleSelectConfig<OT extends { label: string; value: string }[]> = {
  type: 'single-select';
  label: string;
  options: OT;
};

export type DropdownConfig<OT extends { label: string; value: string }[]> = {
  type: 'dropdown';
  label: string;
  optionsPromise: Promise<OT>;
};

export type ToggleConfig = {
  type: 'toggle';
  label: string;
  toggleLabel: string;
};

export type FilterConfig =
  | SingleSelectConfig<{ label: string; value: string }[]>
  | DropdownConfig<{ label: string; value: string }[]>
  | ToggleConfig;
