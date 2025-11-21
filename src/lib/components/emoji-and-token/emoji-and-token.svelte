<script lang="ts">
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import Token from '../token/token.svelte';

  interface Props {
    emoji: string;
    tokenAddress: string;
    animateTokenOnMount?: boolean;
  }

  let { emoji, tokenAddress, animateTokenOnMount = false }: Props = $props();
</script>

<div class="illustration">
  <div class="emoji"><Emoji size="huge" {emoji} /></div>
  <div class="token-logo">
    <Token animateOnMount={animateTokenOnMount} size="huge" address={tokenAddress} show="none" />
  </div>
</div>

<style>
  .illustration {
    user-select: none;
    display: flex;
    justify-content: center;
  }

  .illustration > .token-logo {
    margin-left: -1rem;
  }
</style>
