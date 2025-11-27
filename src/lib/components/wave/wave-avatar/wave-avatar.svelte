<script lang="ts">
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import type { WaveDto } from '$lib/utils/wave/types/wave';
  import type { ComponentProps } from 'svelte';

  let {
    wave,
    size,
  }: {
    wave: WaveDto;
    size?: ComponentProps<typeof UserAvatar>['size'];
  } = $props();
</script>

<!-- TODO(wave): Proper placeholder -->
<UserAvatar src={wave.avatarUrl} placeholderSrc="https://placehold.co/128" {size} />
