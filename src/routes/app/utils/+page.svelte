<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import { Utils, constants } from 'radicle-drips';

  let dripsConfigValue = '';

  const decode = Utils.DripsReceiverConfiguration.fromUint256;

  let decoded: ReturnType<typeof decode> | undefined;

  $: {
    try {
      decoded = decode(dripsConfigValue);
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
      The Drips Config is a string used in setDrips transactions that encodes the stream rate, start
      date and duration, as well as the unique drips stream ID. Paste one below to decode it into
      its parts.
    </p>
    <FormField title="Drips Config">
      <TextInput placeholder="Paste config here" bind:value={dripsConfigValue} />
    </FormField>
    <div class="result">
      <h4>Result</h4>
      <p>
        Stream Rate (wei / sec including extra {constants.AMT_PER_SEC_EXTRA_DECIMALS} decimals of precision):
        <span class="typo-text-mono">{decoded?.amountPerSec}</span>
      </p>
      <p class="indented">
        Approx. Stream Rate (wei / sec): <span class="typo-text-mono"
          >{decoded
            ? decoded.amountPerSec / BigInt(constants.AMT_PER_SEC_MULTIPLIER)
            : undefined}</span
        >
      </p>
      <p class="indented">
        Approx. Stream Rate (wei / day): <span class="typo-text-mono"
          >{decoded
            ? (decoded.amountPerSec * 86400n) / BigInt(constants.AMT_PER_SEC_MULTIPLIER)
            : undefined}</span
        >
      </p>
      <p>Start Date: <span class="typo-text-mono">{decoded?.start}</span></p>
      <p>Duration seconds: <span class="typo-text-mono">{decoded?.duration}</span></p>
      <p>Stream ID: <span class="typo-text-mono">{decoded?.dripId}</span></p>
    </div>
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
