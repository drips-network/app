<script lang="ts">
  export let size: 'small' | 'normal' = 'normal';
</script>

<div class="coming-soon-badge typo-text-bold {size}">Coming soon</div>

<style>
  .coming-soon-badge {
    background-color: var(--color-primary-level-2);
    color: var(--color-primary-level-6);
    padding: 0.25rem 1rem;
    height: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 2rem 0 2rem 2rem;
    width: fit-content;
  }

  .coming-soon-badge.small {
    padding: 0.1rem 0.5rem;
    height: 1.75rem;
  }
</style>
