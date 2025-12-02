<script lang="ts">
  interface Props {
    numDependencies: number;
  }

  let { numDependencies }: Props = $props();
</script>

<div class="ecosystem-distribution-dependencies">
  {numDependencies}
</div>
