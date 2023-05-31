<script>
  import CodeBox from '$lib/components/code-box/code-box.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import unreachable from '$lib/utils/unreachable';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import dripsJsonTemplate from './drips-json-template';
</script>

<StandaloneFlowStepLayout
  description="To verify you are the owner of this project, please add a drips.json file with your Ethereum address to the root of your code repo. "
>
  <CodeBox path="./drips.json" code={dripsJsonTemplate($walletStore.address ?? unreachable())} />
</StandaloneFlowStepLayout>
