<script lang="ts">
  import type { Project } from '$lib/graphql/generated/graphql';

  export let showSource = true;

  export let project: Project;
</script>

<span class="text-foreground-level-5 typo-text"
  >{#if showSource}{project.source.ownerName}/{/if}<span class="text-foreground"
    >{project.source.repoName}</span
  ></span
>
