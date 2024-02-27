<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M12 4.5C11.2487 4.5 10.6716 5.16543 10.7778 5.90919L12 14.4645L13.2222 5.90919C13.3284 5.16543 12.7513 4.5 12 4.5ZM9.78786 6.05061C9.59555 4.70442 10.6401 3.5 12 3.5C13.3599 3.5 14.4044 4.70442 14.2121 6.05061L12.9899 14.6059C12.8264 15.7506 11.1736 15.7507 11.01 14.6059L9.78786 6.05061Z"
  />
  <path
    d="M13.5 19C13.5 19.8284 12.8284 20.5 12 20.5C11.1716 20.5 10.5 19.8284 10.5 19C10.5 18.1716 11.1716 17.5 12 17.5C12.8284 17.5 13.5 18.1716 13.5 19Z"
  />
</IconWrapper>
