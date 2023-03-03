<script lang="ts">
  export let title: string;
  export let description: string | undefined = undefined;
  export let disabled = false;
</script>

<label class="typo-text-bold" class:disabled>
  <div class="content"><slot /></div>
  {#if description}<p>{description}</p>{/if}
  <div class="title">
    {title}
    <span class="slot">
      <slot name="toggle" />
    </span>
  </div>
</label>

<style>
  label {
    color: var(--color-foreground);
    width: 100%;
    display: flex;
    flex-direction: column-reverse;
    gap: 0.75rem;
    width: 100%;
    align-items: flex-start;
    text-align: left;
  }

  .slot {
    color: var(--color-foreground-level-6);
  }

  .title {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .disabled .title {
    color: var(--color-foreground-level-5);
  }

  .content {
    color: var(--color-foreground);
    font-weight: normal;
    width: 100%;
    height: 100%;
  }

  p {
    margin-top: -0.5rem;
    color: var(--color-foreground);
  }
</style>
