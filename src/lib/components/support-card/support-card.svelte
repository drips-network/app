<script lang="ts">
  import Heart from 'radicle-design-system/icons/Heart.svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import Button from '$lib/components/button/button.svelte';
  import type { ClaimedGitProject, DripList, UnclaimedGitProject } from '$lib/utils/metadata/types';
  import DripListService from '$lib/utils/driplist/DripListService';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import { fade } from 'svelte/transition';
  import { getSubgraphClient } from '$lib/utils/get-drips-clients';
  import { goto } from '$app/navigation';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import buildUrl from '$lib/utils/build-url';
  import type { SplitsEntry } from 'radicle-drips';
  import addDripListMemberSteps from '$lib/flows/edit-drip-list/add-member/add-drip-list-member-steps';
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import createDripListStreamSteps from '$lib/flows/create-drip-list-stream/create-drip-list-stream-steps';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';

  export let project: UnclaimedGitProject | ClaimedGitProject | undefined = undefined;
  export let dripList: DripList | undefined = undefined;

  let ownDripLists: DripList[] | null | undefined = undefined;
  let ownDripListSplits: SplitsEntry[] | undefined = undefined;

  $: isOwner =
    $walletStore.connected &&
    ($walletStore.dripsAccountId === project?.owner?.accountId ||
      $walletStore.dripsAccountId === dripList?.account.owner.accountId);

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

  const { initialized } = walletStore;
  $: isWalletConnected = $walletStore.connected;

  let updating = true;
  async function updateState() {
    updating = true;

    if (!$initialized) {
      // Wait for wallet to be initialized before proceeding
      await new Promise<void>((resolve) => {
        const unsubscribe = initialized.subscribe((v) => {
          if (v) {
            unsubscribe();
            resolve();
          }
        });
      });
    }

    const { address } = $walletStore;
    if (!address) {
      ownDripLists = null;
      updating = false;
      return;
    }

    const dripListService = await DripListService.new();
    const result = await dripListService.getByOwnerAddress(address);

    if (result.length > 0) {
      const subgraph = getSubgraphClient();
      ownDripListSplits = await subgraph.getSplitsConfigByAccountId(result[0].account.accountId);
      ownDripLists = result;
    } else {
      ownDripLists = null;
    }

    updating = false;
  }
  $: {
    $walletStore.connected;
    updateState();
  }

  function handleNewStreamButton() {
    const dripListId = dripList?.account.accountId;
    return dripListId && modal.show(Stepper, undefined, createDripListStreamSteps(dripListId));
  }

  async function handleAddtoDripListButton() {
    if (!ownDripLists) {
      goto(buildUrl('/app/funder-onboarding', { urlToAdd: supportUrl }));
    } else {
      // TODO: Refresh profile state after becoming a supporter
      modal.show(Stepper, undefined, addDripListMemberSteps(ownDripLists, project, dripList));
    }
  }
</script>

<div class="become-supporter-card">
  {#if ownDripLists === undefined || updating}
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
    {#if !isWalletConnected}
      Connect your Ethereum wallet to see your support options.
    {:else if dripList && isOwner}
      Support everyone on your list with a single token stream or add it to another Drip List.
    {:else}
      Add this {project ? 'project' : ''} to a Drip List to flexibly support it with an ongoing contribution.
    {/if}
  </p>
  <div class="flex flex-col gap-2">
    {#if !isWalletConnected}
      <Button on:click={() => walletStore.connect()} size="large" icon={Wallet} variant="primary"
        >Connect wallet</Button
      >
    {:else}
      {#if isOwner}
        <Button on:click={handleNewStreamButton} size="large" icon={TokenStreams} variant="primary"
          >Stream tokens</Button
        >
      {/if}
      <Button
        on:click={handleAddtoDripListButton}
        size="large"
        icon={DripListIcon}
        variant="primary">Add to a Drip List</Button
      >
    {/if}
  </div>
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

  p {
    color: var(--color-foreground-level-6);
  }
</style>
