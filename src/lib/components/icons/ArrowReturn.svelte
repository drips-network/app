<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M4.64645 13.3536C4.45118 13.1583 4.45118 12.8417 4.64645 12.6464L9.64645 7.64645C9.84171 7.45118 10.1583 7.45118 10.3536 7.64645C10.5488 7.84171 10.5488 8.15829 10.3536 8.35355L5.70711 13L10.3536 17.6464C10.5488 17.8417 10.5488 18.1583 10.3536 18.3536C10.1583 18.5488 9.84171 18.5488 9.64645 18.3536L4.64645 13.3536Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M4.5 13C4.5 13.2761 4.72386 13.5 5 13.5H18C18.8284 13.5 19.5 12.8284 19.5 12V6C19.5 5.72386 19.2761 5.5 19 5.5C18.7239 5.5 18.5 5.72386 18.5 6V12C18.5 12.2761 18.2761 12.5 18 12.5H5C4.72386 12.5 4.5 12.7239 4.5 13Z"
  />
</IconWrapper>
