<script lang="ts">
  import type { WaveDto } from '$lib/utils/wave/types/wave';
  import WaveAvatar from '../wave-avatar/wave-avatar.svelte';

  let {
    wave,
    size,
    hideName,
  }: {
    wave: WaveDto;
    size?: 'normal' | 'small';
    hideName?: boolean;
  } = $props();
</script>

<div class="wave-badge">
  <WaveAvatar {wave} />
  {#if !hideName}
    <span class="line-clamp-1 {size === 'small' ? 'typo-text-small' : 'typo-text'}"
      >{wave.name}</span
    >
  {/if}
</div>

<style>
  .wave-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
</style>
