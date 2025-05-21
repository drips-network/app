import { rpgfJwtStore } from '$lib/utils/rpgf/siwe.js';
import { get } from 'svelte/store';
import type { CreateRoundDraftDto } from '$lib/utils/rpgf/schemas';
import { getDrafts } from '$lib/utils/rpgf/rpgf.js';
import { browser } from '$app/environment';

export const load = async ({ fetch }) => {
    let drafts: CreateRoundDraftDto[] | null = null;

    if (browser && get(rpgfJwtStore)) {
      drafts = await getDrafts(fetch);
    }

    return {
      drafts,
    };
};
