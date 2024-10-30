<script lang="ts" context="module">
  import { UNCLAIMED_PROJECT_CARD_FRAGMENT } from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import { gql } from 'graphql-request';

  export const ENTER_GIT_URL_STEP_PROJECT_FRAGMENT = gql`
    ${UNCLAIMED_PROJECT_CARD_FRAGMENT}
    fragment EnterGitUrlStepProject on Project {
      ...UnclaimedProjectCard
      account {
        accountId
      }
      chainData {
        ... on UnClaimedProjectData {
          owner {
            address
          }
          verificationStatus
          withdrawableBalances {
            tokenAddress
          }
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
  import UnclaimedProjectCard from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import { isSupportedGitUrl, isValidGitUrl } from '$lib/utils/is-valid-git-url';
  import seededRandomElement from '$lib/utils/seeded-random-element';
  import { page } from '$app/stores';
  import possibleRandomEmoji from '$lib/utils/project/possible-random-emoji';
  import query from '$lib/graphql/dripsQL';
  import type { ProjectQuery, ProjectQueryVariables } from './__generated__/gql.generated';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import possibleColors from '$lib/utils/project/possible-colors';
  import MagnifyingGlass from '$lib/components/icons/MagnifyingGlass.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import network from '$lib/stores/wallet/network';
  import type { GetRepoResponse } from '../../../../../routes/api/github/[repoUrl]/+server';
  import isClaimed from '$lib/utils/project/is-claimed';
  import walletStore from '$lib/stores/wallet/wallet.store';

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

  const projectQuery = gql`
    ${CLAIM_PROJECT_FLOW_PROJECT_FRAGMENT}
    query Project($url: String!, $chains: [SupportedChain!]) {
      projectByUrl(url: $url, chains: $chains) {
        ...ClaimProjectFlowProject
      }
    }
  `;

  class InvalidUrlError extends Error {}

  function fixGitUrlFormat(gitUrl: string) {
    let enteredUrlFixedFormat = gitUrl;

    enteredUrlFixedFormat = enteredUrlFixedFormat.trim();

    // format URL with "https://" (add, or replace "http://" since API error)
    if (!/^https:\/\//.test(enteredUrlFixedFormat)) {
      enteredUrlFixedFormat = 'https://' + enteredUrlFixedFormat.replace(/^http:\/\//, '');
    }

    // if url ends with /, remove it
    if (enteredUrlFixedFormat.endsWith('/')) {
      enteredUrlFixedFormat = enteredUrlFixedFormat.slice(0, -1);
    }

    return enteredUrlFixedFormat;
  }

  async function fetchRepoFromGitHub(gitUrl: string): Promise<GetRepoResponse> {
    const repoInfoRes = await fetch(`/api/github/${encodeURIComponent(gitUrl)}`);

    if (!repoInfoRes.ok) {
      throw new InvalidUrlError(
        'Repo not found. Make sure you enter a link to a public GitHub repository.',
      );
    }

    return await repoInfoRes.json();
  }

  async function normalizeGitUrl(
    gitUrl: string,
    repoInfo: GetRepoResponse,
  ): Promise<{ result: string; newRepoName?: string }> {
    const { url: realUrl } = repoInfo;

    if (realUrl === gitUrl) {
      // Everything checks out.
      return { result: gitUrl };
    }

    if (realUrl.toLowerCase() === gitUrl.toLowerCase()) {
      // The casing is different. Normally, it should correct the casing, except in rare cases
      // where the wrongly-cased project actually has some funds on Drips. This can happen if a split
      // to the project was established before the Drips app properly fixed casing of projects.

      const wronglyCasedProject = (
        await query<ProjectQuery, ProjectQueryVariables>(projectQuery, {
          url: gitUrl,
        })
      ).projectByUrl?.chainData;

      if (!wronglyCasedProject) {
        return { result: realUrl };
      }

      const wronglyCasedProjectChainData = filterCurrentChainData(wronglyCasedProject);
      if (isClaimed(wronglyCasedProjectChainData)) {
        return { result: realUrl };
      }

      const wronglyCasedProjectHasFunds =
        wronglyCasedProjectChainData.withdrawableBalances.length > 0;

      return wronglyCasedProjectHasFunds ? { result: gitUrl } : { result: realUrl };
    }

    // The URL is different. Can happen if the repo was renamed on GitHub. In this case, we want to let
    // the user claim the "old" project, but warn them about it.
    return { result: gitUrl, newRepoName: `${repoInfo.ownerName}/${repoInfo.repoName}` };
  }

  async function fetchProject() {
    $context.linkedToRepo = false;

    try {
      validationState = { type: 'pending' };

      const fixedGitUrl = fixGitUrlFormat($context.gitUrl);

      const repoInfo = await fetchRepoFromGitHub(fixedGitUrl);

      const { result, newRepoName } = await normalizeGitUrl(fixedGitUrl, repoInfo);

      $context.gitUrl = result;
      if (newRepoName) claimingRenamedRepoOriginalName = newRepoName;

      $context.projectMetadata = {
        starCount: repoInfo.stargazersCount,
        forkCount: repoInfo.forksCount,
        description: repoInfo.description ?? undefined,
        defaultBranch: repoInfo.defaultBranch ?? undefined,
      };

      const response = await query<ProjectQuery, ProjectQueryVariables>(projectQuery, {
        url: $context.gitUrl,
        chains: [network.gqlName],
      });

      const project = response.projectByUrl;

      if (!project) {
        throw new InvalidUrlError("Repo doesn't exist or is private");
      }

      const projectChainData = filterCurrentChainData(project.chainData);

      if (projectChainData.__typename === 'ClaimedProjectData') {
        throw new InvalidUrlError('Project already claimed');
      }

      if (
        projectChainData.__typename === 'UnClaimedProjectData' &&
        projectChainData.owner.address.toLowerCase() === $walletStore.address?.toLowerCase()
      ) {
        // The correct owner was already set previously for whatever reason. We can skip updating the owner.
        $context.isPartiallyClaimed = true;
      }

      $context.project = project;

      $context.avatar = {
        type: 'emoji',
        emoji: seededRandomElement(possibleRandomEmoji, project.account.accountId),
      };
      $context.projectColor = seededRandomElement(possibleColors, project.account.accountId);

      validationState = { type: 'valid' };
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error(error);

      if (error instanceof InvalidUrlError) {
        validationState = { type: 'invalid', message: error.message };
      } else {
        validationState = {
          type: 'invalid',
          message: 'An unexpected error occured. There may be more details in the console.',
        };
      }
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
