<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import QuestionIcon from 'radicle-design-system/icons/Info.svelte';

  export let address: string;
  export let hideName = false;
  export let small = false;

  $: tokenInfo = $tokens ? tokens.getByAddress(address)?.info : undefined;

  let imageFailed = false;
</script>

<div class="token">
  <div class="logo" style={small ? 'height: 1.5rem; width: 1.5rem' : undefined}>
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
  {#if !hideName}
    <div class="name typo-text-bold" class:unknown={tokenInfo === undefined}>
      {tokenInfo?.name ?? 'Unknown token'}
    </div>
  {/if}
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
    overflow: hidden;
  }

  .unknown {
    opacity: 0.5;
  }
</style>
