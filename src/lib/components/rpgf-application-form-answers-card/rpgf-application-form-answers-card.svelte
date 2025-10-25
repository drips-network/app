<script lang="ts">
  import buildExternalUrl from '$lib/utils/build-external-url';
  import type { ApplicationVersion } from '$lib/utils/rpgf/types/application';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import RpgfApplicationDetailsCard from '../rpgf-application-details-card/rpgf-application-details-card.svelte';
  import Table from '../table/table.svelte';
  import LinkCell from '$lib/components/table/cells/link.cell.svelte';
  import { getCoreRowModel } from '@tanstack/svelte-table';
  import Markdown from '../markdown/markdown.svelte';
  import ExpandableText from '../expandable-text/expandable-text.svelte';
  import Toggle from '../toggle/toggle.svelte';
  import storedWritable from '@efstajas/svelte-stored-writable';
  import z from 'zod';
  import { browser } from '$app/environment';
  import TitleAndValue from '../title-and-value/title-and-value.svelte';

  export let canSeePrivateFields: boolean;

  export let applicationVersion: ApplicationVersion;

  let privateFieldsHidden = storedWritable(
    'rpgf-application-form-answers-card-private-fields-hidden',
    z.boolean(),
    true,
    !browser,
  );
</script>

<RpgfApplicationDetailsCard title="Form answers" key="form-answers">
  <svelte:fragment slot="right">
    {#if applicationVersion.answers.some((a) => a.field.private)}
      <Toggle size="small" label="Hide private" bind:checked={$privateFieldsHidden} />
    {/if}
  </svelte:fragment>

  <div class="fields">
    {#if !canSeePrivateFields}
      <AnnotationBox type="info">
        Private fields may have been hidden for this application. Sign in as the applicant or a
        round admin to view private data.
      </AnnotationBox>
    {/if}

    <TitleAndValue title="Category">
      {applicationVersion.category.name}
    </TitleAndValue>

    {#each applicationVersion.answers as answer}
      <TitleAndValue
        title={answer.field.label}
        isPrivate={answer.field.private}
        hidden={$privateFieldsHidden && answer.field.private}
      >
        {#if answer.type === 'text'}
          <ExpandableText>
            {#if answer.text === null}
              <span class="no-answer">No answer provided</span>
            {:else}
              <Markdown content={answer.text} />
            {/if}
          </ExpandableText>
        {:else if answer.type === 'email'}
          {#if answer.email === null}
            <span class="no-answer">No answer provided</span>
          {:else}
            <p>{answer.email}</p>
          {/if}
        {:else if answer.type === 'url'}
          {#if answer.url === null}
            <span class="no-answer">No answer provided</span>
          {:else}
            <a
              style:width="fit-content"
              class="typo-link"
              href={buildExternalUrl(answer.url)}
              target="_blank"
              rel="noopener noreferrer">{answer.url}</a
            >
          {/if}
        {:else if answer.type === 'select'}
          {#if answer.selected === null}
            <span class="no-answer">No answer provided</span>
          {:else}
            {#each answer.selected as selected}
              <p>
                {answer.field.options.find((o) => o.value === selected)?.label ?? 'Unknown option'}
              </p>
            {/each}
          {/if}
        {:else if answer.type === 'list'}
          {#if answer.entries === null}
            <span class="no-answer">No answer provided</span>
          {:else}
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
        {/if}
      </TitleAndValue>
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

  p {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
