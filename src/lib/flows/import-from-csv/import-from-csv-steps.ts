import { makeStep } from '$lib/components/stepper/types';
import Upload from './upload.svelte';
import type { ListEditorItem, AccountId } from '$lib/components/list-editor/types';
import type { AddItemError, AddItemSuberror } from '$lib/components/list-editor/errors';

type UploadProps = {
  headline: string;
  description: string;
  allowProjects?: boolean;
  allowAddresses?: boolean;
  allowDripLists?: boolean;
  csvHeaders?: Array<string>;
  csvMaxEntries?: number;
  exampleTableHeaders?: Array<string> | undefined;
  exampleTableData?: Array<Array<unknown>> | undefined;
  exampleTableCaption?: string | undefined;
  addItem: (key: AccountId, item: ListEditorItem, weight: number | undefined) => undefined;
  clearItems: () => undefined;
  onItemsError?: (errors: Array<AddItemSuberror>) => AddItemError;
};

export default (props: UploadProps) => ({
  context: undefined,
  steps: [
    makeStep({
      component: Upload,
      props,
    }),
  ],
});
