<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import IllustrationBottom from '../components/illustration-bottom.svelte';
  import IllustrationTop from '../components/illustration-top.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import Wave from '$lib/components/icons/Wave.svelte';
</script>

<HeadMeta
  title="Kick off your Wave with a boost"
  description="Join the Drips Discord, submit the form before January 11th, 2026, and receive 100 Points after you participate in the first Wave early next year."
/>

<div class="page">
  <div class="wrapper">
    <div class="form-container">
      <h1 class="pixelated">Kick off your Wave with a boost</h1>

      <Markdown
        useExternalRoute={false}
        content={`
## Let’s Make Some Waves: Stellar Wave 1 Social Bonus

[Stellar Wave 1](https://drips.network/wave/stellar) is less than a week away and we’re giving you the opportunity to kick things off with a little extra momentum.

To celebrate the upcoming launch, you can earn **100 bonus points** for showing you’re joining the Wave. Share the official **“I’m joining Stellar Wave 1” GIF** on social, jump into the Wave, and start building.

## **How to Enter**

To qualify for the **100 bonus points**, you must complete **all** of the steps below:

1. **Follow Drips on [X](https://x.com/dripsnetwork) or [Bluesky](https://bsky.app/profile/drips.network)**  
2. **Share the official Stellar Wave 1 GIF** on **X or Bluesky** (you’ll find this in the pinned post on both platforms)  
3. **Tag the Drips account** in your post (X @dripsnetwork or Bluesky @drips.network)  
4. **Include your GitHub username** in the post text so we can find you  
5. **Participate in Stellar Wave 1** by resolving an issue during the Wave

## Deadline

* Entries are valid **until the midnight 22 January 2026 EST**  
* Bonus points are awarded **only after you actively participate** in Stellar Wave 1

Now grab the GIF and share, build, earn!

## Terms & Conditions

* Maximum reward is 100 bonus points total, sharing multiple times on multiple platforms does not increase rewards  
* Your valid GitHub username must be included in your post, and you must resolve at least one issue within the first Stellar Wave using the same username  
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
