<script lang="ts">
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import type { ApplicationMarkdownField } from '$lib/utils/rpgf/types/application';

  interface Props {
    field: ApplicationMarkdownField;
  }

  let { field }: Props = $props();
</script>

<Markdown content={field.content} />
