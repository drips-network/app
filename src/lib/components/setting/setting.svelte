<script lang="ts">
  interface Props {
    title: string;
    subtitle: string;
    disabled?: boolean;
    children?: import('svelte').Snippet;
  }

  let { title, subtitle, disabled = false, children }: Props = $props();
</script>

<div class="setting" class:disabled>
  <div class="title">
    <h4>{title}</h4>
    <p>{subtitle}</p>
  </div>
  {@render children?.()}
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
    max-width: 40rem;
    color: var(--color-foreground-level-5);
  }

  @media (max-width: 1024px) {
    .setting {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .setting.disabled .title {
    transition: color 0.3s;
  }

  .setting.disabled .title {
    color: color-mix(in srgb, currentColor 50%, transparent);
  }
</style>
