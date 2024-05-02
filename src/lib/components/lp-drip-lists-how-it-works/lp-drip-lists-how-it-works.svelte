<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '../button/button.svelte';
  import { goto } from '$app/navigation';

  // this svg is the boxes and lines of the zig zag 'how it works' graphic
  // think the approach is to onMounted, calc the box positions, then absolute position some divs with text to those positions
  // for mobile just hide the svg and stack the divs (and add borders)

  let svgEl: SVGElement;
  const boxPaths: SVGPathElement[] = [];

  interface Step {
    heading: string;
    text: string;
    position?: Pick<DOMRect, 'top' | 'left' | 'width' | 'height'>;
    customClasses?: string;
    button?: {
      text: string;
      handler: () => void;
    };
  }

  const steps: Step[] = [
    {
      heading: 'Choose collaborators',
      text: 'Add anyone with an Ethereum address. These collaborators will vote on the final recipients.',
    },
    {
      heading: 'Nominate recipients',
      text: 'Each collaborator can nominate any Ethereum address or GitHub project.',
      customClasses: 'border-dashed',
    },
    {
      heading: 'Vote on recipients',
      text: 'Decide what percent of funds each recipient should receive.',
    },
    {
      heading: 'Publish the list',
      text: 'Once your list is published, you (or anyone) can send one-time or recurring funds to it.',
    },
    {
      heading: 'Funds cascade down',
      text: 'Recipients split incoming funds among their maintainers and other projects.',
    },
    {
      heading: 'Have an idea?',
      text: 'Get your personalized Drip List started now.',
      customClasses: 'bg-primary-level-1 lg:bg-transparent',
      button: {
        text: 'Start a Drip List',
        handler: () => goto('/app/funder-onboarding'),
      },
    },
  ];

  const positionBoxes = () => {
    const svgBox = svgEl.getBoundingClientRect();
    boxPaths.forEach((el, i) => {
      let { top, left, width, height } = el.getBoundingClientRect();
      if (!width) {
        // svg is hidden on mobile
        steps[i].position = undefined;
        return;
      }
      top = top - svgBox.top;
      left = left - svgBox.left;
      steps[i].position = { top, left, width, height };
    });
  };

  onMount(() => {
    positionBoxes();
  });
</script>

<svelte:window on:resize={positionBoxes} />

<section class="relative w-full max-w-[1110px] mx-auto">
  <svg
    bind:this={svgEl}
    class="hidden lg:block w-full"
    viewBox="0 0 1110 1584"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio
  >
    <path
      bind:this={boxPaths[0]}
      d="M24 1.02039H479.5V305.52C479.5 318.499 468.979 329.02 456 329.02H24C11.0213 329.02 0.5 318.499 0.5 305.52V24.5204C0.5 11.5417 11.0213 1.02039 24 1.02039Z"
      stroke="var(--color-foreground)"
    />
    <path
      bind:this={boxPaths[1]}
      d="M601 185.02H1056.5V489.52C1056.5 502.499 1045.98 513.02 1033 513.02H601C588.021 513.02 577.5 502.499 577.5 489.52V208.52C577.5 195.542 588.021 185.02 601 185.02Z"
      stroke-dasharray="4 4"
      stroke="var(--color-foreground)"
    />
    <path
      bind:this={boxPaths[2]}
      d="M24 482.02H479.5V786.52C479.5 799.499 468.979 810.02 456 810.02H24C11.0213 810.02 0.5 799.499 0.5 786.52V505.52C0.5 492.542 11.0213 482.02 24 482.02Z"
      stroke="var(--color-foreground)"
    />
    <path
      bind:this={boxPaths[3]}
      d="M601 666.02H1056.5V970.52C1056.5 983.499 1045.98 994.02 1033 994.02H601C588.021 994.02 577.5 983.499 577.5 970.52V689.52C577.5 676.542 588.021 666.02 601 666.02Z"
      stroke="var(--color-foreground)"
    />
    <path
      bind:this={boxPaths[4]}
      d="M24 963.02H479.5V1267.52C479.5 1280.5 468.979 1291.02 456 1291.02H24C11.0213 1291.02 0.5 1280.5 0.5 1267.52V986.52C0.5 973.542 11.0213 963.02 24 963.02Z"
      stroke="var(--color-foreground)"
    />
    <path
      bind:this={boxPaths[5]}
      d="M546.5 1255.02H1109V1567.52C1109 1576.08 1102.06 1583.02 1093.5 1583.02H546.5C537.94 1583.02 531 1576.08 531 1567.52V1270.52C531 1261.96 537.94 1255.02 546.5 1255.02Z"
      stroke="var(--color-foreground)"
      fill="var(--color-primary-level-1)"
    />
    <path d="M530.5 1395.14H233C219.745 1395.14 209 1384.4 209 1371.14V1291.5" stroke="black" />
    <rect x="432.5" y="1371.5" width="47" height="47" rx="23.5" fill="#DCFAC8" />
    <rect x="432.5" y="1371.5" width="47" height="47" rx="23.5" stroke="#28333D" />
    <path
      d="M480 80.6433H799C807.837 80.6433 815 87.8068 815 96.6433V183.643"
      stroke="#28333D"
      stroke-dasharray="4 4"
    />
    <path d="M825 174L815 184L805 174" stroke="#28333D" />
    <path d="M241 328.643V404.643V480.643" stroke="black" />
    <path d="M251 471L241 481L231 471" stroke="#28333D" />
    <path
      d="M482 587.643H799C807.837 587.643 815 580.48 815 571.643V512.643"
      stroke="#28333D"
      stroke-dasharray="4 4"
    />
    <path d="M492 597.643L482 587.643L492 577.643" stroke="#28333D" />
    <path d="M480 1069H799C807.837 1069 815 1061.84 815 1053V994" stroke="#28333D" />
    <path d="M489 1079L479 1069L489 1059" stroke="#28333D" />
    <path d="M577 884.643H257C248.163 884.643 241 877.48 241 868.643V809.643" stroke="#28333D" />
    <path d="M568 894.52L578 884.52L568 874.52" stroke="#28333D" />
  </svg>

  <ol class="flex flex-col items-center gap-6 lg:block">
    <!-- mobile: stack of bordered-boxes -->
    <!-- lg/laptop: position inside the SVG's outlined boxes -->
    {#each steps as step}
      <li
        class="flex flex-col px-8 py-12 gap-6 items-center justify-center text-center rounded-drip-lg border w-full max-w-[480px] lg:border-none lg:absolute lg:py-0 lg:gap-4 lg:max-w-none {step.customClasses ??
          ''}"
        style={!step.position
          ? ''
          : Object.entries(step.position)
              .map((entry) => `${entry[0]}: ${entry[1]}px`)
              .join(';')}
        data-step={step.position?.width}
      >
        <figure class="h-30 w-30 bg-gray-100" />
        <h3 class="text-typo-header-1 font-pixelated leading-[1]">{step.heading}</h3>
        <p>{step.text}</p>
        {#if step.button}
          <Button variant="primary" on:click={step.button.handler}>{step.button.text}</Button>
        {/if}
      </li>
    {/each}
  </ol>
</section>
