<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  interface Props {
    style?: string | undefined;
  }

  let { style = undefined }: Props = $props();
</script>

<IconWrapper {style}>
  <rect x="5" y="5" width="6" height="6" rx="1" />
  <rect x="13" y="5" width="6" height="6" rx="1" />
  <rect x="5" y="13" width="6" height="6" rx="1" />
  <rect x="13" y="13" width="6" height="6" rx="1" />
</IconWrapper>
