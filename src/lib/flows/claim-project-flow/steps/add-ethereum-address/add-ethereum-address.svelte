<script lang="ts" module>
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

  interface Props {
    context: Writable<State>;
  }

  let { context }: Props = $props();

  let network = $derived($walletStore.network.name
    ? $walletStore.network.name === 'homestead'
      ? 'ethereum'
      : $walletStore.network.name
    : unreachable());
  let editing = $derived($context.funding.object && Object.keys($context.funding.object).length > 0);
  let description = $derived(editing
    ? `To verify you are the owner of this project, please add your owner address for ${network} to your FUNDING.json file.`
    : `To verify you are the owner of this project, please add a FUNDING.json file with your owner address for ${network} to the default branch of your repository.`);
  let checkboxLabel = $derived(editing
    ? 'I edited the FUNDING.json file'
    : 'I added the FUNDING.json file to the root of my repo.');

  onMount(() => {
    $context.linkedToRepo = false;
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

        if (!$walletStore.network.gelatoRelayAvailable) {
          // If Gelato Relay is not available for the gasless owner update in the background, the last step will
          // instead include a transaction for manually updating the repo owner.
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

          $context.gaslessOwnerUpdateTaskId = taskId === null ? undefined : taskId;
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

  let checked = $state(false);
  let formValid = $derived($walletStore.connected && checked);
</script>

<StandaloneFlowStepLayout headline="Verify project ownership" {description}>
  <CodeBox
    repoUrl={$context.gitUrl}
    defaultBranch={$context.projectMetadata?.defaultBranch}
    path="./FUNDING.json"
    code={$context.funding.json}
    highlight={$context.funding.highlight}
    {editing}
  />
  <Checkbox bind:checked label={checkboxLabel} />
  <!-- @migration-task: migrate this slot by hand, `left-actions` is an invalid identifier -->
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} onclick={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  {#snippet actions()}
  
      <Button disabled={!formValid} icon={VerifiedIcon} variant="primary" onclick={verify}
        >Verify now</Button
      >
    
  {/snippet}
</StandaloneFlowStepLayout>
