<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import RpgfApplicationBadge from '$lib/components/rpgf-application-badge/rpgf-application-badge.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import { page } from '$app/stores';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import RpgfApplicationKycCard from '$lib/components/rpgf-application-kyc-card/rpgf-application-kyc-card.svelte';
  import RpgfSiweButton from '$lib/components/rpgf-siwe-button/rpgf-siwe-button.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import ArrowCounterClockwiseHeart from '$lib/components/icons/ArrowCounterClockwiseHeart.svelte';
  import RpgfApplicationFormAnswersCard from '$lib/components/rpgf-application-form-answers-card/rpgf-application-form-answers-card.svelte';
  import RpgfApplicationSubmissionDetailsCard from '$lib/components/rpgf-application-submission-details-card/rpgf-application-submission-details-card.svelte';
  import RpgfApplicationSplitsCard from '$lib/components/rpgf-application-splits-card/rpgf-application-splits-card.svelte';
  import RpgfApplicationCustomDatasets from '$lib/components/rpgf-application-custom-datasets/rpgf-application-custom-datasets.svelte';

  export let data;
  $: round = data.round;
  $: application = data.application;

  $: isSubmitter = data.application.submitter.id === data.rpgfUserData?.userId;
  $: canSeePrivateFields = round.isAdmin || isSubmitter;

  $: latestVersion = application.latestVersion;

  $: backToBallot = $page.url.searchParams.get('backToBallot') !== null;
</script>

<HeadMeta title="{application.projectName} | {round.name}" />

<div
  class="application"
  style:view-transition-name="application-{application.id}"
  style:view-transition-class="element-handover"
>
  <div class="back-button">
    <Button
      href={backToBallot
        ? `/app/rpgf/rounds/${round.urlSlug}/applications/ballot`
        : `/app/rpgf/rounds/${round.urlSlug}/applications`}
      icon={ArrowLeft}>Back to {backToBallot ? 'ballot' : 'applications'}</Button
    >
  </div>
  {#if !data.rpgfUserData}
    <div class="signin-note">
      <AnnotationBox type="info">
        Sign in as the applicant or a round admin to see private fields, identity verification
        status, and more.
        <svelte:fragment slot="actions">
          <RpgfSiweButton />
        </svelte:fragment>
      </AnnotationBox>
    </div>
  {/if}

  <div class="card">
    <div class="top">
      <RpgfApplicationBadge hideState {application} hideName size="huge" />
      <div class="actions">
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

        {#if isSubmitter && data.round.state === 'intake'}
          <Button
            href={`/app/rpgf/rounds/${round.urlSlug}/applications/${application.id}/edit`}
            icon={Pen}>Edit</Button
          >
        {/if}
      </div>
    </div>
    <h1>
      {application.projectName}
      <span style:margin-left="0.25rem">
        <RpgfApplicationBadge inline hideName hideAvatar {application} />
      </span>
    </h1>

    <div>
      <ProjectBadge tooltip={false} project={data.dripsProject} />
    </div>
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

  <RpgfApplicationCustomDatasets {application} />

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

  .card > * {
    width: 100%;
    min-width: 0;
  }

  .application {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 0 auto;
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    width: 100%;
  }

  .signin-note {
    display: none;
  }

  .back-button {
    display: none;
  }

  @media (max-width: 1400px) {
    .top {
      flex-direction: column-reverse;
      align-items: flex-start;
      gap: 1rem;
    }

    .signin-note {
      display: initial;
    }

    .back-button {
      display: initial;
    }
  }
</style>
