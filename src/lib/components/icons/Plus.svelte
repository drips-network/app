<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M12 4.5C12.2761 4.5 12.5 4.72386 12.5 5V19C12.5 19.2761 12.2761 19.5 12 19.5C11.7239 19.5 11.5 19.2761 11.5 19V5C11.5 4.72386 11.7239 4.5 12 4.5Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M19.5 12C19.5 12.2761 19.2761 12.5 19 12.5L5 12.5C4.72386 12.5 4.5 12.2761 4.5 12C4.5 11.7239 4.72386 11.5 5 11.5L19 11.5C19.2761 11.5 19.5 11.7239 19.5 12Z"
  />
</IconWrapper>
