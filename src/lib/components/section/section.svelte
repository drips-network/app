<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import SectionSkeleton from '../section-skeleton/section-skeleton.svelte';

  interface Props {
    header?: ComponentProps<typeof SectionHeader> | undefined;
    skeleton: Omit<ComponentProps<typeof SectionSkeleton>, 'expanded'>;
    collapsable?: boolean;
    collapsed?: boolean;
    /** Bind to this to get the section skeleton instance of this section. */
    skeletonInstance?: SectionSkeleton | undefined;
    children?: import('svelte').Snippet;
  }

  let {
    header = undefined,
    skeleton,
    collapsable = $bindable(false),
    collapsed = $bindable(false),
    skeletonInstance = $bindable(undefined),
    children
  }: Props = $props();
</script>

<section class="app-section" style:margin-bottom={collapsed ? '-2rem' : 0}>
  {#if header}
    <SectionHeader
      bind:collapsable
      bind:collapsed
      {...header}
      actionsDisabled={collapsed || header.actionsDisabled}
    ></SectionHeader>
  {/if}
  <div>
    <SectionSkeleton bind:this={skeletonInstance} bind:collapsed {...skeleton}>
      {@render children?.()}
    </SectionSkeleton>
  </div>
</section>

<style>
  section {
    transition: margin-bottom 0.3s ease;
  }
</style>
