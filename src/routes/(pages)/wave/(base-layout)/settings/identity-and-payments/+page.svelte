<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import Setting from '$lib/components/setting/setting.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal.js';
  import doWithErrorModal from '$lib/utils/do-with-error-modal.js';
  import { refreshAccessToken } from '$lib/utils/rpgf/siwe.js';
  import { patchProfile } from '$lib/utils/wave/profile.js';
  import z from 'zod';

  let { data } = $props();
  let { user } = $derived(data);

  const stellarAddressSchema = z.string().regex(/^G[A-Z2-7]{55}$/);

  // svelte-ignore state_referenced_locally
  let stellarPayoutAddressValue = $state(user.payoutAddresses?.stellar || '');

  let stellarInputValidationState = $derived.by<TextInputValidationState>(() => {
    if (stellarPayoutAddressValue === '') {
      return { type: 'valid' };
    } else if (stellarAddressSchema.safeParse(stellarPayoutAddressValue).success) {
      return { type: 'valid' };
    } else {
      return { type: 'invalid', message: 'Invalid Stellar address format.' };
    }
  });

  let stellarPayoutAddressChanged = $derived(
    stellarPayoutAddressValue !== user.payoutAddresses?.stellar,
  );

  let updatingAddress = $state(false);
  async function saveStellarPayoutAddress() {
    updatingAddress = true;

    await doWithConfirmationModal(
      `
      Updating your Stellar payout address will affect where you receive payouts for any rewards earned in upcoming Cycles.
      Please make absolutely sure your address is correct. Drips cannot recover funds sent to an incorrect address.
    `,
      () =>
        doWithErrorModal(async () => {
          try {
            await patchProfile(undefined, {
              payoutAddresses: {
                stellar: stellarPayoutAddressValue || null,
              },
            });

            // profile data is encoded in the access JWT, so we need to acquire a new one and refresh the app state.
            await refreshAccessToken();
            await invalidateAll();
          } finally {
            updatingAddress = false;
          }
        }),
    );
  }
</script>

<h5>Payment</h5>
<Setting
  title="Stellar payout address"
  subtitle="Set the Stellar address where you want to receive earned rewards after a Cycle ends."
>
  <div class="address-input">
    <TextInput
      bind:value={stellarPayoutAddressValue}
      validationState={stellarInputValidationState}
      placeholder="GAVFNYXA5POGBANFWO2EK52M7CGNY4CQFLI43ARYA6BSZFGRBTRULJGD"
    />
    <Button
      variant="primary"
      onclick={saveStellarPayoutAddress}
      icon={Check}
      loading={updatingAddress}
      disabled={!stellarPayoutAddressChanged || stellarInputValidationState.type === 'invalid'}
    >
      Save address
    </Button>
  </div>
</Setting>

<Setting
  title="Identity Verification"
  subtitle="To receive rewards, we need to verify your identity using a quick ID check."
>
  todo(wave): kyc
</Setting>

<Divider />
<h5>Profile</h5>

<Setting
  title="Email address"
  subtitle="To change this, update your primary email address on GitHub, then log out and back into Drips Wave."
>
  <span class="typo-text">{user.email}</span>
</Setting>

<style>
  .address-input {
    display: flex;
    max-width: 400px;
    width: 100%;
    gap: 0.5rem;
    flex-direction: column;
    align-items: flex-end;
  }
</style>
