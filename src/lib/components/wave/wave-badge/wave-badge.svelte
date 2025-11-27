<script lang="ts">
  import type { WaveDto } from '$lib/utils/wave/types/wave';
  import WaveAvatar from '../wave-avatar/wave-avatar.svelte';

  let {
    wave,
    size,
  }: {
    wave: WaveDto;
    size?: 'normal' | 'small';
  } = $props();
</script>

<div class="wave-badge">
  <WaveAvatar {wave} />
  <span class="line-clamp-1 {size === 'small' ? 'typo-text-small' : 'typo-text'}">{wave.name}</span>
</div>

<style>
  .wave-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
</style>
