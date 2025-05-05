<script lang="ts">
  export let reverse = false;
</script>

<div class="solution-card" class:reverse>
  <div class="illustration">
    <slot name="illustration"></slot>
  </div>
  <div class="content">
    <div class="inner">
      <h2><slot name="headline"></slot></h2>
      <p><slot name="description"></slot></p>
      <div class="line-items">
        <slot name="line-items"></slot>
      </div>
    </div>
  </div>
</div>

<style>
  .solution-card {
    background-color: var(--color-background);
    width: 100%;
    display: flex;
    margin-top: 2rem;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 2rem 0 2rem 2rem;
  }

  .solution-card.reverse {
    flex-direction: row-reverse;
  }

  .solution-card > * {
    flex: 1;
  }

  .illustration {
    position: relative;
    max-height: 30rem;
    margin-top: -2rem;
    margin-bottom: -2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .content .inner {
    max-width: 600px;
    height: 100%;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
  }

  h2 {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  @media (max-width: 882px) {
    .solution-card {
      flex-direction: column;
      margin-top: 3rem;
      margin-bottom: 0;
    }

    .solution-card.reverse {
      flex-direction: column;
    }

    .illustration {
      flex-basis: 20rem;
      display: block;
      max-height: 20rem;
      margin: 0 auto;
      margin-top: -3rem;
      margin-bottom: 1rem;
    }
  }
</style>
