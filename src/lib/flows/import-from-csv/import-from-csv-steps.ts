import { makeStep } from '$lib/components/stepper/types';
import Upload from './upload.svelte';

type UploadProps = {
  headline?: string;
  description?: string;
  allowProjects?: boolean;
  allowAddresses?: boolean;
  allowDripLists?: boolean;
  exampleTableHeaders?: Array<string> | undefined;
  exampleTableData?: Array<Array<unknown>> | undefined;
  exampleTableCaption?: string | undefined;
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
