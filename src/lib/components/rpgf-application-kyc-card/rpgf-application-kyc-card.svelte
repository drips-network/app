<script lang="ts">
  import { invalidate } from '$app/navigation';
  import createRpgfKycRequestFlow from '$lib/flows/create-rpgf-kyc-request/create-rpgf-kyc-request-flow';
  import linkKycRequestToApplicationFlow from '$lib/flows/link-kyc-request-to-application/link-kyc-request-to-application-flow';
  import modal from '$lib/stores/modal';
  import type { KycRequest } from '$lib/utils/rpgf/types/kyc';
  import Button from '../button/button.svelte';
  import ArrowBoxUpRight from '../icons/ArrowBoxUpRight.svelte';
  import ArrowCounterClockwiseHeart from '../icons/ArrowCounterClockwiseHeart.svelte';
  import ArrowRight from '../icons/ArrowRight.svelte';
  import OrDivider from '../rpgf-results-card/components/or-divider.svelte';
  import Stepper from '../stepper/stepper.svelte';

  export let kycRequest: KycRequest | null;
  export let applicationId: string;
  export let roundId: string;

  let refreshing = false;
  async function handleRefreshKyc() {
    if (refreshing) return;

    refreshing = true;
    await invalidate('rpgf:round:applications');
    refreshing = false;
  }
</script>

<div class="application-kyc-card">
  <div class="card-header">
    <h5>Identity verification</h5>
    <!-- TODO(rpgf): Real refresh icon -->
    <Button
      variant="ghost"
      ariaLabel="Refresh"
      icon={ArrowCounterClockwiseHeart}
      loading={refreshing}
      on:click={handleRefreshKyc}
    >
      Refresh status
    </Button>
  </div>

  {#if !kycRequest}
    <div
      class="status-badge typo-header-4"
      style:color="var(--color-negative-level-6)"
      style:background-color="var(--color-negative-level-1)"
    >
      Not started
    </div>

    <p>
      The round organizers require applicants to verify their identity with a third-party KYC
      provider before it can be approved. Click below to get started.
    </p>
    <p>
      If you're creating multiple applications for yourself or your organization, you can
      alternatively re-use an existing KYC process.
    </p>

    <!-- TODO(rpgf): Learn more link -->

    <Button
      size="large"
      variant="primary"
      on:click={() => modal.show(Stepper, undefined, createRpgfKycRequestFlow(applicationId))}
      icon={ArrowRight}
    >
      Begin verification
    </Button>

    <OrDivider />

    <Button
      size="large"
      on:click={() =>
        modal.show(Stepper, undefined, linkKycRequestToApplicationFlow(applicationId, roundId))}
    >
      Link existing KYC process
    </Button>
  {:else if kycRequest.status === 'CREATED'}
    <div
      class="status-badge typo-header-4"
      style:color="var(--color-caution-level-6)"
      style:background-color="var(--color-caution-level-1)"
    >
      Information needed
    </div>

    <p>Please fill out all the necessary information on the KYC provider's form.</p>

    <Button
      size="large"
      variant="primary"
      href={kycRequest.kycFormUrl}
      target="_blank"
      icon={ArrowBoxUpRight}
    >
      Continue verification
    </Button>
  {:else if kycRequest.status === 'UNDER_REVIEW'}
    <div
      class="status-badge typo-header-4"
      style:color="var(--color-caution-level-6)"
      style:background-color="var(--color-caution-level-1)"
    >
      Under review
    </div>

    <p>
      The KYC provider is currently reviewing your submission. This process is usually quick, but
      may take up to a few days. Be on the lookout for any emails from Fern in case additional
      information is needed.
    </p>
  {:else if kycRequest.status === 'NEEDS_ADDITIONAL_INFORMATION'}
    <div
      class="status-badge typo-header-4"
      style:color="var(--color-caution-level-6)"
      style:background-color="var(--color-caution-level-1)"
    >
      Additional information required
    </div>

    <p>
      The KYC provider needs additional information from you to complete the verification, and will
      reach out to your provided email address directly. Please check your email for details and
      next steps.
    </p>
  {:else if kycRequest.status === 'ACTIVE'}
    <div
      class="status-badge typo-header-4"
      style:color="var(--color-positive-level-6)"
      style:background-color="var(--color-positive-level-1)"
    >
      Verified
    </div>

    <p>Your identity has been successfully verified.</p>
  {:else if kycRequest.status === 'REJECTED'}
    <div
      class="status-badge typo-header-4"
      style:color="var(--color-negative-level-6)"
      style:background-color="var(--color-negative-level-1)"
    >
      Verification failed
    </div>

    <p>
      Unfortunately, your verification was not successful. Please check your email for details from
      the KYC provider and consider reapplying.
    </p>
  {:else if kycRequest.status === 'DEACTIVATED'}
    <div
      class="status-badge typo-header-4"
      style:color="var(--color-negative-level-6)"
      style:background-color="var(--color-negative-level-1)"
    >
      Deactivated
    </div>

    <p>
      Your KYC request has been deactivated for an unknown reason. If you believe this is a mistake,
      please contact the round organizers for assistance.
    </p>
  {/if}
</div>

<style>
  .application-kyc-card {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    padding: 1.5rem;
    border-radius: 1rem;
    background-color: var(--color-background-level-2);
    border: 1px solid var(--color-foreground-level-3);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
  }

  .status-badge {
    display: flex;
    padding: 0.25rem 0.75rem;
    width: fit-content;
    border-radius: 1rem 0 1rem 1rem;
  }

  .application-kyc-card p {
    color: var(--color-foreground-level-6);
  }
</style>
