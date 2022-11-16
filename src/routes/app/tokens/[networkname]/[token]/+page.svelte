<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import { page } from '$app/stores';
  import Token from '$lib/components/token/token.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowUp from 'radicle-design-system/icons/ArrowUp.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import Minus from 'radicle-design-system/icons/Minus.svelte';
  import ArrowLeft from 'radicle-design-system/icons/ArrowLeft.svelte';

  const urlParamToken = $page.params.token.toLowerCase();

  $: token = $tokens?.find(
    (token) =>
      token.info.address.toLocaleLowerCase() === urlParamToken ||
      token.info.symbol.toLowerCase() === urlParamToken,
  );

  $: tokenAddress = token?.info.address ?? urlParamToken;
</script>

<article class="flex flex-col gap-12">
  <header>
    <div class="mb-5 flex">
      <a
        href="/app/dashboard"
        class="pl-2 py-1 pr-4 -ml-10 rounded-full flex items-center typo-header-4 text-foreground-level-5 btn-theme-transparent"
      >
        <div class="w-8 h-8 flex items-center">
          <ArrowLeft />
        </div>
        Dashboard
      </a>
    </div>
    <h1>
      <Token address={tokenAddress} show="symbol" size="huge" fontSize="typo-header-1" />
    </h1>
  </header>

  <section class="grid sm:grid-cols-2 gap-3">
    <section
      class="border-2 rounded-xl py-3 px-4"
      style="border-color:var(--color-foreground-level-1)"
    >
      <header class="flex flex-wrap justify-between">
        <h3 class="typo-text-bold">Incoming</h3>
        <div class="typo-text-mono-bold" style="color:var(--color-positive)">0.00/sec</div>
      </header>

      <!-- amount -->
      <div class="mt-6 text-right typo-header-1">0.00</div>

      <!-- actions -->
      <footer class="flex justify-end mt-3">
        <!-- <div>Collectable: XXXX</div> -->
        <div class="flex gap-3">
          <Button icon={ArrowUp}>Collect</Button>
        </div>
      </footer>
    </section>

    <section
      class="border-2 rounded-xl py-3 px-4"
      style="border-color:var(--color-foreground-level-1)"
    >
      <header class="flex flex-wrap justify-between">
        <h3 class="typo-text-bold">Outgoing</h3>
        <div class="typo-text-mono-bold" style="color:var(--color-negative)">0.00/sec</div>
      </header>

      <!-- amount -->
      <div class="mt-6 text-right typo-header-1">0.00</div>

      <!-- actions -->
      <footer class="flex justify-end mt-3">
        <div />
        <div class="flex gap-1">
          <Button icon={Plus}>Add</Button>
          <Button icon={Minus}>Withdraw</Button>
        </div>
      </footer>
    </section>
  </section>
</article>
