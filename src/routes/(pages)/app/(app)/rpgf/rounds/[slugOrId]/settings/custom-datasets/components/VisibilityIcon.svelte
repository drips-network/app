<script lang="ts">
  import EyeClosed from '$lib/components/icons/EyeClosed.svelte';
  import EyeOpen from '$lib/components/icons/EyeOpen.svelte';

  interface Props {
    visible: boolean;
  }

  let { visible }: Props = $props();
</script>

{#if visible}
  <EyeOpen style="fill: var(--color-positive)" />
{:else}
  <EyeClosed />
{/if}
