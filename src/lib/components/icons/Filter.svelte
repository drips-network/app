<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M4 8.5C4 8.22386 4.22386 8 4.5 8H19.5C19.7761 8 20 8.22386 20 8.5C20 8.77614 19.7761 9 19.5 9H4.5C4.22386 9 4 8.77614 4 8.5ZM17.5 13L6.5 13C6.22386 13 6 12.7761 6 12.5C6 12.2239 6.22386 12 6.5 12L17.5 12C17.7761 12 18 12.2239 18 12.5C18 12.7761 17.7761 13 17.5 13ZM8 16.5C8 16.2239 8.22386 16 8.5 16L15.5 16C15.7761 16 16 16.2239 16 16.5C16 16.7761 15.7761 17 15.5 17L8.5 17C8.22386 17 8 16.7761 8 16.5Z"
  />
</IconWrapper>
