<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M6.5 6C6.5 5.72386 6.72386 5.5 7 5.5H13C15.4853 5.5 17.5 7.51472 17.5 10C17.5 12.2431 15.8593 14.102 13.7126 14.4438L13.5553 13.4563C15.2243 13.1905 16.5 11.7438 16.5 10C16.5 8.067 14.933 6.5 13 6.5H7.5V13.5H9.64494C9.92109 13.5 10.1449 13.7239 10.1449 14C10.1449 14.2761 9.92109 14.5 9.64494 14.5H7.5V18C7.5 18.2761 7.27614 18.5 7 18.5C6.72386 18.5 6.5 18.2761 6.5 18V6Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M16.6159 18.3201L6.61589 6.32009L7.38411 5.67991L17.3841 17.6799C17.5609 17.892 17.5322 18.2073 17.3201 18.3841C17.108 18.5609 16.7927 18.5322 16.6159 18.3201Z"
  />
</IconWrapper>
