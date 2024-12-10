<script lang="ts" context="module">
  export const ADD_ETHEREUM_ADDRESS_STEP_PROJECT_FRAGMENT = gql`
    fragment AddEthereumAddressStepProject on Project {
      source {
        forge
        ownerName
        repoName
      }
    }
  `;
</script>

<script lang="ts">
  import CodeBox from '$lib/components/code-box/code-box.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import unreachable from '$lib/utils/unreachable';
  import { createEventDispatcher, onMount } from 'svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import { getChangedTemplate } from './drips-json-template';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import VerifiedIcon from '$lib/components/icons/Registered.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import assert from '$lib/utils/assert';
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import GitHub from '$lib/utils/github/GitHub';
  import { gql } from 'graphql-request';
  import { Octokit } from '@octokit/rest';

  const octokit = new Octokit();
  const github = new GitHub(octokit);

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let fundingJson: Awaited<ReturnType<typeof github.fetchFundingJson>>;
  let code: string;
  let highlight: [number | null, number | null];

  $: address = $walletStore.address ?? unreachable();
  $: network = $walletStore.network.name
    ? $walletStore.network.name === 'homestead'
      ? 'ethereum'
      : $walletStore.network.name
    : unreachable();
  $: editing = fundingJson && Object.keys(fundingJson).length > 0;
  $: description = editing
    ? `To verify you are the owner of this project, please add your owner address for ${network} to your FUNDING.json file.`
    : `To verify you are the owner of this project, please add a FUNDING.json file with your owner address for ${network} to the default branch of your repository.`;
  $: checkboxLabel = editing
    ? 'I edited the FUNDING.json file'
    : 'I added the FUNDING.json file to the root of my repo.';

  async function loadFundingJson() {
    const { ownerName, repoName } = $context.project?.source ?? unreachable();
    fundingJson = (await github.fetchFundingJson(ownerName, repoName)) || {};
    [code, highlight] = getChangedTemplate(fundingJson, address, network);
  }

  onMount(() => {
    $context.linkedToRepo = false;
    loadFundingJson();
  });

  const GASLESS_CALL_ERROR_MESSAGE =
    'Something went wrong while trying to update the repo owner on-chain. Please try again in ten minutes or reach out on Discord if the error persists.';

  function verify() {
    dispatch('await', {
      promise: async () => {
        const { address, dripsAccountId } = $walletStore;
        assert(address && dripsAccountId);

        const addressInMaintainers = Boolean($context.maintainerSplits.items[dripsAccountId]);
        const maintainersListEmpty = Object.keys($context.maintainerSplits.items).length === 0;

        if (!addressInMaintainers && maintainersListEmpty) {
          $context.maintainerSplits.items = {
            [dripsAccountId]: { type: 'address', address },
          };

          $context.maintainerSplits.weights = {
            [dripsAccountId]: 1000000,
          };
        }

        const { forge, ownerName, repoName } = $context.project?.source ?? unreachable();

        await github.verifyFundingJson(ownerName, repoName, address);

        $context.linkedToRepo = true;

        const numericForgeValue = forge === 'GitHub' ? 0 : 1;

        if ($context.isPartiallyClaimed) {
          // If the project already has the right owner, we don't need to kick off a repo owner update again
          return;
        }

        try {
          // Kick off repo owner update using gasless TX

          const gaslessCall = await fetch('/api/gasless/call/repo-owner-update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              forge: numericForgeValue,
              projectName: `${ownerName}/${repoName}`,
              chainId: $walletStore.network.chainId,
            }),
          });

          if (!gaslessCall.ok) {
            throw new Error(GASLESS_CALL_ERROR_MESSAGE);
          }

          const { taskId } = await gaslessCall.json();

          $context.gaslessOwnerUpdateTaskId = taskId;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          throw new Error(GASLESS_CALL_ERROR_MESSAGE);
        }
      },
      message: 'Verifying...',
      subtitle:
        'We’re scanning your git project’s main branch for a FUNDING.json file with your Ethereum address.',
    });
  }

  let checked = false;
  $: formValid = $walletStore.connected && checked;
</script>

<StandaloneFlowStepLayout headline="Verify project ownership" {description}>
  <CodeBox
    repoUrl={$context.gitUrl}
    defaultBranch={$context.projectMetadata?.defaultBranch}
    path="./FUNDING.json"
    {code}
    {highlight}
    {editing}
  />
  <Checkbox bind:checked label={checkboxLabel} />
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button disabled={!formValid} icon={VerifiedIcon} variant="primary" on:click={verify}
      >Verify now</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>
