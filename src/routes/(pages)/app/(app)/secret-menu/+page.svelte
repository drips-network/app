<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import network from '$lib/stores/wallet/network';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import { repoDriverAbi } from '$lib/utils/sdk/repo-driver/repo-driver-abi';
  import contractConstants from '$lib/utils/sdk/utils/contract-constants';
  import { streamConfigFromUint256 } from '$lib/utils/sdk/utils/stream-config-utils';
  import { ethers, toBigInt } from 'ethers';
  import assert from '$lib/utils/assert';

  // Update owner

  let projectGitHubUrl = '';

  // must be a valid URL on host github.com and path /<owner>/<repo>
  $: projectGitHubUrlValid = projectGitHubUrl.match(/^https:\/\/github\.com\/[^/]+\/[^/]+$/);

  let txInProgress = false;
  async function requestUpdateOwner(gitHubUrl: string) {
    if (txInProgress) return;

    const { signer } = $walletStore;
    assert(signer);

    const contract = new ethers.Contract(network.contracts.REPO_DRIVER, repoDriverAbi, signer);

    // Format is `ownerName/repoName`
    const repoName = gitHubUrl.split('/').slice(-2).join('/');

    txInProgress = true;

    try {
      const tx = await contract.requestUpdateOwner(0, ethers.hexlify(ethers.toUtf8Bytes(repoName)));
      await tx.wait();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      txInProgress = false;
    }
  }

  // Stream config decoder

  let streamConfigValue = '';
  let tokenAddresssValue = '';

  $: token = tokensStore.getByAddress(tokenAddresssValue);

  const decode = streamConfigFromUint256;

  let decoded: ReturnType<typeof decode> | undefined;

  $: {
    try {
      decoded = decode(toBigInt(streamConfigValue));
    } catch {
      decoded = undefined;
    }
  }
</script>

<div class="utils">
  <div>
    <h1>Drips Secret Menu</h1>
    <p>A collection of various advanced utilities and functions for Drips.</p>
  </div>
  <div class="section">
    <h3>Request project owner update</h3>
    <p>
      Initiate a transaction that calls requestUpdateOwner on Drips' RepoDriver contract. This will
      result in the project's owner on-chain being updated to the address set for the current chain
      in the GitHub repo's FUNDING.json file. <a
        class="typo-link"
        href="https://docs.drips.network/get-support/advanced/updating-project-owner"
        target="_blank">Learn more</a
      >
    </p>
    <AnnotationBox type="warning">
      Before requesting an owner update, ensure a valid Ethereum address is set on the repo's
      FUNDING.json file for the "{network.name === 'homestead' ? 'ethereum' : network.name}" chain.
      You'll need to connect a wallet before proceeding.
    </AnnotationBox>
    <FormField
      title="Project GitHub URL"
      description="Important: Case-sensitive, and must match the casing on GitHub. Navigate to the repo on GitHub and copy the URL 1:1."
    >
      <TextInput bind:value={projectGitHubUrl} placeholder="GitHub repo URL" />
    </FormField>
    <div>
      <Button
        on:click={() => requestUpdateOwner(projectGitHubUrl)}
        disabled={!projectGitHubUrlValid || !$walletStore.connected}
        icon={Wallet}
        variant="primary">Request owner update</Button
      >
    </div>
  </div>
  <div class="section">
    <h3>Decode stream config</h3>
    <p>
      The stream config is a string used in setStreams transactions that encodes the stream rate,
      start date and duration, as well as the unique drips stream ID. Paste one below alongside the
      token address that this particular stream will stream to decode it into its parts.
    </p>
    <FormField title="Token address">
      <TextInput placeholder="Paste token address here" bind:value={tokenAddresssValue} />
    </FormField>
    <FormField title="Stream config">
      <TextInput placeholder="Paste config here" bind:value={streamConfigValue} />
    </FormField>
    {#if decoded && token}
      <div class="result">
        <h4>Result</h4>
        <p>
          Stream Rate (wei / sec including extra {contractConstants.AMT_PER_SEC_EXTRA_DECIMALS} decimals
          of precision):
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
