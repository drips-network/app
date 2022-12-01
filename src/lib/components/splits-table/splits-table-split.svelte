<script lang="ts">
  import SplitsTableSplitLozenge from './splits-table-split-lozenge.svelte';
  import SplitsTableVerticalLine from './splits-table-vertical-line.svelte';
  import type { SplitsTableRow } from './types';

  export let split: SplitsTableRow;
  export let verticalLine = true;
  export let isIncoming = false;
</script>

<div
  class="splits-table-split flex items-center -mb-px gap-2.5 {isIncoming ? 'flex-row-reverse' : ''}"
>
  <!-- vector group -->
  <div class="relative h-8 {isIncoming ? 'flex items-end justify-end' : ''}">
    <!-- (vertical line) -->
    {#if verticalLine}
      <SplitsTableVerticalLine
        classes="absolute h-full top-0 {isIncoming ? 'right-0' : 'left-0'}"
      />
    {/if}

    <!-- arrow graphic/s -->
    {#if isIncoming}
      <!-- curved line -->
      <svg
        width="79"
        height="18"
        viewBox="0 0 79 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M77 17C77 17.5523 77.4477 18 78 18C78.5523 18 79 17.5523 79 17H77ZM62 2C65.825 2 68.6273 2.95338 70.6953 4.33205C72.7696 5.71489 74.1649 7.56584 75.1056 9.44721C76.0482 11.3325 76.5245 13.2299 76.7636 14.6644C76.8828 15.3793 76.9419 15.9728 76.9713 16.3837C76.986 16.589 76.9931 16.7482 76.9966 16.8536C76.9984 16.9063 76.9992 16.9455 76.9996 16.9702C76.9998 16.9826 76.9999 16.9913 77 16.9963C77 16.9988 77 17.0004 77 17.001C77 17.0013 77 17.0014 77 17.0012C77 17.0011 77 17.0008 77 17.0008C77 17.0004 77 17 78 17C79 17 79 16.9994 79 16.9988C79 16.9986 79 16.9979 79 16.9973C79 16.9962 79 16.9948 79 16.9931C79 16.9899 78.9999 16.9857 78.9999 16.9805C78.9998 16.9701 78.9997 16.9559 78.9994 16.938C78.9988 16.9022 78.9977 16.8515 78.9955 16.787C78.9912 16.658 78.9828 16.4735 78.9662 16.2413C78.9331 15.7772 78.8672 15.1207 78.7364 14.3356C78.4755 12.7701 77.9518 10.6675 76.8944 8.55279C75.8351 6.43416 74.2304 4.28511 71.8047 2.66795C69.3727 1.04662 66.175 0 62 0V2ZM62 0H0V2H62V0Z"
          fill="var(--color-foreground-level-3)"
        />
      </svg>
    {:else}
      <!-- curved arrow rightward -->
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
    {/if}

    <!-- lozenge area as overlay -->
    <div class="absolute overlay flex items-center justify-center {isIncoming ? 'pr-1' : 'pr-2px'}">
      <!-- lozenge centered-->
      <SplitsTableSplitLozenge text={split.percent} />
    </div>
  </div>

  <!-- subject -->
  <div class="flex-1 flex" class:justify-end={isIncoming}>
    {#if typeof split.subject === 'string'}
      <div class="typo-text-bold" style="color: var(--color-foreground)">
        {split.subject}
      </div>
    {:else if split.subject}
      <svelte:component this={split.subject.component} {...split.subject.props} />
    {/if}
  </div>
</div>
