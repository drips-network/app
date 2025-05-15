<script>
  import { INBOUND_LEAD_FORM_URL } from '$lib/constants';
  import Button from '../button/button.svelte';
</script>

<div class="solution-interstitial">
  <h2 class="pixelated"><slot name="headline"></slot></h2>
  <p><slot name="description"></slot></p>
  <div>
    <Button variant="primary" href={INBOUND_LEAD_FORM_URL} target="_blank" rel="noreferrer"
      >Get in touch</Button
    >
  </div>
</div>

<style>
  .solution-interstitial {
    max-width: 800px;
    margin: 4rem auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  h2 {
    font-size: 1.5rem;
    line-height: 1.75rem;
  }

  p {
    color: var(--color-foreground-level-6);
  }
</style>
