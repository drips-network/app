<script lang="ts">
  export let title: string;
</script>

<label class="typo-text-bold">
  {title}
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
  }

  .content {
    color: var(--color-foreground);
    font-weight: normal;
    width: 100%;
  }
</style>
