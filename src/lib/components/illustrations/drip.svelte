<script lang="ts">
  export let height = '38px';
  export let fill = 'var(--color-primary)';
  export let stroke: string | undefined = undefined;
  export let strokeWidth: string | undefined = undefined;
</script>

<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 38" {height}
  >{@html `
  <path
    ${stroke ? `stroke="${stroke}" ` : ''}
    ${strokeWidth ? `stroke-width="${strokeWidth}" ` : ''}
    fill=${fill}
    d="M.531 25.456c0-2.569 1.146-5.624 3.244-9.67 1.405-2.71 3.211-5.818 5.338-9.478.915-1.576 1.89-3.254 2.918-5.046 1.028 1.792 2.003 3.47 2.918 5.046 2.127 3.66 3.934 6.769 5.338 9.478 2.098 4.046 3.244 7.101 3.244 9.67 0 5.74-5.192 11.5-11.5 11.5s-11.5-5.76-11.5-11.5Z"/>
`}</svg
>
