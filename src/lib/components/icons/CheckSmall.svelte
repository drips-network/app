<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M16.2481 8.56587C16.4878 8.70288 16.5711 9.0083 16.4341 9.24806L13.0837 15.1113C12.593 15.9701 11.42 16.1271 10.7207 15.4278L8.64645 13.3535C8.45118 13.1583 8.45118 12.8417 8.64645 12.6464C8.84171 12.4512 9.15829 12.4512 9.35355 12.6464L11.4278 14.7207C11.6609 14.9538 12.0519 14.9014 12.2154 14.6152L15.5659 8.75192C15.7029 8.51217 16.0083 8.42887 16.2481 8.56587Z"
  />
</IconWrapper>
