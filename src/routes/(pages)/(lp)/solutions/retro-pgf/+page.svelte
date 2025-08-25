<script>
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  import { INBOUND_LEAD_FORM_URL } from '$lib/constants';
  import TrustedBy from '../../components/trusted-by.svelte';
  import RpgfHeaderIllustration from './components/rpgf-header-illustration.svelte';
</script>

<HeadMeta
  title="RetroPGF"
  description="Drips is the simplest way to reward open-source projects within your ecosystem. Drips harnesses the ability to amplify funding across any ecosystem. Now we have expanded our offer to include Retroactive Funding."
/>

<div class="hero">
  <RpgfHeaderIllustration />

  <div class="divider"></div>

  <div class="bottom">
    <p>Manage your RetroPGF round from application intake to distribution.</p>

    <p>
      Ready to launch your RPGF round with Drips?
      <span style:padding-left="0.5rem">
        <Button variant="primary" href={INBOUND_LEAD_FORM_URL} target="_blank">Get in touch</Button>
      </span>
    </p>
  </div>
</div>

<div class="intro">
  <div>
    <h2 class="typo-text-bold">What’s Drips?</h2>
    <p class="typo-text">
      Drips is the simplest way to reward open-source projects within your ecosystem. Drips
      harnesses the ability to amplify funding across any ecosystem. Now we have expanded our offer
      to include Retroactive Funding.
    </p>
  </div>

  <div>
    <h2 class="typo-text-bold">Introducing RetroPGF on Drips</h2>
    <p class="typo-text">
      It’s never been easier to run impact-based funding rounds. Drips offers the perfect solution
      for protocols looking to minimize admin overhead while maximizing transparency and downstream
      effects of funding rounds.
    </p>
  </div>
</div>

<div class="big-headline">
  <h1>How Drips helps you make your RetroPGF round a success</h1>

  <div class="arrows">
    <ArrowDown style="fill: var(--color-primary)" />
    <ArrowDown style="fill: var(--color-primary)" />
    <ArrowDown style="fill: var(--color-primary)" />
    <ArrowDown style="fill: var(--color-primary)" />
  </div>
</div>

<section class="step-card">
  <div class="text">
    <div class="number">1</div>

    <h3 class="typo-text-bold">Public round dashboard</h3>

    <p>All round details consolidated in a single, public interface.</p>

    <ul>
      <li class="typo-text">Customize your round’s appearance</li>
      <li class="typo-text">Communicate key information to your community</li>
      <li class="typo-text">Flexible scheduling and formatting</li>
    </ul>
  </div>

  <div class="illustration">
    <img src="/assets/lp/rpgf/round-view.png" width="1278" height="795" alt="Round view" />
  </div>
</section>

<div class="frame">
  <section class="step-card reverse">
    <div class="text">
      <div class="number">2</div>

      <h3 class="typo-text-bold">Application intake</h3>

      <p>Flexible, straightforward, and secure.</p>

      <ul>
        <li class="typo-text">Fully customizable application forms, including for private data</li>
        <li class="typo-text">
          Applicants apply directly with their GitHub repositories - no need to collect ETH
          addresses
        </li>
        <li class="typo-text">Applications are attested on-chain</li>
      </ul>
    </div>

    <div class="illustration">
      <img
        src="/assets/lp/rpgf/form-builder.png"
        width="1073"
        height="600"
        alt="RPGF form builder"
      />
    </div>
  </section>

  <section class="step-card">
    <div class="text">
      <div class="number">3</div>

      <h3 class="typo-text-bold">Application review</h3>

      <p>A streamlined interface for application review.</p>

      <ul>
        <li class="typo-text">Submit multiple decisions in bulk</li>
        <li class="typo-text">Invite multiple admins to collaborate on reviews</li>
        <li class="typo-text">Download all application data as CSV anytime</li>
      </ul>
    </div>

    <div class="illustration">
      <img
        src="/assets/lp/rpgf/applications.png"
        width="1140"
        height="697"
        alt="Applications screen"
      />
    </div>
  </section>
</div>

<section class="step-card reverse">
  <div class="text">
    <div class="number">4</div>

    <h3 class="typo-text-bold">Badgeholder voting</h3>

    <p>All the data badgeholders need to make impactful decisions, all in one place.</p>

    <ul>
      <li class="typo-text">
        Our integration with Open Source Observer provides helpful key code metrics
      </li>
      <li class="typo-text">Streamlined UI for quick & easy voting</li>
      <li class="typo-text">Voting is gasless, off-chain, and secure</li>
    </ul>
  </div>

  <div class="illustration">
    <img src="/assets/lp/rpgf/ballot.png" width="1274" height="853" alt="Ballot in progress" />
  </div>
</section>

<section class="step-card">
  <div class="text">
    <div class="number">5</div>

    <h3 class="typo-text-bold">Distribute rewards</h3>

    <p>
      Use Drips’ flexible, permissionless funding protocol to automatically distribute rewards for
      your round.
    </p>

    <ul>
      <li class="typo-text">Automatically generate Drip Lists based on round results</li>
      <li class="typo-text">
        Send rewards directly to GitHub repositories - no ETH address needed
      </li>
      <li class="typo-text">Built-in dependency splitting amplifies the impact of your round</li>
    </ul>
  </div>

  <div class="illustration">
    <img
      src="/assets/lp/rpgf/distribution.png"
      width="1358"
      height="1052"
      alt="Distribution settings"
    />
  </div>
</section>

<section class="partners">
  <TrustedBy headline="Notable partners" />
</section>

<section class="get-in-touch">
  <div class="big-headline">
    <h1>Let's talk</h1>
  </div>

  <p>
    Ready to launch your RetroPGF round with Drips? Our pricing is flexible and we've helped small
    and large teams, so get in touch.
  </p>

  <div class="arrows">
    <ArrowDown style="fill: var(--color-primary)" />
    <ArrowDown style="fill: var(--color-primary)" />
    <ArrowDown style="fill: var(--color-primary)" />
    <ArrowDown style="fill: var(--color-primary)" />
  </div>

  <Button variant="primary" size="large" href={INBOUND_LEAD_FORM_URL} target="_blank">
    Get in touch
  </Button>
</section>

<style>
  .hero {
    width: 100%;
    padding: 2rem;
    border: 1px solid var(--color-primary-level-2);
    border-radius: 2rem 0 2rem 2rem;
    background-color: var(--color-primary-level-1);
  }

  .hero .divider {
    width: 100%;
    height: 1px;
    background-color: var(--color-primary-level-2);
    margin: 2rem 0;
  }

  .hero .bottom {
    display: flex;
    align-items: center;
    gap: 2rem;
    justify-content: space-between;
  }

  .big-headline {
    margin-top: 3rem;
    max-width: 48rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }

  .arrows {
    display: flex;
  }

  .big-headline h1 {
    font-size: 3rem;
    text-align: center;
    line-height: 1.2;
    color: var(--color-primary);
  }

  .intro {
    max-width: 72rem;
    display: flex;
    gap: 2rem;
    margin-top: 2rem;
  }

  .intro p {
    color: var(--color-foreground-level-6);
  }

  .intro h2 {
    line-height: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .step-card {
    display: flex;
    align-items: center;
    gap: 3rem;
    padding: 2rem;
    border-radius: 1.5rem;
    margin-top: 2rem;
  }

  .step-card.reverse {
    flex-direction: row-reverse;
  }

  .step-card .text {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 26rem;
  }

  .step-card .text .number {
    width: 2rem;
    margin-bottom: 1rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--color-primary-level-2);
    color: var(--color-foreground);
    font-weight: bold;
  }

  .step-card .text ul {
    padding-left: 1rem;
    list-style-type: disc;
    color: var(--color-foreground-level-6);
  }

  .step-card .illustration {
    max-width: 34rem;
    width: 100%;
    display: flex;
    align-items: center;
  }

  .frame {
    width: 100%;
    background-color: var(--color-primary-level-1);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    margin: 2rem 0;
    border-radius: 2rem 0 2rem 2rem;
  }

  .partners {
    margin-top: 2rem;
  }

  .get-in-touch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .get-in-touch p {
    max-width: 50rem;
    text-align: center;
    color: var(--color-foreground-level-6);
  }

  @media (max-width: 768px) {
    .hero {
      padding: 1rem;
    }

    .hero .bottom,
    .hero .divider {
      display: none;
    }

    .intro {
      flex-direction: column;
    }
    .step-card {
      flex-direction: column-reverse;
      align-items: center;
      padding: 0rem;
    }

    .big-headline h1 {
      font-size: 2.5rem;
    }

    .frame {
      padding: 1rem;
    }

    .step-card.reverse {
      flex-direction: column-reverse;
    }

    .step-card .illustration {
      max-width: 100%;
    }
  }
</style>
