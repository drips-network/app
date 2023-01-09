<!-- prettier-ignore -->
<code class="typo-mono-bold">
<span class="comment">// Create a new sub-account and transfer it to the connected user.</span>
const <span class="name">subAccountId</span> = <span class="await">await</span> <span class="name">nftDriverClient</span>.<span class="function">safeCreateAccount</span>(<span class="name">nftDriverClient.signerAddress</span>);

<span class="comment">// Configure sub-account to drip some DAI.</span>
const <span class="name">setDripsTx</span> = <span class="await">await</span> <span class="name">nftDriverClient</span>.<span class="function">setDrips</span>(
    <span class="name">subAccountId</span>,
    <span class="name">daiTokenAddress</span>,
    <span class="name">currentReceivers</span>,
    <span class="name">newReceivers</span>,
    <span class="name">transferToAddress</span>,
    <span class="name">topUpAmount</span>,
);
await <span class="name">setDripsTx</span>.<span class="name">wait</span>();

// Configure sub-account to split incoming funds.
const <span class="name">setSplitsTx</span> = <span class="await">await</span> <span class="name">nftDriverClient</span>.<span class="function">setSplits</span>(<span class="name">subAccountId</span>, <span class="name">splitsReceivers</span>);
await <span class="name">setSplitsTx</span>.<span class="name">wait</span>();
</code>

<style>
  code {
    text-align: left;
    white-space: pre;
    color: var(--color-foreground-level-5);
  }

  code > .name {
    color: #42b3ff;
  }

  code > .comment {
    color: var(--color-foreground-level-4);
  }

  code > .await {
    color: #b76fb3;
  }

  code > .function {
    color: #d3d499;
  }
</style>
