<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import DripListBadge from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import modal from '$lib/stores/modal';
  import buildUrl from '$lib/utils/build-url';
  import { getRepresentationalSplitsForAccount } from '$lib/utils/drips/splits';
  import type { DripList, GitProject } from '$lib/utils/metadata/types';
  import unreachable from '$lib/utils/unreachable';
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let dripLists: DripList[];
  export let selectedDripListState: Writable<{
    dripList: DripList | undefined;
    representationalSplits:
      | Awaited<ReturnType<typeof getRepresentationalSplitsForAccount>>
      | undefined;
  }>;

  export let projectOrDripListToAdd: GitProject | DripList;

  $: urlToAdd =
    'source' in projectOrDripListToAdd
      ? projectOrDripListToAdd.source.url
      : `https://drips.network/app/drip-lists/${projectOrDripListToAdd.account.accountId}`;

  let selected: string[] = [];

  function isAlreadyInList(list: DripList) {
    const accountIdToAdd =
      'source' in projectOrDripListToAdd
        ? projectOrDripListToAdd.repoDriverAccount.accountId
        : projectOrDripListToAdd.account.accountId;

    return list.projects.some((p) => p.account.accountId === accountIdToAdd);
  }

  function submit() {
    const selectedDripList =
      dripLists.find((dl) => dl.account.accountId === selected[0]) ?? unreachable();

    dispatch('await', {
      message: 'Getting ready…',
      promise: async () => {
        const representationalSplits = await getRepresentationalSplitsForAccount(
          selectedDripList.account.accountId,
          selectedDripList.projects,
        );

        $selectedDripListState = {
          dripList: selectedDripList,
          representationalSplits,
        };
      },
    });
  }
</script>

<StepLayout>
  <StepHeader
    emoji="🫗"
    headline="Add to a Drip List"
    description="Choose which of your Drip Lists you'd like to add this to."
  />
  <FormField title="Your Drip Lists" type="div">
    <div class="card">
      <ListSelect
        searchable={false}
        bind:selected
        items={Object.fromEntries(
          dripLists.map((dl) => [
            dl.account.accountId,
            {
              type: 'selectable',
              disabled: isAlreadyInList(dl),
              label: {
                component: DripListBadge,
                props: {
                  listId: dl.account.accountId,
                  listName: dl.name,
                  owner: undefined,
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
    max-height: 12rem;
    margin-bottom: 1rem;
  }
</style>
