<script lang="ts">
  import CrossSmall from 'radicle-design-system/icons/CrossSmall.svelte';
  import { createEventDispatcher, type ComponentType } from 'svelte';
  import Button from '../button/button.svelte';

  const dispatch = createEventDispatcher<{ dismiss: undefined }>();

  export let title: string;
  export let description: string;
  export let button: {
    href: string;
    label: string;
  };
  export let icon: ComponentType;
</script>

<div class="banner">
  <div class="left">
    <div class="icon">
      <svelte:component this={icon} />
    </div>
    <div class="text">
      <h3 class="pixelated">{title}</h3>
      <p class="typo-text">{description}</p>
    </div>
  </div>
  <div class="right">
    <a href={button.href} rel="noreferrer" target="_blank">
      <Button variant="primary">
        {button.label}
      </Button>
    </a>
    <button class="close-button" on:click={() => dispatch('dismiss')}>
      <CrossSmall style="fill: var(--color-primary-level-6)" />
    </button>
  </div>
</div>

<style>
  .banner {
    position: relative;
    background-color: var(--color-primary-level-1);
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    padding: 1rem 2rem 1rem 1rem;
    border-radius: 5rem 0 5rem 5rem;
    color: var(--color-primary-level-6);
    align-items: center;
    border: 1px solid var(--color-primary);
  }

  .left,
  .right {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .left .icon {
    height: 4rem;
    width: 4rem;
    padding: 0.75rem;
    background-color: var(--color-background);
    border-radius: 2rem;
    border: 1px solid var(--color-primary);
  }

  .left .text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .close-button {
    transition: background-color 0.3s;
    border-radius: 1rem;
  }

  .close-button:hover {
    background-color: var(--color-primary-level-2);
  }

  .close-button:focus {
    background-color: var(--color-primary-level-3);
  }

  @media (max-width: 1056px) {
    .banner {
      flex-direction: column;
      border-radius: 2rem 0 2rem 2rem;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 0.75rem;
    }

    .left .icon {
      height: 3.25rem;
      width: 3.25rem;
    }

    .left,
    .right {
      flex-direction: column;
      align-items: flex-start;
    }

    .close-button {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
    }

    .right {
      justify-content: flex-end;
      flex-grow: 1;
    }
  }
</style>
