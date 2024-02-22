<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M7.64645 14.3536C7.45118 14.1583 7.45118 13.8417 7.64645 13.6464L10.9393 10.3536C11.5251 9.76777 12.4749 9.76777 13.0607 10.3536L16.3536 13.6464C16.5488 13.8417 16.5488 14.1583 16.3536 14.3536C16.1583 14.5488 15.8417 14.5488 15.6464 14.3536L12.3536 11.0607C12.1583 10.8654 11.8417 10.8654 11.6464 11.0607L8.35355 14.3536C8.15829 14.5488 7.84171 14.5488 7.64645 14.3536Z"
  />
</IconWrapper>
