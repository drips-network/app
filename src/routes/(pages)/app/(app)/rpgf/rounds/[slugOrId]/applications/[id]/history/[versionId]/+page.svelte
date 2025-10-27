<script lang="ts">
  import { page } from '$app/stores';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import RpgfApplicationFormAnswersCard from '$lib/components/rpgf-application-form-answers-card/rpgf-application-form-answers-card.svelte';
  import RpgfApplicationSubmissionDetailsCard from '$lib/components/rpgf-application-submission-details-card/rpgf-application-submission-details-card.svelte';

  export let data;

  $: isSubmitter = data.application.submitter.id === data.rpgfUserData?.userId;
</script>

<div class="page">
  <div>
    <Button
      icon={ArrowLeft}
      href={`/app/rpgf/rounds/${data.round.urlSlug}/applications/${data.application.id}/history${$page.url.search}`}
      >Back to history</Button
    >
  </div>

  <AnnotationBox type="info">
    You are viewing a historical version of this application.
    <svelte:fragment slot="actions">
      <Button
        href={`/app/rpgf/rounds/${data.round.urlSlug}/applications/${data.application.id}${$page.url.search}`}
        >View latest version</Button
      >
    </svelte:fragment>
  </AnnotationBox>

  <RpgfApplicationFormAnswersCard
    applicationVersion={data.historyEntry}
    canSeePrivateFields={data.round.isAdmin || isSubmitter}
  />

  <RpgfApplicationSubmissionDetailsCard
    applicationVersion={data.historyEntry}
    submitterWalletAddress={data.application.submitter.walletAddress}
    project={data.project}
  />
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>
