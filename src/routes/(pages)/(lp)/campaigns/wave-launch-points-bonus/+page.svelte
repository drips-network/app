<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import z from 'zod';
  import IllustrationBottom from './components/illustration-bottom.svelte';
  import IllustrationTop from './components/illustration-top.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';

  let emailValue = $state('');
  let githubHandleValue = $state('');
  let discordHandleValue = $state('');
  let marketingConsentValue = $state(false);

  let valid = $derived(
    z.string().email().safeParse(emailValue).success &&
      githubHandleValue.trim().length > 0 &&
      discordHandleValue.trim().length > 0,
  );

  let success = $state(false);
  let submitting = $state(false);
  let error = $state(false);

  async function handleSubmit() {
    if (!valid) return;

    submitting = true;

    try {
      const response = await fetch('/campaigns/wave-launch-points-bonus/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailValue,
          gitHubUsername: githubHandleValue,
          discordUsername: discordHandleValue,
          marketingConsent: marketingConsentValue,
        }),
      });
      if (!response.ok) {
        submitting = false;
        error = true;
        return;
      }

      success = true;
      submitting = false;
    } catch {
      submitting = false;
      error = true;
    }
  }
</script>

<HeadMeta
  title="Kick off your Wave with a boost"
  description="Join the Drips Discord, submit the form before January 11th, 2025, and receive 100 Points after you participate in the first Wave early next year."
/>

<div class="page">
  <div class="wrapper">
    <div class="form-container">
      <h1 class="pixelated">Kick off your Wave with a boost</h1>

      <div class="info-text">
        <p style:margin-bottom="1rem">
          Join the <a class="typo-link" href="https://discord.gg/t8XBXZAEs5">Drips Discord</a>,
          submit the form before January 11th, 2025, and receive
          <span class="highlight">100 Points</span> after you participate in the first Wave early next
          year.
        </p>
        <p class="typo-text-small" style:color="var(--color-foreground-level-5)">
          Points increase your share of the reward pool at the end of the Wave Cycle. The more
          points you collect by resolving issues, the higher your share of the reward pool will be.
          To be eligible for rewards, you'll need to <span class="typo-text-small-bold"
            >resolve at least one issue during the first Wave Cycle</span
          >
          using the GitHub account you submitted in the form, complete
          <span class="typo-text-small-bold">identity verification</span>, and
          <span class="typo-text-small-bold">provide a valid Stellar address for payout</span>.
        </p>
      </div>

      {#if success}
        <CheckCircle
          style="fill: var(--color-positive); width: 4rem; height: 4rem; margin: 2rem auto;"
        />
        <p class="typo-text" style="text-align: center; margin-bottom: 1rem;">
          Thank you! We'll be in touch when it's time for the first Wave.
        </p>
      {:else if error}
        <p
          class="typo-text"
          style="text-align: center; color: var(--color-negative); margin-bottom: 1rem;"
        >
          Something went wrong while submitting the form. Please try again later.
        </p>

        <div>
          <Button onclick={() => (error = false)}>Try again</Button>
        </div>
      {:else}
        <FormField title="Email Address*">
          <TextInput bind:value={emailValue} placeholder="peter-pan@acme.org" />
        </FormField>

        <FormField title="GitHub Handle*">
          <TextInput bind:value={githubHandleValue} placeholder="peter-pan" />
        </FormField>

        <FormField title="Discord Handle*">
          <TextInput bind:value={discordHandleValue} placeholder="peter-pan#1234" />
        </FormField>

        <Checkbox
          bind:checked={marketingConsentValue}
          label="I agree to receive occasional marketing emails from Drips."
        />

        <div class="action">
          <Button
            variant="primary"
            onclick={handleSubmit}
            disabled={!valid || submitting}
            loading={submitting}
            icon={CheckCircle}
            size="large"
          >
            Submit
          </Button>
        </div>

        <p class="typo-text-small" style="color: var(--color-foreground-level-5);">
          By submitting the form, you agree to the <a
            class="typo-link"
            href="https://drips.network/legal/privacy">Drips Privacy Policy</a
          >. If you opt-in to marketing communications, you agree that your email address is stored
          on <a class="typo-link" href="https://www.intercom.com/legal/privacy">Intercom</a> in the EU
          for the purpose of sending updates about Drips. Marketing consent can be withdrawn anytime.
        </p>
      {/if}

      <div class="illustration-top">
        <IllustrationTop />
      </div>

      <div class="illustration-bottom">
        <IllustrationBottom />
      </div>
    </div>

    <section class="what-is-wave">
      <h3>What is Drips Wave?</h3>
      <p class="typo-text">
        Drips Wave enables Open Source ecosystems to run recurring, one-week contribution sprints.
        Contributors earn Points for resolving issues, and receive rewards based on their share of
        the total Points at the end of each Wave Cycle.
      </p>
      <Button href="/solutions/wave" variant="primary">Read all about it</Button>
    </section>
  </div>

  <section class="how-to-get-points">
    <h3>How to get the points</h3>

    <div class="steps">
      <div class="step">
        <CheckCircle style="fill: var(--color-positive)" />
        <span class="typo-text">Join the Drips Discord and submit the form.</span>
      </div>

      <Divider />

      <div class="step">
        <CheckCircle style="fill: var(--color-positive)" />
        <span class="typo-text">
          Contribute by successfully resolving an issue in the first Wave Cycle, using the GitHub
          account you submitted in the form.
        </span>
      </div>

      <Divider />

      <div class="step">
        <CheckCircle style="fill: var(--color-positive)" />
        <span class="typo-text">
          You’ll receive an extra 100 Points before rewards for the first Wave Cycle are calculated
          and distributed.
        </span>
      </div>
    </div>
  </section>
</div>

<style>
  .page {
    max-width: calc(100vw + 2rem);
    width: 100vw;
    margin: 0 -1rem;
    padding: 1rem;
    padding-top: 13rem;
    overflow: hidden;
  }

  .wrapper {
    max-width: 47rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 5rem;
  }

  .illustration-top {
    position: absolute;
    top: -140px;
    width: 1000px;
    left: -430px;
    pointer-events: none;
  }

  .illustration-bottom {
    position: absolute;
    bottom: -150px;
    width: 1000px;
    right: -500px;
    pointer-events: none;
  }

  .form-container {
    position: relative;
    max-width: 50rem;
    text-align: center;
    padding: min(4rem, 6vw);
    background-color: var(--color-background);
    border-radius: 2rem 0 2rem 2rem;
    box-shadow: var(--elevation-low);
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  h1 {
    font-size: min(4rem, 10vw);
    line-height: 1.2;
    color: var(--color-foreground);
  }

  .highlight {
    font-weight: 700;
    color: var(--color-foreground);
  }

  .what-is-wave {
    max-width: 624px;
    margin: 0 auto;
    margin-top: 4rem;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  .how-to-get-points {
    width: 100%;
    margin: 4rem auto;
    margin-top: 6rem;
    width: fit-content;
    display: flex;
    gap: 3rem;
    flex-wrap: wrap;
  }

  .how-to-get-points h3 {
    flex-shrink: 0;
  }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 60rem;
    width: 100%;
  }

  .step {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }
</style>
