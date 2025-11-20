<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const ORCID_NAME_FRAGMENT = gql`
    fragment OrcidName on OrcidLinkedIdentity {
      orcid
      orcidMetadata {
        givenName
        familyName
      }
    }
  `;
</script>

<script lang="ts">
  import type { OrcidNameFragment } from './__generated__/gql.generated';
  import getOrcidDisplayName from '$lib/utils/orcids/display-name';

  export let pixelated = false;
  export let tiny = false;

  export let orcid: OrcidNameFragment;

  const displayName = getOrcidDisplayName(orcid);

  $: pixelatedClasses = pixelated ? 'pixelated' : '';
  $: textClasses = tiny ? 'typo-text-small' : '';
</script>

<span class="text-foreground-level-5 {textClasses} {pixelatedClasses} line-clamp-1"
  ><span class="text-foreground">{displayName}</span></span
>
