<script lang="ts">
  export let title: string;
</script>

<section
  class="token-stat border-2 rounded-xl pt-3 px-4 pb-4"
  style="border-color:var(--color-foreground-level-1)"
>
  <header class="flex flex-wrap justify-between items-end">
    <h3 class="typo-text-bold">{title}</h3>
    <div>
      <slot name="detail" />
    </div>
  </header>

  <!-- amount -->
  <div class="mt-6 text-right typo-header-1">
    <slot name="value" />
  </div>

  <!-- actions -->
  <footer class="flex justify-end mt-3 -mr-1">
    <slot name="actions" />
  </footer>
</section>
