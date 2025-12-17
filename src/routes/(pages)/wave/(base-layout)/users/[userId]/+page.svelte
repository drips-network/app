<script lang="ts">
  import Heart from '$lib/components/icons/Heart.svelte';
  import Issue from '$lib/components/icons/Issue.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import FastAndEasy from '$lib/components/wave/compliment-illustrations/fast-and-easy.svelte';
  import GoodCommunicator from '$lib/components/wave/compliment-illustrations/good-communicator.svelte';
  import HighQualityCode from '$lib/components/wave/compliment-illustrations/high-quality-code.svelte';
  import ProblemSolver from '$lib/components/wave/compliment-illustrations/problem-solver.svelte';
  import GithubUserBadge from '$lib/components/wave/github-user-badge/github-user-badge.svelte';

  let { data } = $props();
  let { profileUserData, pointsBalance } = $derived(data);
  let { gitHubUsername } = $derived(profileUserData);

  const COMPLIMENTS = [
    {
      illustration: GoodCommunicator,
      title: 'Good Communicator',
      count: 5,
    },
    {
      illustration: HighQualityCode,
      title: 'High Quality Code',
      count: 3,
    },
    {
      illustration: FastAndEasy,
      title: 'Fast and Easy',
      count: 3,
    },
    {
      illustration: ProblemSolver,
      title: 'Problem Solver',
      count: 3,
    },
  ];
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

  <div class="content">
    <section>
      <SectionHeader label="Compliments" icon={Heart} />

      <div class="compliments-list">
        {#each COMPLIMENTS as compliment (compliment.title)}
          <Card
            style="background-color: var(--color-primary-level-1); color: var(--color-primary-level-6);"
          >
            <div class="compliment-card">
              <div class="illustration">
                <compliment.illustration />
              </div>
              <h3 class="typo-text-bold">{compliment.title}</h3>
              <div class="compliment-count">
                <p class="typo-text-bold">{compliment.count}x</p>
              </div>
            </div>
          </Card>
        {/each}
      </div>
    </section>

    <section>
      <SectionHeader label="Resolved issues" icon={Issue} />
    </section>
  </div>
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
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .points {
    text-align: center;
  }

  .points p {
    font-size: 3rem;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .compliments-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
  }

  .compliment-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .compliment-card .illustration {
    width: 100%;
    max-height: 150px;
    max-width: 150px;
    height: 100%;
    padding: 1rem;
  }

  .compliment-count {
    background-color: var(--color-primary-level-2);
    height: 2rem;
    padding: 0 1rem;
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
