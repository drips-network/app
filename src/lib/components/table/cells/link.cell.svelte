<script lang="ts">
  interface Props {
    href: string;
  }

  let { href }: Props = $props();
</script>

<a {href} class="typo-link" target="_blank" rel="noopener noreferrer">
  {href}
</a>
