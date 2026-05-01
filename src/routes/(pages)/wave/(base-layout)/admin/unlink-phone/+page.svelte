<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Section from '$lib/components/section/section.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import Button from '$lib/components/button/button.svelte';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { getUser } from '$lib/utils/wave/users';
  import { unlinkPhoneVerification } from '$lib/utils/wave/adminPhone';

  let gitHubUsername = $state('');
  let submitting = $state(false);

  let valid = $derived(gitHubUsername.trim().length > 0);

  async function handleSubmit() {
    if (!valid) return;

    const trimmedUsername = gitHubUsername.trim();

    submitting = true;

    try {
      const user = await doWithErrorModal(() => getUser(fetch, trimmedUsername));

      if (!user) {
        throw new Error(`User "${trimmedUsername}" not found.`);
      }

      const message = `You are about to unlink the phone number from ${trimmedUsername}'s account. They will be able to re-verify afterwards, possibly with a different number. Continue?`;

      await doWithConfirmationModal(message, async () => {
        await doWithErrorModal(() => unlinkPhoneVerification(fetch, user.id), undefined, {
          message: 'Phone number unlinked successfully.',
          confetti: false,
        });
        gitHubUsername = '';
      });
    } catch {
      // Error already handled by doWithErrorModal
    } finally {
      submitting = false;
    }
  }
</script>

<HeadMeta title="Unlink Phone | Admin | Wave" />

<div class="page">
  <Breadcrumbs crumbs={[{ label: 'Admin', href: '/wave/admin' }, { label: 'Unlink Phone' }]} />
  <Section
    header={{
      label: 'Unlink Phone',
    }}
    skeleton={{ loaded: true }}
  >
    <div class="form">
      <FormField
        title="GitHub Username"
        description="The user's phone verification record will be deleted. They can re-verify a (possibly different) number afterwards via the normal flow."
      >
        <TextInput bind:value={gitHubUsername} placeholder="e.g. octocat" />
      </FormField>

      <Button disabled={!valid || submitting} onclick={handleSubmit}>
        {submitting ? 'Unlinking...' : 'Unlink Phone'}
      </Button>
    </div>
  </Section>
</div>

<style>
  .page {
    display: flex;
    max-width: 90rem;
    margin: 0 auto;
    width: 100%;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 32rem;
    margin: 0 auto;
  }
</style>
