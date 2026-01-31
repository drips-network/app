<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import Discord from '$lib/components/icons/Discord.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import FlowStepWrapper from '../shared/flow-step-wrapper.svelte';
  import { getDiscordLinkUrl } from '$lib/utils/wave/discord';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import DiscordSpot from '$lib/components/icons/Discord-Spot.svelte';

  let linking = $state(false);

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
</script>

<HeadMeta title="Link Discord | Wave" />

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
</style>
