<script lang="ts">
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { Writable } from 'svelte/store';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { State } from '../../claim-project-flow';
  import LinkIcon from 'radicle-design-system/icons/Link.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRightIcon from 'radicle-design-system/icons/ArrowRight.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import UnclaimedProjectCard from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import { isSupportedGitUrl, isValidGitUrl } from '$lib/utils/is-valid-git-url';
  import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';
  import type { AccountId } from '$lib/utils/common-types';
  import seededRandomElement from '$lib/utils/seeded-random-element';
  import emoji from '$lib/utils/emoji/emoji';
  // import type { PackageManagerDependencies } from 'git-dep-url/dist/types';
  // import type { GitProject } from '$lib/utils/metadata/types';

  export let context: Writable<State>;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let gitProjectService: GitProjectService;
  let validationState: TextInputValidationState = { type: 'unvalidated' };

  $: formValid = validationState.type === 'valid';

  async function fetchProject() {
    $context.linkedToRepo = false;

    gitProjectService = await GitProjectService.new();

    try {
      validationState = { type: 'pending' };

      const project = await gitProjectService.getByUrl($context.gitUrl);
      if (project.claimed) {
        throw new Error('Project already claimed');
      }

      $context.project = project;

      $context.projectEmoji = seededRandomElement(
        emoji.map((e) => e.unicode),
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

  // async function prePopulateDependencies() {
  //   if (Object.keys($context.dependencySplits.items).length > 0) return;

  //   const response = await fetch(`/api/project-deps?projectUrl=${$context.gitUrl}`, {
  //     method: 'GET',
  //     headers: {
  //       'content-type': 'application/json',
  //     },
  //   });

  //   const deps: PackageManagerDependencies = await response.json();

  //   const depsPromises: Promise<GitProject>[] = [];

  //   Object.keys(deps).forEach((packageManager) => {
  //     if (dependenciesFound(deps)) {
  //       deps[packageManager].forEach((dependency) => {
  //         if (dependency.urls.repo) {
  //           const task = gitProjectService.getByUrl(dependency.urls.repo);

  //           depsPromises.push(task);
  //           return;
  //         }
  //       });

  //       $context.dependencySplits.itemsPromise = depsPromises;
  //     } else {
  //       // eslint-disable-next-line no-console
  //       console.log('💧 ~ Could not pre-populate dependencies:', deps);
  //     }
  //   });

  //   $context.dependenciesAutoImported = true;
  // }

  // function dependenciesFound(obj: any): obj is PackageManagerDependencies {
  //   if (typeof obj !== 'object' || obj === null) {
  //     return false;
  //   }

  //   for (const key in obj) {
  //     const dependenciesArray = obj[key];

  //     if (!Array.isArray(dependenciesArray)) {
  //       return false;
  //     }

  //     for (const dependency of dependenciesArray) {
  //       if (typeof dependency.name !== 'string' || typeof dependency.urls.package !== 'string') {
  //         return false;
  //       }
  //     }
  //   }

  //   return true;
  // }

  function clearProject() {
    $context.project = undefined;
    $context.linkedToRepo = false;
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
  description="Enter your project’s GitHub URL to see if it has claimable funds and start the registration."
>
  <div class="input">
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
