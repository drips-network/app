<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M12 6.5C12.2761 6.5 12.5 6.72386 12.5 7V11.5H17C17.2761 11.5 17.5 11.7239 17.5 12C17.5 12.2761 17.2761 12.5 17 12.5H12.5V17C12.5 17.2761 12.2761 17.5 12 17.5C11.7239 17.5 11.5 17.2761 11.5 17V12.5H7C6.72386 12.5 6.5 12.2761 6.5 12C6.5 11.7239 6.72386 11.5 7 11.5H11.5V7C11.5 6.72386 11.7239 6.5 12 6.5Z"
  />
</IconWrapper>
