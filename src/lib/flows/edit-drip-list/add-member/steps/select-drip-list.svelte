<script context="module">
  export const SELECT_DRIP_LIST_STEP_LISTS_FRAGMENT = gql`
    ${DRIP_LIST_BADGE_FRAGMENT}
    ${EDIT_DRIP_LIST_STEP_SELECTED_DRIP_LIST_FRAGMENT}
    fragment SelectDripListStepLists on DripList {
      ...DripListBadge
      ...EditDripListStepSelectedDripList
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
      }
    }
  `;

  export const SELECT_DRIP_LIST_PROJECT_TO_ADD_FRAGMENT = gql`
    fragment SelectDripListProjectToAdd on Project {
      ... on ClaimedProject {
        account {
          accountId
        }
        source {
          url
        }
      }
      ... on UnclaimedProject {
        account {
          accountId
        }
        source {
          url
        }
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
  import DripListBadge, { DRIP_LIST_BADGE_FRAGMENT } from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import modal from '$lib/stores/modal';
  import buildUrl from '$lib/utils/build-url';
  import unreachable from '$lib/utils/unreachable';
  import { gql } from 'graphql-request';
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { SelectDripListDripListToAddFragment, SelectDripListProjectToAddFragment, SelectDripListStepListsFragment } from './__generated__/gql.generated';
  import type { EditDripListStepSelectedDripListFragment } from '../../shared/steps/__generated__/gql.generated';
  import { EDIT_DRIP_LIST_STEP_SELECTED_DRIP_LIST_FRAGMENT } from '../../shared/steps/edit-drip-list.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let dripLists: SelectDripListStepListsFragment[];

  export let selectedDripListState: Writable<{
    dripList: EditDripListStepSelectedDripListFragment
      | undefined;
  }>;

  export let projectOrDripListToAdd:
    | SelectDripListDripListToAddFragment
    | SelectDripListProjectToAddFragment

  $: urlToAdd =
    'source' in projectOrDripListToAdd
      ? projectOrDripListToAdd.source.url
      : `https://drips.network/app/drip-lists/${projectOrDripListToAdd.account.accountId}`;

  let selected: string[] = [];

  function isAlreadyInList(listSplits: SelectDripListStepListsFragment["splits"]) {
    const accountIdToAdd = projectOrDripListToAdd.account.accountId;

    return listSplits.some((s) => s.account.accountId === accountIdToAdd);
  }

  function submit() {
    const selectedDripList =
      dripLists.find((dl) => dl.account.accountId === selected[0]) ?? unreachable();

    dispatch('await', {
      message: 'Getting ready…',
      promise: async () => {
        $selectedDripListState = {
          dripList: selectedDripList,
        };
      },
    });
  }

  $: subjectName =
    'name' in projectOrDripListToAdd ? `"${projectOrDripListToAdd.name}"` : 'this project';
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
      on:click={() => {
        modal.hide();
        goto(buildUrl('/app/funder-onboarding', { urlToAdd }));
      }}>Create new Drip List</Button
    >
  </FormField>
  <svelte:fragment slot="actions">
    <Button on:click={modal.hide} variant="ghost">Cancel</Button>
    <Button
      on:click={submit}
      disabled={selected[0] === undefined}
      icon={DripListIcon}
      variant="primary">Add</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
  .card {
    border: 1px solid var(--color-foreground);
    overflow-x: scroll;
    border-radius: 1rem 0 1rem 1rem;
    max-height: 16rem;
    margin-bottom: 1rem;
  }
</style>
