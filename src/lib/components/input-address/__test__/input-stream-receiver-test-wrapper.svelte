<script lang="ts">
  import { writable } from 'svelte/store';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import InputStreamReceiver from '../input-stream-receiver.svelte';

  // Mirrors how the Create Stream flow binds the receiver input to a store,
  // alongside other fields living in the same store.
  const context = writable<{
    name: string | undefined;
    recipientInputValue: string | undefined;
    recipientValidatedValue: string | undefined;
  }>({
    name: undefined,
    recipientInputValue: undefined,
    recipientValidatedValue: undefined,
  });

  let validationState = $state<TextInputValidationState>({ type: 'unvalidated' });
</script>

<TextInput bind:value={$context.name} placeholder="Name" />
<InputStreamReceiver
  bind:value={$context.recipientInputValue}
  bind:validatedValue={$context.recipientValidatedValue}
  on:validationChange={(e) => (validationState = e.detail)}
/>
<div data-testid="validation-state">{validationState.type}</div>
<div data-testid="input-value">{$context.recipientInputValue}</div>
<div data-testid="validated-value">{$context.recipientValidatedValue}</div>
