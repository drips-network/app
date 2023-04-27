<script lang="ts">
  import Emoji from '$lib/components/emoji/emoji.svelte';

  export let emoji: string;
</script>

<div class="standalone-flow-header-icon">
  <Emoji {emoji} size="massive" />
</div>

<style>
  .standalone-flow-header-icon {
    height: 8rem;
    width: 8rem;
    background-color: var(--color-background);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    box-shadow: var(--elevation-low);
  }
</style>
