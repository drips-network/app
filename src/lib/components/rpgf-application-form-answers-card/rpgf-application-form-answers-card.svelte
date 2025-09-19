<script lang="ts">
  import buildExternalUrl from '$lib/utils/build-external-url';
  import type { ApplicationVersion } from '$lib/utils/rpgf/types/application';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import Lock from '../icons/Lock.svelte';
  import RpgfApplicationDetailsCard from '../rpgf-application-details-card/rpgf-application-details-card.svelte';
  import Table from '../table/table.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';
  import LinkCell from '$lib/components/table/cells/link.cell.svelte';
  import { getCoreRowModel } from '@tanstack/svelte-table';
  import Markdown from '../markdown/markdown.svelte';
  import ExpandableText from '../expandable-text/expandable-text.svelte';

  export let canSeePrivateFields: boolean;

  export let applicationVersion: ApplicationVersion;
</script>

<RpgfApplicationDetailsCard title="Form answers" key="form-answers">
  <div class="fields">
    {#if !canSeePrivateFields}
      <AnnotationBox type="info">
        Private fields may have been hidden for this application. Sign in as the applicant or a
        round admin to view private data.
      </AnnotationBox>
    {/if}

    <div class="field">
      <h2 class="typo-header-4">Category</h2>
      <p>{applicationVersion.category.name}</p>
    </div>

    {#each applicationVersion.answers as answer}
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

        {#if answer.type === 'text'}
          <ExpandableText let:isLong>
            <div class="text-wrapper" class:is-long={isLong}>
              <Markdown content={answer.text} />
            </div>
          </ExpandableText>
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
  </div>
</RpgfApplicationDetailsCard>

<style>
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
    min-width: 0;
    max-width: 100%;
  }

  .text-wrapper.is-long {
    padding: 0.1rem 0.5rem;
    background-color: var(--color-foreground-level-1);
    border-radius: 0.5rem;
  }

  p {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
