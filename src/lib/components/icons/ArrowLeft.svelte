<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M4.64645 12.3536C4.45118 12.1583 4.45118 11.8417 4.64645 11.6464L9.64645 6.64645C9.84171 6.45118 10.1583 6.45118 10.3536 6.64645C10.5488 6.84171 10.5488 7.15829 10.3536 7.35355L5.70711 12L10.3536 16.6464C10.5488 16.8417 10.5488 17.1583 10.3536 17.3536C10.1583 17.5488 9.84171 17.5488 9.64645 17.3536L4.64645 12.3536Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M4.5 12C4.5 11.7239 4.72386 11.5 5 11.5L19 11.5C19.2761 11.5 19.5 11.7239 19.5 12C19.5 12.2761 19.2761 12.5 19 12.5L5 12.5C4.72386 12.5 4.5 12.2761 4.5 12Z"
  />
</IconWrapper>
