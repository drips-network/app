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

  export let data;
  $: decisionsStore = data.decisions;
  $: round = data.wrappedRound.round;
  $: application = data.application;
  $: applicationFormat = round.applicationFormat.filter((f) => 'slug' in f);

  function isListValue(value: unknown): value is { [key: string]: string | number }[] {
    return Array.isArray(value);
  }
</script>

<div class="application">
  <div>
    <Button href="/app/rpgf/rounds/{round.urlSlug}/applications" icon={ArrowLeft}
      >Back to applications</Button
    >
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

  <div class="card">
    <div class="fields">
      {#each applicationFormat as field}
        {@const value = application.fields[field.slug]}
        {#if !field.private || data.isRoundAdmin}
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
    </div>
  </div>
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
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
  }
</style>
