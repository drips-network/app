<script lang="ts" context="module">
  export const ADD_ETHEREUM_ADDRESS_STEP_PROJECT_FRAGMENT = gql`
    fragment AddEthereumAddressStepProject on Project {
      ... on ClaimedProject {
        source {
          forge
          ownerName
          repoName
        }
      }
      ... on UnclaimedProject {
        source {
          forge
          ownerName
          repoName
        }
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
  import dripsJsonTemplate from './drips-json-template';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from 'radicle-design-system/icons/ArrowLeft.svelte';
  import VerifiedIcon from 'radicle-design-system/icons/Registered.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import assert from '$lib/utils/assert';
  import ethAddressItem from '$lib/components/list-editor/item-templates/eth-address';
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import GitHub from '$lib/utils/github/GitHub';
  import { gql } from 'graphql-request';
  import { Octokit } from '@octokit/rest';

  const octokit = new Octokit();
  const github = new GitHub(octokit);

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  onMount(() => {
    $context.linkedToRepo = false;
  });

  function verify() {
    dispatch('await', {
      promise: async () => {
        const { address } = $walletStore;
        assert(address);

        const addressInMaintainers = $context.maintainerSplits.items[address];
        const maintainersListEmpty = Object.keys($context.maintainerSplits.items).length === 0;

        if (!addressInMaintainers && maintainersListEmpty) {
          $context.maintainerSplits.items = {
            [address]: ethAddressItem(address),
          };

          $context.maintainerSplits.items[address] = ethAddressItem(address);

          $context.maintainerSplits.percentages = {
            [address]: 100,
          };
        }

        const { forge, ownerName, repoName } = $context.project?.source ?? unreachable();

        await github.getFundingJson(
          ownerName,
          repoName,
          dripsJsonTemplate(
            $walletStore.address ?? unreachable(),
            $walletStore.network.name
              ? $walletStore.network.name === 'homestead'
                ? 'ethereum'
                : $walletStore.network.name
              : unreachable(),
          ),
        );

        $context.linkedToRepo = true;

        const numericForgeValue = forge === 'GitHub' ? 0 : 1;

        try {
          // Kick off repo owner update using gasless TX

          await fetch('/api/gasless/call/repo-owner-update', {
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
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          throw new Error('Failed to gasless-call repo-owner-update');
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

<StandaloneFlowStepLayout
  headline="Verify project ownership"
  description="To verify you are the owner of this project, please add a FUNDING.json file with your Ethereum address to the default branch of your repository. "
>
  <CodeBox
    repoUrl={$context.gitUrl}
    defaultBranch={$context.projectMetadata?.defaultBranch}
    path="./FUNDING.json"
    code={dripsJsonTemplate(
      $walletStore.address ?? unreachable(),
      $walletStore.network.name
        ? $walletStore.network.name === 'homestead'
          ? 'ethereum'
          : $walletStore.network.name
        : unreachable(),
    )}
  />
  <Checkbox bind:checked label="I added the FUNDING.json file to the root of my repo." />
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button disabled={!formValid} icon={VerifiedIcon} variant="primary" on:click={verify}
      >Verify now</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>
