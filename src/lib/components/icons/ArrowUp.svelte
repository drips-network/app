<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M11.6464 4.64645C11.8417 4.45118 12.1583 4.45118 12.3536 4.64645L17.3536 9.64645C17.5488 9.84171 17.5488 10.1583 17.3536 10.3536C17.1583 10.5488 16.8417 10.5488 16.6464 10.3536L12 5.70711L7.35355 10.3536C7.15829 10.5488 6.84171 10.5488 6.64645 10.3536C6.45118 10.1583 6.45118 9.84171 6.64645 9.64645L11.6464 4.64645Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M12 4.5C12.2761 4.5 12.5 4.72386 12.5 5V19C12.5 19.2761 12.2761 19.5 12 19.5C11.7239 19.5 11.5 19.2761 11.5 19V5C11.5 4.72386 11.7239 4.5 12 4.5Z"
  />
</IconWrapper>
