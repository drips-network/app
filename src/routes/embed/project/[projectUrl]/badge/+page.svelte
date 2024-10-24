<script>
  import Badge from './badge.svelte'

  export let data;
</script>

<Badge data={data.badgeData} options={data.badgeOptions}/>
