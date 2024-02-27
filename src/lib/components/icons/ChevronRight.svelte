<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M9.64645 7.64645C9.84171 7.45118 10.1583 7.45118 10.3536 7.64645L13.6464 10.9393C14.2322 11.5251 14.2322 12.4749 13.6464 13.0607L10.3536 16.3536C10.1583 16.5488 9.84171 16.5488 9.64645 16.3536C9.45118 16.1583 9.45118 15.8417 9.64645 15.6464L12.9393 12.3536C13.1346 12.1583 13.1346 11.8417 12.9393 11.6464L9.64645 8.35355C9.45118 8.15829 9.45118 7.84171 9.64645 7.64645Z"
  />
</IconWrapper>
