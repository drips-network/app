<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
  import gaslessStore from '$lib/stores/gasless/gasless.store';
  import network from '$lib/stores/wallet/network';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import {
    applicationAttestationData,
    buildAttestApplicationTx,
    getNonce,
    pinApplicationAttestationData,
  } from '$lib/utils/rpgf/eas';
  import { submitApplication } from '$lib/utils/rpgf/rpgf';
  import type { CreateApplicationDto, WrappedRoundPublic } from '$lib/utils/rpgf/schemas';
  import { getUIDsFromAttestReceipt, ZERO_BYTES32 } from '@ethereum-attestation-service/eas-sdk';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import assert from '$lib/utils/assert';

  export let context: Writable<{ applicationId: string | null }>;
  export let applicationData: CreateApplicationDto;
  export let applicationFormat: WrappedRoundPublic['round']['applicationFormat'];
  export let roundSlug: string;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  function handleConfirm() {
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Submit application',

        before: async () => {
          const { connected, address, provider } = $walletStore;
          if (!connected) {
            throw new Error('Wallet not connected');
          }

          const ipfsHash = await pinApplicationAttestationData(applicationData, applicationFormat);

          const attestationData = applicationAttestationData(ipfsHash, roundSlug);

          const tx = await buildAttestApplicationTx(address, attestationData);

          const easAddress = tx.to;

          const easConfig =
            network.retroFunding.enabled &&
            network.retroFunding.attestationConfig.enabled &&
            network.retroFunding.attestationConfig;
          assert(easConfig, 'EAS configuration is not available');

          return { attestTx: tx, easAddress, easConfig, address, attestationData, provider };
        },

        transactions: ({ attestTx, easAddress, easConfig, address, attestationData, provider }) => [
          {
            transaction: attestTx,
            applyGasBuffer: false,
            title: 'Attest application on-chain',
            gasless: $gaslessStore
              ? {
                  nonceGetter: () => getNonce(provider, address),
                  ERC2771Data(nonce) {
                    return {
                      domain: {
                        name: 'EAS',
                        version: '1.3.0',
                        chainId: network.chainId,
                        verifyingContract: easAddress,
                      },
                      types: {
                        Attest: [
                          { name: 'attester', type: 'address' },
                          { name: 'schema', type: 'bytes32' },
                          { name: 'recipient', type: 'address' },
                          { name: 'expirationTime', type: 'uint64' },
                          { name: 'revocable', type: 'bool' },
                          { name: 'refUID', type: 'bytes32' },
                          { name: 'data', type: 'bytes' },
                          { name: 'value', type: 'uint256' },
                          { name: 'nonce', type: 'uint256' },
                          { name: 'deadline', type: 'uint64' },
                        ],
                      },
                      payload: {
                        attester: address,
                        schema: easConfig.applicationAttestationSchemaUID,
                        recipient: address,
                        expirationTime: 0,
                        revocable: false,
                        refUID: ZERO_BYTES32,
                        data: attestationData,
                        value: '0',
                        nonce,
                        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour
                      },
                    };
                  },
                }
              : undefined,
          },
        ],

        after: async (receipts) => {
          const attestationUID = getUIDsFromAttestReceipt(receipts[0])[0];

          const application = await submitApplication(
            undefined,
            roundSlug,
            {
              ...applicationData,
              attestationUID,
            },
            applicationFormat,
          );

          $context.applicationId = application.id;
        },
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader
    headline="Submit your application"
    description="When submitting your application, public fields will be attested on-chain. All fields marked as private will only be shared with the round's organizers."
    emoji="💦"
  />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Never mind</Button>
    <Button icon={Wallet} on:click={handleConfirm} variant="primary">Confirm in wallet</Button>
  </svelte:fragment>
</StepLayout>
