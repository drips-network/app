<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { BlueprintOrBlueprintError } from '../../../../../routes/api/list-blueprints/blueprintSchema';
  import type { Items, Weights } from '$lib/components/list-editor/types';
  import {
    getAddress,
    getDripList,
    getOrcid,
    getProject,
  } from '$lib/components/list-editor/hydrators';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../create-drip-list-flow';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let blueprintOrBlueprintError: BlueprintOrBlueprintError;

  let amountOfSplitsToProcess = 0;
  let splitsProcessed = 0;

  onMount(() => {
    amountOfSplitsToProcess =
      'blueprint' in blueprintOrBlueprintError
        ? blueprintOrBlueprintError.blueprint.splits.length
        : 0;

    dispatch('await', {
      message: 'Populating blueprint...',

      progressBar: {
        progressFn() {
          const progressFraction =
            amountOfSplitsToProcess === 0 ? 1 : splitsProcessed / amountOfSplitsToProcess;

          if (progressFraction === 1) {
            return {
              progressFraction: 1,
              remainingText: undefined,
            };
          }

          return {
            progressFraction,
            remainingText:
              amountOfSplitsToProcess === 0
                ? undefined
                : `${splitsProcessed} of ${amountOfSplitsToProcess} recipients processed`,
          };
        },
        centeredProgressText: true,
      },

      promise: async () => {
        if ('blueprintError' in blueprintOrBlueprintError) {
          let errorMessage = 'An unknown error occurred';

          switch (blueprintOrBlueprintError.blueprintError) {
            case 'not-found':
              errorMessage = 'The specified blueprint could not be found.';
              break;
            case 'invalid':
              errorMessage = 'The specified blueprint is invalid.';
              break;
          }

          throw new Error(errorMessage);
        }

        const {
          splits: blueprintSplits,
          listName,
          listDescription,
        } = blueprintOrBlueprintError.blueprint;

        let splitsToAdd: Items = {};
        let weightsToAdd: Weights = {};

        for (const split of blueprintSplits) {
          switch (split.type) {
            case 'address': {
              const recipientResult = await getAddress(split.ethAddress);

              if (recipientResult && recipientResult.address) {
                splitsToAdd[recipientResult.accountId] = {
                  type: 'address',
                  address: recipientResult.address,
                };

                weightsToAdd[recipientResult.accountId] = split.weight;
              }

              break;
            }

            case 'project': {
              const recipientResult = await getProject(`https://github.com/${split.repoName}`);

              if (recipientResult && recipientResult.project) {
                splitsToAdd[recipientResult.accountId] = {
                  type: 'project',
                  project: recipientResult.project,
                };

                weightsToAdd[recipientResult.accountId] = split.weight;
              }
              break;
            }

            case 'drip-list': {
              const recipientResult = await getDripList(split.accountId);

              if (recipientResult && recipientResult.dripList) {
                splitsToAdd[recipientResult.accountId] = {
                  type: 'drip-list',
                  dripList: recipientResult.dripList,
                };

                weightsToAdd[recipientResult.accountId] = split.weight;
              }

              break;
            }

            case 'orcid-id':
              {
                const recipientResult = await getOrcid(split.orcidId);

                if (recipientResult && recipientResult.orcid) {
                  splitsToAdd[recipientResult.accountId] = {
                    type: 'orcid',
                    orcid: recipientResult.orcid,
                  };

                  weightsToAdd[recipientResult.accountId] = split.weight;
                }
              }
              break;
          }

          splitsProcessed++;
        }

        $context.dripList.items = splitsToAdd;
        $context.dripList.weights = weightsToAdd;
        $context.dripList.title = listName;
        $context.dripList.description = listDescription ?? undefined;
        $context.selectedCreationMode = 1; // choose by yourself
      },
    });
  });
</script>
