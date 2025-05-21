<script lang="ts">
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import Button from '../button/button.svelte';
  import RpgfSiweButton from '../rpgf-siwe-button/rpgf-siwe-button.svelte';

  export let emoji: string;
  export let headline: string;
  export let description: string | undefined = undefined;
  export let learnMoreLink:
    | {
        label: string;
        url: string;
      }
    | undefined = undefined;
  export let button: { label: string; handler: () => void } | undefined = undefined;
  export let secondaryButton: { label: string; handler: () => void } | undefined = undefined;
  export let showSiweButton = false;
</script>

<div class="large-empty-state">
  <Emoji size="huge" {emoji} />
  <div class="content">
    <h1>{headline}</h1>
    {#if description}<p>{description}</p>{/if}
    {#if learnMoreLink}<a
        class="typo-text-small"
        href={learnMoreLink.url}
        target="_blank"
        rel="noreferrer">{learnMoreLink.label}</a
      >{/if}
    <div class="buttons">
      {#if secondaryButton}<Button on:click={secondaryButton.handler}
          >{secondaryButton.label}</Button
        >{/if}
      {#if button}<Button
          variant={secondaryButton ? 'primary' : undefined}
          on:click={button.handler}>{button.label}</Button
        >{/if}
        {#if showSiweButton}
        <RpgfSiweButton></RpgfSiweButton>
        {/if}
    </div>
  </div>
</div>

<style>
  .large-empty-state {
    height: 100%;
    padding: 25vh 0;
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-direction: column;
    align-items: center;
  }

  .content {
    display: flex;
    text-align: center;
    max-width: 32rem;
    gap: 1rem;
    align-items: center;
    flex-direction: column;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
  }

  p {
    color: var(--color-foreground-level-6);
  }

  a {
    text-decoration: underline;
    margin-bottom: 2rem;
  }
</style>
