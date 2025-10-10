<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import RpgfApplicationBadge from '$lib/components/rpgf-application-badge/rpgf-application-badge.svelte';
  import ApplicationDecisionButtons from '$lib/components/rpgf-applications-table/components/application-decision-buttons.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import { page } from '$app/stores';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { decisionsStore } from '$lib/stores/rpgf-decisions/rpgf-decisions.store.js';
  import RpgfApplicationKycCard from '$lib/components/rpgf-application-kyc-card/rpgf-application-kyc-card.svelte';
  import RpgfSiweButton from '$lib/components/rpgf-siwe-button/rpgf-siwe-button.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import ArrowCounterClockwiseHeart from '$lib/components/icons/ArrowCounterClockwiseHeart.svelte';
  import RpgfApplicationFormAnswersCard from '$lib/components/rpgf-application-form-answers-card/rpgf-application-form-answers-card.svelte';
  import RpgfApplicationSubmissionDetailsCard from '$lib/components/rpgf-application-submission-details-card/rpgf-application-submission-details-card.svelte';
  import RpgfApplicationSplitsCard from '$lib/components/rpgf-application-splits-card/rpgf-application-splits-card.svelte';

  export let data;
  $: round = data.round;
  $: application = data.application;

  $: isSubmitter = data.application.submitter.id === data.rpgfUserData?.userId;
  $: canSeePrivateFields = round.isAdmin || isSubmitter;

  $: latestVersion = application.latestVersion;

  $: backToBallot = $page.url.searchParams.get('backToBallot') !== null;
</script>

<HeadMeta title="{application.projectName} | {round.name}" />

<div class="application">
  <div class="actions">
    <Button
      href={backToBallot
        ? `/app/rpgf/rounds/${round.urlSlug}/applications/ballot`
        : `/app/rpgf/rounds/${round.urlSlug}/applications`}
      icon={ArrowLeft}>Back to {backToBallot ? 'ballot' : 'applications'}</Button
    >
    <div class="right">
      <ShareButton
        url={$page.url.toString().replaceAll('?backToBallot', '')}
        shareModalText={application.state !== 'approved'
          ? "Please note that only the applicant or round admins can see this application before it's approved."
          : undefined}
      />

      <Button
        href={`/app/rpgf/rounds/${round.urlSlug}/applications/${application.id}/history`}
        icon={ArrowCounterClockwiseHeart}
        variant="ghost">History</Button
      >

      {#if isSubmitter}
        <Button
          href={`/app/rpgf/rounds/${round.urlSlug}/applications/${application.id}/edit`}
          icon={Pen}>Edit</Button
        >
      {/if}
    </div>
  </div>

  {#if !data.rpgfUserData}
    <AnnotationBox type="info">
      Sign in as the applicant or a round admin to see private fields, identity verification status,
      and more.
      <svelte:fragment slot="actions">
        <RpgfSiweButton />
      </svelte:fragment>
    </AnnotationBox>
  {/if}

  <div class="card">
    <RpgfApplicationBadge hideState {application} hideName size="huge" />
    <h1>
      {application.projectName}
      <RpgfApplicationBadge inline hideName hideAvatar {application} />
    </h1>
    <ProjectBadge project={data.dripsProject} />

    {#if data.reviewMode && application.state === 'pending'}
      <ApplicationDecisionButtons
        applicationId={application.id}
        bind:decision={$decisionsStore[application.id]}
      />
    {/if}
  </div>

  {#if round.kycConfig && canSeePrivateFields}
    <RpgfApplicationKycCard
      roundId={data.round.id}
      roundKycConfig={round.kycConfig}
      kycRequest={data.kycRequest}
      applicationId={application.id}
      isOwnApplication={data.application.submitter.id === data.rpgfUserData?.userId}
      isRoundAdmin={round.isAdmin}
    />
  {/if}

  <RpgfApplicationFormAnswersCard
    {canSeePrivateFields}
    applicationVersion={application.latestVersion}
  />

  <RpgfApplicationSplitsCard project={data.dripsProject} />

  <RpgfApplicationSubmissionDetailsCard
    applicationVersion={latestVersion}
    submitterWalletAddress={application.submitter.walletAddress}
    project={data.dripsProject}
  />
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid var(--color-foreground-level-3);
  }

  .application {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 45rem;
    margin: 0 auto;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .actions .right {
    display: flex;
    gap: 0.5rem;
  }
</style>
