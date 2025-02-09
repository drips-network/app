<div class="edu-card-illustration-bg" />
<div class="edu-card-illustration-wrapper">
  <slot />
</div>

<style>
  .edu-card-illustration-bg {
    position: absolute;
    background-color: var(--color-primary-level-2);
    top: 0;
    width: 35%;
    height: 50%;
    border-radius: 0 0 1rem 1rem;
  }

  .edu-card-illustration-wrapper {
    max-width: 16rem;
    z-index: 1;
  }

  @media (max-width: 768px) {
    .edu-card-illustration-bg {
      width: 100%;
      height: 30%;
      border-radius: 0;
    }
  }
</style>
