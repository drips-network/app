<script lang="ts">
  import '../../../styles/app.css';
  import '../../../styles/embed.css';

  import '$lib/stores/theme/theme.store';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="main" data-uifont="inter">
  <main class="page">
    {@render children?.()}
  </main>
</div>
