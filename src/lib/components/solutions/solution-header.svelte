<div class="solution-header">
  <div class="usecase-badge">
    <span class="typo-header-5"><slot name="usecase-badge"></slot></span>
  </div>
  <h1><slot name="headline"></slot></h1>
  <p><slot name="description"></slot></p>
</div>

<style>
  .solution-header {
    max-width: 720px;
    margin: 0 auto;
    margin-top: 2rem;
    margin-bottom: 3rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .usecase-badge {
    width: fit-content;
    margin: 0 auto;
    background-color: var(--color-primary-level-1);
    padding: 0.5rem 1rem;
    border-radius: 2rem 0 2rem 2rem;
    color: var(--color-primary-level-6);
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  h1 {
    font-size: 3.75rem;
    line-height: 4.5rem;
  }

  p {
    color: var(--color-foreground-level-6);
  }
</style>
