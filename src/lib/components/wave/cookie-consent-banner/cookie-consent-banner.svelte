<script lang="ts">
  import { onMount } from 'svelte';
  import cookieManager from './cookie-manager.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Card from '../card/card.svelte';
  import { fade, fly } from 'svelte/transition';
  import modal from '$lib/stores/modal';
  import CookieModal from './cookie-modal.svelte';

  let triggered = $state(false);

  onMount(() => {
    if (!cookieManager) return;

    if (!cookieManager.cookiesConfigured) {
      triggered = true;
    }
  });

  function handleDecision(decision: 'accept' | 'reject') {
    if (!cookieManager) return;

    if (decision === 'accept') {
      cookieManager.acceptAll();
    } else {
      cookieManager.rejectAllNonEssential();
    }

    cookieManager.setCookiesConfigured();
    triggered = false;
  }
</script>

{#if triggered && cookieManager}
  <div class="bg" transition:fade={{ duration: 300 }}></div>

  <div transition:fly={{ duration: 300, y: 16 }} class="cookie-consent-banner">
    <Card style="background-color: var(--color-foreground-level-1)">
      <div class="cookie-consent-banner-inner">
        <h5>Want some cookies? 🍪</h5>
        <p class="typo-text-small">
          Drips Wave only uses essential cookies for strict technical reasons and to improve your
          experience. We never sell your data.
        </p>

        <div class="actions">
          <Button variant="ghost" onclick={() => handleDecision('reject')}>Reject</Button>
          <Button
            onclick={() =>
              modal.show(CookieModal, undefined, {
                onapply: () => {
                  triggered = false;
                },
              })}>Configure</Button
          >
          <Button variant="primary" onclick={() => handleDecision('accept')}>Accept all</Button>
        </div>
      </div>
    </Card>
  </div>
{/if}

<style>
  .bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--color-background);
    opacity: 0.75;
    z-index: 8;
  }

  .cookie-consent-banner {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: var(--shadow-md);
    max-width: 100%;
    width: 600px;
    z-index: 9;
  }

  .cookie-consent-banner-inner {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
</style>
