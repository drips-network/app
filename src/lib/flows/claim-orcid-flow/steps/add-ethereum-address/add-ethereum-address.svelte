<script lang="ts" context="module">
  export const ADD_ETHEREUM_ADDRESS_STEP_ORCID_FRAGMENT = gql`
    fragment AddEthereumAddressStepOrcid on OrcidLinkedIdentity {
      orcid
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
  import type { State } from '../../claim-orcid-flow';
  import assert from '$lib/utils/assert';
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import { gql } from 'graphql-request';
  import { CLAIMING_URL_NAME } from '$lib/utils/orcids/entities';
  import verifyOrcidClaim from '$lib/utils/orcids/verify-orcid';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  $: network = $walletStore.network.name
    ? $walletStore.network.name === 'homestead'
      ? 'ethereum'
      : $walletStore.network.name
    : unreachable();
  $: link = `http://0.0.0.0/?ethereum_owned_by=${$walletStore.address}&orcid=${$context.claimableId}`;
  $: editing = !!$context.claimableProof;
  $: description = editing
    ? `To verify you are the owner of this ORCID iD, please add or edit the funding URL to the Websites & social links section of your ORCID profile.`
    : `To verify you are the owner of this ORCID iD, please add the funding URL to the Websites & social links section of your ORCID profile.`;
  $: checkboxLabel = editing ? 'I added or edited the URL.' : 'I added this to my ORCID profile';

  onMount(() => {
    $context.linkedToClaimable = false;
  });

  const GASLESS_CALL_ERROR_MESSAGE =
    'Something went wrong while trying to update the ORCID owner on-chain. Please try again in ten minutes or reach out on Discord if the error persists.';

  function verify() {
    dispatch('await', {
      promise: async () => {
        const { address, dripsAccountId } = $walletStore;
        assert(address && dripsAccountId);

        await verifyOrcidClaim($context.claimableId, address);

        $context.linkedToClaimable = true;

        // Split 100% to the owner of this ORCID
        // TODO: is here the right place?
        context.update((c) => {
          c.maintainerSplits = {
            items: {
              [$walletStore.dripsAccountId]: {
                type: 'address',
                address: $walletStore.address,
              },
            },
            weights: {
              [$walletStore.dripsAccountId]: 1000000,
            },
          };

          return c;
        });

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
          const gaslessCall = await fetch('/api/gasless/call/orcid-owner-update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orcid: $context.claimableId,
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
      subtitle: `We’re scanning your ORCID profile for the link with your ${network} address`,
    });
  }

  let checked = false;
  $: formValid = $walletStore.connected && checked;
</script>

<StandaloneFlowStepLayout headline="Verify ownership" {description}>
  <p>First add a new link to your profile</p>
  <CodeBox path="Link name" code={CLAIMING_URL_NAME} />
  <p>Then add the link</p>
  <!-- TODO: fix link overflowing container -->
  <CodeBox path="Link" code={link} />
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
