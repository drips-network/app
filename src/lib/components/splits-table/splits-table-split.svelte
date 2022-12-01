<script lang="ts">
  import SplitsTableSplitLozenge from './splits-table-split-lozenge.svelte';
  import SplitsTableVerticalLine from './splits-table-vertical-line.svelte';
  import type { SplitsTableRow } from './types';

  export let split: SplitsTableRow;
  export let verticalLine = true;
</script>

<div class="splits-table-split flex items-center -mb-px">
  <!-- vector group -->
  <div class="relative h-8">
    <!-- (vertical line) -->
    {#if verticalLine}
      <SplitsTableVerticalLine classes="absolute top-0 left-0 h-full" />
    {/if}
    <!-- curved arrow -->
    <svg
      class="-mt-px"
      width="80"
      height="26"
      viewBox="0 0 80 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 1.83606C2 1.28377 1.55228 0.83606 1 0.83606C0.447715 0.83606 0 1.28377 0 1.83606H2ZM79.7071 18.5432C80.0976 18.1526 80.0976 17.5195 79.7071 17.129L73.3431 10.765C72.9526 10.3745 72.3195 10.3745 71.9289 10.765C71.5384 11.1555 71.5384 11.7887 71.9289 12.1792L77.5858 17.8361L71.9289 23.4929C71.5384 23.8834 71.5384 24.5166 71.9289 24.9071C72.3195 25.2977 72.9526 25.2977 73.3431 24.9071L79.7071 18.5432ZM17 16.8361C13.175 16.8361 10.3727 15.8827 8.3047 14.504C6.23044 13.1212 4.83511 11.2702 3.89443 9.38885C2.95178 7.50356 2.47548 5.60617 2.23639 4.17166C2.11725 3.45678 2.05806 2.86323 2.02871 2.45231C2.01405 2.24702 2.00686 2.08783 2.00335 1.98243C2.0016 1.92975 2.00076 1.89056 2.00036 1.86583C2.00016 1.85347 2.00007 1.84472 2.00003 1.83972C2.00001 1.83722 2 1.83565 2 1.83504C2 1.83473 2 1.83466 2 1.83483C2 1.83491 2 1.83522 2 1.83526C2 1.83563 2 1.83606 1 1.83606C0 1.83606 1.19209e-07 1.83661 5.96046e-07 1.83722C8.9407e-07 1.83751 1.78814e-06 1.83818 2.86102e-06 1.83875C5.126e-06 1.83989 8.9407e-06 1.84128 1.5378e-05 1.84291C2.8193e-05 1.84617 5.13196e-05 1.8504 9.25064e-05 1.85559C0.00017488 1.86597 0.000329435 1.88017 0.000618339 1.89808C0.00119603 1.9339 0.00231117 1.98456 0.00446135 2.04906C0.00876069 2.17804 0.0172047 2.36259 0.0337913 2.59481C0.0669402 3.05889 0.132753 3.71534 0.263606 4.50046C0.524521 6.06595 1.04822 8.16856 2.10557 10.2833C3.16489 12.4019 4.76957 14.551 7.1953 16.1681C9.6273 17.7894 12.825 18.8361 17 18.8361V16.8361ZM17 18.8361H79V16.8361H17V18.8361Z"
        fill="var(--color-foreground-level-3)"
      />
    </svg>
    <!-- lozenge area as overlay -->
    <div class="absolute overlay flex items-center justify-center">
      <!-- lozenge -->
      <SplitsTableSplitLozenge text={split.percent} />
    </div>
  </div>

  <!-- subject -->
  <div class="flex-1 pl-2.5">
    {#if typeof split.subject === 'string'}
      <div class="typo-text-bold" style="color: var(--color-foreground)">
        {split.subject}
      </div>
    {:else if split.subject}
      <svelte:component this={split.subject.component} {...split.subject.props} />
    {/if}
  </div>
</div>
