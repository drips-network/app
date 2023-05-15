<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AccountBox from '../configure-support/components/account-box.svelte';
</script>

<StandaloneFlowStepLayout
  headline="Review"
  subtitle="Review your new Drip List, monthly support, and initial top-up amount."
>
  <FormField type="div" title="Wallet">
    <AccountBox />
  </FormField>
</StandaloneFlowStepLayout>
