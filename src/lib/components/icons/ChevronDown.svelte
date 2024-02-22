<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M16.3536 9.64645C16.5488 9.84171 16.5488 10.1583 16.3536 10.3536L13.0607 13.6464C12.4749 14.2322 11.5251 14.2322 10.9393 13.6464L7.64645 10.3536C7.45118 10.1583 7.45118 9.84171 7.64645 9.64645C7.84171 9.45118 8.15829 9.45118 8.35355 9.64645L11.6464 12.9393C11.8417 13.1346 12.1583 13.1346 12.3536 12.9393L15.6464 9.64645C15.8417 9.45118 16.1583 9.45118 16.3536 9.64645Z"
  />
</IconWrapper>
