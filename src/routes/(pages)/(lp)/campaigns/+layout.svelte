<script lang="ts">
  import LpFooter from '../components/lp-footer.svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="wrapper">
  <div class="content">
    {@render children?.()}
    <div class="footer">
      <LpFooter />
    </div>
  </div>
</div>

<style>
  .wrapper {
    background-color: var(--color-foreground-level-1);
    padding-bottom: 2rem;
    width: 100vw;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .content {
    position: relative;
    width: 100%;
    max-width: calc(1373px + 1rem);
    padding-top: 2rem;
    padding-left: 1rem;
    padding-right: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rem;
  }

  .footer {
    width: 100%;
    max-width: calc(1300px);
  }

  @media (max-width: 882px) {
    .content {
      gap: 1rem;
    }
  }
</style>
