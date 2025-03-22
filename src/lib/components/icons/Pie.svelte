<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
  export let slice: number = 0.25;

  const cy = 12;
  const cx = 12;
  const r = 11.5;

  $: percent = slice * 100;
  $: r0 = r / 2;
  $: circumference = 2 * Math.PI * r0;
  $: translate = -1 * 2 * cx;
</script>

<IconWrapper on:click {style}>
  <circle {cx} {cy} {r} stroke="var(--color-foreground)" />
  <circle
    {cx}
    {cy}
    r={r0}
    stroke="var(--color-primary)"
    stroke-width={cx}
    stroke-dasharray={`calc(${percent} * ${circumference} / 100) ${circumference}`}
    transform={`rotate(-90) translate(${translate})`}
  />
</IconWrapper>
