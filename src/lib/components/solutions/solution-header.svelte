<div class="solution-header">
  <h1><slot name="headline"></slot></h1>
  <p><slot name="description"></slot></p>
</div>

<style>
  .solution-header {
    max-width: 800px;
    margin: 0 auto;
    margin-top: 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  h1 {
    font-size: 3.75rem;
    line-height: 4.5rem;
  }

  p {
    color: var(--color-foreground-level-6);
  }
</style>
