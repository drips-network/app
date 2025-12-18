<script lang="ts">
  import Divider from '$lib/components/divider/divider.svelte';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import cookieManager, { CONSENT_TYPES, ConsentType } from './cookie-manager.svelte';
  import unreachable from '$lib/utils/unreachable';
  import modal from '$lib/stores/modal';
  import Button from '$lib/components/button/button.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';

  let { onapply }: { onapply?: () => void } = $props();

  let values = $state<Record<ConsentType, boolean>>(
    cookieManager ? { ...cookieManager.consentMap } : unreachable(),
  );

  function applySettings() {
    if (!cookieManager) return;
    for (const [type, value] of Object.entries(values) as [ConsentType, boolean][]) {
      cookieManager.setConsent(type, value);
    }

    cookieManager.setCookiesConfigured();

    onapply?.();
    modal.hide();
  }
</script>

<div class="cookie-modal">
  <h2>Cookie preferences</h2>
  <p>
    Drips only uses essential cookies to improve your experience. We never sell your data. Learn
    more in our <a class="typo-link" href="/legal/privacy" target="_blank">Privacy Policy</a>.
  </p>

  <p>The below preferences apply to Drips Wave only.</p>

  <Divider />

  {#if cookieManager}
    <div class="cookies">
      {#each CONSENT_TYPES as { value, label, description, required } (value)}
        <div class="cookie-preference">
          <h5>{label}</h5>
          <p class="typo-text-small">{description}</p>
          <div class="toggle">
            <Toggle bind:checked={values[value]} disabled={required} />
          </div>
        </div>
      {/each}
    </div>
  {:else}
    Something went wrong while loading cookie preferences. Please reach out to support.
  {/if}

  <div class="actions">
    <span class="typo-text-small">You can change your preferences later under Settings.</span>
    <Button variant="primary" icon={CheckCircle} onclick={applySettings}>Apply settings</Button>
  </div>
</div>

<style>
  .cookie-modal {
    padding: 1rem;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  p {
    color: var(--color-foreground-level-6);
  }

  .cookies {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .cookie-preference {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .toggle {
    margin-top: 0.5rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
</style>
