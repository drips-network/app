<script lang="ts">
  export let data;
</script>

<h2>drafts</h2>
{#each data.drafts ?? [] as draft}
  <a href="/app/rpgf/drafts/{draft.id}" class="draft">
    <h3>{draft.draft.name ?? 'Unnamed draft'}</h3>
  </a>
{/each}

<h2>rounds</h2>
{#each data.rounds ?? [] as round}
  <a href="/app/rpgf/rounds/{round.id}" class="draft">
    <h3>{round.name ?? 'Unnamed round'}</h3>
  </a>
{/each}
