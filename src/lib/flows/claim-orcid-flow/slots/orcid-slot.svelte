<script lang="ts">
  import type { OrcidBadgeFragment } from '../../../../routes/(pages)/app/(app)/orcids/[orcidId]/components/__generated__/gql.generated';
  import OrcidBadge from '../../../../routes/(pages)/app/(app)/orcids/[orcidId]/components/orcid-badge.svelte';

  export let orcid: OrcidBadgeFragment;
</script>

<OrcidBadge linkToNewTab {orcid} />
