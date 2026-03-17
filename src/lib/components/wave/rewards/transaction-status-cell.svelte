<script lang="ts">
  import StatusBadge from '$lib/components/status-badge/status-badge.svelte';
  import type { GrantTransactionStatus } from '$lib/utils/wave/types/grant';

  let { status }: { status: GrantTransactionStatus } = $props();

  const statusColors: Record<
    GrantTransactionStatus,
    'positive' | 'caution' | 'foreground' | 'negative'
  > = {
    pending: 'caution',
    complete: 'positive',
    cancelled: 'negative',
  };

  const statusLabels: Record<GrantTransactionStatus, string> = {
    pending: 'Pending',
    complete: 'Complete',
    cancelled: 'Cancelled',
  };
</script>

<StatusBadge size="small" color={statusColors[status]}>{statusLabels[status]}</StatusBadge>
