<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const PROJECT_NAME_FRAGMENT = gql`
    fragment ProjectName on Project {
      ... on ClaimedProject {
        source {
          ownerName
          repoName
        }
      }
      ... on UnclaimedProject {
        source {
          ownerName
          repoName
        }
      }
    }
  `;
</script>

<script lang="ts">
  import type { ProjectNameFragment } from './__generated__/gql.generated';

  export let showSource = true;

  export let project: ProjectNameFragment;
</script>

<span class="text-foreground-level-5 typo-text"
  >{#if showSource}{project.source.ownerName}/{/if}<span class="text-foreground"
    >{project.source.repoName}</span
  ></span
>
