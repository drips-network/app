<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import IllustrationBottom from '../components/illustration-bottom.svelte';
  import IllustrationTop from '../components/illustration-top.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import Wave from '$lib/components/icons/Wave.svelte';
</script>

<HeadMeta
  title="Let's Make Some Waves: Stellar Wave 3 Social Bonus"
  description="Earn 100 bonus points by sharing the official 'I'm joining Stellar Wave 3' GIF on social media and participating in Stellar Wave 3."
/>

<div class="page">
  <div class="wrapper">
    <div class="form-container">
      <h1 class="pixelated">Stellar Wave 3 Social Bonus</h1>

      <Markdown
        useExternalRoute={false}
        content={`
Stellar Wave 3 starts Monday 23rd March and we're giving you the opportunity to kick things off with a little extra momentum.

To celebrate the upcoming launch, you can earn **100 bonus points** just for showing you're joining the Wave. Share the official **"I'm joining Stellar Wave 3"** GIF on social media, jump into the Wave and start building.
        `}
      />

      <Button
        size="large"
        variant="primary"
        icon={ArrowBoxUpRight}
        href="https://docs.google.com/forms/d/e/1FAIpQLSfrnnsuDKMM9KBuTdxC2CkzFtM0xb06DkROE6mNx0aOg-z6Xw/viewform?usp=publish-editor"
      >
        Submit your entry
      </Button>

      <Markdown
        useExternalRoute={false}
        content={`
## **How to Enter**

To qualify for the **100 bonus points**, you must complete **all** of the steps below:

1. **Follow Drips on [X](https://x.com/dripsnetwork) or [Bluesky](https://bsky.app/profile/drips.network)**
2. **Share the official Stellar Wave 3 GIF** on **X or Bluesky** (you'll find this in the pinned post on both platforms)
3. **Tag the Drips account** in your post (X @dripsnetwork or Bluesky @drips.network)
4. [**Fill in the form**](https://docs.google.com/forms/d/e/1FAIpQLSfrnnsuDKMM9KBuTdxC2CkzFtM0xb06DkROE6mNx0aOg-z6Xw/viewform?usp=publish-editor) with a link to your post
5. **Participate in Stellar Wave 3** by resolving an issue during the Wave

## Deadline

* Entries are valid **until midnight March 25th 2026 UTC**
* Bonus points are awarded **only after you actively participate** in Stellar Wave 3

Now grab the GIF and share, build, earn!

## Terms & Conditions

* Maximum reward is 100 bonus points total, sharing multiple times on multiple platforms does not increase rewards
* You must fill in the form providing a link to your post and you must resolve at least one issue within Stellar Wave 3 using the same GitHub username you provided
* Only X and Bluesky posts are eligible
* Posts made after the deadline are not eligible
        `}
      />

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
      <Button icon={Wave} href="/wave" variant="primary">Open the Drips Wave app</Button>
    </section>
  </div>
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
</style>
