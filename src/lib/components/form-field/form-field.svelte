<script lang="ts">
  import { slide } from 'svelte/transition';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import Markdown from '../markdown/markdown.svelte';

  export let title: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let descriptionMd: string | undefined = undefined;
  export let disabled = false;
  export let type: 'label' | 'div' = 'label';

  export let validationState: { type: 'valid' } | { type: 'invalid'; message: string } | undefined =
    undefined;
</script>

<svelte:element this={type} class="wrapper typo-text-bold" class:disabled>
  {#if validationState}
    {#if validationState.type === 'invalid'}
      <div transition:slide={{ duration: 200 }}>
        <AnnotationBox type="error">
          {validationState.message}
        </AnnotationBox>
      </div>
    {/if}
  {/if}
  <div class="content"><slot /></div>
  <div class="description" style:color="var(--color-foreground-level-5)">
    {#if description}<p style:color="var(--color-foreground-level-5)">{description}</p>{/if}
    {#if descriptionMd}
      <Markdown content={descriptionMd} />
    {/if}
  </div>
  {#if title}
    <div class="title">
      {title}
      <span class="slot">
        <slot name="action" />
      </span>
    </div>
  {/if}
</svelte:element>

<style>
  .wrapper {
    color: var(--color-foreground);
    width: 100%;
    display: flex;
    flex-direction: column-reverse;
    gap: 0.75rem;
    width: 100%;
    align-items: flex-start;
    text-align: left;
    transition: opacity 0.3s;
  }

  .slot {
    color: var(--color-foreground-level-6);
  }

  .title {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  }

  .content {
    color: var(--color-foreground);
    font-weight: normal;
    width: 100%;
    height: 100%;
  }

  .disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  p {
    margin-top: -0.5rem;
    color: var(--color-foreground);
  }
</style>
