<div class="card">
  <h4><slot name="title" /></h4>
  <ul>
    <slot name="items" />
  </ul>
</div>

<style>
  .card {
    background-color: var(--color-background);
    padding: 1rem;
    box-shadow: inset var(--elevation-low);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    overflow-x: scroll;
    text-align: left;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
