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

  export let project: ClaimedGitProject;

  let dripList: DripList | null | undefined = undefined;
  let isSupportingProject: boolean | undefined = undefined;
  onMount(async () => {
    const { address } = $walletStore;
    if (!address) {
      dripList = null;
      return;
    }

    const dripListService = await DripListService.new();
    const result = await dripListService.getByOwnerAddress(address);

    if (result[0]) {
      const subgraph = getSubgraphClient();
      const dripListSplits = await subgraph.getSplitsConfigByAccountId(result[0].account.accountId);

      isSupportingProject = Boolean(
        dripListSplits.find((s) => s.accountId === project.repoDriverAccount.accountId),
      );
      dripList = result[0];
    } else {
      dripList = null;
    }
  });

  let loadingModal = false;
  async function handleSupportButton() {
    if (!dripList) {
      goto(buildUrl('/app/funder-onboarding', { projectToAdd: project.source.url }));
    } else {
      // TODO: Refresh profile state after becoming a supporter
      loadingModal = true;
      const representationalSplits = await getRepresentationalSplitsForAccount(
        dripList.account.accountId,
        dripList.projects.filter((s): s is RepoDriverSplitReceiver => 'source' in s),
      );

      modal.show(
        Stepper,
        undefined,
        editDripListSteps(
          dripList.account.accountId,
          dripList.name,
          dripList.description,
          representationalSplits,
          project,
        ),
      );
      loadingModal = false;
    }
  }
</script>

<div class="become-supporter-card">
  {#if dripList === undefined || loadingModal}
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
      <div>
        <ProjectAvatar {project} size="large" outline />
      </div>
    </div>
  </div>
  <h2 class="pixelated">Become a supporter</h2>
  <p>
    {#if isSupportingProject}
      You're already supporting <span class="typo-text-bold">{project.source.repoName}</span> with your
      Drip List.
    {:else}
      Add <span class="typo-text-bold">{project.source.repoName}</span> to your Drip List to support
      this project.
    {/if}
  </p>
  <Button
    on:click={handleSupportButton}
    disabled={isSupportingProject}
    size="large"
    icon={Plus}
    variant="primary">{dripList === null ? 'Create your Drip List' : 'Add to Drip List'}</Button
  >
  <div class="benefits typo-text-small">
    {#if isSupportingProject}You're getting…{:else}Youʼll get…{/if}
    <div class="benefit">
      <Heart />
      <span>…to feel good about yourself, because you're supporting open-source software.</span>
    </div>
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

  .benefits {
    color: var(--color-foreground-level-5);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .benefits > .benefit {
    display: flex;
    gap: 0.5rem;
  }

  p {
    color: var(--color-foreground-level-6);
  }
</style>
