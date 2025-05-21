<script lang="ts">
  export let repoName: string;
  export let repoOwner: string;
</script>

<div class="ecosystem-distribution-project">
  <a target="_blank" href={`/app/projects/github/${repoOwner}/${repoName}?exact`}
    >{repoOwner}/<strong class="typo-text-bold">{repoName}</strong></a
  >
</div>
