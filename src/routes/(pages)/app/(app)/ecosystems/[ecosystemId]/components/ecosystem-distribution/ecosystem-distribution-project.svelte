<script lang="ts">
  interface Props {
    repoName: string;
    repoOwner: string;
  }

  let { repoName, repoOwner }: Props = $props();

  const forge = 'github';
</script>

<div class="ecosystem-distribution-project">
  <a
    target="_blank"
    href={`/app/projects/${forge}/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}?exact`}
    >{repoOwner}/<strong class="typo-text-bold">{repoName}</strong></a
  >
</div>
