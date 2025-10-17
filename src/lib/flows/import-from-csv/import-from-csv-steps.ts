import { makeStep } from '$lib/components/stepper/types';
import Upload from './upload.svelte';
import type { ListEditorItem } from '$lib/components/list-editor/types';
import type { AddItemError, AddItemSuberror } from '$lib/components/list-editor/errors';
import type { AccountId } from '$lib/utils/common-types';

type UploadProps = {
  headline: string;
  description: string;
  allowProjects?: boolean;
  allowAddresses?: boolean;
  allowDripLists?: boolean;
  allowOrcids?: boolean;
  csvHeaders?: Array<string>;
  csvMaxEntries?: number;
  exampleTableHeaders?: Array<string> | undefined;
  exampleTableData?: Array<Array<unknown>> | undefined;
  exampleTableCaption?: string | undefined;
  addItem: (key: AccountId, item: ListEditorItem, weight: number | undefined) => undefined;
  clearItems: () => undefined;
  onItemsError?: (errors: Array<AddItemSuberror>) => AddItemError;
};

export const DEFAULT_CSV_HEADERS = ['recipient', 'percentage'];
export const DEFAULT_MAX_ENTRIES = 200;
export const WEIGHT_FACTOR = 10_000;

export default (props: UploadProps) => ({
  context: undefined,
  steps: [
    makeStep({
      component: Upload,
      props,
    }),
  ],
});
