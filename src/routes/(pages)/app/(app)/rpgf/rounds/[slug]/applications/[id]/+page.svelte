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

  export let data;
  $: decisionsStore = data.decisions;
  $: round = data.wrappedRound.round;
  $: application = data.application;
  $: applicationFormat = round.applicationFormat.filter((f) => 'slug' in f);

  function isListValue(value: unknown): value is { [key: string]: string | number }[] {
    return Array.isArray(value);
  }

  $: canSeePrivateFields =
    data.isRoundAdmin || data.application.submitterUserId === data.rpgfUserData?.userId;

  $: privateFieldsOmitted = applicationFormat.find((f) => f.private) && !canSeePrivateFields;

  $: backToBallot = $page.url.searchParams.get('backToBallot') !== null;
</script>

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

  <RpgfApplicationMetricsCard keyMetrics={data.osoCoreMetrics} />

  <div class="card">
    <h2 class="typo-header-5">Application details</h2>
    <div class="fields">
      {#if privateFieldsOmitted}
        <AnnotationBox type="info">
          Private fields have been hidden for this application. Sign in as the applicant or a round
          admin to view private data.
        </AnnotationBox>
      {/if}

      {#each applicationFormat as field}
        {#if canSeePrivateFields || !field.private}
          {@const value = application.fields[field.slug]}
          <div class="field">
            <h2 class="typo-header-4" style:display="flex" style:gap="0.2rem">
              {field.label}
              {#if field.private}
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
            {#if value}
              {#if field.type === 'text' || field.type === 'textarea' || field.type === 'email'}
                <p>{value}</p>
              {:else if field.type === 'url' && typeof value === 'string'}
                <a
                  style:width="fit-content"
                  class="typo-link"
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer">{value}</a
                >
              {:else if field.type === 'select'}
                <p>{field.options.find((o) => o.value === value)?.label ?? 'Unknown answer'}</p>
              {:else if field.type === 'list'}
                <Table
                  options={{
                    columns: field.entryFields.map((ef) => ({
                      header: ef.label,
                      accessorKey: ef.label,
                      cell: (v) => (ef.type === 'url' ? LinkCell : v),
                      enableSorting: false,
                    })),
                    // This maps the rows so that url fields are displayed as a link... Sorry for the 🍝
                    data: isListValue(value)
                      ? value.map((row) => {
                          return Object.fromEntries(
                            Object.entries(row).map(([label, value]) => {
                              const fieldDef = field.entryFields.find((ef) => ef.label === label);

                              if (fieldDef?.type === 'url' && typeof value === 'string') {
                                return [label, { href: value }];
                              } else {
                                return [label, value];
                              }
                            }),
                          );
                        })
                      : [],
                    getCoreRowModel: getCoreRowModel(),
                  }}
                />
              {/if}
            {:else}
              <span>No answer</span>
            {/if}
            <!-- TODO(rpgf): Implement the rest of possible field types -->
          </div>
        {/if}
      {/each}

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
      <div class="field">
        <h2 class="typo-header-4">GitHub repository</h2>
        <ProjectBadge forceUnclaimed project={data.dripsProject} tooltip={false} />
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
