<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Section from '$lib/components/section/section.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import modal from '$lib/stores/modal';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { deleteTag } from '$lib/utils/wave/tags';
  import type { Tag } from '$lib/utils/wave/types/waveProgram';
  import TagModal from '../components/tag-modal.svelte';

  let { data } = $props();

  let tags = $derived(data.tags);

  async function refresh() {
    await invalidate('wave:admin:repos');
  }

  function openCreateTagModal() {
    modal.show(TagModal, undefined, {
      onSaved: refresh,
    });
  }

  function openEditTagModal(tag: Tag) {
    modal.show(TagModal, undefined, {
      existingTag: tag,
      onSaved: refresh,
    });
  }

  async function handleDeleteTag(tag: Tag) {
    await doWithConfirmationModal(
      `Delete tag "${tag.name}"? This will unassign it from all repos.`,
      () =>
        doWithErrorModal(async () => {
          await deleteTag(fetch, tag.id);
          await refresh();
        }),
    );
  }
</script>

<Section
  header={{
    label: 'Tags',
    actions: [
      {
        label: 'Create tag',
        icon: Plus,
        variant: 'primary',
        handler: openCreateTagModal,
      },
    ],
    infoTooltip: 'Manage tags that can be assigned to repos.',
  }}
  skeleton={{
    loaded: true,
    empty: tags.data.length === 0,
    emptyStateEmoji: '🏷️',
    emptyStateHeadline: 'No tags',
    emptyStateText: 'Create a tag to get started.',
  }}
>
  <div class="list">
    {#each tags.data as tag (tag.id)}
      <div class="row">
        <div class="tag-info">
          <span
            class="tag-badge"
            style:background-color="{tag.color}20"
            style:color={tag.color}
            style:border-color="{tag.color}40"
          >
            {tag.name}
          </span>
        </div>
        <div class="actions">
          <Button size="small" variant="ghost" icon={Pen} onclick={() => openEditTagModal(tag)}
            >Edit</Button
          >
          <Button
            size="small"
            variant="destructive-outline"
            icon={Trash}
            onclick={() => handleDeleteTag(tag)}>Delete</Button
          >
        </div>
      </div>
    {/each}
  </div>
</Section>

<style>
  .list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .row {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
  }

  .row:last-child {
    border-bottom: none;
  }

  .tag-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tag-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.0625rem 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    border: 1px solid;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }
</style>
