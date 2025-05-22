<script lang="ts">
  export let repoName: string;
  export let repoOwner: string;

  const forge = 'github';
</script>

<div class="ecosystem-distribution-project">
  <a
    target="_blank"
    href={`/app/projects/${forge}/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}?exact`}
    >{repoOwner}/<strong class="typo-text-bold">{repoName}</strong></a
  >
</div>
