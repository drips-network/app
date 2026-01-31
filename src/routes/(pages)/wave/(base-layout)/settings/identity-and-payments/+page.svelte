<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import CrossCircle from '$lib/components/icons/CrossCircle.svelte';
  import Discord from '$lib/components/icons/Discord.svelte';
  import ExclamationCircle from '$lib/components/icons/ExclamationCircle.svelte';
  import Setting from '$lib/components/setting/setting.svelte';
  import { unlinkDiscordAccount } from '$lib/utils/wave/discord';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';

  let { data } = $props();
  let { user, kycStatus, linkedAccounts } = $derived(data);

  let discordAccount = $derived(linkedAccounts.find((a) => a.provider === 'discord'));

  let unlinking = $state(false);

  async function handleUnlinkDiscord() {
    await doWithConfirmationModal(
      'Your Discord roles will be removed. You can re-link at any time.',
      () =>
        doWithErrorModal(async () => {
          unlinking = true;
          try {
            await unlinkDiscordAccount();
            await invalidate('wave:linked-accounts');
          } finally {
            unlinking = false;
          }
        }),
    );
  }
</script>

<HeadMeta title="Identity & Payments | Settings | Wave" />

<h5>Payments and rewards</h5>

<Setting
  title="Identity Verification"
  subtitle="Verify your identitiy to be able to withdraw earned rewards."
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
        Your identity couldn't be verified. Reach out to <a href="/wave/support">support</a> for assistance.
      </div>
    </div>
  {:else if kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'RED' && kycStatus.canRetry}
    <div
      class="kyc-status with-action"
      style="color: var(--color-caution-level-6); background-color: var(--color-caution-level-1);"
    >
      <ExclamationCircle style="fill: var(--color-caution-level-6);" />
      <div class="description">
        Please re-submit key documents to complete identity verification.
      </div>
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

<Divider />
<h5>Connected Accounts</h5>

<Setting
  title="Discord"
  subtitle="Link your Discord account to receive roles based on your Wave activity."
>
  {#if discordAccount}
    <div class="linked-account">
      {#if discordAccount.providerAvatarUrl}
        <img
          src={discordAccount.providerAvatarUrl}
          alt="{discordAccount.providerUsername}'s Discord avatar"
          class="discord-avatar"
        />
      {:else}
        <div class="discord-avatar placeholder">
          <Discord />
        </div>
      {/if}
      <div class="account-info">
        <span class="username">{discordAccount.providerUsername}</span>
        {#if discordAccount.providerDisplayName}
          <span class="display-name">{discordAccount.providerDisplayName}</span>
        {/if}
      </div>
      <Button variant="destructive" onclick={handleUnlinkDiscord} disabled={unlinking}>
        {unlinking ? 'Unlinking...' : 'Unlink'}
      </Button>
    </div>
  {:else}
    <Button variant="primary" icon={Discord} href="/wave/link-discord">Link Discord</Button>
  {/if}
</Setting>

<style>
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

  .linked-account {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background-color: var(--color-foreground-level-1);
    padding: 0.5rem 0.5rem 0.5rem 0.75rem;
    border-radius: 2rem 0 2rem 2rem;
  }

  .discord-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    object-fit: cover;
  }

  .discord-avatar.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-foreground-level-2);
  }

  .account-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .account-info .username {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account-info .display-name {
    font-size: 0.875rem;
    color: var(--color-foreground-level-5);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
