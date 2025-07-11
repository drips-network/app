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
  export let size: 'small' | 'medium' = 'medium';

  export let project: ProjectNameFragment;

  $: sizeClass = size === 'small' ? 'typo-text-small' : 'typo-text';
</script>

<span class="text-foreground-level-5 {sizeClass}"
  >{#if showSource}{project.source.ownerName}/{/if}<span class="text-foreground"
    >{project.source.repoName}</span
  ></span
>
