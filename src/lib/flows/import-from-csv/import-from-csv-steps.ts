import { makeStep } from '$lib/components/stepper/types';
import Upload from './upload.svelte';
import type { ListEditorItem, AccountId } from '$lib/components/list-editor/types';

type UploadProps = {
  headline?: string;
  description?: string;
  allowProjects?: boolean;
  allowAddresses?: boolean;
  allowDripLists?: boolean;
  maxEntries?: number;
  exampleTableHeaders?: Array<string> | undefined;
  exampleTableData?: Array<Array<unknown>> | undefined;
  exampleTableCaption?: string | undefined;
  addItem: (key: AccountId, item: ListEditorItem, weight: number | undefined) => undefined;
  clearItems: () => undefined;
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
