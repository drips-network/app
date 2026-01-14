<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import FlowStepWrapper from '../shared/flow-step-wrapper.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import User from '$lib/components/icons/User.svelte';

  let { data } = $props();
</script>

<HeadMeta title="Welcome to Drips Wave" />

<FlowStepWrapper headline="You're signed in with GitHub" description="Welcome to Drips Wave!">
  <div class="boxes">
    <Card>
      <div class="next-steps">
        <div class="option">
          <div class="icon">
            <User style="fill: var(--color-primary)" />
          </div>

          <p>Verify your identity to be eligible for rewards.</p>
          <Button href="/wave/settings/identity-and-payments">Identity settings</Button>
        </div>

        <div class="option">
          <div class="icon">
            <Ledger style="fill: var(--color-primary)" />
          </div>

          <p>Discover current Waves and apply to work on issues.</p>
          <Button href="/wave">View waves</Button>
        </div>

        <div class="option">
          <div class="icon">
            <InfoCircle style="fill: var(--color-primary)" />
          </div>

          <p>Read the docs to learn how to use the platform.</p>
          <Button href="https://docs.drips.network/wave" target="_blank">Open docs</Button>
        </div>
      </div>
    </Card>

    <Card style="background-color: var(--color-foreground-level-1); padding: 2rem 1rem">
      <div class="maintainer-entrypoint">
        <h3>Are you an open-source maintainer?</h3>

        <p>Install the Drips Wave GitHub App to sync your repos and apply them to a Wave.</p>

        <Button icon={ArrowRight} href="/wave/maintainer-onboarding/install-app">
          Apply repos to a Wave
        </Button>
      </div>
    </Card>

    <Card style="background-color: var(--color-foreground-level-1); padding: 2rem 1rem">
      <div class="maintainer-entrypoint">
        <h3>Subscribe to the Drips Wave newsletter</h3>

        <p>Stay updated with the latest news and updates from Drips Wave, and never miss a Wave.</p>

        <Button icon={ArrowRight} href="/wave/newsletter">Newsletter signup</Button>
      </div>
    </Card>
  </div>

  <p class="typo-text-small" style:color="var(--color-foreground-level-6)">
    By using Drips Wave, you agree to the <a
      class="typo-link"
      target="_blank"
      href="https://docs.drips.network/wave/terms-and-rules">Terms of Service</a
    >
    and <a class="typo-link" target="_blank" href="/legal/privacy">Privacy Policy</a>.
  </p>

  {#snippet actions()}
    <Button icon={ArrowRight} href={data.backTo}>Continue</Button>
  {/snippet}
</FlowStepWrapper>

<style>
  .next-steps {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .boxes {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .option {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 12rem;
    gap: 1rem;
    flex: 1;
    text-align: center;
  }

  p {
    margin-bottom: auto;
  }

  .maintainer-entrypoint {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    text-align: center;
  }
</style>
