<script lang="ts">
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import Lock from '../icons/Lock.svelte';
  import Markdown from '../markdown/markdown.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';

  interface Props {
    title?: string | undefined;
    description?: string | undefined;
    descriptionMd?: string | undefined;
    disabled?: boolean;
    privateNoticeText?: string | undefined;
    type?: 'label' | 'div';
    validationState?: { type: 'valid' } | { type: 'invalid'; message: string } | undefined;
    children?: import('svelte').Snippet;
    action?: import('svelte').Snippet;
    private_notice?: import('svelte').Snippet;
  }

  let {
    title = undefined,
    description = undefined,
    descriptionMd = undefined,
    disabled = false,
    privateNoticeText = undefined,
    type = 'label',
    validationState = undefined,
    children,
    action,
    private_notice,
  }: Props = $props();
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
        ></div>
        <AnnotationBox type="error">
          {validationState.message}
        </AnnotationBox>
      </div>
    {/if}
  {/if}
  <div class="content">{@render children?.()}</div>
  {#if description || descriptionMd}
    <div class="description" style:color="var(--color-foreground-level-6)">
      {#if description}<p style:color="var(--color-foreground-level-6)">{description}</p>{/if}
      {#if descriptionMd}
        <Markdown content={descriptionMd} />
      {/if}
    </div>
  {/if}
  {#if title}
    <div class="title">
      {title}
      <span class="slot">
        {@render action?.()}
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
              {@render private_notice?.()}
            </span>
            <Lock />
          </div>
          {#snippet tooltip_content()}
            {privateNoticeText}
          {/snippet}
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
