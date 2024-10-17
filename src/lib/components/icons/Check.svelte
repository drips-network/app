<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import IconWrapper from './IconWrapper.svelte';

  export let iconWrapperProps: ComponentProps<IconWrapper>;
</script>

<IconWrapper on:click {...iconWrapperProps}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M17.3 7.6C17.5209 7.76568 17.5657 8.07909 17.4 8.3L12.0918 15.3776C11.5441 16.1079 10.4766 16.1837 9.83115 15.5383L6.64645 12.3536C6.45118 12.1583 6.45118 11.8417 6.64645 11.6464C6.84171 11.4512 7.15829 11.4512 7.35355 11.6464L10.5383 14.8311C10.7534 15.0463 11.1092 15.021 11.2918 14.7776L16.6 7.7C16.7657 7.47909 17.0791 7.43431 17.3 7.6Z"
  />
</IconWrapper>
