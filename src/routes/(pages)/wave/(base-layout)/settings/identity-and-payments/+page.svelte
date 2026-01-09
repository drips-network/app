<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
</script>

<AnnotationBox>
  Identity verification and reward settings will be enabled close to the launch of the first Stellar
  Wave. Please keep an eye on the Wave channel in <a
    class="typo-link"
    href="https://discord.gg/t8XBXZAEs5">our Discord</a
  > for announcements!
</AnnotationBox>

<!-- <script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import CrossCircle from '$lib/components/icons/CrossCircle.svelte';
  import ExclamationCircle from '$lib/components/icons/ExclamationCircle.svelte';
  import Setting from '$lib/components/setting/setting.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal.js';
  import doWithErrorModal from '$lib/utils/do-with-error-modal.js';
  import { refreshAccessToken } from '$lib/utils/rpgf/siwe.js';
  import { patchProfile } from '$lib/utils/wave/profile.js';
  import z from 'zod';

  let { data } = $props();
  let { user, kycStatus } = $derived(data);

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
      Updating your Stellar payout address will affect where you receive payouts for any rewards earned in upcoming Waves.
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

<HeadMeta title="Identity & Payments | Settings | Wave" />

<h5>Payment</h5>
<Setting
  title="Stellar payout address"
  subtitle="Set the Stellar address where you want to receive earned rewards after a Wave ends."
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
  {#if kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'GREEN'}
    <div
      class="kyc-status"
      style="color: var(--color-positive-level-6); background-color: var(--color-positive-level-1);"
    >
      <CheckCircle style="fill: var(--color-positive-level-6);" />
      <div class="description">Your identity has been successfully verified.</div>
    </div>
  {:else if kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'RED' && !kycStatus.canRetry}
    <div
      class="kyc-status with-action"
      style="color: var(--color-negative-level-6); background-color: var(--color-negative-level-1);"
    >
      <CrossCircle style="fill: var(--color-negative-level-6);" />
      <div class="description">
        Your identity couldn't be verified. Please contact support for assistance.
      </div>
      <Button icon={ArrowRight} href="/wave/kyc" variant="primary">Verify identity</Button>
    </div>
  {:else if kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'RED' && kycStatus.canRetry}
    <div
      class="kyc-status with-action"
      style="color: var(--color-caution-level-6); background-color: var(--color-caution-level-1);"
    >
      <ExclamationCircle style="fill: var(--color-caution-level-6);" />
      <div class="description">Your identity couldn't be verified. Please try again.</div>
      <Button icon={ArrowRight} href="/wave/kyc" variant="primary">Verify identity</Button>
    </div>
  {:else if !kycStatus.status || kycStatus.status === 'pending' || kycStatus.status === 'applicantReset' || kycStatus.status === 'applicantCreated'}
    <div
      class="kyc-status with-action"
      style="color: var(--color-caution-level-6); background-color: var(--color-caution-level-1);"
    >
      <div class="description">
        <ExclamationCircle style="fill: var(--color-caution-level-6);" />
        Verify your identity now to be eligible for Wave rewards.
      </div>
      <Button icon={ArrowRight} href="/wave/kyc" variant="primary">Verify identity</Button>
    </div>
  {:else if kycStatus.status === 'applicantPending' || kycStatus.status === 'applicantOnHold'}
    <div
      class="kyc-status"
      style="color: var(--color-foreground); background-color: var(--color-foreground-level-1);"
    >
      <div class="description">
        Your provided documents are being reviewed. You will be notified once the review is
        complete.
      </div>
    </div>
  {/if}
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

  .kyc-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--color-foreground-level-1);
    padding: 0.5rem 1rem 0.5rem 1rem;
    border-radius: 2rem 0 2rem 2rem;
  }

  .kyc-status.with-action {
    padding: 0.5rem 0.5rem 0.5rem 1rem;
  }

  .kyc-status .description {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
  }
</style> -->
