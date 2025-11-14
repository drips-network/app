<script lang="ts">
  interface Props {
    explorerName: string;
    url?: string | undefined;
  }

  let { explorerName, url = undefined }: Props = $props();
</script>

{#if url}
  • <a href={url} target="_blank" rel="noopener noreferrer"> View on {explorerName} </a>
{/if}

<style>
  a {
    text-decoration: underline;
  }
</style>
