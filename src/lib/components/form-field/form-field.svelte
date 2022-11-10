<script lang="ts">
  export let title: string;
  export let description: string | undefined = undefined;
</script>

<div class="form-field">
  <label class="typo-text-bold" for="control"><h4>{title}</h4></label>
  {#if description}<p>{description}</p>{/if}
  <div id="control">
    <slot />
  </div>
</div>

<style>
  .form-field {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    align-items: flex-start;
    text-align: left;
  }

  #control {
    width: 100%;
    height: 100%;
  }

  h4 {
    color: var(--color-foreground-level-6);
  }

  p {
    margin-top: -0.5rem;
    color: var(--color-foreground-level-5);
  }
</style>
