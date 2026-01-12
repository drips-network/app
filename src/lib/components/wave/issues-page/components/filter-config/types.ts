interface LinkConfig {
  label: string;
  href: string;
}

export type SingleSelectConfig<OT extends { label: string; value: string }[]> = {
  type: 'single-select';
  label: string;
  link?: LinkConfig;
  options: OT;
};

export type DropdownConfig<OT extends { label: string; value: string }[]> = {
  type: 'dropdown';
  label: string;
  link?: LinkConfig;
  optionsPromise: Promise<OT>;
};

export type FilterConfig =
  | SingleSelectConfig<{ label: string; value: string }[]>
  | DropdownConfig<{ label: string; value: string }[]>;
