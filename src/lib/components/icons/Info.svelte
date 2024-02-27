<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    d="M13 8C12.4553 8 12 7.54467 12 7C12 6.45533 12.4553 6 13 6C13.5447 6 14 6.45533 14 7C14 7.54467 13.5447 8 13 8Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M9.5 11C9.5 10.7239 9.72386 10.5 10 10.5H12C12.147 10.5 12.2865 10.5647 12.3815 10.6768C12.4765 10.789 12.5174 10.9372 12.4932 11.0822L11.7843 15.3356C11.6827 15.9451 12.1528 16.5 12.7707 16.5H13C13.2761 16.5 13.5 16.7239 13.5 17C13.5 17.2761 13.2761 17.5 13 17.5H12.7707C11.5348 17.5 10.5947 16.3903 10.7979 15.1712L11.4098 11.5H10C9.72386 11.5 9.5 11.2761 9.5 11Z"
  />
</IconWrapper>
