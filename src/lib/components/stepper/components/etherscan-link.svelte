<script lang="ts">
  export let url: string | undefined = undefined;
</script>

{#if url}
  • <a href={url} target="_blank" rel="noopener noreferrer"> View on Etherscan </a>
{/if}

<style>
  a {
    text-decoration: underline;
  }
</style>
