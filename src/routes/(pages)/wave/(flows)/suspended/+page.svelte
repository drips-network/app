<script lang="ts">
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
</script>

<LargeEmptyState
  emoji="🚫"
  headline="Your Wave account has been suspended"
  description="Please contact support at support@drips.network for more information."
  button={{
    label: 'Go to drips.network',
    handler: () => {
      window.location.href = '/';
    },
  }}
/>
