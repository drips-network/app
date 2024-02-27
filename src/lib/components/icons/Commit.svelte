<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5ZM7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51472 16.5 7.5 14.4853 7.5 12Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M12 2.5C12.2761 2.5 12.5 2.72386 12.5 3V8C12.5 8.27614 12.2761 8.5 12 8.5C11.7239 8.5 11.5 8.27614 11.5 8V3C11.5 2.72386 11.7239 2.5 12 2.5Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M12 15.5C12.2761 15.5 12.5 15.7239 12.5 16V21C12.5 21.2761 12.2761 21.5 12 21.5C11.7239 21.5 11.5 21.2761 11.5 21V16C11.5 15.7239 11.7239 15.5 12 15.5Z"
  />
</IconWrapper>
