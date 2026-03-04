<script lang="ts" module>
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
  import verifyOrcidClaim, { getNetworkLinkName } from '$lib/utils/orcids/verify-orcid';
  import { env } from '$env/dynamic/public';
  import getLitChainName from '$lib/utils/lit/get-lit-chain-name';
  import { isSandboxOrcidEnv } from '$lib/utils/orcids/fetch-orcid';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<State>;
  }

  let { context }: Props = $props();

  let network = $derived(
    $walletStore.network.name
      ? $walletStore.network.name === 'homestead'
        ? 'ethereum'
        : $walletStore.network.name
      : unreachable(),
  );
  let useLit = $derived(env.PUBLIC_USE_LIT_OWNER_UPDATE === 'true');
  let link = $derived(
    useLit
      ? `http://0.0.0.0/DRIPS_OWNERSHIP_CLAIM?${getLitChainName($walletStore.network.name)}=${$walletStore.address}`
      : `http://0.0.0.0/?${getNetworkLinkName()}=${$walletStore.address}&orcid=${$context.claimableId}`,
  );
  let editing = $derived(!!$context.claimableProof);
  let description = $derived(
    editing
      ? `To verify you are the owner of this ORCID iD, please add or edit the funding URL to the Websites & social links section of your ORCID profile.`
      : `To verify you are the owner of this ORCID iD, please add the funding URL to the Websites & social links section of your ORCID profile.`,
  );
  let checkboxLabel = $derived(
    editing ? 'I added or edited the URL.' : 'I added this to my ORCID profile',
  );

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

        if ($context.isPartiallyClaimed) {
          $context.linkedToClaimable = true;
          return;
        }

        if (useLit) {
          const sourceKind = isSandboxOrcidEnv() ? 'orcidSandbox' : 'orcid';

          const res = await fetch('/api/lit/owner-signature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceKind,
              name: $context.claimableId,
              chainName: getLitChainName($walletStore.network.name),
            }),
          });

          if (!res.ok) {
            throw new Error('Failed to get ownership signature from Lit. Please try again later.');
          }

          $context.litOwnerUpdateSignature = await res.json();
          $context.linkedToClaimable = true;
          return;
        }

        await verifyOrcidClaim($context.claimableId, address);

        $context.linkedToClaimable = true;

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
      subtitle: useLit
        ? `We're verifying your ORCID profile ownership claim`
        : `We're scanning your ORCID profile for the link with your ${network} address`,
    });
  }

  let checked = $state(false);
  let formValid = $derived($walletStore.connected && checked);
</script>

<StandaloneFlowStepLayout headline="Verify ownership" {description}>
  <p>First add a new link to your profile</p>
  <CodeBox path="Link name" code={CLAIMING_URL_NAME} />
  <p>Then add the link</p>
  <CodeBox path="Link" code={link} wrap />
  <Checkbox bind:checked label={checkboxLabel} />
  {#snippet left_actions()}
    <Button icon={ArrowLeft} onclick={() => dispatch('goBackward')}>Back</Button>
  {/snippet}
  {#snippet actions()}
    <Button disabled={!formValid} icon={VerifiedIcon} variant="primary" onclick={verify}
      >Verify now</Button
    >
  {/snippet}
</StandaloneFlowStepLayout>
