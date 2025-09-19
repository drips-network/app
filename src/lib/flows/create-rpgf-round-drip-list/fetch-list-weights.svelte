<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { getDripListWeightsForRound } from '$lib/utils/rpgf/rpgf';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from './create-rpgf-round-drip-list-flow';
  import { classifyRecipient } from '$lib/components/list-editor/classifiers';
  import type { Items, Weights } from '$lib/components/list-editor/types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let roundId: string;

  onMount(() => {
    dispatch('await', {
      message: 'Fetching list weights and project data. This may take a moment…',
      promise: async () => {
        const calculatedWeights = await getDripListWeightsForRound(undefined, roundId);

        if (Object.keys(calculatedWeights).length > 199) {
          throw new Error(
            'Drip Lists with more than 200 recipients are not yet supported. You can manually create multiple Drip Lists with subsets of recipients and link them to your round. Please feel free to reach out to us on Discord so we can help you resolve this.',
          );
        }

        const totalAllocatedWeight = Object.values(calculatedWeights).reduce(
          (sum, weight) => sum + weight,
          0,
        );

        if (totalAllocatedWeight !== 1_000_000) {
          throw new Error(
            `The total allocated weight for the drip list is ${totalAllocatedWeight}, but it should be exactly 1,000,000`,
          );
        }

        let items: Items = {};
        let weights: Weights = {};

        for (const [gitHubUrl, weight] of Object.entries(calculatedWeights)) {
          const classification = classifyRecipient(gitHubUrl, {
            allowProjects: true,
            allowAddresses: false,
            allowDripLists: false,
          });

          if (!classification) {
            throw new Error(`Failed to classify recipient: ${gitHubUrl}.`);
          }

          const recipientResult = await classification.fetch();

          if (!recipientResult || !recipientResult.project) {
            throw new Error(`Failed to fetch recipient data for: ${gitHubUrl}.`);
          }

          const { accountId } = recipientResult;

          items[accountId] = {
            type: 'project',
            project: recipientResult.project,
          };
          weights[accountId] = weight;
        }

        $context.weights = weights;
        $context.items = items;
      },
    });
  });
</script>
