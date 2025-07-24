<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const PROJECT_NAME_FRAGMENT = gql`
    fragment ProjectName on Project {
      source {
        ownerName
        repoName
      }
    }
  `;
</script>

<script lang="ts">
  import type { ProjectNameFragment } from './__generated__/gql.generated';

  export let showSource = true;
  export let pixelated = false;
  export let tiny = false;

  export let project: ProjectNameFragment;

  $: pixelatedClasses = pixelated ? 'pixelated' : '';
  $: textClasses = tiny ? 'typo-text-small' : '';
</script>

<span class="text-foreground-level-5 {textClasses} {pixelatedClasses}"
  >{#if showSource}{project.source.ownerName}/{/if}<span class="text-foreground"
    >{project.source.repoName}</span
  ></span
>
