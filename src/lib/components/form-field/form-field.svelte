<script lang="ts">
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import Lock from '../icons/Lock.svelte';
  import Markdown from '../markdown/markdown.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';

  export let title: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let descriptionMd: string | undefined = undefined;
  export let disabled = false;
  export let privateNoticeText: string | undefined = undefined;
  export let type: 'label' | 'div' = 'label';

  export let validationState: { type: 'valid' } | { type: 'invalid'; message: string } | undefined =
    undefined;
</script>

<svelte:element this={type} class="wrapper typo-text-bold" class:disabled>
  {#if validationState}
    {#if validationState.type === 'invalid'}
      <div style:position="relative">
        <div
          id="form-field-validation-error-anchor"
          style:visibility="hidden"
          style:position="absolute"
          style:top="-230px"
        />
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
      {#if privateNoticeText}
        <Tooltip>
          <div
            style:border-radius="1rem"
            style:cursor="help"
            style:padding="0.1rem"
            style:background-color="var(--color-foreground-level-1)"
          >
            <span class="slot">
              <slot name="private-notice" />
            </span>
            <Lock />
          </div>
          <svelte:fragment slot="tooltip-content">
            {privateNoticeText}
          </svelte:fragment>
        </Tooltip>
      {/if}
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
