<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const ORCID_NAME_FRAGMENT = gql`
    fragment OrcidName on OrcidLinkedIdentity {
      orcid
    }
  `;
</script>

<script lang="ts">
  import type { OrcidNameFragment } from './__generated__/gql.generated';

  export let pixelated = false;
  export let tiny = false;

  export let orcid: OrcidNameFragment;

  $: pixelatedClasses = pixelated ? 'pixelated' : '';
  $: textClasses = tiny ? 'typo-text-small' : '';
</script>

<span class="text-foreground-level-5 {textClasses} {pixelatedClasses} line-clamp-1"
  ><span class="text-foreground"
    >{orcid.orcid}</span
  ></span
>
