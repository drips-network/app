<script lang="ts" context="module">
  export const ENTER_GIT_URL_STEP_PROJECT_FRAGMENT = gql`
    ${UNCLAIMED_PROJECT_CARD_FRAGMENT}
    fragment EnterGitUrlStepProject on Project {
      ...UnclaimedProjectCard
      account {
        accountId
      }
      chainData {
        ... on UnClaimedProjectData {
          verificationStatus
        }
      }
    }
  `;
</script>

<script lang="ts">
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { Writable } from 'svelte/store';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import { CLAIM_PROJECT_FLOW_PROJECT_FRAGMENT, type State } from '../../claim-project-flow';
  import LinkIcon from '$lib/components/icons/Link.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRightIcon from '$lib/components/icons/ArrowRight.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import UnclaimedProjectCard, {
    UNCLAIMED_PROJECT_CARD_FRAGMENT,
  } from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import { isSupportedGitUrl, isValidGitUrl } from '$lib/utils/is-valid-git-url';
  import seededRandomElement from '$lib/utils/seeded-random-element';
  import { page } from '$app/stores';
  import possibleRandomEmoji from '$lib/utils/project/possible-random-emoji';
  import query from '$lib/graphql/dripsQL';
  import { gql } from 'graphql-request';
  import type { ProjectQuery, ProjectQueryVariables } from './__generated__/gql.generated';
  import { ProjectVerificationStatus } from '$lib/graphql/__generated__/base-types';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import possibleColors from '$lib/utils/project/possible-colors';
  import MagnifyingGlass from '$lib/components/icons/MagnifyingGlass.svelte';

  export let context: Writable<State>;
  export let projectUrl: string | undefined = undefined;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let validationState: TextInputValidationState = { type: 'unvalidated' };

  $: formValid = validationState.type === 'valid';

  const { searchParams } = $page.url;
  const projectUrlToAdd = projectUrl ?? searchParams.get('projectToAdd') ?? undefined;

  onMount(() => {
    if (projectUrlToAdd) {
      $context.gitUrl = projectUrlToAdd;
      fetchProject();
    }
  });

  let claimingRenamedRepoOriginalName: string | undefined;

  async function fetchProject() {
    $context.linkedToRepo = false;

    try {
      validationState = { type: 'pending' };

      // format URL with "https://" (add, or replace "http://" since API error)
      if (!/^https:\/\//.test($context.gitUrl)) {
        $context.gitUrl = 'https://' + $context.gitUrl.replace(/^http:\/\//, '');
      }

      // if url ends with /, remove it
      if ($context.gitUrl.endsWith('/')) {
        $context.gitUrl = $context.gitUrl.slice(0, -1);
      }

      const repoInfoRes = await fetch(`/api/github/${encodeURIComponent($context.gitUrl)}`);
      const repoInfo = await repoInfoRes.json();
      const normalizedUrl = repoInfo.url;

      // If the normalized URL is different from the original URL in lowercase, it means that the repo has likely
      // been renamed on GitHub. In this case, we should let the user claim the outdated project too.
      // In all other cases, we use the normalized URL to fix casing mismatches.
      if (normalizedUrl?.toLowerCase() === $context.gitUrl.toLowerCase()) {
        $context.gitUrl = normalizedUrl;
      } else {
        claimingRenamedRepoOriginalName = normalizedUrl;
      }

      $context.projectMetadata = {
        starCount: repoInfo.stargazersCount,
        forkCount: repoInfo.forksCount,
        description: repoInfo.description ?? undefined,
        defaultBranch: repoInfo.defaultBranch ?? undefined,
      };

      const projectQuery = gql`
        ${CLAIM_PROJECT_FLOW_PROJECT_FRAGMENT}
        query Project($url: String!) {
          projectByUrl(url: $url) {
            ...ClaimProjectFlowProject
          }
        }
      `;

      const response = await query<ProjectQuery, ProjectQueryVariables>(projectQuery, {
        url: $context.gitUrl,
      });

      const project = response.projectByUrl;

      if (!project) {
        throw new Error('Project not found');
      }

      if (project.__typename === 'ClaimedProject') {
        throw new Error('Project already claimed');
      }

      if (
        project.__typename === 'UnclaimedProject' &&
        project.verificationStatus === ProjectVerificationStatus.PendingMetadata
      ) {
        $context.isPartiallyClaimed = true;
      }

      $context.project = project;

      $context.avatar = {
        type: 'emoji',
        emoji: seededRandomElement(possibleRandomEmoji, project.account.accountId),
      };
      $context.projectColor = seededRandomElement(possibleColors, project.account.accountId);

      validationState = { type: 'valid' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      validationState = { type: 'invalid', message: error.message };
    }
  }

  function clearProject() {
    $context.project = undefined;
    $context.linkedToRepo = false;
    $context.isPartiallyClaimed = false;
    $context.projectMetadata = undefined;

    claimingRenamedRepoOriginalName = undefined;

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

  async function onPaste() {
    // need to wait some time for value to be available ¯\_(ツ)_/¯
    await new Promise((resolve) => setTimeout(resolve, 100));
    submitInput();
  }
</script>

<StandaloneFlowStepLayout
  headline="Claim your project"
  description="Enter your project’s GitHub URL to see if it has claimable funds and start the registration. Your repository must be public."
>
  <TextInput
    bind:value={$context.gitUrl}
    icon={LinkIcon}
    placeholder="Paste your GitHub project URL"
    disabled={validationState.type === 'valid' || validationState.type === 'pending'}
    {validationState}
    showClearButton={$context.gitUrl.length > 0 && validationState.type !== 'pending'}
    on:clear={clearProject}
    on:keydown={(e) => e.key === 'Enter' && submitInput()}
    on:paste={onPaste}
  />
  {#if $context.project && validationState.type === 'valid'}
    <UnclaimedProjectCard
      project={$context.project}
      projectMetadata={$context.projectMetadata}
      claimableTokensKey="Claimable tokens"
    />
    {#if claimingRenamedRepoOriginalName}
      <AnnotationBox>
        You're claiming a project that has been renamed to {claimingRenamedRepoOriginalName.replace(
          'https://github.com/',
          '',
        )} on GitHub. Please ensure that the repository URL you entered matches the old name of your
        repo exactly (including casing), and validate that any funds you're expecting to claim are displayed
        above.
      </AnnotationBox>
    {/if}
  {/if}
  <svelte:fragment slot="actions">
    {#if formValid}
      <Button icon={ArrowRightIcon} variant="primary" on:click={() => dispatch('goForward')}
        >Continue</Button
      >
    {:else}
      <Button
        disabled={!inputSubmittable}
        icon={MagnifyingGlass}
        variant="primary"
        on:click={() => submitInput()}>Search</Button
      >
    {/if}
  </svelte:fragment>
</StandaloneFlowStepLayout>
