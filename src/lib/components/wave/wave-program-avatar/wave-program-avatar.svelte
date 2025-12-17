<script lang="ts">
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import type { WaveProgramDto } from '$lib/utils/wave/types/waveProgram';
  import type { ComponentProps } from 'svelte';

  let {
    waveProgram,
    size,
  }: {
    waveProgram: WaveProgramDto;
    size?: ComponentProps<typeof UserAvatar>['size'];
  } = $props();
</script>

<!-- TODO(wave): Proper placeholder -->
<UserAvatar src={waveProgram.avatarUrl} placeholderSrc="https://placehold.co/128" {size} />
