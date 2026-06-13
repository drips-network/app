<script lang="ts">
  interface Props {
    address?: string;
  }

  let { address }: Props = $props();
</script>

<span data-testid="identity-badge-stub">{address}</span>
