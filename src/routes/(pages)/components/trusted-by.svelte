<script lang="ts">
  const imageUrls = [
    '/partner-logos/ef.png',
    '/partner-logos/ens.png',
    '/partner-logos/ftc.png',
    '/partner-logos/octant.png',
    '/partner-logos/scroll.png',
    '/partner-logos/protocol-labs.png',
    '/partner-logos/radworks.png',
  ]

  const imageElems: HTMLImageElement[] = [];4
  let loadedIndexes = [];

  function handleImageLoad(index: number) {
    loadedIndexes.push(index);
  }
</script>

<div class="trusted-by">
  <h5>Trusted by</h5>
  <div class="logos">
    {#each imageUrls as imageUrl, i}
      <img on:load={() => handleImageLoad(i)} bind:this={imageElems[i]} src={imageUrl} alt="Partner logo" />
    {/each}
  </div>
</div>

<style>
  .logos {
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin-top: 1rem;
  }

  .logos img {
    height: 2rem;
    width: auto;
  }
</style>
