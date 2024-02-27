<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M14.2464 14.2464C14.4417 14.0512 14.7583 14.0512 14.9536 14.2464L19.3536 18.6464C19.5488 18.8417 19.5488 19.1583 19.3536 19.3536C19.1583 19.5488 18.8417 19.5488 18.6464 19.3536L14.2464 14.9536C14.0512 14.7583 14.0512 14.4417 14.2464 14.2464Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M11 6.5C8.51472 6.5 6.5 8.51472 6.5 11C6.5 13.4853 8.51472 15.5 11 15.5C13.4853 15.5 15.5 13.4853 15.5 11C15.5 8.51472 13.4853 6.5 11 6.5ZM5.5 11C5.5 7.96243 7.96243 5.5 11 5.5C14.0376 5.5 16.5 7.96243 16.5 11C16.5 14.0376 14.0376 16.5 11 16.5C7.96243 16.5 5.5 14.0376 5.5 11Z"
  />
</IconWrapper>
