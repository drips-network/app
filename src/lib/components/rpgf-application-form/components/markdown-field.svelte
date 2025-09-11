<script lang="ts">
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import type { ApplicationMarkdownField } from '$lib/utils/rpgf/types/application';

  export let field: ApplicationMarkdownField;
</script>

<Markdown content={field.content} />
