<script>
  import Badge from './badge.svelte'

  export let data;
</script>

<div>
  Hello World {data}
  <Badge data={data.badgeData} options={data.badgeOptions}/>
</div>
