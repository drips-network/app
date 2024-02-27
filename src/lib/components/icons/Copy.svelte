<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M8.5 6C8.5 5.17157 9.17157 4.5 10 4.5H18C18.8284 4.5 19.5 5.17157 19.5 6V14C19.5 14.8284 18.8284 15.5 18 15.5H15.5V18C15.5 18.8284 14.8284 19.5 14 19.5H6C5.17157 19.5 4.5 18.8284 4.5 18V10C4.5 9.17157 5.17157 8.5 6 8.5H8.5V6ZM8.5 9.5H6C5.72386 9.5 5.5 9.72386 5.5 10V18C5.5 18.2761 5.72386 18.5 6 18.5H14C14.2761 18.5 14.5 18.2761 14.5 18V15.5H10C9.17157 15.5 8.5 14.8284 8.5 14V9.5ZM10 5.5C9.72386 5.5 9.5 5.72386 9.5 6V14C9.5 14.2761 9.72386 14.5 10 14.5H18C18.2761 14.5 18.5 14.2761 18.5 14V6C18.5 5.72386 18.2761 5.5 18 5.5H10Z"
  />
</IconWrapper>
