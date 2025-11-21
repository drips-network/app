<script lang="ts" module>
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

  interface Props {
    showSource?: boolean;
    pixelated?: boolean;
    tiny?: boolean;
    project: ProjectNameFragment;
  }

  let { showSource = true, pixelated = false, tiny = false, project }: Props = $props();

  let pixelatedClasses = $derived(pixelated ? 'pixelated' : '');
  let textClasses = $derived(tiny ? 'typo-text-small' : '');
</script>

<span class="text-foreground-level-5 {textClasses} {pixelatedClasses} line-clamp-1"
  >{#if showSource}{project.source.ownerName}/{/if}<span class="text-foreground"
    >{project.source.repoName}</span
  ></span
>
