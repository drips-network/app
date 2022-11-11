<script lang="ts">
  export let title: string;
  export let description: string | undefined = undefined;
</script>

<label class="typo-text-bold">
  {title}
  {#if description}<p>{description}</p>{/if}
  <div class="content"><slot /></div>
</label>

<style>
  label {
    color: var(--color-foreground-level-5);
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    align-items: flex-start;
    text-align: left;
  }

  .content {
    color: var(--color-foreground);
    font-weight: normal;
    width: 100%;
    height: 100%;
  }

  p {
    margin-top: -0.5rem;
    color: var(--color-foreground-level-5);
  }
</style>
