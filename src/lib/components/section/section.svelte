<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import SectionSkeleton from '../section-skeleton/section-skeleton.svelte';

  export let header: ComponentProps<SectionHeader>;
  export let skeleton: Omit<ComponentProps<SectionSkeleton>, 'expanded'>;

  export let collapsable = false;
  export let collapsed = false;
</script>

<section class="app-section" style:margin-bottom={collapsed ? '-2rem' : 0}>
  <SectionHeader
    bind:collapsable
    bind:collapsed
    {...header}
    actionsDisabled={collapsed || header.actionsDisabled}
  />
  <div>
    <SectionSkeleton bind:collapsed {...skeleton}>
      <slot />
    </SectionSkeleton>
  </div>
</section>

<style>
  section {
    transition: margin-bottom 0.3s ease;
  }
</style>
