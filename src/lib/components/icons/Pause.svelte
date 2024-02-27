<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M10 8.5C10.2761 8.5 10.5 8.72386 10.5 9V15C10.5 15.2761 10.2761 15.5 10 15.5C9.72386 15.5 9.5 15.2761 9.5 15V9C9.5 8.72386 9.72386 8.5 10 8.5Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M14 8.5C14.2761 8.5 14.5 8.72386 14.5 9V15C14.5 15.2761 14.2761 15.5 14 15.5C13.7239 15.5 13.5 15.2761 13.5 15V9C13.5 8.72386 13.7239 8.5 14 8.5Z"
  />
</IconWrapper>
