<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { BlueprintOrBlueprintError } from '../../../../utils/blueprints/schemas';
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
  import { AddItemError, AddItemSuberror } from '$lib/components/list-editor/errors';

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

        let errors: Array<AddItemSuberror> = [];

        for (const [index, split] of blueprintSplits.entries()) {
          switch (split.type) {
            case 'address': {
              const recipientResult = await getAddress(split.ethAddress);

              if (recipientResult && recipientResult.address) {
                splitsToAdd[recipientResult.accountId] = {
                  type: 'address',
                  address: recipientResult.address,
                };

                weightsToAdd[recipientResult.accountId] = split.weight;
              } else {
                const error = new AddItemSuberror(
                  "We couldn't process this address.",
                  split.ethAddress,
                  index + 1,
                );
                errors.push(error);
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
              } else {
                const error = new AddItemSuberror(
                  "We couldn't process this project.",
                  split.repoName,
                  index + 1,
                );
                errors.push(error);
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
              } else {
                const error = new AddItemSuberror(
                  "We couldn't process this drip list.",
                  split.accountId,
                  index + 1,
                );
                errors.push(error);
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
                } else {
                  const error = new AddItemSuberror(
                    "We couldn't process this ORCID iD.",
                    split.orcidId,
                    index + 1,
                  );
                  errors.push(error);
                }
              }
              break;
          }

          splitsProcessed++;
        }

        if (errors.length) {
          const recipientError = new AddItemError(
            'Some of your blueprint recipients were invalid',
            'error',
            'They won’t be included in your splits.',
            errors,
          );
          context.update((c) => {
            c.recipientErrors = [recipientError];
            return c;
          });
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
