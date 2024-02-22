<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M12.3536 19.3536C12.1583 19.5488 11.8417 19.5488 11.6464 19.3536L6.64645 14.3536C6.45118 14.1583 6.45118 13.8417 6.64645 13.6464C6.84171 13.4512 7.15829 13.4512 7.35355 13.6464L12 18.2929L16.6464 13.6464C16.8417 13.4512 17.1583 13.4512 17.3536 13.6464C17.5488 13.8417 17.5488 14.1583 17.3536 14.3536L12.3536 19.3536Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M12 19.5C11.7239 19.5 11.5 19.2761 11.5 19L11.5 5C11.5 4.72386 11.7239 4.5 12 4.5C12.2761 4.5 12.5 4.72386 12.5 5L12.5 19C12.5 19.2761 12.2761 19.5 12 19.5Z"
  />
</IconWrapper>
