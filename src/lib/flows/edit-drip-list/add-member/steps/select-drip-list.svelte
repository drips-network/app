<script module>
  export const SELECT_DRIP_LIST_STEP_LISTS_FRAGMENT = gql`
    ${DRIP_LIST_BADGE_FRAGMENT}
    ${EDIT_DRIP_LIST_FLOW_DRIP_LIST_FRAGMENT}
    fragment SelectDripListStepLists on DripList {
      ...DripListBadge
      ...EditDripListFlowDripList
      splits {
        ... on AddressReceiver {
          account {
            accountId
          }
        }
        ... on ProjectReceiver {
          account {
            accountId
          }
        }
        ... on DripListReceiver {
          account {
            accountId
          }
        }
        ... on EcosystemMainAccountReceiver {
          account {
            accountId
          }
        }
        ... on SubListReceiver {
          account {
            accountId
          }
        }
      }
    }
  `;

  export const SELECT_DRIP_LIST_PROJECT_TO_ADD_FRAGMENT = gql`
    fragment SelectDripListProjectToAdd on Project {
      account {
        accountId
      }
      source {
        url
      }
    }
  `;

  export const SELECT_DRIP_LIST_DRIP_LIST_TO_ADD_FRAGMENT = gql`
    fragment SelectDripListDripListToAdd on DripList {
      account {
        accountId
      }
    }
  `;
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import DripListBadge, {
    DRIP_LIST_BADGE_FRAGMENT,
  } from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import modal from '$lib/stores/modal';
  import buildUrl from '$lib/utils/build-url';
  import unreachable from '$lib/utils/unreachable';
  import { gql } from 'graphql-request';
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type {
    SelectDripListDripListToAddFragment,
    SelectDripListProjectToAddFragment,
    SelectDripListStepListsFragment,
  } from './__generated__/gql.generated';
  import { EDIT_DRIP_LIST_FLOW_DRIP_LIST_FRAGMENT } from '../../edit-members/edit-drip-list-steps';
  import {
    mapSplitReceiversToEditorConfig,
    type SplitReceiver,
  } from '$lib/components/list-editor/utils/split-receivers-to-list-editor-config';
  import type { ContextType } from '../add-drip-list-member-steps';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    dripLists: SelectDripListStepListsFragment[];
    context: Writable<ContextType>;
    projectOrDripListToAdd:
      | SelectDripListDripListToAddFragment
      | SelectDripListProjectToAddFragment;
  }

  let { dripLists, context, projectOrDripListToAdd }: Props = $props();

  let urlToAdd = $derived(
    'source' in projectOrDripListToAdd
      ? projectOrDripListToAdd.source.url
      : `https://drips.network/app/drip-lists/${projectOrDripListToAdd.account.accountId}`,
  );

  let selected: string[] = $state([]);

  function isAlreadyInList(listSplits: SelectDripListStepListsFragment['splits']) {
    const accountIdToAdd = projectOrDripListToAdd.account.accountId;

    return listSplits.some((s) => s.account.accountId === accountIdToAdd);
  }

  function submit() {
    const selectedDripList =
      dripLists.find((dl) => dl.account.accountId === selected[0]) ?? unreachable();

    $context = {
      listEditorConfig: mapSplitReceiversToEditorConfig(selectedDripList.splits as SplitReceiver[]),
      name: selectedDripList.name,
      description: selectedDripList.description || undefined,
      dripListAccountId: selectedDripList.account.accountId,
      isVisible: selectedDripList.isVisible,
    };

    dispatch('goForward');
  }

  let subjectName = $derived(
    'name' in projectOrDripListToAdd ? `"${projectOrDripListToAdd.name}"` : 'this project',
  );
</script>

<StepLayout>
  <StepHeader
    emoji="🫗"
    headline="Add to a Drip List"
    description={`Choose which Drip List to add ${subjectName} to.`}
  />
  <FormField title="Your Drip Lists" type="div">
    <div class="card">
      <ListSelect
        searchable={false}
        bind:selected
        items={Object.fromEntries(
          dripLists
            .filter((dl) => {
              // prevent adding Drip List to self (owner adding their own list to another)
              return 'account' in projectOrDripListToAdd
                ? dl.account.accountId !== projectOrDripListToAdd.account.accountId
                : true;
            })
            .map((dl) => [
              dl.account.accountId,
              {
                type: 'selectable',
                disabled: isAlreadyInList(dl.splits),
                label: {
                  component: DripListBadge,
                  props: {
                    isLinked: false,
                    dripList: dl,
                    showOwner: false,
                    disabled: isAlreadyInList(dl.splits),
                  },
                },
              },
            ]),
        )}
      />
    </div>
    <Button
      icon={Plus}
      onclick={() => {
        modal.hide();
        goto(buildUrl('/app/funder-onboarding', { urlToAdd }));
      }}>Create new Drip List</Button
    >
  </FormField>
  {#snippet actions()}
    <Button onclick={modal.hide} variant="ghost">Cancel</Button>
    <Button
      onclick={submit}
      disabled={selected[0] === undefined}
      icon={DripListIcon}
      variant="primary">Add</Button
    >
  {/snippet}
</StepLayout>

<style>
  .card {
    border: 1px solid var(--color-foreground-level-3);
    overflow-x: scroll;
    border-radius: 1rem 0 1rem 1rem;
    max-height: 16rem;
    margin-bottom: 1rem;
  }
</style>
