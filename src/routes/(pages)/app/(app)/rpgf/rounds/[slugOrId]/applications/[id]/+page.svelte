<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import Lock from '$lib/components/icons/Lock.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import RpgfApplicationBadge from '$lib/components/rpgf-application-badge/rpgf-application-badge.svelte';
  import ApplicationDecisionButtons from '$lib/components/rpgf-applications-table/components/application-decision-buttons.svelte';
  import Table from '$lib/components/table/table.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import { getCoreRowModel } from '@tanstack/svelte-table';
  import LinkCell from '$lib/components/table/cells/link.cell.svelte';
  import RpgfApplicationMetricsCard from '$lib/components/rpgf-application-metrics-card/rpgf-application-metrics-card.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import { page } from '$app/stores';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { decisionsStore } from '$lib/stores/rpgf-decisions/rpgf-decisions.store.js';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import buildExternalUrl from '$lib/utils/build-external-url';
  import RpgfApplicationKycCard from '$lib/components/rpgf-application-kyc-card/rpgf-application-kyc-card.svelte';

  export let data;
  $: round = data.round;
  $: application = data.application;

  $: canSeePrivateFields =
    round.isAdmin || data.application.submitter.id === data.rpgfUserData?.userId;

  $: backToBallot = $page.url.searchParams.get('backToBallot') !== null;
</script>

<HeadMeta title="{application.projectName} | {round.name}" />

<div class="application">
  <div class="actions">
    <Button
      href={backToBallot
        ? `/app/rpgf/rounds/${round.urlSlug}/applications/ballot#content-anchor`
        : `/app/rpgf/rounds/${round.urlSlug}/applications#content-anchor`}
      icon={ArrowLeft}>Back to {backToBallot ? 'ballot' : 'applications'}</Button
    >
    <ShareButton
      url={$page.url.toString().replaceAll('?backToBallot', '').replaceAll('#content-anchor', '')}
      shareModalText={application.state !== 'approved'
        ? "Please note that only the applicant or round admins can see this application before it's approved."
        : undefined}
    />
  </div>
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

  {#if round.kycProvider}
    <RpgfApplicationKycCard
      roundId={data.round.id}
      kycRequest={data.kycRequest}
      applicationId={application.id}
    />
  {/if}

  <RpgfApplicationMetricsCard keyMetrics={data.osoCoreMetrics} />

  <div class="card">
    <h2 class="typo-header-5">Application details</h2>
    <div class="fields">
      {#if !canSeePrivateFields}
        <AnnotationBox type="info">
          Private fields may have been hidden for this application. Sign in as the applicant or a
          round admin to view private data.
        </AnnotationBox>
      {/if}

      <div class="field">
        <h2 class="typo-header-4">Category</h2>
        <p>{application.category.name}</p>
      </div>

      {#each application.answers as answer}
        <div class="field">
          <h2 class="typo-header-4" style:display="flex" style:gap="0.2rem">
            {answer.field.label}
            {#if answer.field.private}
              <div style:cursor="help" style:width="fit-content">
                <Tooltip>
                  <svelte:fragment slot="tooltip-content">
                    This field is private and only visible to admins or the applicant.
                  </svelte:fragment>
                  <Lock />
                </Tooltip>
              </div>
            {/if}
          </h2>

          {#if answer.type === 'text' || answer.type === 'textarea'}
            <p>{answer.text}</p>
          {:else if answer.type === 'email'}
            <p>{answer.email}</p>
          {:else if answer.type === 'url'}
            <a
              style:width="fit-content"
              class="typo-link"
              href={buildExternalUrl(answer.url)}
              target="_blank"
              rel="noopener noreferrer">{answer.url}</a
            >
          {:else if answer.type === 'select'}
            {#each answer.selected as selected}
              <p>
                {answer.field.options.find((o) => o.value === selected)?.label ?? 'Unknown option'}
              </p>
            {/each}
          {:else if answer.type === 'list'}
            <Table
              options={{
                columns: answer.field.entryFields.map((ef) => ({
                  header: ef.label,
                  accessorKey: ef.label,
                  cell: (v) => (ef.type === 'url' ? LinkCell : v),
                  enableSorting: false,
                })),
                // This maps the rows so that url fields are displayed as a link... Sorry for the 🍝
                data: answer.entries.map((row) => {
                  return Object.fromEntries(
                    Object.entries(row).map(([label, value]) => {
                      const fieldDef = answer.field.entryFields.find((ef) => ef.label === label);

                      if (fieldDef?.type === 'url' && typeof value === 'string') {
                        return [label, { href: buildExternalUrl(value) }];
                      } else {
                        return [label, value];
                      }
                    }),
                  );
                }),
                getCoreRowModel: getCoreRowModel(),
              }}
            />
          {/if}
        </div>
      {/each}

      <div class="field">
        <h2 class="typo-header-4">GitHub repository</h2>
        <ProjectBadge size="tiny" forceUnclaimed project={data.dripsProject} tooltip={false} />
      </div>

      <div class="field">
        <h2 class="typo-header-4">Submitted by</h2>
        <IdentityBadge address={application.submitter.walletAddress} />
      </div>

      <div class="field">
        <h2 class="typo-header-4">Submitted at</h2>
        <p>
          {new Date(application.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
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
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .fields > .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: fit-content;
  }
</style>
