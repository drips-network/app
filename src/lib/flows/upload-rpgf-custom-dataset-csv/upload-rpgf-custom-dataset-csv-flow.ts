import { makeStep } from '$lib/components/stepper/types';
import type { CustomDataset } from '$lib/utils/rpgf/types/customDataset';
import UploadRpgfCustomDatasetCsv from './upload-rpgf-custom-dataset-csv.svelte';

export default (customDataset: CustomDataset) => {
  return {
    steps: [
      makeStep({
        component: UploadRpgfCustomDatasetCsv,
        props: {
          customDataset,
        },
      }),
    ],
  };
};
