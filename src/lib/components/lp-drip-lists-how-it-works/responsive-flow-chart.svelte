<script lang="ts" context="module">
  type ButtonConfig = {
    text: string;
    icon?: ComponentType;
    href?: string;
    handler?: () => void;
  };

  export interface Step {
    path?: SVGPathElement;
    illustration?: ComponentType;
    heading: string;
    text: string;
    position?: Pick<DOMRect, 'top' | 'left' | 'width' | 'height'>;
    customClasses?: string;
    isOptional?: boolean;
    button?: ButtonConfig;
    secondaryButton?: ButtonConfig;
  }
</script>

<script lang="ts">
  import { onMount, tick, type ComponentType } from 'svelte';
  import Button from '../button/button.svelte';

  let wrapper: HTMLDivElement;

  export let steps: Step[] = [];

  const positionBoxes = () => {
    const artboard = wrapper.getBoundingClientRect();
    steps.forEach((step, i) => {
      if (!step.path) return;
      let { top, left, width, height } = step.path.getBoundingClientRect();
      if (!width) {
        // svg is hidden on mobile
        steps[i].position = undefined;
        return;
      }
      top = top - artboard.top;
      left = left - artboard.left;
      steps[i].position = { top, left, width, height };
    });
  };

  const stepStyle = (step: Step) =>
    !step.position
      ? ''
      : Object.entries(step.position)
          .map((entry) => `${entry[0]}: ${entry[1]}px`)
          .join(';');

  onMount(async () => {
    await tick();
    positionBoxes();
  });
</script>

<svelte:window on:resize={positionBoxes} />

<section class="relative w-full max-w-[1110px] mx-auto">
  <div bind:this={wrapper} class="hidden lg:block">
    <slot />
  </div>

  <ol class="flex flex-col items-center gap-6 lg:block">
    <!-- mobile: stack of bordered-boxes -->
    <!-- lg/laptop: position step content inside the SVG's outlined boxes -->
    {#each steps as step}
      <li
        class="flex flex-col px-8 py-12 gap-6 items-center justify-center text-center rounded-drip-lg border w-full max-w-[480px] lg:border-none lg:absolute lg:py-0 lg:gap-4 lg:max-w-none relative {step.customClasses ??
          ''}"
        style={stepStyle(step)}
      >
        {#if step.isOptional}
          <div
            class="absolute top-2 right-2 shadow-low rounded-drip-lg typo-text-small leading-none h-5 px-1.5 pt-px"
          >
            Optional
          </div>
        {/if}
        {#if step.illustration}
          <div class="h-30 w-30 illustration">
            <svelte:component this={step.illustration} />
          </div>
        {/if}
        <h3 class="text-typo-header-1 font-pixelated leading-[1]">{step.heading}</h3>
        <p>{step.text}</p>
        <div class="flex gap-2">
          {#if step.button}
            <Button
              href={step.button.href}
              target="_blank"
              variant="primary"
              icon={step.button.icon}
              on:click={step.button.handler}>{step.button.text}</Button
            >
          {/if}
          {#if step.secondaryButton}
            <Button
              href={step.secondaryButton.href}
              target="_blank"
              variant="normal"
              icon={step.secondaryButton.icon}
              on:click={step.secondaryButton.handler}>{step.secondaryButton.text}</Button
            >
          {/if}
        </div>
      </li>
    {/each}
  </ol>
</section>
