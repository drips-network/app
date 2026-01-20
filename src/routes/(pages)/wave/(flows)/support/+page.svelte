<script>
  import FlowStepWrapper from '../shared/flow-step-wrapper.svelte';
  import HelpEmoji from '$lib/components/icons/👪.svelte';
  import Button from '$lib/components/button/button.svelte';
  import OrDivider from '$lib/components/rpgf-results-card/components/or-divider.svelte';
  import Discord from '$lib/components/icons/Discord.svelte';
  import Envelope from '$lib/components/icons/Envelope.svelte';
  import { show } from '@intercom/messenger-js-sdk';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';

  function handleOpenIntercom() {
    show();
  }
</script>

<HeadMeta title="Support | Wave" description="Get help and support for Drips Wave." />

<FlowStepWrapper
  icon={HelpEmoji}
  headline="Drips Wave Support"
  description="If you have any questions or need assistance, please reach out to our support team. We're here to help!"
>
  <div style:max-width="32rem" style:margin="0 auto">
    <AnnotationBox type="info" centered>
      <span class="typo-text-small-bold"
        >We do our best to respond to all requests as quickly as possible.</span
      > Nevertheless, please allow up to two business days for a response.
    </AnnotationBox>
  </div>

  <div class="support-option">
    <h3>Chat</h3>
    <p>
      Reach out through the chat widget for a direct line to the Drips team. Please make sure you're
      logged in with the account relevant to your request.
    </p>

    <div class="action">
      <Button icon={Envelope} variant="primary" size="large" onclick={handleOpenIntercom}
        >Open Chat</Button
      >
    </div>
  </div>

  <OrDivider />

  <div class="support-option">
    <h3>Community</h3>
    <p>Join the Drips Discord and hit the #wave channel for any general questions.</p>

    <div class="action">
      <Button icon={Discord} variant="primary" size="large" href="https://discord.gg/t8XBXZAEs5"
        >Open Discord</Button
      >
    </div>
  </div>

  <OrDivider />

  <div class="support-option">
    <h3>Email</h3>
    <p>
      If you're old-school like that, you can email us at <a
        class="typo-link"
        href="mailto:support@drips.network">support@drips.network</a
      >.
    </p>
  </div>
</FlowStepWrapper>

<style>
  .support-option {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .action {
    display: flex;
    flex-direction: column;
    max-width: 13rem;
    width: 100%;
    margin: 0 auto;
  }
</style>
