<script lang="ts">
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { Writable } from 'svelte/store';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { State } from '../../claim-project-flow';
  import LinkIcon from 'radicle-design-system/icons/Link.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRightIcon from 'radicle-design-system/icons/ArrowRight.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import UnclaimedProjectCard from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import { isSupportedGitUrl, isValidGitUrl } from '$lib/utils/is-valid-git-url';
  import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';
  import type { AccountId } from '$lib/utils/common-types';
  import seededRandomElement from '$lib/utils/seeded-random-element';
  import { page } from '$app/stores';
  import RepoDriverMetadataManager from '$lib/utils/metadata/RepoDriverMetadataManager';
  import type { UnclaimedGitProject } from '$lib/utils/metadata/types';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import possibleRandomEmoji from '$lib/utils/project/possible-random-emoji';
  import { getRepoDriverClient } from '$lib/utils/get-drips-clients';

  export let context: Writable<State>;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let gitProjectService: GitProjectService;
  let validationState: TextInputValidationState = { type: 'unvalidated' };

  $: formValid = validationState.type === 'valid';

  const { searchParams } = $page.url;
  const projectUrlToAdd = searchParams.get('projectToAdd') ?? undefined;

  onMount(() => {
    if (projectUrlToAdd) $context.gitUrl = projectUrlToAdd;
  });

  async function fetchProject() {
    $context.linkedToRepo = false;

    gitProjectService = await GitProjectService.new();

    try {
      validationState = { type: 'pending' };

      if (!$context.gitUrl.startsWith('http://') && !$context.gitUrl.startsWith('https://')) {
        $context.gitUrl = 'https://' + $context.gitUrl;
      }

      // if url ends with /, remove it
      if ($context.gitUrl.endsWith('/')) {
        $context.gitUrl = $context.gitUrl.slice(0, -1);
      }

      const { forge, username, repoName } = GitProjectService.deconstructUrl($context.gitUrl);
      const projectName = `${username}/${repoName}`;

      const repoDriverClient = await getRepoDriverClient();
      const accountId = await repoDriverClient.getAccountId(forge, projectName);

      const owner = await repoDriverClient.getOwner(accountId);
      const project = await gitProjectService.getByUrl($context.gitUrl);

      // TODO: inefficient to fetch metadata twice - `getByUrl` already does that.
      const repoDriverMetadataManager = new RepoDriverMetadataManager();
      const projectMetadata = await repoDriverMetadataManager.fetchAccountMetadata(
        project.repoDriverAccount.accountId,
      );
      if (project.claimed && projectMetadata) {
        throw new Error('Project already claimed');
      }

      if (
        owner &&
        owner.toLowerCase() === $walletStore.address?.toLowerCase() &&
        !projectMetadata
      ) {
        $context.isPartiallyClaimed = true;
      }

      $context.project = project as UnclaimedGitProject;

      $context.projectEmoji = seededRandomElement(
        possibleRandomEmoji,
        project.repoDriverAccount.accountId,
      );
      $context.projectColor = seededRandomElement(
        ['#5555FF', '#53DB53', '#FFC555', '#FF5555'],
        project.repoDriverAccount.accountId,
      );

      // TODO: enable pre-population of dependencies.
      // await Promise.all([fetchProjectMetadata(), fetchUnclaimedProjectFunds(project.repoDriverAccount.accountId), prePopulateDependencies()]);
      await Promise.all([
        fetchProjectMetadata(),
        fetchUnclaimedProjectFunds(project.repoDriverAccount.accountId),
      ]);

      validationState = { type: 'valid' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      validationState = { type: 'invalid', message: error.message };
    }
  }

  async function fetchProjectMetadata() {
    const { defaultBranch, description, forksCount, starsCount } =
      await gitProjectService.getProjectInfo($context.gitUrl);

    $context.projectMetadata = {
      starCount: starsCount,
      forkCount: forksCount,
      description: description ?? undefined,
      defaultBranch: defaultBranch ?? undefined,
    };
  }

  async function fetchUnclaimedProjectFunds(accountId: AccountId) {
    $context.unclaimedFunds = await fetchUnclaimedFunds(accountId);
  }

  function clearProject() {
    $context.project = undefined;
    $context.linkedToRepo = false;
    $context.isPartiallyClaimed = false;
    $context.projectMetadata = undefined;

    validationState = { type: 'unvalidated' };
  }

  function submitInput() {
    if (isSupportedGitUrl($context.gitUrl)) {
      fetchProject();
    } else if (isValidGitUrl($context.gitUrl) && !isSupportedGitUrl($context.gitUrl)) {
      validationState = { type: 'invalid', message: 'Unsupported URL' };
    }
  }

  $: inputSubmittable =
    isSupportedGitUrl($context.gitUrl) &&
    validationState.type !== 'valid' &&
    validationState.type !== 'pending';
</script>

<StandaloneFlowStepLayout
  headline="Claim your project"
  description="Enter your project’s GitHub URL to see if it has claimable funds and start the registration. Your repository must be public."
>
  <div class="input" on:keydown={(e) => e.key === 'Enter' && submitInput()}>
    <TextInput
      bind:value={$context.gitUrl}
      icon={LinkIcon}
      placeholder="Paste your GitHub project URL"
      disabled={validationState.type === 'valid' || validationState.type === 'pending'}
      {validationState}
      showClearButton={validationState.type === 'valid' || validationState.type === 'invalid'}
      on:clear={clearProject}
    />
    <div class="submit-button">
      <Button
        disabled={!inputSubmittable}
        variant={inputSubmittable ? 'primary' : undefined}
        on:click={submitInput}>Submit</Button
      >
    </div>
  </div>
  {#if $context.project && validationState.type === 'valid'}
    <UnclaimedProjectCard
      project={$context.project}
      projectMetadata={$context.projectMetadata}
      unclaimedFunds={$context.unclaimedFunds}
      claimableTokensKey="Claimable tokens"
    />
  {/if}
  <svelte:fragment slot="actions">
    <Button
      disabled={!formValid}
      icon={ArrowRightIcon}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

<style>
  .input {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-end;
  }
</style>
