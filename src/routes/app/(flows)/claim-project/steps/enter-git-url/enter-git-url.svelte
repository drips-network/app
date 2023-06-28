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
  import type { GitProject } from '$lib/utils/metadata/types';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import UnclaimedProjectCard from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import { isSupportedGitUrl, isValidGitUrl } from '$lib/utils/is-valid-git-url';
  import type { PackageManagerDependencies } from 'git-dep-url/dist/types';
  import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';
  import type { UserId } from '$lib/utils/common-types';

  export let context: Writable<State>;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let gitProjectService: GitProjectService;
  let validationState: TextInputValidationState = { type: 'unvalidated' };

  $: if (isSupportedGitUrl($context.gitUrl) && validationState.type === 'unvalidated') {
    fetchProject();
  }
  $: if (isValidGitUrl($context.gitUrl) && !isSupportedGitUrl($context.gitUrl)) {
    validationState = { type: 'invalid', message: 'Unsupported URL' };
  }
  $: formValid = validationState.type === 'valid';

  async function fetchProject() {
    gitProjectService = await GitProjectService.new();

    try {
      validationState = { type: 'pending' };

      const project = await gitProjectService.getByUrl($context.gitUrl);
      if (project.claimed) {
        throw new Error('Project already claimed');
      }

      $context.project = project;

      // TODO: enable pre-population of dependencies.
      // await Promise.all([fetchProjectMetadata(), fetchUnclaimedProjectFunds(project.repoDriverAccount.userId), prePopulateDependencies()]);
      await Promise.all([
        fetchProjectMetadata(),
        fetchUnclaimedProjectFunds(project.repoDriverAccount.userId),
      ]);

      console.log($context);

      validationState = { type: 'valid' };
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

  async function fetchUnclaimedProjectFunds(userId: UserId) {
    $context.unclaimedFunds = await fetchUnclaimedFunds(userId);
  }

  async function prePopulateDependencies() {
    if (Object.keys($context.dependencySplits.items).length > 0) return;

    const response = await fetch(`/api/project-deps?projectUrl=${$context.gitUrl}`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    });

    const deps: PackageManagerDependencies = await response.json();

    const depsPromises: Promise<GitProject>[] = [];

    Object.keys(deps).forEach((packageManager) => {
      if (dependenciesFound(deps)) {
        deps[packageManager].forEach((dependency) => {
          if (dependency.urls.repo) {
            const task = gitProjectService.getByUrl(dependency.urls.repo);

            depsPromises.push(task);
            return;
          }
        });

        $context.dependencySplits.itemsPromise = depsPromises;
      } else {
        console.log('💧 ~ Could not pre-populate dependencies:', deps);
      }
    });

    $context.dependenciesAutoImported = true;
  }

  function dependenciesFound(obj: any): obj is PackageManagerDependencies {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    for (const key in obj) {
      const dependenciesArray = obj[key];

      if (!Array.isArray(dependenciesArray)) {
        return false;
      }

      for (const dependency of dependenciesArray) {
        if (typeof dependency.name !== 'string' || typeof dependency.urls.package !== 'string') {
          return false;
        }
      }
    }

    return true;
  }

  function clearProject() {
    $context.project = undefined;
    $context.projectMetadata = undefined;

    validationState = { type: 'unvalidated' };
  }
</script>

<StandaloneFlowStepLayout
  description="Enter your project’s URL to see if it has claimable funds and start the registration."
>
  <TextInput
    bind:value={$context.gitUrl}
    icon={LinkIcon}
    placeholder="Paste your GitHub project URL"
    disabled={validationState.type !== 'unvalidated'}
    {validationState}
    showClearButton={validationState.type === 'valid' || validationState.type === 'invalid'}
    on:clear={clearProject}
  />
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
