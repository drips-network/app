<script lang="ts">
  import StatusBadge from '$lib/components/status-badge/status-badge.svelte';
  import type { GrantStatus } from '$lib/utils/wave/types/grant';

  interface Props {
    status: GrantStatus;
    expired?: boolean;
    size?: 'small' | 'normal' | 'large';
  }

  let { status, expired = false, size = 'normal' }: Props = $props();

  const statusConfig: Record<
    GrantStatus | 'expired',
    { label: string; color: 'positive' | 'caution' | 'primary' | 'foreground' | 'negative' }
  > = {
    withdrawable: { label: 'Withdrawable', color: 'positive' },
    test_transaction_requested: { label: 'Test requested', color: 'caution' },
    test_transaction_sent: { label: 'Test sent', color: 'primary' },
    withdrawal_pending: { label: 'Withdrawal pending', color: 'caution' },
    withdrawal_complete: { label: 'Complete', color: 'positive' },
    expired: { label: 'Expired', color: 'negative' },
  };

  let config = $derived(expired ? statusConfig.expired : statusConfig[status]);
</script>

<StatusBadge {size} color={config.color}>{config.label}</StatusBadge>
