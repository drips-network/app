<script lang="ts">
  import { invalidate } from '$app/navigation';
  import createRpgfKycRequestFlow from '$lib/flows/create-rpgf-kyc-request/create-rpgf-kyc-request-flow';
  import linkKycRequestToApplicationFlow from '$lib/flows/link-kyc-request-to-application/link-kyc-request-to-application-flow';
  import modal from '$lib/stores/modal';
  import type { KycRequest, KycStatus } from '$lib/utils/rpgf/types/kyc';
  import type { KycConfig } from '$lib/utils/rpgf/types/round';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import Button from '../button/button.svelte';
  import Copyable from '../copyable/copyable.svelte';
  import ArrowBoxUpRight from '../icons/ArrowBoxUpRight.svelte';
  import Refresh from '../icons/Refresh.svelte';
  import ArrowRight from '../icons/ArrowRight.svelte';
  import RpgfApplicationDetailsCard from '../rpgf-application-details-card/rpgf-application-details-card.svelte';
  import OrDivider from '../rpgf-results-card/components/or-divider.svelte';
  import Stepper from '../stepper/stepper.svelte';

  interface Props {
    kycRequest: KycRequest | null;
    roundKycConfig: KycConfig;
    applicationId: string;
    roundId: string;
    isOwnApplication: boolean;
    isRoundAdmin: boolean;
  }

  let {
    kycRequest,
    roundKycConfig,
    applicationId,
    roundId,
    isOwnApplication,
    isRoundAdmin,
  }: Props = $props();

  let refreshing = $state(false);
  async function handleRefreshKyc() {
    if (refreshing) return;

    refreshing = true;
    await invalidate('rpgf:round:applications');
    refreshing = false;
  }

  const FRIENDLY_STATE_LABELS: Record<KycStatus | 'NONE', string> = {
    NONE: 'Not started',
    CREATED: 'Information needed',
    UNDER_REVIEW: 'Under review',
    NEEDS_ADDITIONAL_INFORMATION: 'Additional information required',
    ACTIVE: 'Verified',
    REJECTED: 'Verification failed',
    DEACTIVATED: 'Deactivated',
  };

  const STATE_BADGE_BACKGROUND: Record<KycStatus | 'NONE', string> = {
    NONE: 'var(--color-foreground-level-2)',
    CREATED: 'var(--color-caution-level-1)',
    UNDER_REVIEW: 'var(--color-caution-level-1)',
    NEEDS_ADDITIONAL_INFORMATION: 'var(--color-caution-level-1)',
    ACTIVE: 'var(--color-positive-level-1)',
    REJECTED: 'var(--color-negative-level-1)',
    DEACTIVATED: 'var(--color-negative-level-1)',
  };

  const STATE_BADGE_TEXT: Record<KycStatus | 'NONE', string> = {
    NONE: 'var(--color-foreground)',
    CREATED: 'var(--color-caution-level-6)',
    UNDER_REVIEW: 'var(--color-caution-level-6)',
    NEEDS_ADDITIONAL_INFORMATION: 'var(--color-caution-level-6)',
    ACTIVE: 'var(--color-positive-level-6)',
    REJECTED: 'var(--color-negative-level-6)',
    DEACTIVATED: 'var(--color-negative-level-6)',
  };
</script>

<RpgfApplicationDetailsCard title="Identity verification" key="kyc">
  {#snippet right()}
    <Button
      variant="ghost"
      ariaLabel="Refresh"
      icon={Refresh}
      loading={refreshing}
      onclick={handleRefreshKyc}
    >
      Refresh status
    </Button>
  {/snippet}

  {#if !isOwnApplication && isRoundAdmin}
    <div class="fields">
      <div class="field">
        <h2 class="typo-header-4">Status</h2>
        <div
          class="status-badge typo-header-4"
          style:color={STATE_BADGE_TEXT[kycRequest?.status ?? 'NONE']}
          style:background-color={STATE_BADGE_BACKGROUND[kycRequest?.status ?? 'NONE']}
        >
          {FRIENDLY_STATE_LABELS[kycRequest?.status ?? 'NONE']}
        </div>
      </div>

      <div class="field">
        <h2 class="typo-header-4">Verification link</h2>
        {#if kycRequest}
          <Copyable value={kycRequest.kycFormUrl} alwaysVisible>
            <a
              class="typo-link"
              href={kycRequest.kycFormUrl}
              target="_blank"
              rel="noopener noreferrer">{kycRequest.kycFormUrl}</a
            >
          </Copyable>
        {:else if roundKycConfig.provider === 'Fern'}
          <p style:color="var(--color-foreground-level-5)">No KYC request linked</p>
        {:else if roundKycConfig.provider === 'Treova'}
          {@const url = `https://verify.treova.ai/${roundKycConfig.formId}`}
          <Copyable value={url} alwaysVisible>
            <a class="typo-link" href={url} target="_blank" rel="noopener noreferrer">{url}</a>
          </Copyable>
        {/if}
      </div>

      {#if kycRequest}
        <div class="field">
          <h2 class="typo-header-4">Verification type</h2>
          <p style:text-transform="capitalize">{kycRequest.kycType}</p>
        </div>
      {/if}
    </div>
  {:else}
    <div
      class="status-badge typo-header-4"
      style:color={STATE_BADGE_TEXT[kycRequest?.status ?? 'NONE']}
      style:background-color={STATE_BADGE_BACKGROUND[kycRequest?.status ?? 'NONE']}
    >
      {FRIENDLY_STATE_LABELS[kycRequest?.status ?? 'NONE']}
    </div>

    {#if !kycRequest}
      <p>
        The round organizers require applicants to verify their identity with a third-party KYC
        provider before rewards can be distributed. We have provided an option to complete your KYC
        ahead of time below to expedite post-round distribution. Click below to get started.
      </p>

      <!-- TODO(rpgf): Learn more link -->

      {#if roundKycConfig.provider === 'Fern'}
        <p>
          If you're creating multiple applications for yourself or your organization, you can
          alternatively re-use an existing KYC process.
        </p>

        <Button
          size="large"
          variant="primary"
          onclick={() => modal.show(Stepper, undefined, createRpgfKycRequestFlow(applicationId))}
          icon={ArrowRight}
        >
          Begin verification
        </Button>

        <OrDivider />

        <Button
          size="large"
          onclick={() =>
            modal.show(Stepper, undefined, linkKycRequestToApplicationFlow(applicationId, roundId))}
        >
          Link existing KYC process
        </Button>
      {:else if roundKycConfig.provider === 'Treova'}
        <AnnotationBox type="info">
          Use the same wallet address as you did for this application in the KYC form to ensure it
          gets linked correctly. After submitting the form, it may take a few minutes for the status
          to update here.
        </AnnotationBox>

        <AnnotationBox type="warning">
          Clicking the link below will take you to a third-party KYC provider. Their Privacy Policy
          and Terms of Service apply.
        </AnnotationBox>

        <Button
          size="large"
          variant="primary"
          href="https://verify.treova.ai/{roundKycConfig.formId}"
          target="_blank"
          icon={ArrowBoxUpRight}
        >
          Open verification form
        </Button>
      {/if}
    {:else if kycRequest.status === 'CREATED'}
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
      <p>
        The KYC provider is currently reviewing your submission. This process is usually quick, but
        may take up to a few days. Be on the lookout for any emails from {roundKycConfig.provider} in
        case additional information is needed.
      </p>
    {:else if kycRequest.status === 'NEEDS_ADDITIONAL_INFORMATION'}
      <p>
        {roundKycConfig.provider} needs additional information from you to complete the verification,
        and will reach out to your provided email address directly. Please check your email for details
        and next steps.
      </p>
    {:else if kycRequest.status === 'ACTIVE'}
      <p>Your identity has been successfully verified.</p>
    {:else if kycRequest.status === 'REJECTED'}
      <p>
        Unfortunately, your verification was not successful. Please check your email for details
        from the KYC provider {roundKycConfig.provider} and consider reapplying.
      </p>
    {:else if kycRequest.status === 'DEACTIVATED'}
      <p>
        Your KYC request has been deactivated by the KYC provider for an unknown reason. If you
        believe this is a mistake, please contact the round organizers for assistance.
      </p>
    {/if}
  {/if}
</RpgfApplicationDetailsCard>

<style>
  .status-badge {
    display: flex;
    padding: 0.25rem 0.75rem;
    width: fit-content;
    border-radius: 1rem 0 1rem 1rem;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .fields > .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: fit-content;
  }
</style>
