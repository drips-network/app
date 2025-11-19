import { makeStep } from '$lib/components/stepper/types';
import type { CustomDataset } from '$lib/utils/rpgf/types/customDataset';
import EnterCustomDatasetDetails from './edit-custom-dataset-details.svelte';

export default (customDataset: CustomDataset, existingCustomDatasets: CustomDataset[]) => {
  return {
    steps: [
      makeStep({
        component: EnterCustomDatasetDetails,
        props: {
          customDataset,
          existingCustomDatasets,
        },
      }),
    ],
  };
};
