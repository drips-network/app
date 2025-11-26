<script lang="ts">
  import ExpandableText from '$lib/components/expandable-text/expandable-text.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';

  let { data } = $props();

  let issue = $derived(data.issue);
</script>

<div
  style:view-transition-name={`issue-${issue.id}`}
  style:view-transition-class="element-handover"
  style:height="100%"
>
  <Card>
    <div class="issue">
      <div class="details">
        <h1>
          <span style:color="var(--color-foreground-level-5)">#{issue.gitHubIssueNumber}</span>
          {issue.title}
        </h1>

        <RepoBadge repo={issue.repo} />
      </div>

      {#if issue.body}
        <ExpandableText>
          <Markdown content={issue.body} />
        </ExpandableText>
      {:else}
        <p style:color="var(--color-foreground-level-4)">No description provided.</p>
      {/if}
    </div>
  </Card>
</div>

<style>
  .issue {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
