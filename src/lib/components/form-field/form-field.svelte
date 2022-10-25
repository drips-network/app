<script lang="ts">
  export let title: string;
</script>

<div class="form-field">
  <label class="typo-text-bold" for="control">{title}</label>
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
  }

  #control {
    width: 100%;
    height: 100%;
  }

  label {
    color: var(--color-foreground-level-5);
  }
</style>
