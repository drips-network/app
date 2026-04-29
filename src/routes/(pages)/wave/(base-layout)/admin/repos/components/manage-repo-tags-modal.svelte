<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Cross from '$lib/components/icons/Cross.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import modal from '$lib/stores/modal';
  import { assignTagToRepo, unassignTagFromRepo } from '$lib/utils/wave/tags';
  import type { Tag, WaveProgramRepoWithDetailsDto } from '$lib/utils/wave/types/waveProgram';

  interface Props {
    repo: WaveProgramRepoWithDetailsDto;
    allTags: Tag[];
    onChanged: () => void;
  }

  let { repo, allTags, onChanged }: Props = $props();

  let assignedTags = $state<{ id: string; name: string; color: string }[]>([
    ...(repo.repo.tags ?? []),
  ]);
  let busy = $state(false);
  let error = $state<string | null>(null);

  let availableTags = $derived(allTags.filter((t) => !assignedTags.some((at) => at.id === t.id)));

  async function handleAssign(tagId: string) {
    const tag = allTags.find((t) => t.id === tagId);
    if (!tag) return;

    busy = true;
    error = null;
    try {
      await assignTagToRepo(fetch, repo.repo.id, tagId);
      assignedTags = [...assignedTags, { id: tag.id, name: tag.name, color: tag.color }];
      onChanged();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to assign tag.';
    } finally {
      busy = false;
    }
  }

  async function handleUnassign(tagId: string) {
    busy = true;
    error = null;
    try {
      await unassignTagFromRepo(fetch, repo.repo.id, tagId);
      assignedTags = assignedTags.filter((t) => t.id !== tagId);
      onChanged();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to remove tag.';
    } finally {
      busy = false;
    }
  }
</script>

<div class="modal">
  <StandaloneFlowStepLayout headline="Manage tags" description={repo.repo.gitHubRepoFullName}>
    <div class="content">
      <div class="assigned-tags">
        {#if assignedTags.length === 0}
          <span class="typo-text-small dim">No tags assigned.</span>
        {:else}
          {#each assignedTags as tag (tag.id)}
            <span
              class="tag-badge"
              style:background-color="{tag.color}20"
              style:color={tag.color}
              style:border-color="{tag.color}40"
            >
              {tag.name}
              <button
                class="tag-remove"
                style:color={tag.color}
                disabled={busy}
                onclick={() => handleUnassign(tag.id)}
                aria-label="Remove tag {tag.name}"
              >
                <Cross style="width: 0.75rem; height: 0.75rem; fill: currentColor" />
              </button>
            </span>
          {/each}
        {/if}
      </div>

      {#if availableTags.length > 0}
        <div class="add-tag">
          <span class="typo-text-small dim">Add tag:</span>
          <Dropdown
            small
            value={undefined}
            options={availableTags.map((t) => ({ value: t.id, title: t.name }))}
            onchange={handleAssign}
          />
        </div>
      {/if}

      {#if error}
        <AnnotationBox type="error">{error}</AnnotationBox>
      {/if}
    </div>

    {#snippet actions()}
      <Button variant="primary" onclick={modal.hide}>Done</Button>
    {/snippet}
  </StandaloneFlowStepLayout>
</div>

<style>
  .modal {
    padding: 1rem;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .assigned-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    min-height: 2rem;
  }

  .tag-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    border: 1px solid;
  }

  .tag-remove {
    display: inline-flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s;
  }

  .tag-remove:hover {
    opacity: 1;
  }

  .tag-remove:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .add-tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dim {
    color: var(--color-foreground-level-5);
  }
</style>
