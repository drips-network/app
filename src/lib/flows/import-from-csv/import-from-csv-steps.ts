import { makeStep } from '$lib/components/stepper/types';
import Upload from './upload.svelte';

type UploadProps = {
  allowProjects?: boolean;
  allowAddresses?: boolean;
  allowDripLists?: boolean;
  exampleTableHeaders?: Array<string> | undefined;
  exampleTableData?: Array<Array<unknown>> | undefined;
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
