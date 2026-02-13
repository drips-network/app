<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Orgs from '$lib/components/icons/Orgs.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import List from '$lib/components/icons/List.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Section from '$lib/components/section/section.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import StatusBadge from '$lib/components/status-badge/status-badge.svelte';
  import GrantStatusBadge from '$lib/components/wave/rewards/grant-status-badge.svelte';
  import TransactionStatusCell from '$lib/components/wave/rewards/transaction-status-cell.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import GitHubUserBadge from '$lib/components/wave/github-user-badge/github-user-badge.svelte';
  import testTransactionFlow from '$lib/flows/wave/test-transaction/test-transaction-flow';
  import withdrawalFlow from '$lib/flows/wave/withdrawal/withdrawal-flow';
  import { cancelWithdrawal } from '$lib/utils/wave/grants.js';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { invalidate } from '$app/navigation';
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

  let cancellingWithdrawal = $state(false);

  async function handleCancelWithdrawal() {
    await doWithConfirmationModal('Are you sure you want to cancel this pending withdrawal?', () =>
      doWithErrorModal(async () => {
        cancellingWithdrawal = true;
        try {
          await cancelWithdrawal(fetch, grant.id);
          await invalidate('wave:rewards');
        } finally {
          cancellingWithdrawal = false;
        }
      }),
    );
  }

  let isExpired = $derived(new Date(grant.expiresAt) < new Date());

  function canRequestTest(g: GrantDetailDto): boolean {
    return (
      (g.status === 'withdrawable' || g.status === 'test_transaction_sent') &&
      new Date(g.expiresAt) >= new Date() &&
      g.currentAmountUSD > 1
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
        {#if grant.description}
          <div class="description-card">
            <h4 class="typo-text-bold">Description</h4>
            <p class="description-text typo-text">{grant.description}</p>
          </div>
        {/if}

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
            <span class="label typo-text-small">Amount</span>
            <span class="value typo-text-small tnum"
              >${grant.initialAmountUSD.toLocaleString()} USD</span
            >
          </div>
          <div class="overview-row">
            <span class="label typo-text-small">Withdrawable amount</span>
            <span class="value typo-text-small tnum"
              >${grant.currentAmountUSD.toLocaleString()} USD</span
            >
          </div>
          <div class="overview-row">
            <span class="label typo-text-small">Status</span>
            <GrantStatusBadge status={grant.status} expired={isExpired} size="small" />
          </div>
          {#if grant.isOrgGrant}
            <div class="overview-row">
              <span class="label typo-text-small">Grant type</span>
              <StatusBadge size="small" color="primary" icon={Orgs}>
                <span
                  style="display: inline-flex; align-items: center; gap: 0.25rem;"
                  title="This grant is issued to your organization and can be withdrawn by anyone within the org."
                >
                  Org grant
                  <InfoCircle
                    style="width: 1rem; height: 1rem; fill: currentColor; cursor: help;"
                  />
                </span>
              </StatusBadge>
            </div>
            <div class="overview-row">
              <span class="label typo-text-small">Recipient org</span>
              <span class="value typo-text-small">{grant.orgName}</span>
            </div>
          {/if}
          <div class="overview-row">
            <span class="label typo-text-small">Granted</span>
            <span class="value typo-text-small">{formatDate(grant.createdAt, 'dayAndYear')}</span>
          </div>
          <div class="overview-row">
            <span class="label typo-text-small">Expires on</span>
            <span class="value typo-text-small">{formatDate(grant.expiresAt, 'dayAndYear')}</span>
          </div>
        </div>
      </Section>

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

      {#if isProcessing(grant.status)}
        <AnnotationBox type="info">
          Your {grant.status === 'withdrawal_pending' ? 'withdrawal' : 'test transaction'} is being processed.
          {grant.status === 'withdrawal_pending'
            ? 'Withdrawals are usually completed within 1–3 business days.'
            : 'Test transactions are usually processed within a few minutes, but may take up to 3 days in rare cases.'}
          We'll send you an email when it's done.
        </AnnotationBox>
        {#if grant.status === 'withdrawal_pending'}
          <Button variant="normal" onclick={handleCancelWithdrawal} loading={cancellingWithdrawal}>
            Cancel withdrawal
          </Button>
        {/if}
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
                  <span class="detail-label typo-text-small">Amount</span>
                  <span class="detail-value typo-text-small tnum"
                    >${tx.amountUSD.toLocaleString()}</span
                  >
                </div>
                <div class="detail-row">
                  <span class="detail-label typo-text-small">Destination</span>
                  <Tooltip text={tx.stellarAddress} copyable>
                    <span class="detail-value typo-text-small typo-text-mono"
                      >{tx.stellarAddress.slice(0, 4)}–{tx.stellarAddress.slice(-4)}</span
                    >
                    {#snippet tooltip_content()}
                      <span class="typo-text-mono">{tx.stellarAddress}</span>
                    {/snippet}
                  </Tooltip>
                </div>
                <div class="detail-row">
                  <span class="detail-label typo-text-small">Memo</span>
                  <span class="detail-value typo-text-small" class:typo-text-mono={tx.memoValue}
                    >{tx.memoValue || 'None'}</span
                  >
                </div>
                {#if grant.isOrgGrant && tx.requestedByGitHubUsername && tx.requestedByUserId}
                  <div class="detail-row">
                    <span class="detail-label typo-text-small">Requested by</span>
                    <GitHubUserBadge
                      size={24}
                      user={{
                        id: tx.requestedByUserId,
                        gitHubUsername: tx.requestedByGitHubUsername,
                        gitHubAvatarUrl: `https://avatars.githubusercontent.com/${tx.requestedByGitHubUsername}`,
                      }}
                    />
                  </div>
                {/if}
                <div class="detail-row">
                  <span class="detail-label typo-text-small">Requested</span>
                  <span class="detail-value typo-text-small">{formatDate(tx.requestedAt)}</span>
                </div>
                {#if tx.completedAt}
                  <div class="detail-row">
                    <span class="detail-label typo-text-small">Completed</span>
                    <span class="detail-value typo-text-small">{formatDate(tx.completedAt)}</span>
                  </div>
                {/if}
                {#if tx.transactionHash}
                  <div class="detail-row">
                    <span class="detail-label typo-text-small">Transaction hash</span>
                    <a
                      href="https://stellar.expert/explorer/public/tx/{tx.transactionHash}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="tx-link typo-text-small"
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
    gap: 0.75rem;
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

  .description-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    background-color: var(--color-foreground-level-1);
    border-radius: 1rem 0 1rem 1rem;
    margin-bottom: 0.75rem;
  }

  .description-text {
    color: var(--color-foreground-level-5);
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
  }

  .detail-value {
    color: var(--color-foreground);
  }

  .tx-link {
    color: var(--color-primary-level-6);
    text-decoration: none;
    font-family: monospace;
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
