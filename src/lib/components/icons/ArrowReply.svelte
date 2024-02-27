<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M4.64645 10.6464C4.45118 10.8417 4.45118 11.1583 4.64645 11.3536L9.64645 16.3536C9.84171 16.5488 10.1583 16.5488 10.3536 16.3536C10.5488 16.1583 10.5488 15.8417 10.3536 15.6464L5.70711 11L10.3536 6.35355C10.5488 6.15829 10.5488 5.84171 10.3536 5.64645C10.1583 5.45118 9.84171 5.45118 9.64645 5.64645L4.64645 10.6464Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M4.5 11C4.5 10.7239 4.72386 10.5 5 10.5H18C18.8284 10.5 19.5 11.1716 19.5 12V18C19.5 18.2761 19.2761 18.5 19 18.5C18.7239 18.5 18.5 18.2761 18.5 18V12C18.5 11.7239 18.2761 11.5 18 11.5H5C4.72386 11.5 4.5 11.2761 4.5 11Z"
  />
</IconWrapper>
