<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Orgs from '$lib/components/icons/Orgs.svelte';
  import List from '$lib/components/icons/List.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Section from '$lib/components/section/section.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import GrantStatusBadge from '$lib/components/wave/rewards/grant-status-badge.svelte';
  import TransactionStatusCell from '$lib/components/wave/rewards/transaction-status-cell.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import testTransactionFlow from '$lib/flows/wave/test-transaction/test-transaction-flow';
  import withdrawalFlow from '$lib/flows/wave/withdrawal/withdrawal-flow';
  import modal from '$lib/stores/modal';
  import formatDate from '$lib/utils/format-date.js';
  import type { GrantDetailDto, GrantStatus } from '$lib/utils/wave/types/grant.js';

  let { data } = $props();

  let { grant, kycStatus } = $derived(data);

  let kycApproved = $derived(kycStatus.reviewAnswer === 'GREEN');

  function openTestTransactionFlow(g: GrantDetailDto) {
    modal.show(Stepper, undefined, testTransactionFlow(g));
  }

  function getLastSuccessfulTestTransaction(g: GrantDetailDto) {
    return g.transactions
      .filter((tx) => tx.type === 'test' && tx.status === 'complete')
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
  }

  function openWithdrawalFlow(g: GrantDetailDto) {
    const lastTest = getLastSuccessfulTestTransaction(g);
    const prefill = lastTest
      ? { stellarAddress: lastTest.stellarAddress, memo: lastTest.memoValue ?? undefined }
      : undefined;
    modal.show(Stepper, undefined, withdrawalFlow(g, prefill));
  }

  let isExpired = $derived(new Date(grant.expiresAt) < new Date());

  function canRequestTest(g: GrantDetailDto): boolean {
    return (
      (g.status === 'withdrawable' || g.status === 'test_transaction_sent') &&
      new Date(g.expiresAt) >= new Date()
    );
  }

  function canWithdraw(g: GrantDetailDto): boolean {
    return (
      (g.status === 'withdrawable' || g.status === 'test_transaction_sent') &&
      new Date(g.expiresAt) >= new Date()
    );
  }

  function isProcessing(status: GrantStatus): boolean {
    return status === 'test_transaction_requested' || status === 'withdrawal_pending';
  }
</script>

<HeadMeta title="{grant.waveProgramName} Wave {grant.waveNumber} Reward | Wave" />

<div class="page-wrapper">
  <Breadcrumbs
    crumbs={[
      { href: '/wave/rewards', label: 'Reward Grants' },
      { label: `${grant.waveProgramName} Wave ${grant.waveNumber}` },
    ]}
  />

  <div class="page">
    <div class="left-pane">
      <Section
        header={{
          label: `${grant.waveProgramName} Wave ${grant.waveNumber}`,
          icon: Orgs,
        }}
        skeleton={{
          loaded: true,
          empty: false,
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

        <div class="grant-overview">
          <div class="overview-row">
            <span class="label">Amount</span>
            <span class="value tnum">${grant.initialAmountUSD.toLocaleString()} USD</span>
          </div>
          <div class="overview-row">
            <span class="label">Withdrawable amount</span>
            <span class="value tnum">${grant.currentAmountUSD.toLocaleString()} USD</span>
          </div>
          <div class="overview-row">
            <span class="label">Status</span>
            <GrantStatusBadge status={grant.status} expired={isExpired} />
          </div>
          <div class="overview-row">
            <span class="label">Granted</span>
            <span class="value">{formatDate(grant.createdAt, 'dayAndYear')}</span>
          </div>
        </div>

        {#if !isExpired && !isProcessing(grant.status) && grant.status !== 'withdrawal_complete'}
          <div class="grant-actions">
            {#if canRequestTest(grant)}
              <Button
                variant="primary"
                onclick={() => openTestTransactionFlow(grant)}
                disabled={!kycApproved}
              >
                Request test transaction
              </Button>
            {/if}
            {#if canWithdraw(grant)}
              <Button
                variant={grant.status === 'test_transaction_sent' ? 'primary' : 'normal'}
                onclick={() => openWithdrawalFlow(grant)}
                disabled={!kycApproved}
              >
                Request full withdrawal
              </Button>
            {/if}
          </div>
        {/if}
      </Section>

      {#if isProcessing(grant.status)}
        <AnnotationBox type="info">
          Your {grant.status === 'withdrawal_pending' ? 'withdrawal' : 'test transaction'} is being processed.
          {grant.status === 'withdrawal_pending'
            ? 'Withdrawals are usually completed within 2–5 business days.'
            : 'Test transactions are usually processed within a few minutes, but may take up to 7 days in rare cases.'}
          We'll send you an email when it's done.
        </AnnotationBox>
      {/if}
    </div>

    <div class="right-pane">
      <Section
        header={{
          label: 'Transaction history',
          icon: List,
        }}
        skeleton={{
          loaded: true,
          empty: grant.transactions.length === 0,
          emptyStateEmoji: '📋',
          emptyStateHeadline: 'No transactions yet',
          emptyStateText:
            'Request a test transaction or withdrawal to see your transaction history.',
        }}
      >
        <div class="transactions-list">
          {#each grant.transactions as tx (tx.id)}
            <div class="transaction-card">
              <div class="transaction-header">
                <span class="transaction-type typo-text-bold">
                  {tx.type === 'test' ? 'Test Transaction' : 'Withdrawal'}
                </span>
                <TransactionStatusCell status={tx.status} />
              </div>

              <div class="transaction-details">
                <div class="detail-row">
                  <span class="detail-label">Amount</span>
                  <span class="detail-value tnum">${tx.amountUSD.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Destination</span>
                  <Tooltip text={tx.stellarAddress} copyable>
                    <span class="detail-value typo-text-mono"
                      >{tx.stellarAddress.slice(0, 4)}–{tx.stellarAddress.slice(-4)}</span
                    >
                    {#snippet tooltip_content()}
                      <span class="typo-text-mono">{tx.stellarAddress}</span>
                    {/snippet}
                  </Tooltip>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Memo</span>
                  <span class="detail-value" class:typo-text-mono={tx.memoValue}
                    >{tx.memoValue || 'None'}</span
                  >
                </div>
                <div class="detail-row">
                  <span class="detail-label">Requested</span>
                  <span class="detail-value">{formatDate(tx.requestedAt)}</span>
                </div>
                {#if tx.completedAt}
                  <div class="detail-row">
                    <span class="detail-label">Completed</span>
                    <span class="detail-value">{formatDate(tx.completedAt)}</span>
                  </div>
                {/if}
                {#if tx.transactionHash}
                  <div class="detail-row">
                    <span class="detail-label">Transaction hash</span>
                    <a
                      href="https://stellar.expert/explorer/public/tx/{tx.transactionHash}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="tx-link"
                    >
                      {tx.transactionHash.slice(0, 12)}...
                    </a>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </Section>
    </div>
  </div>
</div>

<style>
  .page-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 90rem;
    width: 100%;
    margin: 0 auto;
  }

  .page {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
  }

  .left-pane {
    align-self: start;
    position: sticky;
    top: 5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .right-pane {
    min-width: 0;
  }

  .kyc-warning {
    margin-bottom: 1rem;
  }

  .kyc-warning a {
    color: inherit;
    font-weight: bold;
    text-decoration: underline;
  }

  .grant-overview {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background-color: var(--color-foreground-level-1);
    border-radius: 1rem 0 1rem 1rem;
  }

  .overview-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .label {
    color: var(--color-foreground-level-5);
  }

  .value {
    font-weight: 500;
  }

  .grant-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .grant-actions :global(.button) {
    width: 100%;
  }

  .transactions-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .transaction-card {
    padding: 1rem 1.25rem;
    background-color: var(--color-background);
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: inset 0 0 0 1px var(--color-foreground-level-2);
  }

  .transaction-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .transaction-type {
    color: var(--color-foreground);
  }

  .transaction-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-label {
    color: var(--color-foreground-level-5);
    font-size: 0.875rem;
  }

  .detail-value {
    color: var(--color-foreground);
    font-size: 0.875rem;
  }

  .tx-link {
    color: var(--color-primary-level-6);
    text-decoration: none;
    font-family: monospace;
    font-size: 0.875rem;
  }

  .tx-link:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .page {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .left-pane {
      position: static;
    }
  }
</style>
