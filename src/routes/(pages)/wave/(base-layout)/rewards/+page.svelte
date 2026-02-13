<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Orgs from '$lib/components/icons/Orgs.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import Section from '$lib/components/section/section.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import StatusBadge from '$lib/components/status-badge/status-badge.svelte';
  import GrantStatusBadge from '$lib/components/wave/rewards/grant-status-badge.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import testTransactionFlow from '$lib/flows/wave/test-transaction/test-transaction-flow';
  import withdrawalFlow from '$lib/flows/wave/withdrawal/withdrawal-flow';
  import modal from '$lib/stores/modal';
  import type { GrantDetailDto, GrantDto, GrantStatus } from '$lib/utils/wave/types/grant.js';
  import { getGrant } from '$lib/utils/wave/grants.js';

  let { data } = $props();

  let {
    grants: { data: grants },
    kycStatus,
  } = $derived(data);

  let kycApproved = $derived(kycStatus.reviewAnswer === 'GREEN');

  let loadingWithdrawalGrantId = $state<string | null>(null);

  function openTestTransactionFlow(grant: GrantDto) {
    modal.show(Stepper, undefined, testTransactionFlow(grant));
  }

  function getLastSuccessfulTestTransaction(g: GrantDetailDto) {
    return g.transactions
      .filter((tx) => tx.type === 'test' && tx.status === 'complete')
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
  }

  async function openWithdrawalFlow(grant: GrantDto) {
    loadingWithdrawalGrantId = grant.id;
    try {
      const grantDetail = await getGrant(fetch, grant.id);
      const lastTest = grantDetail ? getLastSuccessfulTestTransaction(grantDetail) : undefined;
      const prefill = lastTest
        ? { stellarAddress: lastTest.stellarAddress, memo: lastTest.memoValue ?? undefined }
        : undefined;
      modal.show(Stepper, undefined, withdrawalFlow(grant, prefill));
    } finally {
      loadingWithdrawalGrantId = null;
    }
  }

  function isExpired(grant: GrantDto): boolean {
    return new Date(grant.expiresAt) < new Date();
  }

  function canRequestTest(grant: GrantDto): boolean {
    return (
      (grant.status === 'withdrawable' || grant.status === 'test_transaction_sent') &&
      !isExpired(grant) &&
      grant.currentAmountUSD > 1
    );
  }

  function canWithdraw(grant: GrantDto): boolean {
    return (
      (grant.status === 'withdrawable' || grant.status === 'test_transaction_sent') &&
      !isExpired(grant)
    );
  }

  function isProcessing(status: GrantStatus): boolean {
    return status === 'test_transaction_requested' || status === 'withdrawal_pending';
  }
</script>

<HeadMeta title="Reward Grants | Wave" />

<Section
  header={{
    label: 'Your Reward Grants',
    icon: Orgs,
    infoTooltip: 'View and withdraw your earned grants from completed Wave contributions.',
  }}
  skeleton={{
    loaded: true,
    empty: grants.length === 0,
    emptyStateEmoji: '💰',
    emptyStateHeadline: 'No current Reward Grants available',
    emptyStateText:
      "Rewards are made available when Points for rewards have been frozen after each Wave. You'll receive an email notification when a grant is available.",
  }}
>
  {#if !kycApproved}
    <div class="kyc-warning">
      <AnnotationBox type="warning">
        <span>
          You need to complete identity verification before you can withdraw funds.
          <a href="/wave/settings/identity-and-payments">Verify your identity</a>
        </span>
      </AnnotationBox>
    </div>
  {/if}

  <div class="grants-list">
    {#each grants as grant (grant.id)}
      <a href="/wave/rewards/{grant.id}" class="grant-card">
        <div class="grant-info">
          <div class="grant-header">
            <span class="program-name typo-text-bold"
              >{grant.waveProgramName} Wave {grant.waveNumber}</span
            >
            <GrantStatusBadge status={grant.status} expired={isExpired(grant)} size="small" />
            {#if grant.isOrgGrant}
              <Tooltip>
                <StatusBadge size="small" color="primary" icon={Orgs}>
                  <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                    Org grant
                    <InfoCircle
                      style="width: 1rem; height: 1rem; fill: currentColor; cursor: help;"
                    />
                  </span>
                </StatusBadge>
                {#snippet tooltip_content()}
                  This grant is issued to your organization and can be withdrawn by anyone within
                  the org.
                {/snippet}
              </Tooltip>
            {/if}
          </div>
          {#if grant.description}
            <p class="grant-description typo-text-small">{grant.description}</p>
          {/if}
          <div class="grant-amount">
            <span class="amount tnum">${grant.initialAmountUSD.toLocaleString()}</span>
            <span class="currency">USD</span>
          </div>
        </div>

        <div class="grant-right">
          {#if !isExpired(grant) && !isProcessing(grant.status) && grant.status !== 'withdrawal_complete'}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <div class="grant-actions" onclick={(e) => e.preventDefault()} role="group">
              {#if canRequestTest(grant)}
                <Button
                  variant="primary"
                  onclick={() => openTestTransactionFlow(grant)}
                  disabled={!kycApproved}
                >
                  Request test
                </Button>
              {/if}
              {#if canWithdraw(grant)}
                <Button
                  variant={grant.status === 'test_transaction_sent' ? 'primary' : 'normal'}
                  onclick={() => openWithdrawalFlow(grant)}
                  disabled={!kycApproved}
                  loading={loadingWithdrawalGrantId === grant.id}
                >
                  Request full withdrawal
                </Button>
              {/if}
            </div>
          {/if}

          <div class="chevron">
            <ChevronRight
              style="width: 1.25rem; height: 1.25rem; fill: var(--color-foreground-level-4);"
            />
          </div>
        </div>
      </a>
    {/each}
  </div>
</Section>

<style>
  .kyc-warning {
    margin-bottom: 1rem;
  }

  .kyc-warning a {
    color: inherit;
    font-weight: bold;
    text-decoration: underline;
  }

  .grants-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .grant-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background-color: var(--color-background);
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: inset 0 0 0 1px var(--color-foreground-level-2);
    transition:
      box-shadow 0.2s,
      background-color 0.2s;
    text-decoration: none;
    color: inherit;
  }

  .grant-card:hover {
    box-shadow: inset 0 0 0 1px var(--color-foreground-level-4);
    background-color: var(--color-foreground-level-1);
  }

  .grant-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .grant-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .program-name {
    color: var(--color-foreground);
  }

  .grant-description {
    color: var(--color-foreground-level-5);
  }

  .grant-amount {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
  }

  .amount {
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--color-foreground);
  }

  .currency {
    color: var(--color-foreground-level-5);
  }

  .grant-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .grant-actions {
    display: flex;
    gap: 0.5rem;
  }

  .chevron {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .grant-card {
      position: relative;
      padding-right: 2.5rem;
    }

    .grant-header {
      flex-wrap: wrap;
      row-gap: 0.25rem;
    }

    .grant-actions {
      display: none;
    }

    .grant-right {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>
