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
  /**
   * Lazily loads the dropdown options. Only invoked once the user opens the
   * dropdown (or when a value is already selected and its label needs
   * resolving), so heavy option fetches don't run on every page view.
   */
  getOptions: () => Promise<OT>;
};

export type MultiSelectConfig<OT extends { label: string; value: string }[]> = {
  type: 'multi-select';
  label: string;
  link?: LinkConfig;
  optionsPromise: Promise<OT>;
};

export type FilterConfig =
  | SingleSelectConfig<{ label: string; value: string }[]>
  | DropdownConfig<{ label: string; value: string }[]>
  | MultiSelectConfig<{ label: string; value: string }[]>;
