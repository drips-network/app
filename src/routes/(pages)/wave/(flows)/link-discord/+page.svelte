<script lang="ts">
  import { invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import Discord from '$lib/components/icons/Discord.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import FlowStepWrapper from '../shared/flow-step-wrapper.svelte';
  import { getDiscordLinkUrl, unlinkDiscordAccount } from '$lib/utils/wave/discord';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import DiscordSpot from '$lib/components/icons/Discord-Spot.svelte';

  let { data } = $props();

  let linking = $state(false);
  let unlinking = $state(false);

  async function handleLinkDiscord() {
    linking = true;
    try {
      await doWithErrorModal(async () => {
        const { url } = await getDiscordLinkUrl('/wave/settings/identity-and-payments');
        window.location.href = url;
      });
    } catch {
      linking = false;
    }
  }

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

<HeadMeta title="Link Discord | Wave" />

{#if data.discordAccount}
  <FlowStepWrapper
    icon={DiscordSpot}
    headline="Discord linked"
    description="Your Discord account is connected to your Wave profile."
  >
    <div class="linked-account-card">
      {#if data.discordAccount.providerAvatarUrl}
        <img
          src={data.discordAccount.providerAvatarUrl}
          alt="{data.discordAccount.providerUsername}'s Discord avatar"
          class="discord-avatar"
        />
      {:else}
        <div class="discord-avatar placeholder">
          <Discord />
        </div>
      {/if}
      <div class="account-info">
        <span class="username">{data.discordAccount.providerUsername}</span>
        {#if data.discordAccount.providerDisplayName}
          <span class="display-name">{data.discordAccount.providerDisplayName}</span>
        {/if}
      </div>
    </div>

    <AnnotationBox type="info">
      Your Discord roles are automatically updated based on your Wave activity. You have access to
      the "Wave Contributor" role for earning points, and the "Wave Project Maintainer" role if you
      have approved repositories.
    </AnnotationBox>

    {#snippet leftActions()}
      <Button icon={ArrowLeft} href="/wave/settings/identity-and-payments">Back</Button>
    {/snippet}

    {#snippet actions()}
      <Button variant="destructive" onclick={handleUnlinkDiscord} disabled={unlinking}>
        {unlinking ? 'Unlinking...' : 'Unlink Discord'}
      </Button>
    {/snippet}
  </FlowStepWrapper>
{:else}
  <FlowStepWrapper
    icon={DiscordSpot}
    headline="Link your Discord"
    description="Connect your Discord account to your Wave profile for these benefits:"
  >
    <div class="benefits">
      <div class="benefit">
        <CheckCircle style="fill: var(--color-positive-level-6); flex-shrink: 0;" />
        <p>Automatic roles in the Drips Discord based on your Wave activity</p>
      </div>
      <div class="benefit">
        <CheckCircle style="fill: var(--color-positive-level-6); flex-shrink: 0;" />
        <p>For maintainers, automatic access to the maintainers-only channel</p>
      </div>
      <div class="benefit" style:margin-bottom="1rem">
        <CheckCircle style="fill: var(--color-positive-level-6); flex-shrink: 0;" />
        <p>Stay up-to-date with Wave announcements on the Drips Discord</p>
      </div>

      <AnnotationBox type="warning">
        If you're not already a member of the <a
          href="https://discord.gg/t8XBXZAEs5"
          target="_blank"
          rel="noopener noreferrer"
          class="typo-link">Drips Discord server</a
        >, linking will automatically add you to it.
      </AnnotationBox>
    </div>

    {#snippet leftActions()}
      <Button icon={ArrowLeft} href="/wave/settings/identity-and-payments">Back</Button>
    {/snippet}

    {#snippet actions()}
      <Button variant="primary" icon={Discord} onclick={handleLinkDiscord} disabled={linking}>
        {linking ? 'Redirecting...' : 'Link Discord'}
      </Button>
    {/snippet}
  </FlowStepWrapper>
{/if}

<style>
  .benefits {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    text-align: left;
    width: 100%;
    max-width: 29rem;
    margin: 0 auto;
  }

  .benefit {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .benefit p {
    margin: 0;
  }

  .linked-account-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background-color: var(--color-foreground-level-1);
    padding: 1rem 1.5rem;
    border-radius: 1rem 0 1rem 1rem;
  }

  .discord-avatar {
    width: 3rem;
    height: 3rem;
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
    font-size: 1.125rem;
  }

  .account-info .display-name {
    color: var(--color-foreground-level-5);
  }
</style>
