<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  interface Props {
    style?: string | undefined;
  }

  let { style = undefined }: Props = $props();
</script>

<IconWrapper {style}>
  <rect x="4" y="14" width="4" height="6" rx="1" />
  <rect x="10" y="10" width="4" height="10" rx="1" />
  <rect x="16" y="5" width="4" height="15" rx="1" />
</IconWrapper>
