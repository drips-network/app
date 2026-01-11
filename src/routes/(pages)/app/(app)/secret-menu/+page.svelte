<script lang="ts">
  import { run } from 'svelte/legacy';

  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import network from '$lib/stores/wallet/network';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import { repoDriverAbi } from '$lib/utils/sdk/repo-driver/repo-driver-abi';
  import { callerAbi } from '$lib/utils/sdk/caller/caller-abi';
  import { addressDriverAbi } from '$lib/utils/sdk/address-driver/address-driver-abi';
  import contractConstants from '$lib/utils/sdk/utils/contract-constants';
  import { streamConfigFromUint256 } from '$lib/utils/sdk/utils/stream-config-utils';
  import makeStreamId from '$lib/utils/streams/make-stream-id';
  import { addressDriverAccountMetadataParser } from '$lib/utils/metadata/schemas';
  import { fetchIpfs } from '$lib/utils/ipfs';
  import {
    Interface,
    decodeBytes32String,
    ethers,
    isHexString,
    toBigInt,
    toUtf8String,
  } from 'ethers';
  import assert from '$lib/utils/assert';

  // Update owner

  let projectGitHubUrl = $state('');

  // must be a valid URL on host github.com and path /<owner>/<repo>
  let projectGitHubUrlValid = $derived(
    projectGitHubUrl.match(/^https:\/\/github\.com\/[^/]+\/[^/]+$/),
  );

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

  let streamConfigValue = $state('');
  let tokenAddresssValue = $state('');

  let token = $derived(tokensStore.getByAddress(tokenAddresssValue));

  const decode = streamConfigFromUint256;

  let decoded: ReturnType<typeof decode> | undefined = $state();

  run(() => {
    try {
      decoded = decode(toBigInt(streamConfigValue));
    } catch {
      decoded = undefined;
    }
  });

  // Calldata decoder

  type StreamChange = {
    streamId: string;
    displayId: string;
    receiverAccountId: string;
    receiverDriver: 'address' | 'nft' | 'repo';
    amountPerSecond: bigint;
    start: number;
    duration: number;
    tokenAddress: string;
    name?: string;
    description?: string;
    link?: string;
  };

  type TopUpResult = {
    type: 'topUp';
    tokenAddress: string;
    balanceDelta: bigint;
  };

  type StreamEditResult = {
    type: 'streamEdit';
    tokenAddress: string;
    accountId: string;
    metadataHash?: string;
    newStreams: StreamChange[];
    editedStreams: StreamChange[];
    deletedStreams: StreamChange[];
  };

  type DecodeResult = TopUpResult | StreamEditResult;

  let calldataValue = $state('');
  let decoding = $state(false);
  let decodeError: string | undefined = $state();
  let decodeResult: DecodeResult | undefined = $state();

  const callerInterface = new Interface(callerAbi);
  const addressDriverInterface = new Interface(addressDriverAbi);

  function streamsEqual(
    a: { accountId: bigint; config: bigint }[],
    b: { accountId: bigint; config: bigint }[],
  ) {
    if (a.length !== b.length) return false;

    return a.every((item, i) => item.accountId === b[i].accountId && item.config === b[i].config);
  }

  function parseReceivers(
    receivers: { accountId: bigint; config: bigint }[],
    tokenAddress: string,
    senderAccountId: string,
  ) {
    return receivers.map((receiver) => {
      const cfg = streamConfigFromUint256(receiver.config);
      const streamId = makeStreamId(
        senderAccountId,
        tokenAddress.toLowerCase(),
        cfg.dripId.toString(),
      );

      return {
        key: `${receiver.accountId.toString()}-${cfg.dripId.toString()}`,
        streamId,
        displayId: cfg.dripId.toString(),
        receiverAccountId: receiver.accountId.toString(),
        config: cfg,
        raw: receiver.config,
      };
    });
  }

  function formatAmountPerSecond(amount: bigint, tokenAddress: string) {
    const tokenInfo = tokensStore.getByAddress(tokenAddress)?.info;

    if (!tokenInfo) return `${amount.toString()} wei/sec`;

    return `${formatTokenAmount(amount, tokenInfo.decimals)} ${tokenInfo.symbol}/sec`;
  }

  function formatTokenAmountFriendly(amount: bigint, tokenAddress: string) {
    const tokenInfo = tokensStore.getByAddress(tokenAddress)?.info;

    if (!tokenInfo) return `${amount.toString()} wei`;

    return `${formatTokenAmount(amount, tokenInfo.decimals)} ${tokenInfo.symbol}`;
  }

  function formatTokenLabel(tokenAddress: string) {
    const tokenInfo = tokensStore.getByAddress(tokenAddress)?.info;

    if (!tokenInfo) return tokenAddress;

    return `${tokenInfo.symbol} (${tokenInfo.name}) — ${tokenAddress}`;
  }

  function receiverLink(driver: StreamChange['receiverDriver'], accountId: string) {
    switch (driver) {
      case 'address':
        return `/app/${accountId}`;
      case 'nft':
        return `/app/drip-lists/${accountId}`;
      case 'repo':
        return `/app/projects/${accountId}`;
      default:
        return undefined;
    }
  }

  async function decodeCalldata() {
    decodeError = undefined;
    decodeResult = undefined;

    const raw = calldataValue.trim();

    if (!raw) {
      decodeError = 'Paste calldata to decode.';
      return;
    }

    if (!isHexString(raw)) {
      decodeError = 'Calldata must be a hex string (0x...)';
      return;
    }

    decoding = true;

    try {
      // First, attempt to decode a caller.callBatched payload.
      try {
        const [calls] = callerInterface.parseTransaction({ data: raw })?.args as unknown as [
          { target: string; data: string; value: bigint }[],
        ];

        const setStreamsCall = calls.find((call) => {
          try {
            addressDriverInterface.decodeFunctionData('setStreams', call.data);
            return true;
          } catch (e) {
            if (e instanceof Error && !e.message.includes('data size mismatch')) return false;
            return false;
          }
        });

        const metadataCall = calls.find((call) => {
          try {
            addressDriverInterface.decodeFunctionData('emitAccountMetadata', call.data);
            return true;
          } catch (e) {
            if (e instanceof Error && !e.message.includes('data size mismatch')) return false;
            return false;
          }
        });

        if (setStreamsCall && metadataCall) {
          const streamEditResult = await decodeStreamEdit(setStreamsCall.data, metadataCall.data);

          if (streamEditResult) {
            decodeResult = streamEditResult;
            return;
          }
        }
      } catch {
        // Not a callBatched payload – continue trying direct setStreams.
      }

      // Fallback: maybe this is a direct setStreams top-up.
      const topUp = decodeTopUp(raw);
      if (topUp) {
        decodeResult = topUp;
        return;
      }

      decodeError = 'Unsupported or unrecognized calldata for this decoder.';
    } catch (err) {
      decodeError = err instanceof Error ? err.message : 'Failed to decode calldata';
    } finally {
      decoding = false;
    }
  }

  function decodeTopUp(data: string): TopUpResult | undefined {
    try {
      const [tokenAddress, currReceivers, balanceDelta, newReceivers] =
        addressDriverInterface.decodeFunctionData('setStreams', data) as unknown as [
          string,
          { accountId: bigint; config: bigint }[],
          bigint,
          { accountId: bigint; config: bigint }[],
        ];

      if (!streamsEqual(currReceivers, newReceivers)) return undefined;
      if (balanceDelta === 0n) return undefined;

      return {
        type: 'topUp',
        tokenAddress,
        balanceDelta,
      };
    } catch {
      return undefined;
    }
  }

  async function decodeStreamEdit(
    setStreamsData: string,
    metadataData: string,
  ): Promise<StreamEditResult | undefined> {
    try {
      const [tokenAddress, currReceivers, balanceDelta, newReceivers] =
        addressDriverInterface.decodeFunctionData('setStreams', setStreamsData) as unknown as [
          string,
          { accountId: bigint; config: bigint }[],
          bigint,
          { accountId: bigint; config: bigint }[],
        ];

      if (balanceDelta !== 0n) return undefined;

      const ipfsHash = extractIpfsHashFromMetadata(metadataData);
      if (!ipfsHash) return undefined;

      const meta = await fetchAndParseMetadata(ipfsHash);
      if (!meta) return undefined;

      const senderAccountId = meta.describes.accountId;

      const parsedCurr = parseReceivers(currReceivers, tokenAddress, senderAccountId);
      const parsedNew = parseReceivers(newReceivers, tokenAddress, senderAccountId);

      const currentMap = new Map(parsedCurr.map((r) => [r.key, r]));
      const newMap = new Map(parsedNew.map((r) => [r.key, r]));

      const newStreams: StreamChange[] = [];
      const editedStreams: StreamChange[] = [];
      const deletedStreams: StreamChange[] = [];

      for (const [key, receiver] of newMap.entries()) {
        const metaInfo = meta.streamIndex.get(receiver.streamId);
        const base: Omit<StreamChange, 'amountPerSecond' | 'start' | 'duration'> = {
          streamId: receiver.streamId,
          displayId: receiver.displayId,
          receiverAccountId: metaInfo?.receiver.accountId ?? receiver.receiverAccountId,
          receiverDriver: metaInfo?.receiver.driver ?? 'address',
          name: metaInfo?.name,
          description: metaInfo?.description,
          tokenAddress,
          link: metaInfo
            ? receiverLink(metaInfo.receiver.driver, metaInfo.receiver.accountId)
            : undefined,
        };

        if (!currentMap.has(key)) {
          newStreams.push({
            ...base,
            amountPerSecond: receiver.config.amountPerSec,
            start: Number(receiver.config.start),
            duration: Number(receiver.config.duration),
          });
          continue;
        }

        const previous = currentMap.get(key)!;
        if (previous.raw !== receiver.raw) {
          editedStreams.push({
            ...base,
            amountPerSecond: receiver.config.amountPerSec,
            start: Number(receiver.config.start),
            duration: Number(receiver.config.duration),
          });
        }
      }

      for (const [key, receiver] of currentMap.entries()) {
        if (newMap.has(key)) continue;

        const metaInfo = meta.streamIndex.get(receiver.streamId);
        deletedStreams.push({
          streamId: receiver.streamId,
          displayId: receiver.displayId,
          receiverAccountId: metaInfo?.receiver.accountId ?? receiver.receiverAccountId,
          receiverDriver: metaInfo?.receiver.driver ?? 'address',
          name: metaInfo?.name,
          description: metaInfo?.description,
          tokenAddress,
          amountPerSecond: receiver.config.amountPerSec,
          start: Number(receiver.config.start),
          duration: Number(receiver.config.duration),
          link: metaInfo
            ? receiverLink(metaInfo.receiver.driver, metaInfo.receiver.accountId)
            : undefined,
        });
      }

      if (!newStreams.length && !editedStreams.length && !deletedStreams.length) return undefined;

      return {
        type: 'streamEdit',
        tokenAddress,
        accountId: senderAccountId,
        metadataHash: ipfsHash,
        newStreams,
        editedStreams,
        deletedStreams,
      };
    } catch {
      return undefined;
    }
  }

  function extractIpfsHashFromMetadata(metadataData: string) {
    try {
      const [metadataEntries] = addressDriverInterface.decodeFunctionData(
        'emitAccountMetadata',
        metadataData,
      ) as unknown as [{ key: string; value: string }[]];

      const ipfsEntry = metadataEntries.find((entry) => {
        try {
          return decodeBytes32String(entry.key) === 'ipfs';
        } catch {
          return false;
        }
      });

      if (!ipfsEntry) return undefined;

      return toUtf8String(ipfsEntry.value);
    } catch {
      return undefined;
    }
  }

  async function fetchAndParseMetadata(ipfsHash: string) {
    const res = await fetchIpfs(ipfsHash);
    if (!res.ok) return undefined;

    const json = await res.json();
    const parsed = addressDriverAccountMetadataParser.parseLatest(json);

    const streamIndex = new Map(
      parsed.assetConfigs.flatMap((asset) =>
        asset.streams.map((stream) => [stream.id, { ...stream, tokenAddress: asset.tokenAddress }]),
      ),
    );

    return { ...parsed, streamIndex };
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
        onclick={() => requestUpdateOwner(projectGitHubUrl)}
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
  <div class="section">
    <h3>Decode transaction calldata</h3>
    <p>
      Paste the calldata from a transaction created by this app to see a human-friendly breakdown.
      Supported: (1) top ups via <code>setStreams</code> (no receiver changes) and (2) stream edits
      submitted through <code>callBatched</code> that pair a <code>setStreams</code> call with an accompanying
      metadata update.
    </p>

    <AnnotationBox type="warning">
      This tool is purely for informational and debugging purposes. Always double-check decoded
      results before acting on them.
    </AnnotationBox>

    <FormField title="Calldata">
      <TextArea bind:value={calldataValue} placeholder="0x..." resizable={true} />
    </FormField>
    <div class="actions">
      <Button onclick={decodeCalldata} disabled={decoding} variant="primary">
        {decoding ? 'Decoding…' : 'Decode'}
      </Button>
    </div>

    {#if decodeError}
      <AnnotationBox type="warning">{decodeError}</AnnotationBox>
    {/if}

    {#if decodeResult?.type === 'topUp'}
      <div class="result">
        <h4>Transaction type: Top-Up</h4>
        <p>
          Token: <span class="typo-text">{formatTokenLabel(decodeResult.tokenAddress)}</span>
        </p>
        <p>
          Top up amount: <span class="typo-text tabular-nums"
            >{formatTokenAmountFriendly(decodeResult.balanceDelta, decodeResult.tokenAddress)}</span
          >
        </p>
        <p class="muted">
          Raw amount (wei): <span class="typo-text tabular-nums"
            >{decodeResult.balanceDelta.toString()}</span
          >
        </p>
      </div>
    {:else if decodeResult?.type === 'streamEdit'}
      <div class="result">
        <h4>Transaction type: Stream configuration edit</h4>
        <p>
          Sender account ID: <span class="typo-text">{decodeResult.accountId}</span>
        </p>
        <p>
          Token: <span class="typo-text">{formatTokenLabel(decodeResult.tokenAddress)}</span>
        </p>
        {#if decodeResult.metadataHash}
          <p>
            Metadata: <a
              class="typo-link"
              href={`https://drips.mypinata.cloud/ipfs/${decodeResult.metadataHash}`}
              target="_blank">{decodeResult.metadataHash}</a
            >
          </p>
        {/if}

        {#each [{ title: '➕ New streams', items: decodeResult.newStreams, emptyText: 'No new streams in this batch.' }, { title: '✍️ Edited streams', items: decodeResult.editedStreams, emptyText: 'No edits in this batch.' }, { title: '🗑️ Deleted streams', items: decodeResult.deletedStreams, emptyText: 'No deletions in this batch.' }] as group (group.title)}
          <div class="stream-section">
            <div class="stream-section-header">
              <h5>{group.title}</h5>
              <span class="muted"
                >{group.items.length} item{group.items.length === 1 ? '' : 's'}</span
              >
            </div>

            {#if group.items.length === 0}
              <div class="empty-box">{group.emptyText}</div>
            {:else}
              <div class="stream-list">
                {#each group.items as stream (stream.streamId)}
                  <div class="stream-card">
                    <div class="stream-heading">
                      <div class="typo-text tabular-nums label-pill">
                        Stream #{stream.displayId}
                      </div>
                      <div class="typo-text">
                        {formatAmountPerSecond(stream.amountPerSecond, stream.tokenAddress)}
                      </div>
                    </div>
                    <div class="stream-meta">
                      <span class="muted">Receiver:</span>
                      {#if stream.link}
                        <a class="typo-link" href={stream.link} target="_blank"
                          >{stream.receiverAccountId}</a
                        >
                      {:else}
                        <span>{stream.receiverAccountId}</span>
                      {/if}
                      <span class="muted">Driver:</span>
                      <span>{stream.receiverDriver}</span>
                    </div>
                    <div class="stream-meta">
                      <span class="muted">Start:</span>
                      <span
                        >{stream.start
                          ? new Date(stream.start * 1000).toLocaleString()
                          : 'Immediate'}</span
                      >
                      <span class="muted">Duration:</span>
                      <span>{stream.duration ? `${stream.duration} sec` : 'Indefinite'}</span>
                    </div>
                    {#if stream.name}
                      <div class="stream-meta">
                        <span class="muted">Name:</span>
                        <span>{stream.name}</span>
                      </div>
                    {/if}
                    {#if stream.description}
                      <p class="muted">{stream.description}</p>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
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

  .actions {
    display: flex;
    gap: 0.75rem;
  }

  .stream-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 0.5rem 0 1.5rem 0;
  }

  .stream-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .stream-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .empty-box {
    border: 1px dashed var(--theme-border-subtle);
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--theme-text-soft);
    background: var(--theme-surface-raised);
  }

  .stream-card {
    border-radius: 1rem 0 1rem 1rem;
    padding: 0.75rem 1rem;
    background: var(--theme-surface-raised);
    border: 1px solid var(--color-foreground-level-3);
  }

  .stream-heading {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.35rem;
  }

  .stream-meta {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-size: 0.9rem;
  }

  .muted {
    color: var(--theme-text-soft);
  }

  .label-pill {
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    background: var(--color-foreground-level-2);
  }
</style>
