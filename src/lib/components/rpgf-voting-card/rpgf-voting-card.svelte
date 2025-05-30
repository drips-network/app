<script lang="ts">
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
import type { Application, Ballot, InProgressBallot } from '$lib/utils/rpgf/schemas';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import Button from '../button/button.svelte';
  import Divider from '../divider/divider.svelte';
  import ArrowBoxUpRight from '../icons/ArrowBoxUpRight.svelte';
  import CheckCircle from '../icons/CheckCircle.svelte';

  export let ballot: InProgressBallot;
  export let applications: Application[];

  export let currentStep: number = 0;
</script>

<div class="voting-card">
  <h5>Voting</h5>

  {#if !$dismissablesStore.includes('rpgf-we-save-ur-ballot')}
    <AnnotationBox type="info">
      We're saving your progress locally on your browser. You can leave this page and come back later to continue voting.
      <svelte:fragment slot="actions">
        <Button variant="primary" on:click={() => dismissablesStore.dismiss('rpgf-we-save-ur-ballot')}>Sounds good</Button>
      </svelte:fragment>
    </AnnotationBox>
  {/if}

  <div class="steps">
  
    <div class="step">
      <div class="step-headline" class:active={currentStep === 0}>
        <h6 class="typo-text-bold">
          {#if currentStep > 0}
            <CheckCircle style="fill: var(--color-primary)" />
          {/if}
          Step 1
        </h6>
        <span class="typo-text">Read guidelines</span>
      </div>

      {#if currentStep === 0}
      <div class="description">
        <p class="typo-text-small">Please carefully read the round's badgeholder guidelines before proceeding. These guidelines outline the rules and expectations for badgeholders during the voting process.</p>
      </div>

      <div class="actions">
        <Button variant="primary" icon={ArrowBoxUpRight}>Voter guidelines</Button>
        <Button variant="normal" on:click={() => currentStep = 1}>Confirm & continue</Button>
      </div>
      {:else}
        <Button variant="ghost" icon={ArrowBoxUpRight}>Review voter guidelines</Button>
      {/if}
    </div>

    <Divider />

    <div class="step">
      <div class="step-headline" class:active={currentStep === 1}>
        <h6 class="typo-text-bold">
          {#if currentStep > 1}
            <CheckCircle style="fill: var(--color-primary)" />
          {/if}
          Step 2
        </h6>
        <span class="typo-text">Pick applications</span>
      </div>

      {#if currentStep === 1}
      <div class="description">
        <p class="typo-text-small">Decide which applications you'd like to add to your ballot by selecting them on the left.</p>
        <p class="typo-text-small"> Use this step to decide on which projects you believe are worthy of funding.</p>
      </div>

      <div class="actions">
        <Button variant="primary" on:click={() => currentStep = 2}>Continue to assign votes</Button>
      </div>
      {/if}
    </div>

    <Divider />

    <div class="step">
      <div class="step-headline" class:active={currentStep === 2}>
        <h6 class="typo-text-bold">
          {#if currentStep > 2}
            <CheckCircle style="fill: var(--color-primary)" />
          {/if}
          Step 3
        </h6>
        <span class="typo-text">Assign votes</span>
      </div>
      
      {#if currentStep === 2}
      <div class="description">
        <p class="typo-text-small">Assign votes to the selected applications.</p>
        <p class="typo-text-small">Once you're done, click submit to sign your ballot with your wallet and submit it.</p>
      </div>
      {/if}
    </div>
  </div>

</div>

<style>
  .voting-card {
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: var(--elevation-medium);
    display: flex;
    gap: 1rem;
    flex-direction: column;
    view-transition-name: rpgf-applications-voting-card;
  }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .step {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .step-headline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    opacity: 0.75;
  }

  .step-headline.active {
    opacity: 1;
  }

  .step-headline h6 {
    color: var(--color-primary);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .step-headline span {
    color: var(--color-foreground-level-5);
  }

  .description {
    color: var(--color-foreground-level-6);
  }

  .actions {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    gap: 0.5rem;
  }

  .description {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
