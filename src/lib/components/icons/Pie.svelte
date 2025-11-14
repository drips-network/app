<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  interface Props {
    style?: string | undefined;
    slice?: number;
  }

  let { style = undefined, slice = 0.25 }: Props = $props();

  const cy = 12;
  const cx = 12;
  const r = 11.5;

  let percent = $derived(slice * 100);
  let r0 = $derived(r / 2);
  let circumference = $derived(2 * Math.PI * r0);
  let translate = $derived(-1 * 2 * cx);
</script>

<IconWrapper {style}>
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
