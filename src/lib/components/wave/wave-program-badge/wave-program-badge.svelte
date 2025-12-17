<script lang="ts">
  import type { WaveProgramDto } from '$lib/utils/wave/types/waveProgram';
  import WaveAvatar from '../wave-program-avatar/wave-program-avatar.svelte';

  let {
    waveProgram,
    size,
    hideName,
  }: {
    waveProgram: WaveProgramDto;
    size?: 'normal' | 'small';
    hideName?: boolean;
  } = $props();
</script>

<div class="wave-badge">
  <WaveAvatar {waveProgram} />
  {#if !hideName}
    <span class="line-clamp-1 {size === 'small' ? 'typo-text-small' : 'typo-text'}"
      >{waveProgram.name}</span
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
