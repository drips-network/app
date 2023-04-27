<script lang="ts">
  import { quintInOut } from 'svelte/easing';

  import { fly } from 'svelte/transition';

  import type { SvelteComponent, SvelteComponentTyped } from 'svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Props<T> = T extends SvelteComponentTyped<infer P, any, any> ? P : never;
  type PropsOrUndefined<T> = Props<T> extends Record<string, never> ? undefined : Props<T>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Constructor<T> = new (...args: any[]) => T;

  type CT = $$Generic<SvelteComponent>;

  export let component: {
    component: Constructor<CT>;
    props: PropsOrUndefined<CT>;
  };
</script>

<div class="step-header">
  <div class="background" />
  <div class="content">
    {#key component}
      <div
        class="transition-wrapper"
        in:fly|local={{ x: 32, duration: 500, easing: quintInOut }}
        out:fly|local={{ x: -32, duration: 500, easing: quintInOut }}
      >
        <div class="inner">
          <svelte:component this={component.component} {...component.props} />
        </div>
      </div>
    {/key}
  </div>
</div>

<style>
  .step-header {
    height: 10rem;
  }

  .background {
    background-color: var(--color-primary-level-1);
    height: 6rem;
  }

  .content {
    padding: 0 2rem;
    margin-top: -4rem;
    position: absolute;
  }

  .content .transition-wrapper {
    position: absolute;
  }

  .content .inner {
    position: absolute;
  }
</style>
