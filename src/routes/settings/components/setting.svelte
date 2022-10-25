<script lang="ts">
  export let title: string;
  export let subtitle: string;
</script>

<div class="setting">
  <div class="title">
    <h3>{title}</h3>
    <p>{subtitle}</p>
  </div>
  <slot />
</div>

<style>
  .setting {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .title {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  p {
    color: var(--color-foreground-level-6);
  }

  @media (max-width: 1024px) {
    .setting {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
