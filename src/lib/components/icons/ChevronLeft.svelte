<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M14.3536 16.3536C14.1583 16.5488 13.8417 16.5488 13.6464 16.3536L10.3536 13.0607C9.76777 12.4749 9.76777 11.5251 10.3536 10.9393L13.6464 7.64645C13.8417 7.45118 14.1583 7.45118 14.3536 7.64645C14.5488 7.84171 14.5488 8.15829 14.3536 8.35355L11.0607 11.6464C10.8654 11.8417 10.8654 12.1583 11.0607 12.3536L14.3536 15.6464C14.5488 15.8417 14.5488 16.1583 14.3536 16.3536Z"
  />
</IconWrapper>
