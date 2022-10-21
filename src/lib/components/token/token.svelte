<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import QuestionIcon from 'radicle-design-system/icons/Info.svelte';

  export let address: string;

  $: tokenInfo = $tokens ? tokens.getByAddress(address)?.info : undefined;

  let imageFailed = false;
</script>

<div class="token">
  <div class="logo">
    {#if tokenInfo?.logoURI && !imageFailed}
      <img
        src={tokenInfo.logoURI}
        on:error={() => (imageFailed = true)}
        alt={`${tokenInfo.name} logo`}
      />
    {:else}
      <QuestionIcon />
    {/if}
  </div>
  <div class="name typo-text-bold" class:unknown={tokenInfo === undefined}>
    {tokenInfo?.name ?? 'Unknown token'}
  </div>
</div>

<style>
  .token {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .logo {
    background-color: var(--color-foreground-level-2);
    height: 2rem;
    width: 2rem;
    border-radius: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .unknown {
    opacity: 0.5;
  }
</style>
