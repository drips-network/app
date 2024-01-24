<script lang="ts" context="module">
  export const ENTER_GIT_URL_STEP_PROJECT_FRAGMENT = gql`
    ${UNCLAIMED_PROJECT_CARD_FRAGMENT}
    fragment EnterGitUrlStepProject on Project {
      ...UnclaimedProjectCard
      ... on UnclaimedProject {
        verificationStatus
        account {
          accountId
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
  import LinkIcon from 'radicle-design-system/icons/Link.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRightIcon from 'radicle-design-system/icons/ArrowRight.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import UnclaimedProjectCard, {
    UNCLAIMED_PROJECT_CARD_FRAGMENT,
  } from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import { isSupportedGitUrl, isValidGitUrl } from '$lib/utils/is-valid-git-url';
  import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';
  import seededRandomElement from '$lib/utils/seeded-random-element';
  import { page } from '$app/stores';
  import possibleRandomEmoji from '$lib/utils/project/possible-random-emoji';
  import query from '$lib/graphql/dripsQL';
  import { gql } from 'graphql-request';
  import type { ProjectQuery, ProjectQueryVariables } from './__generated__/gql.generated';
  import { ProjectVerificationStatus } from '$lib/graphql/__generated__/base-types';

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

  async function fetchProject() {
    $context.linkedToRepo = false;

    try {
      validationState = { type: 'pending' };

      if (!$context.gitUrl.startsWith('http://') && !$context.gitUrl.startsWith('https://')) {
        $context.gitUrl = 'https://' + $context.gitUrl;
      }

      // if url ends with /, remove it
      if ($context.gitUrl.endsWith('/')) {
        $context.gitUrl = $context.gitUrl.slice(0, -1);
      }

      const repoInfoRes = await fetch(`/api/github/${encodeURIComponent($context.gitUrl)}`);
      const repoInfo = await repoInfoRes.json();
      const normalizedUrl = repoInfo.url;

      $context.gitUrl = normalizedUrl;

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
      $context.projectColor = seededRandomElement(
        ['#5555FF', '#53DB53', '#FFC555', '#FF5555'],
        project.account.accountId,
      );

      $context.unclaimedFunds = await fetchUnclaimedFunds(project.account.accountId);

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
        on:click={submitInput}>Search</Button
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
