<script>
  import Button from '$lib/components/button/button.svelte';
</script>

<div class="lp-contact-card">
  <h1>Get in touch</h1>
  <p>
    If you have a funding idea or a chain we’re not yet live on, let’s work together to build
    something for your use case.
  </p>
  <Button>Talk to us</Button>
</div>

<style>
  .lp-contact-card {
    display: flex;
    flex-direction: column;
    border-radius: 2rem 0 2rem 2rem;
    color: white;
    border: 1px solid var(--color-primary-level-2);
    background-color: var(--color-primary);
    padding: 2rem;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 1rem;
    height: 100%;
  }
</style>
