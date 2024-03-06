<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M4 8.5C4 8.22386 4.22386 8 4.5 8H19.5C19.7761 8 20 8.22386 20 8.5C20 8.77614 19.7761 9 19.5 9H4.5C4.22386 9 4 8.77614 4 8.5ZM4 12.5C4 12.2239 4.22386 12 4.5 12H19.5C19.7761 12 20 12.2239 20 12.5C20 12.7761 19.7761 13 19.5 13H4.5C4.22386 13 4 12.7761 4 12.5ZM4 16.5C4 16.2239 4.22386 16 4.5 16H19.5C19.7761 16 20 16.2239 20 16.5C20 16.7761 19.7761 17 19.5 17H4.5C4.22386 17 4 16.7761 4 16.5Z"
  />
</IconWrapper>
