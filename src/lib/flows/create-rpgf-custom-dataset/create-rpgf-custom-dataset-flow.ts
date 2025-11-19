import { makeStep } from '$lib/components/stepper/types';
import type { CustomDataset } from '$lib/utils/rpgf/types/customDataset';
import EnterCustomDatasetDetails from './enter-custom-dataset-details.svelte';

export default (roundId: string, existingCustomDatasets: CustomDataset[]) => {
  return {
    steps: [
      makeStep({
        component: EnterCustomDatasetDetails,
        props: {
          roundId,
          existingCustomDatasets,
        },
      }),
    ],
  };
};
