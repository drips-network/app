<script lang="ts">
  import AccountBox from '$lib/components/account-box/account-box.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import ArrowRightIcon from '$lib/components/icons/ArrowRight.svelte';
  import ArrowLeftIcon from '$lib/components/icons/ArrowLeft.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import unreachable from '$lib/utils/unreachable';
  import { getChangedTemplate } from '../add-ethereum-address/drips-json-template';
  import { Octokit } from '@octokit/rest';
  import GitHub from '$lib/utils/github/GitHub';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';

  const octokit = new Octokit();
  const github = new GitHub(octokit);

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  $: address = $walletStore.address ?? unreachable();
  $: network = $walletStore.network.name
    ? $walletStore.network.name === 'homestead'
      ? 'ethereum'
      : $walletStore.network.name
    : unreachable();

  $: formValid = $walletStore.connected;

  function verifyProject() {
    dispatch('await', {
      message: 'Gathering project information…',
      promise: async () => {
        const { ownerName, repoName } = $context.project?.source ?? unreachable();
        const fundingObject = (await github.fetchFundingJson(ownerName, repoName)) || {};
        const [fundingJson, jsonHighlight] = getChangedTemplate(fundingObject, address, network);

        context.update((c) => {
          c.funding = {
            object: fundingObject,
            json: fundingJson,
            highlight: jsonHighlight,
          };
          return c;
        });
      },
    });
  }
</script>

<StandaloneFlowStepLayout
  headline="Connect your wallet"
  description="If you maintain this GitHub project, connect an Ethereum wallet that will control funds and manage the project's Drips profile."
>
  <FormField type="div" title="Project Owner Ethereum Address">
    <AccountBox />
  </FormField>
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeftIcon} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button disabled={!formValid} icon={ArrowRightIcon} variant="primary" on:click={verifyProject}
      >Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>
