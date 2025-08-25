<script lang="ts">
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import type { ApplicationMarkdownField } from '$lib/utils/rpgf/schemas';

  export let field: ApplicationMarkdownField;
</script>

<Markdown content={field.content} />
