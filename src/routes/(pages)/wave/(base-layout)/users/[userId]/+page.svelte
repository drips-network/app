<script lang="ts">
  import Card from '$lib/components/wave/card/card.svelte';
  import GithubUserBadge from '$lib/components/wave/github-user-badge/github-user-badge.svelte';

  let { data } = $props();
  let { profileUserData, pointsBalance } = $derived(data);
  let { gitHubUsername } = $derived(profileUserData);
</script>

<!-- todo(wave): everything -->
<div class="page">
  <div class="profile-info">
    <Card>
      <div class="profile-info-inner">
        <div class="avatar-and-name">
          <GithubUserBadge user={profileUserData} size={128} hideName link={false} />
          <h1>{gitHubUsername}</h1>
        </div>

        <Card
          style="background-color: var(--color-caution-level-1); color: var(--color-caution-level-6); width: 100%;"
        >
          <div class="points">
            <p class="typo-header-1">{pointsBalance.totalPoints}</p>
            <h5>Points</h5>
          </div>
        </Card>
      </div>
    </Card>
  </div>

  <div class="content"></div>
</div>

<style>
  .page {
    max-width: 90rem;
    width: 100%;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 3fr;
    grid-template-areas: 'profile-info content';
    gap: 2rem;
  }

  .profile-info {
    grid-area: profile-info;
  }

  .profile-info-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .profile-info h1 {
    font-size: 1.75rem;
  }

  .avatar-and-name {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .content {
    grid-area: content;
  }

  .points {
    text-align: center;
  }

  .points p {
    font-size: 3rem;
  }
</style>
