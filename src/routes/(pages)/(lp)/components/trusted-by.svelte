<script>
  import Ens from './svgs/partner-logos/ens.svelte';
  import EthereumFoundation from './svgs/partner-logos/ethereum-foundation.svelte';
  import FilecoinFoundation from './svgs/partner-logos/filecoin-foundation.svelte';
  import FundingTheCommons from './svgs/partner-logos/funding-the-commons.svelte';
  import Octant from './svgs/partner-logos/octant.svelte';
  import Radworks from './svgs/partner-logos/radworks.svelte';
  import Scroll from './svgs/partner-logos/scroll.svelte';

  export let headline = 'Trusted by';
</script>

<div class="trusted-by">
  <h5>{headline}</h5>
  <div class="logos">
    <div class="image"><Ens /></div>
    <div class="image"><FilecoinFoundation /></div>
    <div class="image"><Scroll /></div>
    <div class="image"><Octant /></div>
    <div class="image"><FundingTheCommons /></div>
    <div class="image"><Radworks /></div>
    <div class="image"><EthereumFoundation /></div>
  </div>
</div>

<style>
  .trusted-by,
  .trusted-by h5 {
    text-align: center;
  }

  .logos {
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin-top: 1rem;
    flex-wrap: wrap;
    padding: 0 1rem;
  }

  .logos .image {
    height: 1.5rem;
    width: auto;
    max-width: 6.5rem;
  }
</style>
