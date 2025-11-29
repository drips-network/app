<script lang="ts">
  import Card from '$lib/components/wave/card/card.svelte';
  import GithubUserBadge from '$lib/components/wave/github-user-badge/github-user-badge.svelte';
  import type { IssueApplicationWithDetailsDto } from '$lib/utils/wave/types/issue-application';

  let {
    application,
  }: {
    application: IssueApplicationWithDetailsDto;
  } = $props();
</script>

<Card>
  <div class="issue-application-card">
    <GithubUserBadge link={false} user={application.applicant} />
    <!-- TODO(wave): Applicant metrics -->
    <p class="line-clamp-3">
      {application.applicationText}
    </p>
  </div>
</Card>

<style>
  .issue-application-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  p {
    color: var(--color-foreground-level-6);
  }
</style>
