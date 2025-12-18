<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { BlueprintOrBlueprintError, Split } from '../../../../utils/blueprints/schemas';
  import type {
    Items,
    Weights,
    ListEditorItem,
    RecipientResult,
  } from '$lib/components/list-editor/types';
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

        const processRecipient = async (
          promise: Promise<RecipientResult>,
          splitType: Split['type'],
          identifier: string,
          errorMessage: string,
          weight: number,
          itemIndex: number,
        ) => {
          const result = await promise;

          let key: keyof Omit<NonNullable<RecipientResult>, 'accountId'>;
          let type: ListEditorItem['type'];

          switch (splitType) {
            case 'address':
              key = 'address';
              type = 'address';
              break;
            case 'project':
              key = 'project';
              type = 'project';
              break;
            case 'drip-list':
              key = 'dripList';
              type = 'drip-list';
              break;
            case 'orcid-id':
              key = 'orcid';
              type = 'orcid';
              break;
          }

          if (result && result[key]) {
            splitsToAdd[result.accountId] = {
              type,
              [key]: result[key],
            } as unknown as ListEditorItem;

            weightsToAdd[result.accountId] = weight;
          } else {
            const error = new AddItemSuberror(errorMessage, identifier, itemIndex + 1);
            errors.push(error);
          }
        };

        for (const [index, split] of blueprintSplits.entries()) {
          switch (split.type) {
            case 'address':
              await processRecipient(
                getAddress(split.ethAddress),
                split.type,
                split.ethAddress,
                'This address is invalid.',
                split.weight,
                index,
              );
              break;

            case 'project':
              await processRecipient(
                getProject(`https://github.com/${split.repoName}`),
                split.type,
                split.repoName,
                'This project is invalid.',
                split.weight,
                index,
              );
              break;

            case 'drip-list':
              await processRecipient(
                getDripList(split.accountId),
                split.type,
                split.accountId,
                'This drip list is invalid.',
                split.weight,
                index,
              );
              break;

            case 'orcid-id':
              await processRecipient(
                getOrcid(split.orcidId),
                split.type,
                split.orcidId,
                'This ORCID iD is invalid.',
                split.weight,
                index,
              );
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
