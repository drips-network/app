<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import { Utils, constants } from 'radicle-drips';

  let streamConfigValue = '';
  let tokenAddresssValue = '';

  $: token = tokensStore.getByAddress(tokenAddresssValue);

  const decode = Utils.StreamConfiguration.fromUint256;

  let decoded: ReturnType<typeof decode> | undefined;

  $: {
    try {
      decoded = decode(streamConfigValue);
    } catch (e) {
      decoded = undefined;
    }
  }
</script>

<div class="utils">
  <h1>Drips Utils</h1>
  <div class="section">
    <h3>Decode Drips Config</h3>
    <p>
      The Drips Config is a string used in setStreams transactions that encodes the stream rate,
      start date and duration, as well as the unique drips stream ID. Paste one below alongside the
      token address that this particular stream will stream to decode it into its parts.
    </p>
    <FormField title="Token Address">
      <TextInput placeholder="Paste token address here" bind:value={tokenAddresssValue} />
    </FormField>
    <FormField title="Drips Config">
      <TextInput placeholder="Paste config here" bind:value={streamConfigValue} />
    </FormField>
    {#if decoded && token}
      <div class="result">
        <h4>Result</h4>
        <p>
          Stream Rate (wei / sec including extra {constants.AMT_PER_SEC_EXTRA_DECIMALS} decimals of precision):
          <span class="typo-text tabular-nums">{decoded?.amountPerSec}</span>
        </p>
        <p class="indented">
          Approx. Stream Rate ({token.info.symbol} / sec):
          <span class="typo-text tabular-nums"
            >{decoded
              ? formatTokenAmount(decoded.amountPerSec, token.info.decimals)
              : undefined}</span
          >
        </p>
        <p class="indented">
          Approx. Stream Rate ({token.info.symbol} / day):
          <span class="typo-text tabular-nums"
            >{decoded
              ? formatTokenAmount(decoded.amountPerSec * 86400n, token.info.decimals)
              : undefined}</span
          >
        </p>
        <p>Start Date: <span class="typo-text tabular-nums">{decoded?.start}</span></p>
        <p>Duration seconds: <span class="typo-text tabular-nums">{decoded?.duration}</span></p>
        <p>Stream ID: <span class="typo-text tabular-nums">{decoded?.dripId}</span></p>
      </div>
    {/if}
  </div>
</div>

<style>
  .utils {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .indented {
    margin-left: 2rem;
  }
</style>
