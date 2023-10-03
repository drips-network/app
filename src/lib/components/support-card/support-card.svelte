<script lang="ts">
  import Heart from 'radicle-design-system/icons/Heart.svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import Button from '$lib/components/button/button.svelte';
  import type {
    ClaimedGitProject,
    DripList,
    RepoDriverSplitReceiver,
  } from '$lib/utils/metadata/types';
  import { onMount } from 'svelte';
  import DripListService from '$lib/utils/driplist/DripListService';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import { fade } from 'svelte/transition';
  import { getSubgraphClient } from '$lib/utils/get-drips-clients';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import { goto } from '$app/navigation';
  import { getRepresentationalSplitsForAccount } from '$lib/utils/drips/splits';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import editDripListSteps from '$lib/flows/edit-drip-list/edit-drip-list-steps';
  import buildUrl from '$lib/utils/build-url';
  import type { SplitsEntry } from 'radicle-drips';

  export let project: ClaimedGitProject | undefined = undefined;
  export let dripList: DripList | undefined = undefined;

  let ownDripList: DripList | null | undefined = undefined;
  let ownDripListSplits: SplitsEntry[] | undefined = undefined;

  let isSupporting: boolean | undefined;
  $: isSupporting = ownDripListSplits?.some(
    (s) =>
      s.accountId === project?.repoDriverAccount.accountId ||
      s.accountId === dripList?.account.accountId,
  );

  $: isOwner =
    $walletStore.dripsAccountId === project?.owner.accountId ||
    $walletStore.dripsAccountId === dripList?.account.owner.accountId;

  let supportUrl: string;
  $: {
    if (project) {
      supportUrl = project.source.url;
    } else if (dripList) {
      supportUrl = `https://drips.network/app/drip-lists/${dripList.account.accountId}`;
    } else {
      throw new Error('You must populate either the `project` or `dripList` prop.');
    }
  }

  onMount(async () => {
    const { address } = $walletStore;
    if (!address) {
      ownDripList = null;
      return;
    }

    const dripListService = await DripListService.new();
    const result = await dripListService.getByOwnerAddress(address);

    if (result[0]) {
      const subgraph = getSubgraphClient();
      ownDripListSplits = await subgraph.getSplitsConfigByAccountId(result[0].account.accountId);
      ownDripList = result[0];
    } else {
      ownDripList = null;
    }
  });

  let loadingModal = false;
  async function handleSupportButton() {
    if (!ownDripList) {
      goto(buildUrl('/app/funder-onboarding', { urlToAdd: supportUrl }));
    } else {
      // TODO: Refresh profile state after becoming a supporter
      loadingModal = true;
      const representationalSplits = await getRepresentationalSplitsForAccount(
        ownDripList.account.accountId,
        ownDripList.projects.filter((s): s is RepoDriverSplitReceiver => 'source' in s),
      );

      modal.show(
        Stepper,
        undefined,
        editDripListSteps(
          ownDripList.account.accountId,
          ownDripList.name,
          ownDripList.description,
          representationalSplits,
          project,
          dripList,
        ),
      );
      loadingModal = false;
    }
  }
</script>

<div class="become-supporter-card" class:is-owner={isOwner}>
  {#if ownDripList === undefined || loadingModal}
    <div transition:fade|local={{ duration: 300 }} class="loading-overlay">
      <Spinner />
    </div>
  {/if}
  <div class="header">
    <div class="background" />
    <div class="circles">
      <div class="circle">
        <Heart style="height: 3rem; width: 3rem; fill: var(--color-primary)" />
      </div>
      {#if project}
        <div>
          <ProjectAvatar {project} size="large" outline />
        </div>
      {/if}
    </div>
  </div>
  <h2 class="pixelated">Become a supporter</h2>
  <p>
    {#if isSupporting}
      You're already supporting this with your Drip List.
    {:else}
      Add this {project ? 'project' : ''} to your Drip List to flexibly support it with an ongoing contribution.
    {/if}
  </p>
  <Button
    on:click={handleSupportButton}
    disabled={isSupporting || isOwner}
    size="large"
    icon={Plus}
    variant="primary">{ownDripList === null ? 'Create your Drip List' : 'Add to Drip List'}</Button
  >
</div>

<style>
  .become-supporter-card {
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: var(--elevation-medium);
    background-color: var(--color-background);
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    position: relative;
  }

  .loading-overlay {
    top: 6rem;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: 1rem 0 1rem 1rem;
    position: absolute;
    background-color: var(--color-background);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
  }

  .header > .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    opacity: 0.4;
    background-color: var(--color-primary-level-2);
    height: 3rem;
    border-radius: 1rem 0 0 0;
  }

  .header > .circles {
    display: flex;
    position: relative;
  }

  .header > .circles > *:not(:first-child) {
    margin-left: -1.5rem;
  }

  .header > .circles > .circle {
    width: 4rem;
    height: 4rem;
    margin: 1px;
    background-color: var(--color-background);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--elevation-low);
  }

  .is-owner {
    opacity: 0.75;
    pointer-events: none;
  }

  p {
    color: var(--color-foreground-level-6);
  }
</style>
